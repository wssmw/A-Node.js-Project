const service = require('../service/user.service');
const fs = require('fs');
const path = require('path');
const { SERVER_HOST, SERVER_PORT } = process.env;
const { handeleErrorReturnMessage, handeleSuccessReturnMessage } = require('../utils');

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

    async updateUserAvatar(ctx) {
        try {
            const { id: userId } = ctx.userinfo;
            const file = ctx.request.file || ctx.file; // multer会将文件放在这两个位置之一
            if (!file) {
                handeleErrorReturnMessage(ctx, '请上传头像文件');
                return;
            }

            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.mimetype)) {
                // 删除上传的文件
                fs.unlinkSync(file.path);
                handeleErrorReturnMessage(ctx, '只支持 JPG、PNG、GIF 格式的图片');
                return;
            }

            // 获取旧头像信息
            const oldUser = await service.getUserById(userId);
            
            // 如果有旧头像且不是默认头像，则删除旧头像文件
            if (oldUser && oldUser.avatar_url && !oldUser.avatar_url.includes('defaultAvatar')) {
                const oldAvatarPath = path.join(__dirname, '../../', oldUser.avatar_url);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }

            // 更新用户头像
            const avatar_url = file.path.replace(/\\/g, '/'); // 统一使用正斜杠
            const result = await service.updateUserInfo(userId, {
                avatar_url
            });

            // 如果更新失败，删除上传的新文件
            if (!result) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                handeleErrorReturnMessage(ctx, '更新头像失败');
                return;
            }

            handeleSuccessReturnMessage(ctx, '头像更新成功', {
                userInfo: result
            });

        } catch (error) {
            console.error('错误详情:', error);
            // 发生错误时删除上传的文件
            const file = ctx.request.file || ctx.file;
            if (file && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            handeleErrorReturnMessage(ctx, '更新头像失败: ' + error.message);
        }
    }

    // 更新用户信息
    async updateUserInfo(ctx) {
        const { id: userId } = ctx.userinfo; // 从token中获取用户ID
        const userInfo = ctx.request.body;

        try {
            const updatedUser = await service.updateUserInfo(userId, userInfo);
            console.log(updatedUser,'updatedUser')
            handeleSuccessReturnMessage(ctx, '更新成功', {
                userInfo: updatedUser
            });
        } catch (error) {
            handeleErrorReturnMessage(ctx, '更新失败: ' + error.message);
        }
    }

    // 删除用户
    async deleteUser(ctx) {
        const { id: userId } = ctx.userinfo; // 从token中获取用户ID

        try {
            await service.deleteUser(userId);
            handeleSuccessReturnMessage(ctx, '删除成功');
        } catch (error) {
            handeleErrorReturnMessage(ctx, '删除失败: ' + error.message);
        }
    }
}

module.exports = new UserController();
