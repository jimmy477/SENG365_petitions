const db = require('../../config/db');
const passwords = require('bcrypt');


exports.registerUser = async function (user_data) {
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) ' +
                  'VALUES (?, ?, ?, ?, ?)';
    const hashed_password = await passwords.hash(user_data.password, 10);
    const [result] = await conn.query(query, [user_data.name, user_data.email, hashed_password, user_data.city, user_data.country]);
    conn.release();
    return result.insertId;
};

exports.login = async function (user_data) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id, password FROM User WHERE email = ?';
    const [result] = await conn.query(query, [user_data.email]);
    conn.release();
    var token = randomNum() + randomNum();
    password_correct = await passwords.compare(user_data.password, result[0].password);
    if (result[0] === undefined || !password_correct) {
        return null;
    } else {
        return {"userId": result[0].user_id, "token": token};
    }
};

function randomNum() {
    return Math.random().toString(36).substr(2);
}