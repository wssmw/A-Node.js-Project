const jwt = require('jsonwebtoken');

const errType = require('../app/err.message');

const service = require('../service/user.service');

const md5password = require('../utils/passwordhandle');

const { GITEE_LOGIN_REDIRECTURL } = process.env;
const { PRIVATE_KEY, PUBLIC_KEY } = require('../app/config');
const { default: axios } = require('axios');
const { handeleSuccessReturnMessage } = require('../utils');
const {
    SERVER_HOST,
    SERVER_PORT,
    GITEE_AUTH_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    GITEE_OWNER,
    GITEE_REPO,
    SHA,
    GITEE_ACCESS_TOKEN,
} = process.env;
console.log(
    GITEE_AUTH_URL,
    CLIENT_ID,
    CLIENT_SECRET,
    GITEE_OWNER,
    GITEE_REPO,
    SHA,
    GITEE_ACCESS_TOKEN
);
const verifyLogin = async (ctx, next) => {
    // 1.拿到用户名和密码
    const { username, password } = ctx.request.body;
    // 2.判断账号密码是否为空
    if (username === '' || password === '' || !username || !password) {
        const err = new Error(errType.NAME_OR_PASSWORD_IS_NULL);
        return ctx.app.emit('err', err, ctx);
    }
    // 3.判断用户名是否存在
    const result = await service.getUsernameByusername(username);
    const userinfo = result[0];
    if (!userinfo) {
        const err = new Error(errType.USER_DOES_NOT_EXISTS);
        return ctx.app.emit('err', err, ctx);
    }
    // 4.判断账号密码和数据库中的是否相同
    if (userinfo.password != md5password(password)) {
        const err = new Error('password_is_incorrent');
        return ctx.app.emit('err', err, ctx);
    }
    // if (userinfo.avatar_url) {
    //     userinfo.avatar_url = `http://${SERVER_HOST}:${SERVER_PORT}${userinfo.avatar_url}`;
    // }
    ctx.userinfo = userinfo;
    await next();
};

const redirectLogin = async (ctx, next) => {
    console.log(GITEE_LOGIN_REDIRECTURL, 'GITEE_LOGIN_REDIRECTURL');

    let authUrl = `${GITEE_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${GITEE_LOGIN_REDIRECTURL}&response_type=code`;
    console.log(authUrl, 'authUrl');
    ctx.redirect(authUrl);
};

const verifyAuth = async (ctx, next) => {
    const authorization = ctx.headers.authorization || '';
    const token = authorization.replace('Bearer ', '');
    console.log(token, 'token');
    try {
        const result = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256'],
        });
        console.log('result:', result);
        ctx.userinfo = result;
        await next();
    } catch (error) {
        console.log('这出错了');
        const err = new Error(errType.UNAUTHORIZATION);
        return ctx.app.emit('err', err, ctx);
    }
};

// 获取accesstoken
const getAccessToken = async (ctx, next) => {
    console.log('这里执行');
    // 1.拿到code
    let { code } = ctx.query;
    console.log(code, 'code');
    // 2.获取accesstoken
    try {
        const tokenResponse = await axios.post(
            'https://gitee.com/oauth/token',
            {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: GITEE_LOGIN_REDIRECTURL,
                grant_type: 'authorization_code',
            }
        );
        const { access_token } = tokenResponse.data;
        let userInfo = await getUserInfo(access_token);
        let { login, name, avatar_url } = userInfo;
        userInfo = {
            username: login,
            nickname: name,
            avatar_url: avatar_url,
        };
        ctx.userInfo = userInfo;
        await next();
    } catch (error) {
        ctx.body = error.response.data;
    }
};

// 获取用户信息
async function getUserInfo(access_token) {
    //官方文档： https://gitee.com/api/v5/swagger#/getV5User
    const response = await axios({
        method: 'get',
        url: 'https://gitee.com/api/v5/user',
        params: {
            access_token,
        },
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${access_token}`,
        },
    });

    console.log('response', response.data);

    if (!response.data?.id) throw new Error('获取用户信息失败！');

    /**
    response.data = {
      "id": 9534923,
      "login": "china-quanda",
      "name": "China-Quanda",
      "avatar_url": "https://foruda.gitee.com/avatar/1677178346321314348/9534923_china-quanda_1627964208.png",
      "url": "https://gitee.com/api/v5/users/china-quanda",
      "html_url": "https://gitee.com/china-quanda",
      "remark": "",
      "followers_url": "https://gitee.com/api/v5/users/china-quanda/followers",
      "following_url": "https://gitee.com/api/v5/users/china-quanda/following_url{/other_user}",
      "gists_url": "https://gitee.com/api/v5/users/china-quanda/gists{/gist_id}",
      "starred_url": "https://gitee.com/api/v5/users/china-quanda/starred{/owner}{/repo}",
      "subscriptions_url": "https://gitee.com/api/v5/users/china-quanda/subscriptions",
      "organizations_url": "https://gitee.com/api/v5/users/china-quanda/orgs",
      "repos_url": "https://gitee.com/api/v5/users/china-quanda/repos",
      "events_url": "https://gitee.com/api/v5/users/china-quanda/events{/privacy}",
      "received_events_url": "https://gitee.com/api/v5/users/china-quanda/received_events",
      "type": "User",
      "blog": null,
      "weibo": null,
      "bio": "时间过得很快，不记录很难回忆起来",
      "public_repos": 11,
      "public_gists": 0,
      "followers": 4,
      "following": 10,
      "stared": 241,
      "watched": 29,
      "created_at": "2021-08-03T12:11:18+08:00",
      "updated_at": "2024-09-08T14:52:57+08:00",
      "email": "864910436@qq.com"
    }
    */

    return response.data;
}

// 可选的身份验证中间件
const verifyAuthOptional = async (ctx, next) => {
    const authorization = ctx.headers.authorization;
    if (!authorization) {
        // 如果没有token，继续执行但不设置userinfo
        await next();
        return;
    }
    console.log('authorization>>', authorization);
    try {
        const token = authorization.replace('Bearer ', '');
        const result = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256'],
        });
        ctx.userinfo = result;
    } catch (err) {
        // 如果token无效，不设置userinfo
        console.error('Token verification failed:', err);
    }
    // 无论token是否有效，都继续执行
    await next();
};

const getCommitMessage = async (ctx, next) => {
    const result = await axios.get(
        `https://gitee.com/api/v5/repos/${GITEE_OWNER}/${GITEE_REPO}/commits?access_token=${GITEE_ACCESS_TOKEN}&sha=${SHA}`
    );
    handeleSuccessReturnMessage(ctx, '获取成功', {
        commits: result.data,
        total: result.data.length,
    });
};

module.exports = {
    verifyLogin,
    verifyAuth,
    verifyAuthOptional,
    getAccessToken,
    redirectLogin,
    getCommitMessage,
};
