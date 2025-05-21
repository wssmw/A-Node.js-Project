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

/**
 * 表关系说明：
 * 1. users 与 articles: 一对多关系，一个用户可以发布多篇文章
 * 2. articles 与 categories: 多对一关系，多篇文章属于同一分类
 * 3. articles 与 tags: 多对多关系，通过 article_tags 表关联
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
};
