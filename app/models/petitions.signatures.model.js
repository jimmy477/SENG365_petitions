const db = require('../../config/db');


exports.getSignaturesById = async function (petition_id) {
    const conn = await db.getPool().getConnection();
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
};


exports.addSignatureWithId = async function (petition_id, user_id) {
    const already_signed_petition = await checkUserSigned(user_id, petition_id);
    if (already_signed_petition) {
        return 'User has already signed this petition';
    } else {
        const date = new Date();
        const conn = await db.getPool().getConnection();
        const query = 'INSERT INTO Signature (signatory_id, petition_id, signed_date) ' +
            'VALUES (?, ?, ?)';
        const [result] = await conn.query(query, [user_id, petition_id, date]);
        return result;
    }
};


async function checkUserSigned(user_id, petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT signatory_id FROM Signature WHERE petition_id = ? AND signatory_id = ?';
    const [users] = await conn.query(query, [petition_id, user_id]);
    return users.length > 0;
}


async function checkPetitionExists(petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT title FROM Petition WHERE petition_id = ?';
    const [title] = await conn.query(query, [petition_id]);
    conn.release();
    return title.length !== 0;
}