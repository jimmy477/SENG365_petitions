const photos = require('../models/users.photos.model');
const path = require('path');
const authentication = require('../middleware/authenticate.middleware');
const db = require('../../config/db');
const accepted_mime_types = ['image/png', 'image/jpeg', 'image/gif'];
const absolute_photo_directory = __dirname + '../../../storage/photos';


exports.getProfilePhoto = async function (req, res) {
    try {
        const profile_photo_name = await photos.getPhotoById(req.params.id);
        if (profile_photo_name === null) {
            res.statusMessage = 'Photo not found';
            res.status(404)
                .send();
        } else {
            const type_start = profile_photo_name.indexOf('.') + 1;
            res.contentType('image/' + profile_photo_name.slice(type_start));
            res.status(200)
                .sendFile(path.join(absolute_photo_directory, profile_photo_name));
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.setProfilePhoto = async function (req, res) {
    try {
        const authorized_user_id = req.authenticatedUserId;
        const exists = await checkUserIdExists(req.params.id);
        if (!exists) {
            res.status(404)
                .send();
        } else if (authorized_user_id != req.params.id) {  // Check the user is changing their own photo
            res.status(403)
                .send();
        } else if (accepted_mime_types.indexOf(req.header('Content-Type')) < 0) {  // Check if image being sent is of an accepted type
            res.status(400)
                .send();
        } else {
            const existed = await photos.deletePhotoById(authorized_user_id);  // Delete the old photo if it existed
            await photos.setPhotoForId(req.params.id, req.header('Content-Type'), req.body);
            if (!existed) {
                res.status(201)
                    .send();
            } else {
                res.status(200)
                    .send();
            }
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.deleteProfilePhoto = async function (req, res) {
    try {
        const authorized_user_id = req.authenticatedUserId;
        const exists = await checkUserIdExists(req.params.id);
        if (!exists) {  // Check if the user_id even exists
            res.status(404)
                .send();
        } else if (authorized_user_id != req.params.id) {
            res.status(403)
                .send();
        } else {
            const exists = await photos.deletePhotoById(req.params.id);
            if (!exists) {  // Checking if the user has a photo to delete
                res.status(404)
                    .send();
            } else {
                res.status(200)
                    .send();
            }
        }
    } catch (err ) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


async function checkUserIdExists(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT name FROM User WHERE user_id = ?';
    const [result] = await conn.query(query, [user_id]);
    conn.release();
    return result.length > 0
}