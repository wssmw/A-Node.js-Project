const connection = require('../app/database');
const { SERVER_HOST, SERVER_PORT } = process.env;
const md5password = require('../utils/passwordhandle');
const { generateUserId } = require('../utils/idGenerator');

class UserService {
    async create(user) {
        const {
            username,
            password = md5password(md5password('123456')),
            nickname = username,
            avatar_url = `http://${SERVER_HOST}:${SERVER_PORT}/uploads/avatar/defaultAvatar.png`,
        } = user;

        const id = generateUserId(); // 生成唯一的12位用户ID
        const statement = `
            INSERT INTO users (id, username, password, nickname, avatar_url) 
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            const [result] = await connection.execute(statement, [
                id,
                username,
                password,
                nickname,
                avatar_url,
            ]);
            return { ...result, id };
        } catch (error) {
            console.error('创建用户错误:', error);
            throw error;
        }
    }
    async update(user) {
        console.log(user, 'user');
        const { username, password = '', nickname, avatar_url } = user;

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

    async updateUserInfo(userId, userInfo) {
        let conn;
        try {
            // 获取连接
            conn = await connection.getConnection();

            // 开启事务
            await conn.beginTransaction();

            // 更新users表
            const userFields = ['nickname', 'avatar_url', 'email', 'phone'];
            const userUpdates = [];
            const userValues = [];

            userFields.forEach(field => {
                if (userInfo[field] !== undefined) {
                    userUpdates.push(`${field} = ?`);
                    userValues.push(userInfo[field]);
                }
            });

            if (userUpdates.length > 0) {
                const userSql = `
                    UPDATE users 
                    SET ${userUpdates.join(', ')}
                    WHERE id = ?
                `;
                userValues.push(userId);
                await conn.execute(userSql, userValues);
            }

            // 更新user_profiles表
            const profileFields = [
                'bio',
                'qq',
                'wechat',
                'github',
                'website',
                'location',
                'occupation',
                'company',
            ];
            const profileUpdates = [];
            const profileValues = [];

            profileFields.forEach(field => {
                if (userInfo[field] !== undefined) {
                    profileUpdates.push(`${field} = ?`);
                    profileValues.push(userInfo[field]);
                }
            });

            if (profileUpdates.length > 0) {
                // 检查是否存在profile记录
                const [profiles] = await conn.execute(
                    'SELECT id FROM user_profiles WHERE user_id = ?',
                    [userId]
                );

                if (profiles.length > 0) {
                    // 更新现有记录
                    const profileSql = `
                        UPDATE user_profiles 
                        SET ${profileUpdates.join(', ')}
                        WHERE user_id = ?
                    `;
                    profileValues.push(userId);
                    await conn.execute(profileSql, profileValues);
                } else {
                    // 创建新记录
                    const fields = [
                        'user_id',
                        ...profileFields.filter(
                            field => userInfo[field] !== undefined
                        ),
                    ];
                    const values = [userId, ...profileValues];
                    const profileSql = `
                        INSERT INTO user_profiles (${fields.join(', ')})
                        VALUES (${fields.map(() => '?').join(', ')})
                    `;
                    await conn.execute(profileSql, values);
                }
            }

            // 提交事务
            await conn.commit();

            // 返回更新后的用户信息
            return await this.getUserById(userId);
        } catch (error) {
            // 回滚事务
            if (conn) {
                await conn.rollback();
            }
            throw error;
        } finally {
            // 释放连接
            if (conn) {
                conn.release();
            }
        }
    }

    async deleteUser(userId) {
        let conn;
        try {
            // 获取连接
            conn = await connection.getConnection();

            // 开启事务
            await conn.beginTransaction();

            // 由于设置了外键CASCADE，删除用户时会自动删除相关的profile记录
            const sql = 'DELETE FROM users WHERE id = ?';
            const [result] = await conn.execute(sql, [userId]);

            // 提交事务
            await conn.commit();
            return result;
        } catch (error) {
            // 回滚事务
            if (conn) {
                await conn.rollback();
            }
            throw error;
        } finally {
            // 释放连接
            if (conn) {
                conn.release();
            }
        }
    }

    async getUserById(userId) {
        const sql = `
            SELECT 
                u.*,
                up.bio,
                up.qq,
                up.wechat,
                up.github,
                up.website,
                up.location,
                up.occupation,
                up.company
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = ?
        `;
        const [rows] = await connection.execute(sql, [userId]);
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password; // 删除敏感信息
            return user;
        }
        return null;
    }

    // 获取用户信息
    async getUserInfo(userId) {
        try {
            const statement = `
                SELECT 
                    u.*,
                    up.bio,
                    up.qq,
                    up.wechat,
                    up.github,
                    up.website,
                    up.location,
                    up.occupation,
                    up.company,
                    (SELECT COUNT(*) FROM articles WHERE user_id = u.id) as article_count,
                    (SELECT COUNT(*) FROM user_follows WHERE follower_id = u.id) as following_count,
                    (SELECT COUNT(*) FROM user_follows WHERE following_id = u.id) as follower_count,
                    (SELECT COUNT(*) FROM article_likes WHERE user_id = u.id) as like_count,
                    (SELECT COUNT(*) FROM article_views av 
                     JOIN articles a ON av.article_id = a.id 
                     WHERE a.user_id = u.id) as total_views,
                    (SELECT COUNT(DISTINCT av.ip) FROM article_views av 
                     JOIN articles a ON av.article_id = a.id 
                     WHERE a.user_id = u.id) as unique_views,
                    (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comment_count,
                    (SELECT COUNT(*) FROM collection_articles ca 
                     JOIN collections c ON ca.collection_id = c.id 
                     WHERE c.user_id = u.id) as collection_count,
                    (SELECT COUNT(*) FROM article_likes al 
                     JOIN articles a ON al.article_id = a.id 
                     WHERE a.user_id = u.id) as received_likes,
                    (SELECT COUNT(*) FROM comments c 
                     JOIN articles a ON c.article_id = a.id 
                     WHERE a.user_id = u.id) as received_comments
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = ?
            `;
            const [users] = await connection.execute(statement, [userId]);

            if (users.length === 0) {
                return null;
            }

            const user = users[0];

            // 计算一些额外的统计信息
            user.total_interactions =
                user.received_likes + user.received_comments;
            user.engagement_rate =
                user.article_count > 0
                    ? (user.total_interactions / user.article_count).toFixed(2)
                    : 0;

            return user;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            throw error;
        }
    }
}

module.exports = new UserService();
