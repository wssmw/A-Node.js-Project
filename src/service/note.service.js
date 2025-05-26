const connection = require('../app/database');
const { generateEntityId } = require('../utils/idGenerator');

class NoteService {
    async createNote(noteData) {
        const { title, content, weather = null, note_time, userId } = noteData;
        const id = generateEntityId();
        try {
            await connection.execute(
                `INSERT INTO notes (id, user_id, title, content, weather, note_time) VALUES (?, ?, ?, ?, ?, ?)`,
                [id, userId, title, content, weather, note_time]
            );
            return { id };
        } catch (error) {
            console.error('创建小记错误:', error);
            throw error;
        }
    }

    async getNoteById(id, userId) {
        const statement = `SELECT * FROM notes WHERE id = ? AND user_id = ?`;
        const [rows] = await connection.execute(statement, [id, userId]);
        return rows[0] || null;
    }

    async getNotesByUser(userId, offset = 0, limit = 10) {
        console.log(userId, offset, limit, 'userId, offset, limit');
        const statement = `SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
        const [rows] = await connection.execute(statement, [userId]);
        return rows;
    }

    async updateNote(id, userId, updateData) {
        const fields = [];
        const values = [];
        for (const key in updateData) {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        }
        if (fields.length === 0) return false;
        const statement = `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
        values.push(id, userId);
        const [result] = await connection.execute(statement, values);
        return result.affectedRows > 0;
    }

    async deleteNote(id, userId) {
        const statement = `DELETE FROM notes WHERE id = ? AND user_id = ?`;
        const [result] = await connection.execute(statement, [id, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = new NoteService();
