const connection = require('../app/database')

class ManagerService {
    async create(user) {
        const { username, password, auth } = user

        const statement = `INSERT INTO users (username,password,auth) VALUES (?,?,?)`

        const result = await connection.execute(statement, [username, password, auth])

        return result
    }
    async SelectAuth(id) {
        const statement = `SELECT auth FROM users WHERE id=(?)`
        const result = await connection.execute(statement, [id])
        return result[0]
    }
    
    async getUsernameByUsername(username) {
        const statement = `SELECT * FROM users WHERE username = ?;`
        const result = await connection.execute(statement, [username])
        return result[0]
    }
    async SelectBook (name) {
        const statement = `SELECT * FROM books WHERE name=?`
        const result = await connection.execute(statement, [name])
        return result[0]
    }
    async addBook (name,nums){
        const statement = `UPDATE books SET nums=nums+? WHERE name=?`
        const result = await connection.execute(statement, [nums,name])
        return result
    }
    async CreateBook (name,nums,price){
        const statement = `INSERT INTO books (name,nums,price) VALUES (?,?,?)`
        const result = await connection.execute(statement, [name,nums,price])
        console.log(result);
        return result
    }
}

module.exports = new ManagerService()