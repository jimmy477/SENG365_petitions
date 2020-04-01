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
    const query_token = 'SELECT user_id FROM User WHERE auth_token = ?';
    const [result_id] = await conn.query(query_token, [token]);
    conn.release();
    if (user_info[0] === undefined) {
        return null;
    }
    if (result_id[0] === undefined || result_id[0].user_id != user_id) {
        delete user_info[0].email;
    }
    return user_info[0];
};

exports.updateUserInfo = async function (user_id, update_info) {
    const conn = await db.getPool().getConnection();
    let set_query = 'SET';
    let set_params = [];
    if (update_info.name !== undefined) {
        set_params.push(update_info.name);
        set_query += ' name = ?';
    }
    if (update_info.email !== undefined) {
        if (set_params.length < 1) {
            set_query += ' email = ?';
        } else {
            set_query += ', email = ?'
        }
        set_params.push(update_info.email);
    }
    if (update_info.city !== undefined) {
        if (set_params.length < 1) {
            set_query += ' city = ?';
        } else {
            set_query += ', city = ?';
        }
        set_params.push(update_info.city);
    }
    if (update_info.country !== undefined) {
        if (set_params.length < 1) {
            set_query += ' country = ?';
        } else {
            set_query += ', country = ?';
        }
        set_params.push(update_info.country);
    }
    if (update_info.password !== undefined && update_info.currentPassword === undefined) {
        return 'no current password given'
    }
    if (update_info.password !== undefined && update_info.currentPassword !== undefined) {
        const check_password_query = 'SELECT password FROM User WHERE user_id = ?';
        const [hashed_password] = await conn.query(check_password_query, [user_id]);
        const password_correct = await passwords.compare(update_info.currentPassword, hashed_password[0].password);
        if (password_correct) {
            if (set_params.length < 1) {
                set_query += ' password = ?';
            } else {
                set_query += ', password = ?';
            }
            set_params.push(update_info.password);
        } else {
            return 'incorrect password'
        }

    }

    const query = 'UPDATE User ' + set_query + ' WHERE user_id = ?';
    set_params.push(user_id);
    const [result] = await conn.query(query, set_params);
    conn.release();
    return result;
};

async function comparePasswords(user_id, plain_text) {
    /**Compares a plainText password with the hashed password in the database and returns true if the same*/
    const conn = await db.getPool().getConnection();
    const check_password_query = 'SELECT password FROM User WHERE user_id = ?';
    const [hashed_password] = await conn.query(check_password_query, [user_id]);
    console.log(plain_text, user_id);
    console.log(hashed_password);
    return passwords.compare(plain_text, hashed_password[0].password);
}

function randomNum() {
    return Math.random().toString(36).substr(2);
}