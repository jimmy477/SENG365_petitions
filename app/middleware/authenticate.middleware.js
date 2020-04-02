const db = require('../../config/db');

exports.checkToken = async function (req, res, next) {
    /* Checks the authentication token given in the request to see if it matched a user in the database, if it is,
       it adds the user_id it matched to the request and continues */
    const token = req.header('X-Authorization');
    try {
        const result = await findUserIdByToken(token);
        if (result[0] === undefined) {  // No user with the given authentication token
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.authenticatedUserId = result[0].user_id.toString();  // Adds the user_id to the header to be used by other functions
            next();
        }
    } catch (err) {
        res.status(500)
            .send();
    }
};

// TODO check if these functions are used anywhere after refactoring
exports.checkUserIdExists = async function (req, res, next) {
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT name FROM User WHERE user_id = ?';
        const [result] = await conn.query(query, [req.params.id]);
        conn.release();
        if (result[0] === undefined) {
            res.status(404)
                .send();
        } else {
            next();
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.checkPetitionIdExists = async function (req, res, next) {
    try {
        const conn = await db.getPool().getConnection();
        const query = 'SELECT title FROM Petition WHERE petition_id = ?';
        const [result] = await conn.query(query, [req.params.id]);
        conn.release();
        if (result[0] === undefined) {
            res.status(404)
                .send();
        } else {
            next();
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.getUserId = async function (token) {
    /* Only to be used after checkToken */
    const user_id = await findUserIdByToken(token);
    return user_id[0].user_id
};

exports.getUserIdFromPetitionId = async function (petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT author_id FROM Petition WHERE petition_id = ?';
    const [user_id] = await conn.query(query, [petition_id]);
    conn.release();
    return user_id;
};

async function findUserIdByToken(token) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id FROM User WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    conn.release();
    return result;
}
