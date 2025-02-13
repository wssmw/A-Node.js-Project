/**
 * 对成功的返回数据进行改造
 * 与此函数相关联引入的其他函数，并说明该函数具体位置以及说明其功能
 * @param {string} ctx
 * @param {string} message 成功信息
 * @param {Object} data 参数
 */
const handeleSuccessReturnMessage = (ctx, message = '成功', data) => {
    ctx.body = {
        success: true,
        code: 200,
        message,
        data,
    };
};

/**
 * 对错误的返回数据进行改造
 * 与此函数相关联引入的其他函数，并说明该函数具体位置以及说明其功能
 * @param {string} ctx
 * @param {string} message 失败原因
 */
const handeleErrorReturnMessage = (ctx, message = '失败') => {
    ctx.body = {
        success: false,
        code: 400,
        message,
    };
};
module.exports = {
    handeleSuccessReturnMessage,
    handeleErrorReturnMessage,
};
