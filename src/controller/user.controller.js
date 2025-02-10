const service = require('../service/user.service');
const fs = require('fs');
const path = require('path');
const { SERVER_HOST, SERVER_PORT } = process.env;

// 添加 uploadDir 常量
const uploadDir = 'uploads/avatar';

class UserController {
    async create(ctx, next) {
        // 获取用户请求的参数
        const user = ctx.request.body;

        console.log(user);

        // 查询数据
        const res = await service.create(user);
        console.log(res, 'restes');
        // 返回数据
        ctx.body = {
            code: 200,
            message: '创建成功',
            success: true,
            data: {
                userInfo: user,
            },
        };
    }

    async updateInfo(ctx) {
        console.log('开始处理更新请求');
        try {
            const { id: userId } = ctx.userinfo;
            const { nickname } = ctx.request.body;
            const file = ctx.file; // 改为从 ctx.file 获取文件信息

            console.log('文件信息:', file);
            console.log('请求体:', ctx.request.body);
            console.log('用户ID:', userId);

            // 验证昵称
            if (nickname !== undefined && nickname.length > 30) {
                ctx.status = 400;
                ctx.body = {
                    code: 400,
                    message: '昵称长度不能超过30个字符',
                };
                return;
            }

            // 处理头像
            let avatar_url = undefined;
            if (file) {
                console.log('处理文件:', file.path);
                // 获取旧头像信息
                const oldUser = await service.getUserById(userId);
                // 删除旧头像文件
                if (oldUser && oldUser.avatar_url) {
                    const oldAvatarPath = path.join(
                        __dirname,
                        `../../${oldUser.avatar_url}`
                    );
                    console.log('oldAvatarPath', oldAvatarPath);
                    if (fs.existsSync(oldAvatarPath)) {
                        fs.unlinkSync(oldAvatarPath);
                    }
                }

                // 设置新头像URL
                avatar_url = file.path;
                console.log('新头像URL:', avatar_url);
            }

            // 更新用户信息
            const result = await service.updateUserInfo(userId, {
                nickname,
                avatar_url,
            });

            console.log('更新结果:', result);

            if (result.affected === 0) {
                // 如果更新失败且上传了新文件，删除新上传的文件
                if (file) {
                    const filePath = path.join(__dirname, '../../', avatar_url);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }

                ctx.body = {
                    code: 200,
                    message: '没有信息需要更新',
                };
                return;
            }

            // 获取更新后的用户信息
            const updatedUser = await service.getUserById(userId);

            // 添加完整的图片URL
            if (updatedUser.avatar_url) {
                let avatar_url = JSON.parse(
                    JSON.stringify(updatedUser.avatar_url)
                );
                updatedUser.avatar_url = `${avatar_url}`;
            }

            ctx.body = {
                code: 200,
                message: '用户信息更新成功',
                data: updatedUser,
            };
        } catch (error) {
            console.error('完整错误信息:', error);
            // 如果出错且上传了文件，删除文件
            if (ctx.file) {
                // 改为检查 ctx.file
                const filePath = ctx.file.path;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            ctx.status = 500;
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                error: error.message,
            };
        }
    }
}

module.exports = new UserController();
