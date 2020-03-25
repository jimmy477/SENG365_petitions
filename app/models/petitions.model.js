const db = require('../../config/db');

exports.getAll = async function (parameters) {

    console.log('Request to get all users from the database...');

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

    // console.log(query);

    let [rows] = await conn.query(query, param_array);
    conn.release();
    if (parameters.q !== undefined) {
        for (let i = 0; i < rows.length; i++) {
            if (!rows[i].title.includes(parameters.q)) {
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