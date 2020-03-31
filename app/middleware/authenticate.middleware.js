const db = require('../../config/db');

exports.checkToken = async function (req, res, next) {
    const token = req.header('X-Authorization');
    try {
        const result = await findUserIdByToken(token);
        console.log(result);
        if (result[0] === undefined) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send();
        } else {
            req.authenticatedUserId = result[0].user_id.toString();
            next();
        }
    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send();
    }
};

exports.checkIdExists = async function (req, res, next) {
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

exports.getUserId = async function (token) {
    /* Only to be used after checkToken */
    const user_id = await findUserIdByToken(token);
    return user_id[0].user_id
};

async function findUserIdByToken(token) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT user_id FROM User WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    conn.release();
    return result;
}
