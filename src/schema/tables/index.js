/**
 * 数据库表结构定义索引
 */
const users = require('./users')
const articles = require('./articles')
const categories = require('./categories') // 分类表
const tags = require('./tags') // 标签表
const articleTags = require('./article_tags') // 文章-标签关联表

/**
 * 表关系说明：
 * 1. users 与 articles: 一对多关系，一个用户可以发布多篇文章
 * 2. articles 与 categories: 多对一关系，多篇文章属于同一分类
 * 3. articles 与 tags: 多对多关系，通过 article_tags 表关联
 */

module.exports = {
  users,
  categories,  // 先创建分类表
  tags,        // 再创建标签表
  articles,    // 然后是文章表（依赖用户表和分类表）
  'article_tags': articleTags  // 最后是文章标签关联表（依赖文章表和标签表）
} 