/**
 * 数据库表结构定义索引
 */
const users = require('./users');
const userProfiles = require('./user_profiles');
const articles = require('./articles');
const categories = require('./categories'); // 分类表
const tags = require('./tags'); // 标签表
const articleTags = require('./article_tags'); // 文章-标签关联表
const comments = require('./comments'); // 添加评论表
const articleLikes = require('./article_likes'); // 添加评论表
const commentLikes = require('./comment_likes'); // 添加评论表
const collections = require('./collections'); // 添加收藏夹表
const collectionArticles = require('./collection_articles'); // 添加收藏夹-文章关联表
const articleViews = require('./article_views');
const userFollows = require('./user_follows');
const tagFollows = require('./tag_follows');
const notifications = require('./notifications');
const toolCategories = require('./tool_categories');
const tools = require('./tools');
const notes = require('./notes');
const refreshTokens = require('./refresh_tokens'); // 添加刷新令牌表
const aiConversations = require('./ai_conversations'); // AI对话表
const aiMessages = require('./ai_messages'); // AI消息表
const performanceReports = require('./performance_reports'); // 性能监控报告表
const performanceResources = require('./performance_resources'); // 性能监控资源表
const performanceErrors = require('./performance_errors'); // 性能监控错误表
const performanceNetworkRequests = require('./performance_network_requests'); // 性能监控网络请求表

/**
 * 表关系说明：
 * 1. users 与 articles: 一对多关系，一个用户可以发布多篇文章
 * 2. articles 与 categories: 多对一关系，多篇文章属于同一分类
 * 3. articles 与 tags: 多对多关系，通过 article_tags 表关联
 * 4. performance_reports 与 performance_resources/performance_errors/performance_network_requests: 一对多关系
 */

module.exports = {
    users,
    user_profiles: userProfiles, // 添加用户详情表
    categories, // 先创建分类表
    tags, // 再创建标签表
    articles, // 然后是文章表（依赖用户表和分类表）
    article_tags: articleTags, // 最后是文章标签关联表（依赖文章表和标签表）
    comments, // 添加到导出对象中
    article_likes: articleLikes,
    comment_likes: commentLikes,
    collections,
    collection_articles: collectionArticles,
    article_views: articleViews,
    user_follows: userFollows,
    tag_follows: tagFollows,
    notifications,
    tool_categories: toolCategories,
    tools,
    notes,
    refresh_tokens: refreshTokens, // 添加刷新令牌表
    ai_conversations: aiConversations, // AI对话表
    ai_messages: aiMessages, // AI消息表
    performance_reports: performanceReports, // 性能监控报告表
    performance_resources: performanceResources, // 性能监控资源表
    performance_errors: performanceErrors, // 性能监控错误表
    performance_network_requests: performanceNetworkRequests, // 性能监控网络请求表
};
