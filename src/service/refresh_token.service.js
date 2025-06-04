const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class RefreshTokenService {
    async create(userId, token, expiresAt) {
        const id = generateEntityId();
        console.log(id, userId, token, expiresAt, 'id');
        const statement = `
            INSERT INTO refresh_tokens (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await connection.execute(statement, [
            id,
            userId,
            token,
            expiresAt,
        ]);
        return result;
    }

    async findByToken(token) {
        const statement = `
            SELECT * FROM refresh_tokens 
            WHERE token = ? AND expires_at > NOW()
        `;
        const [result] = await connection.execute(statement, [token]);
        return result[0];
    }

    async deleteByUserId(userId) {
        const statement = `
            DELETE FROM refresh_tokens 
            WHERE user_id = ?
        `;
        const [result] = await connection.execute(statement, [userId]);
        return result;
    }

    async deleteByToken(token) {
        const statement = `
            DELETE FROM refresh_tokens 
            WHERE token = ?
        `;
        const [result] = await connection.execute(statement, [token]);
        return result;
    }
}

module.exports = new RefreshTokenService();
