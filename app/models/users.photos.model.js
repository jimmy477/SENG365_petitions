const db = require('../../config/db');


exports.getPhotoById = async function (id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM User WHERE user_id = ?';
    const [photo] = await conn.query(query, [id]);
    try {
        return photo[0].photo_filename;
    } catch (err) {
        return 'Could not find photo';
    }
};