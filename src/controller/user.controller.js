const service = require('../service/user.service');
const fs = require('fs').promises; // 使用 promises 版本的 fs
const fsSync = require('fs');
const path = require('path');
const { SERVER_HOST, SERVER_PORT } = process.env;
const { handeleErrorReturnMessage, handeleSuccessReturnMessage } = require('../utils');
const { getFileUrl } = require('../middleware/file.middleware');

// 添加 uploadDir 常量
const uploadDir = 'uploads/avatar';

// 安全删除文件函数
async function safeDeleteFile(filePath) {
    try {
        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('删除文件失败:', error);
        return false;
    }
}

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
        let newFilePath = null;
        try {
            const { id: userId } = ctx.userinfo;
            const files = ctx.request.files || ctx.files;
            const file = files[0];
            if (!files||files.length===0) {
                handeleErrorReturnMessage(ctx, '请上传头像文件');
                return;
            }

            newFilePath = file.path; // 保存新文件路径以便错误时删除

            // 检查文件类型
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.mimetype)) {
                await safeDeleteFile(file.path);
                handeleErrorReturnMessage(ctx, '只支持 JPG、PNG、GIF 格式的图片');
                return;
            }

            // 获取旧头像信息
            const oldUser = await service.getUserById(userId);
            
            // 如果有旧头像且不是默认头像，尝试删除旧文件
            if (oldUser?.avatar_url && !oldUser.avatar_url.includes('defaultAvatar')) {
                const oldPath = oldUser.avatar_url.split('/').slice(3).join('/');
                const oldAvatarPath = path.join(__dirname, '../../', oldPath);
                await safeDeleteFile(oldAvatarPath);
            }

            // 生成完整的文件URL
            const avatar_url = getFileUrl(file.path);

            // 更新用户头像
            const result = await service.updateUserInfo(userId, {
                avatar_url
            });

            // 如果更新失败，删除上传的新文件
            if (!result) {
                await safeDeleteFile(file.path);
                handeleErrorReturnMessage(ctx, '更新头像失败');
                return;
            }

            handeleSuccessReturnMessage(ctx, '头像更新成功', {
                userInfo: result
            });

        } catch (error) {
            console.error('更新头像错误:', error);
            // 发生错误时尝试删除新上传的文件
            if (newFilePath) {
                await safeDeleteFile(newFilePath);
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
