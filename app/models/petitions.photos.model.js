const db = require('../../config/db');
const fs = require('mz/fs');
const photos_directory = './storage/photos/';

exports.setPetitionPhotoById = async function (petition_id, content_type, photo_buffer) {
    const current_filename = await checkIfPhotoExists(petition_id);
    const filename = createFilename(petition_id, content_type);
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    await conn.query(query, [filename, petition_id]);
    conn.release();
    fs.writeFileSync(photos_directory + filename, photo_buffer);
    return current_filename[0].photo_filename;
};


async function checkIfPhotoExists(petition_id) {
    /* Type must be 'User' or 'Petition' */
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
    const [filename] = await conn.query(query, [petition_id]);
    conn.release();
    return filename;
}


function createFilename(user_id, content_type) {
    /* Creates a filename based on the current time and user_id */
    let date = new Date();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    return 'user' + '_' + user_id + '_' + minutes + seconds + '.' + content_type.slice(6);
}