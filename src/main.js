const app = require('./app');
const config = require('./app/config');

const connection = require('./app/database');

app.listen(config.SERVER_PORT, () => {
    console.log(`服务器在${config.SERVER_PORT}启动成功`);
});
