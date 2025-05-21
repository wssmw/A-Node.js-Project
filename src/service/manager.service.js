const connection = require('../app/database');
const { generateUserId, generateEntityId } = require('../utils/idGenerator');

class ManagerService {
    async create(user) {
        const { username, password, auth } = user;
        const id = generateUserId(); // 用户ID用12位

        const statement = `
            INSERT INTO users (id, username, password, auth) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await connection.execute(statement, [
            id,
            username,
            password,
            auth,
        ]);

        return { ...result, id };
    }
    async SelectAuth(id) {
        const statement = `SELECT auth FROM users WHERE id=(?)`;
        const result = await connection.execute(statement, [id]);
        return result[0];
    }

    async getUsernameByUsername(username) {
        const statement = `SELECT * FROM users WHERE username = ?;`;
        const result = await connection.execute(statement, [username]);
        return result[0];
    }
    async SelectBook(name) {
        const statement = `SELECT * FROM books WHERE name=?`;
        const result = await connection.execute(statement, [name]);
        return result[0];
    }
    async addBook(name, nums) {
        const statement = `UPDATE books SET nums=nums+? WHERE name=?`;
        const result = await connection.execute(statement, [nums, name]);
        return result;
    }
    async CreateBook(name, nums, price) {
        const id = generateEntityId(); // 图书ID用6位
        const statement = `
            INSERT INTO books (id, name, nums, price) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await connection.execute(statement, [
            id,
            name,
            nums,
            price,
        ]);
        return { ...result, id };
    }
}

module.exports = new ManagerService();
