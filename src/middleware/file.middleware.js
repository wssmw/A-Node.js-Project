const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');
const { SERVER_HOST, SERVER_PORT } = process.env;

// 文件上传配置
const uploadConfig = {
    users: {
        dir: 'uploads/avatar',    // 用户头像存储目录
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    article: {
        dir: 'uploads/article',   // 文章图片存储目录
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
};

// 确保所有上传目录都存在
Object.values(uploadConfig).forEach(config => {
    if (!fs.existsSync(config.dir)) {
        fs.mkdirSync(config.dir, { recursive: true });
    }
});

// 根据URL路径获取上传配置
const getUploadConfig = (url) => {
    const path = url.split('/')[1]; // 获取路由第一段
    return uploadConfig[path] || uploadConfig.article; // 默认使用文章配置
};

// 生成完整的文件URL
const getFileUrl = (filePath) => {
    return `http://${SERVER_HOST}:${SERVER_PORT}/${filePath}`;
};

// 创建存储配置
const storage = multer.diskStorage({
    destination: function (ctx, file, cb) {
        const config = getUploadConfig(ctx.url);
        cb(null, config.dir);
    },
    filename: function (ctx, file, cb) {
        // 获取原始文件名（不包含扩展名）和扩展名
        const originalName = path.parse(file.originalname).name;
        const ext = path.extname(file.originalname).toLowerCase();
        // 生成随机数
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 组合新文件名：原始名称-随机数.扩展名
        const filename = `${originalName}-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// 文件过滤器
const fileFilter = (ctx, file, cb) => {
    const config = getUploadConfig(ctx.url);
    if (config.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`只支持 ${config.allowedTypes.join(', ')} 格式的文件`), false);
    }
};

// 创建 multer 实例，使用 any() 接受任意字段名
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 默认5MB
    }
});

module.exports = {
    upload,
    getFileUrl
};
