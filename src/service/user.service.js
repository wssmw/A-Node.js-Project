const connection = require('../app/database')

class UserService{
    async create(user) {
        const {username,password,auth} = user
        
        const statement = `INSERT INTO users (username,password,auth) VALUES (?,?,?)`

        const result = await connection.execute(statement, [username,password,auth])

        return result
    }

    async getUsernameByusername(username){
        const statement = `SELECT * FROM users WHERE username = ?;`
        const result = await connection.execute(statement,[username])
        return result[0]
    }
}

module.exports = new UserService()