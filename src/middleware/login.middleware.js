const jwt = require("jsonwebtoken");

const errType = require("../app/err.message");

const service = require("../service/user.service");

const md5password = require("../utils/passwordhandle");
const GITEE_AUTH_URL = 'https://gitee.com/oauth/authorize'
const CLIENT_ID =
  "345c224984e879d914da13cd4dd4b92cdbf217722342f2bfc46db724ca7ad681";
const CLIENT_SECRET =
  "9ae0cc711853df7e0b6441e2926c0bd3513dd6df57be5e79174a9ffb9da8868b";
const REDIRECTURL = "http://localhost:1234/login/gitee/callback";
const { PRIVATE_KEY, PUBLIC_KEY } = require("../app/config");
const { default: axios } = require("axios");
const { SERVER_HOST, SERVER_PORT } = process.env

const verifyLogin = async (ctx, next) => {
  // 1.拿到用户名和密码
  const { username, password } = ctx.request.body;
  // 2.判断账号密码是否为空
  if (username === "" || password === "" || !username || !password) {
    const err = new Error(errType.NAME_OR_PASSWORD_IS_NULL);
    return ctx.app.emit("err", err, ctx);
  }
  // 3.判断用户名是否存在
  const result = await service.getUsernameByusername(username);
  const userinfo = result[0];
  if (!userinfo) {
    const err = new Error(errType.USER_DOES_NOT_EXISTS);
    return ctx.app.emit("err", err, ctx);
  }
  // 4.判断账号密码和数据库中的是否相同
  if (userinfo.password != md5password(password)) {
    const err = new Error("123333");
    return ctx.app.emit("err", err, ctx);
  }
  if(userinfo.avatar_url) {
    userinfo.avatar_url = `http://${SERVER_HOST}:${SERVER_PORT}${userinfo.avatar_url}`
  }
  ctx.userinfo = userinfo;
  await next();
};

const testLogin = async (ctx, next) => {
  let authUrl = `${GITEE_AUTH_URL}?client_id=${CLIENT_ID}&redirect_uri=${CLIENT_SECRET}&response_type=code`
  ctx.redirect(authUrl)
}

const verifyAuth = async (ctx, next) => {
  const authorization = ctx.headers.authorization || "";
  const token = authorization.replace("Bearer ", "");
  try {
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    console.log("result:", result);
    ctx.userinfo = result;
    await next();
  } catch (error) {
    console.log("这出错了");
    const err = new Error(errType.UNAUTHORIZATION);
    return ctx.app.emit("err", err, ctx);
  }
};

// 获取accesstoken
const getAccessToken = async (ctx, next) => {
  console.log("这里执行");
  // 1.拿到code
  console.log(ctx.request.url, 'ctx')
  let url = ctx.request.url
  url = url.split('=')
  console.log(url)
  let code = url[1]
  console.log(code, 'code');
  // 2.获取accesstoken
  try {
    const tokenResponse = await axios.post("https://gitee.com/oauth/token", {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECTURL,
      grant_type: "authorization_code",
    });
    console.log(tokenResponse, 'tokenResponse')
    const { access_token } = tokenResponse.data;
    console.log(access_token, 'access_token')
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
    method: "get",
    url: "https://gitee.com/api/v5/user",
    params: {
      access_token,
    },
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${access_token}`,
    },
  });

  console.log("response", response.data);

  if (!response.data?.id) throw new Error("获取用户信息失败！");

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

module.exports = {
  verifyLogin,
  verifyAuth,
  getAccessToken,
  testLogin
};
