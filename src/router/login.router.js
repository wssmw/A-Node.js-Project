const Router = require('koa-router');

const {
    login,
    seccess,
    loginWithGitee,
} = require('../controller/login.controller');

const {
    verifyLogin,
    verifyAuth,
    getAccessToken,
    testLogin,
} = require('../middleware/login.middleware');

const loginRouter = new Router();
// 验证登录的中间件
// 登录
loginRouter.post('/login', verifyLogin, login);
// gitee登录
// loginRouter.post("/login/gitee", getAccessToken, loginWithGitee);
loginRouter.post('/login/gitee', testLogin);
loginRouter.get('/login/gitee/callback', getAccessToken, loginWithGitee);

// 验证登录是否成功
loginRouter.get('/test', verifyAuth, seccess);

module.exports = loginRouter;
