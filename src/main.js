const config = require('./app/config');
require('dotenv-flow').config();
const { initDatabase } = require('./schema/init');

const app = require('./app');
const connection = require('./app/database');

console.log('testJenkins')

// 初始化数据库
initDatabase()
    .then(() => {
        // 启动服务器
        app.listen(config.SERVER_PORT, () => {
            console.log(`服务器在${config.SERVER_PORT}启动成功`);
        });
    })
    .catch(error => {
        console.error('服务器启动失败:', error);
        process.exit(1);
    });
