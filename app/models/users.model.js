const db = require('../../config/db');
const passwords = require('bcrypt');
const authentication = require('../middleware/authenticate.middleware');


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
    // Checks user has given correct credentials then assigns a random auth_token and puts this in the database
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id, password FROM User WHERE email = ?';
    const [result] = await conn.query(query, [user_data.email]);
    var token = randomNum() + randomNum();
    if (result[0] === undefined) {
        conn.release();
        return null;
    } else {
        const password_correct = passwords.compare(user_data.password, result[0].password);
        if (!password_correct) {
            conn.release();
            return null;
        } else {
            const token_query = 'UPDATE User SET auth_token = ? WHERE email = ?';
            await conn.query(token_query, [token, user_data.email]);
            conn.release();
            return {"userId": result[0].user_id, "token": token};
        }
    }
};

exports.logout = async function (user_id) {
    // Removes the auth_token from the users database row
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = NULL WHERE user_id = ?';
    const [result] = await conn.query(query, [user_id]);
    conn.release();
};

exports.getUserInfo = async function (user_id, token) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT name, city, country, email FROM User WHERE user_id = ?';
    const [user_info] = await conn.query(query, [user_id]);
    conn.release();
    if (user_info[0] === undefined) {
        return null;
    }
    const token_id = await authentication.findUserIdByToken(token);
    if (token_id[0].user_id != user_id) {
        delete user_info[0].email;
    }
    return user_info[0];
};

function randomNum() {
    return Math.random().toString(36).substr(2);
}