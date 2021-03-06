const db = require('../../config/db');
const authentication = require('../middleware/authenticate.middleware');


exports.getAll = async function (parameters) {
    /* Gets all the petitions which meet the criteria of the parameters */
    //const conn = await db.getPool().getConnection();
    const [extra_query, param_array] = createExtraQuery(parameters.categoryId, parameters.authorId);
    const order_by_query = createOrderByQuery(parameters.sortBy);
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
    let [rows] = await db.getPool().query(query, param_array);
    //conn.release();
    if (parameters.q !== undefined) {
        for (let i = 0; i < rows.length; i++) {
            const title = rows[i].title.toUpperCase();
            if (!title.includes(parameters.q.toUpperCase())) {  // If title does not include the search parameter q, remove from rows
                rows.splice(i, 1);
                i--;  //Needed as we are changing the length of rows as we delete things from it
            }
        }
    }
    if (parameters.startIndex !== undefined) {  // Removes all rows upto startIndex
        rows.splice(0, parameters.startIndex);
    }
    if (parameters.count !== undefined) {  // Removes all rows after the count
        rows = rows.splice(0, parameters.count);
    }
    return rows;
};

exports.addNewPetition = async function (user_id, petition_data) {
    /* Adds a new petition to the database */
    //const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO Petition (title, description, author_id, category_id, created_date, closing_date) ' +
        'VALUES (?, ?, ?, ?, ?, ?)';
    const now = new Date();
    const [result] = await db.getPool().query(query, [petition_data.title, petition_data.description, user_id, petition_data.categoryId, now, petition_data.closingDate]);
    //conn.release();
    return result.insertId;
};


exports.getPetitionById = async function (id) {
    //const conn = await db.getPool().getConnection();

    const query = 'SELECT p.petition_id as petitionId,' +
        'p.title, ' +
        'c.name as category, ' +
        'u.name as authorName, ' +
        'count(*) as signatureCount, ' +
        'p.description, ' +
        'p.author_id as authorId, ' +
        'u.city as authorCity, ' +
        'u.country as authorCountry, ' +
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
    const [petition_info] = await db.getPool().query(query, [id]);
    //conn.release();
    return petition_info[0]
};


exports.changePetitionById = async function (user_id, petition_id, changes) {
    const author_id = await getAuthorId(petition_id);
    if (author_id.length === 0) {
        return 'Petition does not exist';
    } else if (user_id != author_id[0].author_id) {
        return 'Cannot change petitions that are not your own';
    } else {
        //const conn = await db.getPool().getConnection();
        const [query, set_params] = createChangeQuery(changes, petition_id);
        await db.getPool().query(query, set_params);
        //conn.release();
    }
};

exports.deletePetitionById = async function (user_id, petition_id) {
    const author_id = await getAuthorId(petition_id);
    if (author_id.length === 0) {
        return 'Petition does not exist';
    } else if (user_id != author_id[0].author_id) {
        return 'cannot delete petitions that are not your own';
    } else {
        //const conn = await db.getPool().getConnection();
        const query = 'DELETE FROM Petition WHERE petition_id = ?';
        const delete_signatures_query = 'DELETE FROM Signature WHERE petition_id = ?';
        await db.getPool().query(query, [petition_id]);
        await db.getPool().query(delete_signatures_query, [petition_id]);
        //conn.release();
    }
};

exports.getAllCategories = async function () {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id as categoryId, name FROM Category';
    const [categories] = await db.getPool().query(query);
    //conn.release();
    return categories;
};

async function getAuthorId(petition_id) {
    //const conn = await db.getPool().getConnection();
    const query = 'SELECT author_id FROM Petition WHERE petition_id = ?';
    const [author_id] = await db.getPool().query(query, [petition_id]);
    return author_id;
}


function createExtraQuery(category_id, author_id) {
    let extra_query = '';
    let param_array = [];
    if (category_id !== undefined) {
        extra_query += 'AND category_id = ? ';
        param_array.push(category_id);
    }
    if (author_id !== undefined) {
        extra_query += 'AND author_id = ? ';
        param_array.push(author_id);
    }
    return [extra_query, param_array];
}


function createOrderByQuery(sort_by) {
    let order_by_query = 'ORDER BY signatureCount DESC, p.petition_id ASC';  // This is the default ORDER unless otherwise specified in parameters.sortBy
    if (sort_by !== undefined) {
        switch (sort_by) {
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
    return order_by_query;
}


function createChangeQuery(changes, petition_id) {
    let set_query = 'SET';
    let set_params = [];
    if (changes.title !== undefined) {
        set_query += ' title = ?';
        set_params.push(changes.title);
    }
    if (changes.description !== undefined) {
        if (set_params.length < 1) {
            set_query += ' description = ?';
        } else {
            set_query += ', description = ?';
        }
        set_params.push(changes.description);
    }
    if (changes.categoryId !== undefined) {
        if (set_params.length < 1) {
            set_query += ' category_id = ?';
        } else {
            set_query += ', category_id = ?';
        }
        set_params.push(changes.categoryId);
    }
    if (changes.closingDate !== undefined) {
        if (set_params.length < 1) {
            set_query += ' closing_date = ?';
        } else {
            set_query += ', closing_date = ?';
        }
        set_params.push(changes.closingDate);
    }
    const query = 'UPDATE Petition ' + set_query + ' WHERE petition_id = ?';
    set_params.push(petition_id);
    return [query, set_params]
}
