const crypto = require('crypto');

// 基于时间戳和随机数的混合算法生成唯一ID
function generateUniqueId(length) {
    // 获取当前时间戳（毫秒）
    const timestamp = Date.now().toString();

    // 生成4字节随机数
    const randomBytes = crypto.randomBytes(4).toString('hex');

    // 组合时间戳和随机数
    const combined = timestamp + randomBytes;

    // 使用 SHA-256 哈希
    const hash = crypto.createHash('sha256').update(combined).digest('hex');

    // 转换为62进制（数字+大小写字母）
    const base62chars =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let uniqueId = '';

    // 取哈希的前几位转换为62进制
    for (let i = 0; i < length; i++) {
        const index = parseInt(hash.substr(i * 2, 2), 16) % 62;
        uniqueId += base62chars[index];
    }

    return uniqueId;
}

// 生成12位用户ID
function generateUserId() {
    return generateUniqueId(12);
}

// 生成6位其他实体ID
function generateEntityId() {
    return generateUniqueId(6);
}

module.exports = {
    generateUserId,
    generateEntityId,
};
