const db = require('../../config/db');


exports.getSignaturesById = async function (petition_id) {
    const conn = await db.getPool().getConnection();
    const exists = checkPetitionExists(petition_id);
    if (!exists) {
        return 'Petition does not exist';
    } else {
        const query = 'SELECT s.signatory_id as signatoryId, ' +
            'u.name, ' +
            'u.city, ' +
            'u.country, ' +
            's.signed_date as signedDate ' +
            'FROM Signature s ' +
            'LEFT JOIN User u ' +
            'ON s.signatory_id = u.user_id ' +
            'WHERE petition_id = ? ' +
            'ORDER BY s.signed_date';
        const [signatures] = await conn.query(query, [petition_id]);
        conn.release();
        return signatures;
    }
};


async function checkPetitionExists(petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT title FROM Petition WHERE petition_id = ?';
    const [title] = await conn.query(query, [petition_id]);
    conn.release();
    return title.length !== 0;
}