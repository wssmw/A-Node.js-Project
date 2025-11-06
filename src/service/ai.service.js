const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class AIService {
    /**
     * 创建消息
     * @param {string} conversationId - 对话ID
     * @param {string} role - 角色：user 或 assistant
     * @param {string} content - 消息内容
     * @param {number} sequence - 消息序号（可选，如果不提供则自动获取最大值+1）
     * @returns {Promise<{id: string, role: string, content: string, created_at: Date}>}
     */
    async createMessage(conversationId, role, content, sequence = null) {
        try {
            let messageSequence = sequence;
            
            // 如果没有提供sequence，自动获取最大值+1
            if (messageSequence === null) {
                const [maxSequenceResult] = await connection.execute(
                    'SELECT COALESCE(MAX(sequence), 0) as max_sequence FROM ai_messages WHERE conversation_id = ?',
                    [conversationId]
                );
                messageSequence = maxSequenceResult[0].max_sequence + 1;
            }

            const messageId = generateEntityId();

            const statement = `
                INSERT INTO ai_messages (id, conversation_id, role, content, sequence)
                VALUES (?, ?, ?, ?, ?)
            `;

            await connection.execute(statement, [
                messageId,
                conversationId,
                role,
                content,
                messageSequence,
            ]);

            // 更新对话的更新时间
            await connection.execute(
                'UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?',
                [conversationId]
            );

            // 返回创建的消息
            const [messages] = await connection.execute(
                'SELECT id, role, content, sequence, created_at FROM ai_messages WHERE id = ?',
                [messageId]
            );

            return messages[0];
        } catch (error) {
            console.error('创建消息失败:', error);
            throw error;
        }
    }

    /**
     * 创建新对话并保存第一条消息
     * @param {string} userId - 用户ID
     * @param {string} userMessage - 用户消息内容
     * @param {string} assistantMessage - AI回复内容
     * @returns {Promise<{conversation: Object, userMessage: Object, assistantMessage: Object}>}
     */
    async createConversationWithMessages(
        userId,
        userMessage,
        assistantMessage
    ) {
        const conn = await require('../app/database').getConnection();
        try {
            await conn.beginTransaction();

            const conversationId = generateEntityId();

            // 从用户消息生成标题（前50个字符）
            const title =
                userMessage.length > 50
                    ? userMessage.substring(0, 50) + '...'
                    : userMessage;

            // 创建对话
            const conversationStatement = `
                INSERT INTO ai_conversations (id, user_id, title)
                VALUES (?, ?, ?)
            `;
            await conn.execute(conversationStatement, [
                conversationId,
                userId,
                title,
            ]);

            // 创建用户消息（第一条消息，sequence = 1）
            const userMessageId = generateEntityId();
            const userMessageStatement = `
                INSERT INTO ai_messages (id, conversation_id, role, content, sequence)
                VALUES (?, ?, 'user', ?, 1)
            `;
            await conn.execute(userMessageStatement, [
                userMessageId,
                conversationId,
                userMessage,
            ]);

            // 创建AI回复消息（第二条消息，sequence = 2）
            const assistantMessageId = generateEntityId();
            const assistantMessageStatement = `
                INSERT INTO ai_messages (id, conversation_id, role, content, sequence)
                VALUES (?, ?, 'assistant', ?, 2)
            `;
            await conn.execute(assistantMessageStatement, [
                assistantMessageId,
                conversationId,
                assistantMessage,
            ]);

            await conn.commit();

            // 返回创建的对话和消息信息
            const [conversations] = await conn.execute(
                'SELECT id, title, created_at, updated_at FROM ai_conversations WHERE id = ?',
                [conversationId]
            );

            const [userMessages] = await conn.execute(
                'SELECT id, role, content, created_at FROM ai_messages WHERE id = ?',
                [userMessageId]
            );

            const [assistantMessages] = await conn.execute(
                'SELECT id, role, content, created_at FROM ai_messages WHERE id = ?',
                [assistantMessageId]
            );

            return {
                conversation: conversations[0],
                userMessage: userMessages[0],
                assistantMessage: assistantMessages[0],
            };
        } catch (error) {
            await conn.rollback();
            console.error('创建对话失败:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * 获取用户的所有对话列表（支持懒加载）
     * @param {string} userId - 用户ID
     * @param {number} offset - 偏移量
     * @param {number} limit - 每页数量
     * @returns {Promise<{conversations: Array, total: number}>}
     */
    async getConversations(userId, offset = 0, limit = 10) {
        try {
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            // 查询对话列表
            const statement = `
                SELECT 
                    c.id,
                    c.title,
                    c.created_at,
                    c.updated_at,
                    (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = c.id) as message_count
                FROM ai_conversations c
                WHERE c.user_id = ?
                ORDER BY c.updated_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [conversations] = await connection.execute(statement, [userId]);

            // 获取总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM ai_conversations 
                WHERE user_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [
                userId,
            ]);

            return {
                conversations,
                total: countResult[0].total,
            };
        } catch (error) {
            console.error('获取对话列表失败:', error);
            throw error;
        }
    }

    /**
     * 获取具体对话的消息内容（支持懒加载）
     * @param {string} conversationId - 对话ID
     * @param {string} userId - 用户ID（用于验证权限）
     * @param {number} offset - 偏移量
     * @param {number} limit - 每页数量
     * @returns {Promise<{messages: Array, total: number, conversation: Object}>}
     */
    async getConversationMessages(
        conversationId,
        userId,
        offset = 0,
        limit = 10
    ) {
        try {
            const safeOffset = parseInt(offset);
            const safeLimit = parseInt(limit);

            // 验证对话是否存在且属于该用户
            const conversationStatement = `
                SELECT id, title, created_at, updated_at
                FROM ai_conversations
                WHERE id = ? AND user_id = ?
            `;
            const [conversations] = await connection.execute(
                conversationStatement,
                [conversationId, userId]
            );

            if (conversations.length === 0) {
                throw new Error('对话不存在或无权限访问');
            }

            const conversation = conversations[0];

            // 查询消息列表（按sequence正序排序，确保消息顺序正确）
            const messageStatement = `
                SELECT 
                    id,
                    role,
                    content,
                    sequence,
                    created_at
                FROM ai_messages
                WHERE conversation_id = ?
                ORDER BY sequence ASC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [messages] = await connection.execute(messageStatement, [
                conversationId,
            ]);

            // 获取消息总数
            const countStatement = `
                SELECT COUNT(*) as total 
                FROM ai_messages 
                WHERE conversation_id = ?
            `;
            const [countResult] = await connection.execute(countStatement, [
                conversationId,
            ]);

            return {
                conversation,
                messages,
                total: countResult[0].total,
            };
        } catch (error) {
            console.error('获取对话消息失败:', error);
            throw error;
        }
    }

    /**
     * 获取对话的所有历史消息（用于构建OpenAI API的messages数组）
     * @param {string} conversationId - 对话ID
     * @param {string} userId - 用户ID（用于验证权限）
     * @returns {Promise<Array>} 返回格式化的消息数组 [{role: 'user', content: '...'}, ...]
     */
    async getConversationHistory(conversationId, userId) {
        try {
            // 先验证对话是否存在且属于该用户
            const [conversations] = await connection.execute(
                'SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?',
                [conversationId, userId]
            );

            if (conversations.length === 0) {
                throw new Error('对话不存在或无权限访问');
            }

            const statement = `
                SELECT role, content
                FROM ai_messages
                WHERE conversation_id = ?
                ORDER BY sequence ASC
            `;

            const [messages] = await connection.execute(statement, [
                conversationId,
            ]);

            // 格式化为OpenAI API需要的格式
            return messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
        } catch (error) {
            console.error('获取对话历史失败:', error);
            throw error;
        }
    }

    /**
     * 在已有对话中发送新消息
     * @param {string} conversationId - 对话ID
     * @param {string} userId - 用户ID（用于验证权限）
     * @param {string} userMessage - 用户新消息
     * @param {string} assistantMessage - AI回复
     * @returns {Promise<{userMessage: Object, assistantMessage: Object}>}
     */
    async sendMessageToConversation(
        conversationId,
        userId,
        userMessage,
        assistantMessage
    ) {
        const conn = await require('../app/database').getConnection();
        try {
            await conn.beginTransaction();

            // 验证对话是否存在且属于该用户
            const [conversations] = await conn.execute(
                'SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?',
                [conversationId, userId]
            );

            if (conversations.length === 0) {
                throw new Error('对话不存在或无权限访问');
            }

            // 获取当前对话的最大sequence值
            const [maxSequenceResult] = await conn.execute(
                'SELECT COALESCE(MAX(sequence), 0) as max_sequence FROM ai_messages WHERE conversation_id = ?',
                [conversationId]
            );
            const nextSequence = maxSequenceResult[0].max_sequence + 1;

            // 创建用户消息
            const userMessageId = generateEntityId();
            const userMessageStatement = `
                INSERT INTO ai_messages (id, conversation_id, role, content, sequence)
                VALUES (?, ?, 'user', ?, ?)
            `;
            await conn.execute(userMessageStatement, [
                userMessageId,
                conversationId,
                userMessage,
                nextSequence,
            ]);

            // 创建AI回复消息
            const assistantMessageId = generateEntityId();
            const assistantMessageStatement = `
                INSERT INTO ai_messages (id, conversation_id, role, content, sequence)
                VALUES (?, ?, 'assistant', ?, ?)
            `;
            await conn.execute(assistantMessageStatement, [
                assistantMessageId,
                conversationId,
                assistantMessage,
                nextSequence + 1,
            ]);

            // 更新对话的更新时间
            await conn.execute(
                'UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?',
                [conversationId]
            );

            await conn.commit();

            // 返回创建的消息
            const [userMessages] = await conn.execute(
                'SELECT id, role, content, created_at FROM ai_messages WHERE id = ?',
                [userMessageId]
            );

            const [assistantMessages] = await conn.execute(
                'SELECT id, role, content, created_at FROM ai_messages WHERE id = ?',
                [assistantMessageId]
            );

            return {
                userMessage: userMessages[0],
                assistantMessage: assistantMessages[0],
            };
        } catch (error) {
            await conn.rollback();
            console.error('发送消息失败:', error);
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * 删除对话（同时删除所有相关消息）
     * @param {string} conversationId - 对话ID
     * @param {string} userId - 用户ID（用于验证权限）
     * @returns {Promise<boolean>}
     */
    async deleteConversation(conversationId, userId) {
        const connection = await require('../app/database').getConnection();
        try {
            await connection.beginTransaction();

            // 验证对话是否存在且属于该用户
            const [conversations] = await connection.execute(
                'SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?',
                [conversationId, userId]
            );

            if (conversations.length === 0) {
                throw new Error('对话不存在或无权限删除');
            }

            // 删除对话（由于外键约束，会自动删除相关消息）
            const [result] = await connection.execute(
                'DELETE FROM ai_conversations WHERE id = ?',
                [conversationId]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            console.error('删除对话失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new AIService();

