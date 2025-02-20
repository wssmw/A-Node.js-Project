注意:
    1.返回的数据是这种格式
        ctx.body = {
            code: 200,
            message: '创建成功',
            success: true,
            data: {
                userInfo: user,
            },
        };
    2.保存的图片url都是完整的,这是因为有第三方登录,此时图片地址是完整的

# Blog Backend

一个基于 Node.js + Koa2 + MySQL 的博客系统后端服务。

## 项目结构
```
├── src/                    # 源代码目录
│   ├── app/               # 应用配置
│   │   ├── config.js      # 配置文件
│   │   ├── database.js    # 数据库连接
│   │   └── error.js       # 错误处理
│   ├── controller/        # 控制器层
│   │   ├── user.controller.js    # 用户相关控制器
│   │   ├── tag.controller.js     # 标签相关控制器
│   │   └── article.controller.js # 文章相关控制器
│   ├── middleware/        # 中间件
│   │   ├── auth.middleware.js    # 认证中间件
│   │   └── error.middleware.js   # 错误处理中间件
│   ├── router/           # 路由层
│   │   ├── user.router.js     # 用户路由
│   │   ├── tag.router.js      # 标签路由
│   │   └── article.router.js  # 文章路由
│   ├── service/          # 服务层
│   │   ├── user.service.js    # 用户服务
│   │   ├── tag.service.js     # 标签服务
│   │   └── article.service.js # 文章服务
│   ├── schema/           # 数据库相关
│   │   ├── init.js           # 数据库初始化
│   │   └── tables/          # 表结构定义
│   └── main.js           # 应用入口文件
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
├── package.json          # 项目依赖配置
└── README.md            # 项目说明文档
```

## 技术栈
- Node.js
- Koa2
- MySQL
- JWT (JSON Web Token)
- dotenv-flow (环境配置)

## 主要功能
- 用户管理
  - 注册
  - 登录
  - 个人信息管理
- 文章管理
  - 文章的增删改查
  - 文章分类
  - 文章标签
- 标签管理
  - 标签的增删改查
- 分类管理
  - 分类的增删改查

## 数据库设计
### 表结构
1. users (用户表)
   - id: 主键
   - username: 用户名
   - password: 密码
   - nickname: 昵称
   - avatar_url: 头像地址
   - created_at: 创建时间
   - updated_at: 更新时间

2. articles (文章表)
   - id: 主键
   - title: 文章标题
   - content: 文章内容
   - summary: 文章摘要
   - cover_url: 封面图片URL
   - user_id: 作者ID
   - category_id: 分类ID
   - created_at: 创建时间
   - updated_at: 更新时间

3. tags (标签表)
   - id: 主键
   - name: 标签名称
   - created_at: 创建时间
   - updated_at: 更新时间

4. article_tags (文章-标签关联表)
   - id: 主键
   - article_id: 文章ID
   - tag_id: 标签ID
   - created_at: 创建时间

5. categories (分类表)
   - id: 主键
   - name: 分类名称
   - created_at: 创建时间
   - updated_at: 更新时间

## 开发环境搭建
1. 安装依赖
```bash
npm install
```

2. 配置环境变量
复制 `.env.example` 到 `.env.development`，并修改相应配置：
```
# 服务器配置
SERVER_PORT=8000

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=blog_dev
MYSQL_USER=root
MYSQL_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret
```

3. 初始化数据库
```bash
npm run init-db
```

4. 启动开发服务器
```bash
npm run dev
```

## 部署说明
1. 构建生产环境
```bash
npm run build
```

2. 配置生产环境变量
复制 `.env.example` 到 `.env.production` 并修改配置

3. 启动服务
```bash
npm run start
```

## 项目特点
1. 统一的响应格式
```javascript
{
    code: 200,           // 状态码
    message: "xxx成功",   // 操作结果描述
    success: true,       // 操作是否成功
    data: {             // 返回的数据
        // ... 具体数据
    }
}
```

2. 完善的错误处理机制
- 统一的错误处理中间件
- 自定义错误类型
- 详细的错误日志

3. 规范的代码结构
- 控制器负责处理请求和响应
- 服务层负责业务逻辑
- 数据库操作封装在服务层

4. 安全性考虑
- 密码加密存储
- JWT 认证
- SQL注入防护
- XSS防护

## 注意事项
1. 返回的数据格式统一
2. 图片URL存储完整路径
3. 敏感信息（如密码）不返回给前端
4. 接口调用需要符合权限要求

## API文档
详细的API文档请参考 [API文档](./API.md)

## 贡献指南
1. Fork 本仓库
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 许可证
MIT

## 错误码说明
- 200: 操作成功
- 400: 请求参数错误
- 401: 未登录或token已过期
- 404: 资源不存在
- 409: 资源冲突（如标签名重复）

## 图片存储说明

- 系统中所有保存的图片 URL 都使用完整的 URL 地址
- 这样设计的原因是为了支持第三方登录时的图片地址兼容性
- 示例：`https://example.com/images/avatar.jpg`

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200    | 成功 |
| 400    | 请求参数错误 |
| 401    | 未授权 |
| 403    | 禁止访问 |
| 404    | 资源不存在 |
| 500    | 服务器内部错误 |

## 注意事项

1. 所有请求都需要在 header 中携带 token（除了登录注册等公开接口）
2. 图片上传需要限制文件大小和格式
3. 请求参数和响应数据都使用 JSON 格式