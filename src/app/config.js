const fs = require('fs');

const path = require('path');

// const PRIVATE_KEY = fs.readFileSync('src/app/keys/private.key')
const PRIVATE_KEY = fs.readFileSync(
    path.resolve(__dirname, './keys/private.key')
);

// const PUBLIC_KEY = fs.readFileSync('src/app/keys/public.key')
const PUBLIC_KEY = fs.readFileSync(
    path.resolve(__dirname, './keys/public.key')
);

module.exports = {
    SERVER_PORT,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,
} = process.env;

module.exports.PRIVATE_KEY = PRIVATE_KEY;
module.exports.PUBLIC_KEY = PUBLIC_KEY;
