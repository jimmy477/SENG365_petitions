const db = require('../../config/db');

exports.getAll = async function (parameters) {

    console.log('Request to get all users from the database...');

    const conn = await db.getPool().getConnection();
    let extra_query = '';
    let param_array = [];

    if (parameters.q !== undefined) {
        extra_query += '';
        param_array.push(parameters.q);
    }
    if (parameters.categoryId !== undefined) {
        extra_query += ' WHERE category_id = ?';
        param_array.push(parameters.categoryId);
    }
    if (parameters.authorId !== undefined) {
        extra_query += '';
        param_array.push(parseInt(parameters.authorId));
    }
    if (parameters.sortBy !== undefined) {
        extra_query += '';
        param_array.push(parameters.sortBy);
    }
    if (parameters.startIndex !== undefined && parameters.count === undefined) {
        extra_query += ' LIMIT ?, 9999999';
        param_array.push(parseInt(parameters.startIndex));
    }
    if (parameters.count !== undefined && parameters.startIndex === undefined) {
        extra_query += ' LIMIT ?';
        param_array.push(parseInt(parameters.count));
    }
    if (parameters.startIndex !== undefined && parameters.count !== undefined) {
        extra_query += ' LIMIT ?, ?';
        param_array.push(parseInt(parameters.startIndex));
        param_array.push(parseInt(parameters.count));
    }

    const query = 'SELECT * FROM Petition' + extra_query;

    // console.log(query);

    const [rows] = await conn.query(query, param_array);
    conn.release();
    return rows;
};