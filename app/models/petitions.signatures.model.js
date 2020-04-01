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
    const petition_open = await checkPetitionOpen(petition_id);
    if (already_signed_petition) {
        return 'User has already signed this petition';
    } else if (!petition_open) {
        return 'Petition has closed'
    } else {
        const date = new Date();
        const conn = await db.getPool().getConnection();
        const query = 'INSERT INTO Signature (signatory_id, petition_id, signed_date) ' +
            'VALUES (?, ?, ?)';
        const [result] = await conn.query(query, [user_id, petition_id, date]);
        return result;
    }
};


exports.deleteSignatureWithId = async function (petition_id, user_id) {
    console.log('a');

    const already_signed_petition = await checkUserSigned(user_id, petition_id);
    console.log('a');

    const user_created_petition = await checkUserCreatedPetition(user_id, petition_id);
    console.log('a');

    const petition_open = await checkPetitionOpen(petition_id);
    console.log('a');

    if (!already_signed_petition) {
        return 'Cannot remove signature from petition you have not signed';
    } else if (user_created_petition) {
        return 'Cannot remove signature from petition you created';
    } else if (!petition_open) {
        return 'Petition has closed'
    } else {
        const conn = await db.getPool().getConnection();
        const query = 'DELETE FROM Signature WHERE petition_id = ? AND signatory_id = ?';
        const result = await conn.query(query, [petition_id, user_id]);
        return result
    }
};


async function checkUserCreatedPetition(user_id, petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT author_id FROM Petition WHERE petition_id = ?';
    const author = await conn.query(query, [petition_id]);
    return author == user_id;
}


async function checkUserSigned(user_id, petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT signatory_id FROM Signature WHERE petition_id = ? AND signatory_id = ?';
    const [users] = await conn.query(query, [petition_id, user_id]);
    return users.length > 0;
}


async function checkPetitionOpen(petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT closing_date FROM Petition WHERE petition_id = ?';
    let signed_date = await conn.query(query, [petition_id]);
    signed_date = signed_date[0][0].closing_date;
    const current_date = new Date();
    return current_date < signed_date;
}


async function checkPetitionExists(petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT title FROM Petition WHERE petition_id = ?';
    const [title] = await conn.query(query, [petition_id]);
    conn.release();
    return title.length !== 0;
}