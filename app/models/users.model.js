const db = require('../../config/db');
const passwords = require('bcrypt');


exports.registerUser = async function (user_data) {
    // Registers a new user and stores their data in the database
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
    conn.release();
    if (result[0] === undefined) {  // No user with given email
        return null;
    } else {
        const password_correct = passwords.compare(user_data.password, result[0].password);
        if (!password_correct) {
            return null;
        } else {
            var token = randomNum() + randomNum();  // Generate a random number for the authentication token
            const token_query = 'UPDATE User SET auth_token = ? WHERE email = ?';  // Set the authentication token in the database
            await conn.query(token_query, [token, user_data.email]);
            return {"userId": result[0].user_id, "token": token};
        }
    }
};


exports.logout = async function (user_id) {
    // Removes the auth_token from the users database row
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = NULL WHERE user_id = ?';
    await conn.query(query, [user_id]);
    conn.release();
};


exports.getUserInfo = async function (user_id, token) {
    /* Retrieves information about the user with user_id, includes the email field only if the token matches the token of
       the user they are requesting */
    const conn = await db.getPool().getConnection();
    const query = 'SELECT name, city, country, email FROM User WHERE user_id = ?';  // Get the user info
    const [user_info] = await conn.query(query, [user_id]);
    const query_token = 'SELECT user_id FROM User WHERE auth_token = ?';  // Get the user_id to match the given authentication token
    const [result_id] = await conn.query(query_token, [token]);
    conn.release();
    if (user_info[0] === undefined) {  // No user with given user_id
        return null;
    }
    if (result_id[0] === undefined || result_id[0].user_id != user_id) {  // If the given authentication token does not match requested user_id info delete the email from response
        delete user_info[0].email;
    }
    return user_info[0];
};


exports.updateUserInfo = async function (user_id, update_info) {
    /* Updates an already registered users details as given in update_info */
    const conn = await db.getPool().getConnection();
    let set_query = 'SET';
    let set_params = [];
    if (update_info.name !== undefined) {
        set_params.push(update_info.name);
        set_query += ' name = ?';
    }
    if (update_info.email !== undefined) {
        if (!req.body.email.includes('@')) {  // Check the email is valid
            return 'Email is invalid';
        } else if (set_params.length < 1) {  // Check if this is the first parameter being SET
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
    if (update_info.password !== undefined && update_info.currentPassword === undefined) {  // If a password is given but no current password then this is an invalid request
        return 'No current password given'
    }
    if (update_info.password !== undefined && update_info.currentPassword !== undefined) {  // If both current password and new password given, check current password matched what's in the database
        const check_password_query = 'SELECT password FROM User WHERE user_id = ?';
        const [hashed_password] = await conn.query(check_password_query, [user_id]);
        const password_correct = await passwords.compare(update_info.currentPassword, hashed_password[0].password);
        if (password_correct) {
            if (set_params.length < 1) {
                set_query += ' password = ?';
            } else {
                set_query += ', password = ?';
            }
            const new_hashed_password = await passwords.hash(update_info.password, 10);
            set_params.push(new_hashed_password);
        } else {
            return 'Incorrect password'
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