const connection = require("../app/database");
const { SERVER_HOST, SERVER_PORT } = process.env

class UserService {
  async create(user) {
    // 解构用户数据，设置默认值
    const { 
      username, 
      password,
      nickname = username, // 如果没有提供昵称，使用用户名
      avatar_url = null   // 如果没有提供头像，使用null
    } = user

    const statement = `INSERT INTO users (username, password, nickname, avatar_url) VALUES (?, ?, ?, ?);`

    try {
      const [result] = await connection.execute(statement, [
        username,
        password,
        nickname,
        avatar_url
      ])
      return result
    } catch (error) {
      console.error('创建用户错误:', error)
      throw error
    }
  }
  async update(user) {
    console.log(user, 'user')
    const { username, password = "", nickname, avatar_url } = user;

    const statement = `UPDATE users SET nickname = ?,avatar_url = ? WHERE username = ?`;

    const result = await connection.execute(statement, [
      nickname,
      avatar_url,
      username,
    ]);

    return result;
  }

  async getUsernameByusername(username) {
    const statement = `SELECT * FROM users WHERE username = ?;`;
    const result = await connection.execute(statement, [username]);
    return result[0];
  }

  async updateUserInfo(userId, userData) {
    try {
      const { nickname, avatar_url } = userData
      const updateFields = []
      const params = []

      if (nickname !== undefined) {
        updateFields.push('nickname = ?')
        params.push(nickname)
      }

      if (avatar_url !== undefined) {
        updateFields.push('avatar_url = ?')
        params.push(avatar_url)
      }

      if (updateFields.length === 0) {
        return { affected: 0 }
      }

      params.push(userId)

      const sql = `
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = ?
      `

      const [result] = await connection.execute(sql, params)
      return { affected: result.affectedRows }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      throw error
    }
  }

  async getUserById(id) {
    try {
      const [users] = await connection.execute(
        'SELECT id, username, nickname, avatar_url FROM users WHERE id = ?',
        [id]
      )
      
      // 处理头像URL
      if (users[0] && users[0].avatar_url) {
        users[0].avatar_url = `http://${SERVER_HOST}:${SERVER_PORT}${users[0].avatar_url}`
      }
      
      return users[0]
    } catch (error) {
      console.error('获取用户信息错误:', error)
      throw error
    }
  }
}

module.exports = new UserService();
