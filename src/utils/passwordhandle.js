const crypto = require('crypto')

const md5password = (password) => {
    const md5 = crypto.createHash('md5')
    const res = md5.update(password).digest('hex')
    console.log(res);
    return res
}

module.exports = md5password