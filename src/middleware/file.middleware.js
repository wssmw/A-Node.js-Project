const multer = require('@koa/multer')
const path = require('path')
const fs = require('fs')

// 文件上传配置
const uploadConfig = {
    avatar: {
        dir: 'uploads/avatar',
        prefix: 'avatar',
        maxSize: 2 * 1024 * 1024  // 2MB
    },
    cover: {
        dir: 'uploads/article',
        prefix: 'article',
        maxSize: 5 * 1024 * 1024  // 5MB
    }
}

// 确保所有上传目录都存在
Object.values(uploadConfig).forEach(config => {
    if (!fs.existsSync(config.dir)) {
        fs.mkdirSync(config.dir, { recursive: true })
    }
})

// 获取文件配置
function getFileConfig(fieldName) {
    return uploadConfig[fieldName] || uploadConfig.avatar // 默认使用头像配置
}

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (ctx, file, cb) {
        console.log('ctx',ctx)
        console.log('ctx',ctx.uploadType)
        const config = getFileConfig(ctx.uploadType)
        console.log('保存文件到:', config.dir)
        cb(null, config.dir)
    },
    filename: function (ctx, file, cb) {
        console.log('原始文件名:', file.originalname)
        const config = getFileConfig(ctx.uploadType)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname).toLowerCase()
        const filename = `${config.prefix}-${uniqueSuffix}${ext}`
        console.log('生成的文件名:', filename)
        cb(null, filename)
    }
})

// 文件过滤器
const fileFilter = (ctx, file, cb) => {
    console.log('文件类型:', file.mimetype)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true)
    } else {
        cb(new Error('只允许上传 jpg、png、gif 格式的图片！'), false)
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
})
// 导出中间件工厂函数
module.exports =  {
    upload
}
