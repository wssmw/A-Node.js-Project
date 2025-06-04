const jwt = require('jsonwebtoken');
const { PRIVATE_KEY } = require('../app/config');
const service = require('../service/user.service');
const refreshTokenService = require('../service/refresh_token.service');
const { handeleSuccessReturnMessage } = require('../utils');

class LoginController {
    async login(ctx, next) {
        const { id, username } = ctx.userinfo;

        // 生成访问令牌（15分钟过期）
        const token = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 1, // 15分钟
            algorithm: 'RS256',
        });

        // 生成刷新令牌（7天过期）
        const refreshToken = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24 * 7, // 7天
            algorithm: 'RS256',
        });

        // 保存刷新令牌到数据库
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refreshTokenService.create(id, refreshToken, expiresAt);

        handeleSuccessReturnMessage(ctx, '登录成功', {
            token,
            refreshToken,
            userInfo: ctx.userinfo,
        });
    }

    async refreshToken(ctx, next) {
        const authorization = ctx.headers.authorization || '';
        const refreshToken = authorization.replace('Bearer ', '');
        console.log(refreshToken, 'refreshToken');
        try {
            // 验证刷新令牌
            const decoded = jwt.verify(refreshToken, PRIVATE_KEY, {
                algorithms: ['RS256'],
            });
            console.log(decoded, 'decoded');
            // 检查数据库中是否存在该刷新令牌
            const tokenRecord =
                await refreshTokenService.findByToken(refreshToken);
            if (!tokenRecord) {
                const err = new Error('无效的刷新令牌');
                return ctx.app.emit('err', err, ctx);
            }

            // 获取用户信息
            const user = await service.getUserById(decoded.id);
            if (!user) {
                const err = new Error('用户不存在');
                return ctx.app.emit('err', err, ctx);
            }

            // 生成新的访问令牌
            const accessToken = jwt.sign(
                { id: user.id, username: user.username },
                PRIVATE_KEY,
                {
                    expiresIn: 60 * 15, // 15分钟
                    algorithm: 'RS256',
                }
            );

            // 生成新的刷新令牌
            const newRefreshToken = jwt.sign(
                { id: user.id, username: user.username },
                PRIVATE_KEY,
                {
                    expiresIn: 60 * 60 * 24 * 7, // 7天
                    algorithm: 'RS256',
                }
            );

            // 删除旧的刷新令牌
            await refreshTokenService.deleteByToken(refreshToken);

            // 保存新的刷新令牌
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await refreshTokenService.create(
                user.id,
                newRefreshToken,
                expiresAt
            );

            handeleSuccessReturnMessage(ctx, '令牌刷新成功', {
                token: accessToken,
                refreshToken: newRefreshToken,
                userInfo: user,
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                // 删除过期的刷新令牌
                await refreshTokenService.deleteByToken(refreshToken);
                const err = new Error('REFRESH_TOKEN_EXPIRED');
                return ctx.app.emit('err', err, ctx);
            }
            const err = new Error('无效的刷新令牌');
            return ctx.app.emit('err', err, ctx);
        }
    }

    async logout(ctx, next) {
        const authorization = ctx.headers.authorization || '';
        const refreshToken = authorization.replace('Bearer ', '');
        if (refreshToken) {
            await refreshTokenService.deleteByToken(refreshToken);
        }
        handeleSuccessReturnMessage(ctx, '登出成功');
    }

    async loginWithGitee(ctx, next) {
        let userInfo = ctx.userInfo;
        let { username } = userInfo;

        // 1.判断用户名是否存在
        let result = await service.getUsernameByusername(username);
        const userinfo = result[0];

        if (!userinfo) {
            const res = await service.create(userInfo);
        } else {
            const res = await service.update(userInfo);
        }

        result = await service.getUsernameByusername(username);
        let { id } = result;

        // 生成访问令牌（15分钟过期）
        const accessToken = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 15,
            algorithm: 'RS256',
        });

        // 生成刷新令牌（7天过期）
        const refreshToken = jwt.sign({ id, username }, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24 * 7, // 7天
            algorithm: 'RS256',
        });

        // 保存刷新令牌到数据库
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await refreshTokenService.create(id, refreshToken, expiresAt);

        handeleSuccessReturnMessage(ctx, '登录成功', {
            accessToken,
            refreshToken,
            userInfo: {
                ...result[0],
            },
        });
    }

    async seccess(ctx, next) {
        ctx.body = '授权成功';
    }
}

module.exports = new LoginController();
