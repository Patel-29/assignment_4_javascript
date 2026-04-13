const pool = require("../db/pool.js");

exports.createUser = async (
    first_name, 
    last_name, 
    email, 
    password_hash
) => {
    const sql = `
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *
  `;

    const { rows } = await pool.query(sql, [
        first_name,
        last_name,
        email,
        password_hash
    ])

    return rows[0];
};

exports.updateUserMembership = async (userId) => {
    const sql = `UPDATE users SET is_member = true WHERE id = $1`;
    await pool.query(sql, [userId]);
};

exports.updateUserAdminStatus = async (userId) => {
    const sql = `
        UPDATE users
        SET is_admin = true, is_member = true
        WHERE id = $1
  `;
    await pool.query(sql, [userId])
};