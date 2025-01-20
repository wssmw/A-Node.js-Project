const connection = require("../app/database");

class UserService {
  async create(user) {
    console.log(user, 'user')
    const { username, password = "", nickname, avatar_url } = user;

    const statement = `INSERT INTO users (username,password,nickname,avatar_url) VALUES (?,?,?,?)`;

    const result = await connection.execute(statement, [
      username,
      password,
      nickname,
      avatar_url,
    ]);

    return result;
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
}

module.exports = new UserService();
