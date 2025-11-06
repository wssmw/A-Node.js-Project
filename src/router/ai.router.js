const Router = require('koa-router');
const { verifyAuth } = require('../middleware/login.middleware');
const {
    test,
    createConversation,
    getConversations,
    getConversationMessages,
    sendMessage,
    deleteConversation,
} = require('../controller/ai.controller');

const aiRouter = new Router({ prefix: '/ai' });

// 测试
aiRouter.post('/test', test);

// 创建新对话
aiRouter.post('/conversations/create', verifyAuth, createConversation);

// 获取用户的所有对话列表（支持懒加载）
aiRouter.post('/conversations', verifyAuth, getConversations);

// 获取具体对话的消息内容（支持懒加载）
aiRouter.post('/conversations/:conversationId/messages', verifyAuth, getConversationMessages);

// 在已有对话中发送新消息
aiRouter.post('/conversations/:conversationId/send', verifyAuth, sendMessage);

// 删除对话
aiRouter.post('/conversations/delete', verifyAuth, deleteConversation);

module.exports = aiRouter;
