const Router = require('koa-router');
const {
    verifyAuth,
    getCommitMessage,
} = require('../middleware/login.middleware');
const { create, updateUserAvatar, updateUserInfo, deleteUser } = require('../controller/user.controller');
const { verifyUser, handlePassword } = require('../middleware/user.middleware');
const { upload } = require('../middleware/file.middleware');


const userRouter = new Router({ prefix: '/users' });

userRouter.post('/register', verifyUser, handlePassword, create);

// 更新用户头像
userRouter.post(
    '/updateUserAvatar', 
    verifyAuth,
    upload.single('avatar'),
    updateUserAvatar
);

// 更新用户信息
userRouter.post('/updateUserInfo', verifyAuth, updateUserInfo);

// 删除用户
userRouter.post('/deleteUser', verifyAuth, deleteUser);
userRouter.get('/getCommitMessage', getCommitMessage);

module.exports = userRouter;
