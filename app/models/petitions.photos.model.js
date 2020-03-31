const db = require('../../config/db');
const fs = require('mz/fs');
const photos_directory = './storage/photos/';

exports.setPetitionPhotoById = async function (user_id, content_type, photo_buffer) {
    const current_filename = await checkIfPhotoExists(user_id);
    const filename = createFilename(user_id, content_type);
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = ? WHERE user_id = ?';
    await conn.query(query, [filename, user_id]);
    conn.release();
    fs.writeFileSync(photos_directory + filename, photo_buffer);
    return current_filename[0].photo_filename;
};


async function checkIfPhotoExists(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM User WHERE user_id = ?';
    const [filename] = await conn.query(query, [user_id]);
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