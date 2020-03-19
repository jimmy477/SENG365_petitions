const db = require('../../config/db');

exports.registerUser = async function (user_data) {
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) ' +
                  'VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.query(query, [user_data.name, user_data.email, user_data.password, user_data.city, user_data.country]);
    conn.release();
    return result.insertId;
};

exports.login = async function (user_data) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id FROM User WHERE email = ? AND password = ?';
    const [result] = await conn.query(query, [user_data.email, user_data.password]);
    conn.release();
    var token = randomNum() + randomNum();
    if (result[0] === undefined) {
        return null;
    } else {
        return {"userId": result[0].user_id, "token": token};
    }
};

function randomNum() {
    return Math.random().toString(36).substr(2);
}