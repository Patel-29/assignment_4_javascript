const pool = require("../db/pool.js");

exports.getAllMessages = async () => {
    const sql = `
        SELECT 
          messages.id,
          messages.title,
          messages.body,
          messages.created_at,
          messages.user_id,
          users.first_name,
          users.last_name
        FROM messages
        JOIN users ON messages.user_id = users.id
        ORDER BY messages.created_at DESC;`;
    
    const { rows } = await pool.query(sql);
    return rows;
};

exports.createMessage = async (title, body, userId) => {
    const sql = `
        INSERT INTO messages (title, body, user_id)
        VALUES ($1, $2, $3)
        `;
    await pool.query(sql, [title, body, userId]);
};

exports.deleletMessage = async (messageId) => {
    const sql = `DELETE FROM messages WHERE id = $1`;
    await pool.query(sql, [messageId]);
}

