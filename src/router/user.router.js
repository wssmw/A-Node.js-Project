const Router = require('koa-router');
const {
    verifyAuth,
    verifyAuthOptional,
    getCommitMessage,
} = require('../middleware/login.middleware');
const {
    create,
    updateUserAvatar,
    updateUserInfo,
    deleteUser,
    getUserInfo,
} = require('../controller/user.controller');
const { verifyUser, handlePassword } = require('../middleware/user.middleware');
const { upload } = require('../middleware/file.middleware');

const userRouter = new Router({ prefix: '/users' });

// 注册
userRouter.post('/register', verifyUser, handlePassword, create);

// 更新用户头像
userRouter.post(
    '/updateUserAvatar',
    verifyAuth,
    upload.any(),
    updateUserAvatar
);

// 更新用户信息
userRouter.post('/updateUserInfo', verifyAuth, updateUserInfo);

// 删除用户
userRouter.post('/deleteUser', verifyAuth, deleteUser);

userRouter.get('/getCommitMessage', getCommitMessage);
// 获取用户信息（可选登录）
userRouter.get('/:id', verifyAuthOptional, getUserInfo);

module.exports = userRouter;
