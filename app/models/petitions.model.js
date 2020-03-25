const db = require('../../config/db');
const authentication = require('../middleware/authenticate.middleware');

exports.getAll = async function (parameters) {
    /* Gets all the petitions which meet the criterea of the parameters */
    const conn = await db.getPool().getConnection();
    let extra_query = '';
    let order_by_query = 'ORDER BY signatureCount DESC, p.petition_id ASC';
    let param_array = [];

    if (parameters.categoryId !== undefined && parameters.authorId === undefined) {
        extra_query += 'AND category_id = ? ';
        param_array.push(parameters.categoryId);
    } else if (parameters.categoryId === undefined && parameters.authorId !== undefined) {
        extra_query += 'AND author_id = ? ';
        param_array.push(parameters.authorId);
    } else if (parameters.categoryId !== undefined && parameters.authorId !== undefined) {
        extra_query += 'AND category_id = ? AND author_id = ? ';
        param_array.push(parameters.categoryId);
        param_array.push(parameters.authorId);
    }
    if (parameters.sortBy !== undefined) {
        switch (parameters.sortBy) {
            case 'ALPHABETICAL_ASC':
                order_by_query = 'ORDER BY title ASC';
                break;
            case 'ALPHABETICAL_DESC':
                order_by_query = 'ORDER BY title DESC';
                break;
            case 'SIGNATURES_ASC':
                order_by_query = 'ORDER BY signatureCount ASC, p.petition_id ASC';
                break;
            case 'SIGNATURES_DESC':
                order_by_query = 'ORDER BY signatureCount DESC, p.petition_id ASC';
                break;
        }
    }

    const query = 'SELECT p.petition_id as petitionId, p.title, c.name as category, ' +
                  'u.name as authorName, count(*) as signatureCount ' +
                  'FROM Petition p ' +
                  'LEFT JOIN User u ' +
                      'ON p.author_id = u.user_id ' +
                  'LEFT JOIN Category c ' +
                      'USING (category_id) ' +
                  'LEFT JOIN Signature s ' +
                      'USING (petition_id) ' +
                  'WHERE 1=1 ' +
                   extra_query +
                  'GROUP BY p.petition_id ' +
                   order_by_query;

    let [rows] = await conn.query(query, param_array);
    conn.release();
    if (parameters.q !== undefined) {
        for (let i = 0; i < rows.length; i++) {
            let title = rows[i].title.toUpperCase();
            if (!title.includes(parameters.q.toUpperCase())) {
                rows.splice(i, 1);
                i--;    //Needed as we are changing the length of rows as we delete things from it
            }
        }
    }
    if (parameters.startIndex !== undefined) {
        rows.splice(0, parameters.startIndex);
    }
    if (parameters.count !== undefined) {
        rows = rows.splice(0, parameters.count);
    }
    return rows;
};

exports.addNewPetition = async function (auth_token, petition_data) {
    /* Adds a new petition to the database */
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) ' +
                  'VALUES (?, ?, ?, ?, ?, ?)';
    const user_id = await authentication.getUserId(auth_token);
    // let now = new Date().toISOString().replace('Z', '').replace('T', ' ');
    let now = new Date();
    const [result] = await conn.query(query, [petition_data.title, petition_data.description, user_id[0].user_id, petition_data.categoryId, now, petition_data.closingDate]);
    conn.release();
    return result.insertId;
};

exports.checkCategoryId = async function (categoryId) {
    /*Checks the given categoryId exists within the db*/
    const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id FROM Category WHERE category_id = ?';
    const [result] = await conn.query(query, [categoryId]);
    return result[0] !== undefined;
};

exports.getPetitionById = async function (id) {
    const conn = await db.getPool().getConnection();

    const query = 'SELECT p.petition_id as petitionId,' +
                         'p.title, ' +
                         'c.name as category, ' +
                         'u.name as authorName, ' +
                         'count(*) as signatureCount, ' +
                         'p.description, ' +
                         'p.author_id as authorId, ' +
                         'u.city, ' +
                         'u.country, ' +
                         'p.created_date as createdDate, ' +
                         'p.closing_date as closingDate ' +
                  'FROM Petition p ' +
                         'LEFT JOIN User u ' +
                             'ON p.author_id = u.user_id ' +
                         'LEFT JOIN Category c ' +
                             'USING (category_id) ' +
                         'LEFT JOIN Signature s ' +
                             'USING (petition_id) ' +
                  'WHERE petition_id = ?';
    const [petition_info] =  await conn.query(query, [id]);
    return petition_info[0]
};
