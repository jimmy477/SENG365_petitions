const db = require('../../config/db');
const fs = require('mz/fs');
const photos_directory = './storage/photos/';

exports.getPhotoById = async function (id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM User WHERE user_id = ?';
    const [photo] = await conn.query(query, [id]);
    conn.release();
    if (photo.length > 0) {
        return photo[0].photo_filename;
    } else {
        return null
    }
};


exports.setPhotoForId = async function (user_id, content_type, photo_buffer) {
    /* Checks if there is already a photo set for the user and updates it to the new
       photo from the photo_buffer. Returns null if no filename was present before
     */
    const current_filename = await checkIfPhotoExists(user_id);
    const filename = createFilename(user_id, content_type);
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    await conn.query(query, [filename, user_id]);
    conn.release();
    fs.writeFileSync(photos_directory + filename, photo_buffer);
    return current_filename[0].photo_filename;
};


exports.deletePhotoById = async function (user_id) {
    /* Deletes a users photo adn removes from the photo directory, returns false if the user does not
       have a photo to delete */
    const conn = await db.getPool().getConnection();
    const filename_query = 'SELECT photo_filename FROM User WHERE user_id = ?'; // Checking if the user already has a photo to delete
    const query = 'UPDATE User SET photo_filename = null WHERE user_id = ?';
    const [filename] = await conn.query(filename_query, [user_id]);
    await conn.query(query, [user_id]);
    conn.release();
    if (filename[0].photo_filename === null) {
        return false;
    } else {
        await fs.unlink(photos_directory + filename[0].photo_filename);
        return true;
    }
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