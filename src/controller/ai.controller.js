const aiService = require('../service/ai.service');
const {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
} = require('../utils');
const OpenAI = require('openai');
const { AI_API_KEY } = process.env;

// import OpenAI from 'openai';
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: AI_API_KEY,
});

console.log(openai, 'openai');
class AIController {
    async test(ctx) {
        let completion;
        try {
            completion = await openai.chat.completions.create({
                messages: [{ role: 'system', content: '你好呀' }],
                model: 'deepseek-chat',
            });
        } catch (error) {
            console.error('Error creating chat completion:', error);
        }
        console.log(completion);
        handeleSuccessReturnMessage(ctx, '创建成功', completion);
    }

    /**
     * 创建新对话
     * 接收用户消息，调用OpenAI API获取回复，并存储对话和消息
     */
    async createConversation(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { message } = ctx.request.body;

            if (!message || !message.trim()) {
                handeleErrorReturnMessage(ctx, '消息内容不能为空');
                return;
            }

            // 调用OpenAI API获取回复
            let assistantMessage = '';
            try {
                const completion = await openai.chat.completions.create({
                    messages: [{ role: 'user', content: message }],
                    model: 'deepseek-chat',
                });

                assistantMessage =
                    completion.choices[0]?.message?.content || '抱歉，我无法回复您的问题。';
            } catch (error) {
                console.error('OpenAI API调用失败:', error);
                assistantMessage = '抱歉，AI服务暂时不可用，请稍后再试。';
            }

            // 创建对话并保存消息
            const result = await aiService.createConversationWithMessages(
                userId,
                message.trim(),
                assistantMessage
            );

            handeleSuccessReturnMessage(ctx, '创建对话成功', {
                conversation: result.conversation,
                userMessage: result.userMessage,
                assistantMessage: result.assistantMessage,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    /**
     * 获取用户的所有对话列表（支持懒加载）
     */
    async getConversations(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { offset = 0, limit = 10 } = ctx.request.body;

            const safeOffset = Math.max(0, parseInt(offset));
            const safeLimit = Math.min(parseInt(limit) || 10, 50); // 限制最大50条

            const result = await aiService.getConversations(
                userId,
                safeOffset,
                safeLimit
            );

            handeleSuccessReturnMessage(ctx, '获取成功', {
                conversations: result.conversations,
                total: result.total,
                offset: safeOffset,
                limit: safeLimit,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    /**
     * 获取具体对话的消息内容（支持懒加载）
     */
    async getConversationMessages(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { conversationId } = ctx.params;
            const { offset = 0, limit = 10 } = ctx.request.body;

            if (!conversationId) {
                handeleErrorReturnMessage(ctx, '对话ID不能为空');
                return;
            }

            const safeOffset = Math.max(0, parseInt(offset));
            const safeLimit = Math.min(parseInt(limit) || 10, 50); // 限制最大50条

            const result = await aiService.getConversationMessages(
                conversationId,
                userId,
                safeOffset,
                safeLimit
            );

            handeleSuccessReturnMessage(ctx, '获取成功', {
                conversation: result.conversation,
                messages: result.messages,
                total: result.total,
                offset: safeOffset,
                limit: safeLimit,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    /**
     * 在已有对话中继续发送消息
     * 会获取对话历史，构建完整的messages数组传递给OpenAI API
     */
    async sendMessage(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { conversationId } = ctx.params;
            const { message } = ctx.request.body;

            if (!conversationId) {
                handeleErrorReturnMessage(ctx, '对话ID不能为空');
                return;
            }

            if (!message || !message.trim()) {
                handeleErrorReturnMessage(ctx, '消息内容不能为空');
                return;
            }

            // 先验证对话是否存在且属于该用户（在sendMessageToConversation中会验证，但这里先验证可以提前失败）
            // 获取对话的所有历史消息（也会验证权限）
            const historyMessages = await aiService.getConversationHistory(
                conversationId,
                userId
            );

            // 构建完整的messages数组（包含历史消息 + 新消息）
            const messages = [
                ...historyMessages,
                { role: 'user', content: message.trim() },
            ];

            // 调用OpenAI API获取回复
            let assistantMessage = '';
            try {
                const completion = await openai.chat.completions.create({
                    messages: messages,
                    model: 'deepseek-chat',
                });

                assistantMessage =
                    completion.choices[0]?.message?.content || '抱歉，我无法回复您的问题。';
            } catch (error) {
                console.error('OpenAI API调用失败:', error);
                assistantMessage = '抱歉，AI服务暂时不可用，请稍后再试。';
            }

            // 保存用户消息和AI回复
            const result = await aiService.sendMessageToConversation(
                conversationId,
                userId,
                message.trim(),
                assistantMessage
            );

            handeleSuccessReturnMessage(ctx, '发送消息成功', {
                userMessage: result.userMessage,
                assistantMessage: result.assistantMessage,
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }

    /**
     * 删除对话
     */
    async deleteConversation(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const { conversationId } = ctx.request.body;

            if (!conversationId) {
                handeleErrorReturnMessage(ctx, '对话ID不能为空');
                return;
            }

            const success = await aiService.deleteConversation(
                conversationId,
                userId
            );

            if (!success) {
                handeleErrorReturnMessage(ctx, '删除失败');
                return;
            }

            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, error.message);
        }
    }
}

module.exports = new AIController();
