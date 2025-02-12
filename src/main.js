const config = require('./app/config');
require('dotenv-flow').config();

const app = require('./app');
const connection = require('./app/database');

app.listen(config.SERVER_PORT, () => {
    console.log(`服务器在${config.SERVER_PORT}启动成功`);
});
