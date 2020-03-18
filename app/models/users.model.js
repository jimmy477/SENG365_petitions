const db = require('../../config/db');

exports.registerUser = async function (user_data) {

    console.log('Request to register a user to the database...');

    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) ' +
                  'VALUES (?, ?, ?, ?, ?)';
    const [result] = await conn.query(query, [user_data.name, user_data.email, user_data.password, user_data.city, user_data.country]);
    conn.release();
    return result.insertId;
};