const authentication = require('../middleware/authenticate.middleware');
const petition_photo = require('../models/petitions.photos.model');
const path = require('path');
const db = require('../../config/db');
const fs = require('mz/fs');
const absolute_photo_directory = __dirname + '../../../storage/photos';
const accepted_mime_types = ['image/png', 'image/jpeg', 'image/gif'];


exports.getPetitionPhoto = async function (req, res) {
    try {
        const petition_photo_name = await petition_photo.getPetitionPhotoById(req.params.id);
        if (petition_photo_name === null) {
            res.statusMessage = 'Photo not found';
            res.status(404)
                .send();
        } else {
            const type_start = petition_photo_name.indexOf('.') + 1;
            res.contentType('image/' + petition_photo_name.slice(type_start));
            res.status(200)
                .sendFile(path.join(absolute_photo_directory, petition_photo_name));
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.setPetitionPhoto = async function (req, res) {
    try {
        const authorized_user_id = req.authenticatedUserId;
        const exists = await checkPetitionIdExists(req.params.id);
        const user_id = await authentication.getUserIdFromPetitionId(req.params.id);
        if (!exists) {
            res.status(404)
                .send();
        } else if (authorized_user_id != user_id[0].author_id) {  // Check the user is changing their own petition photo
            res.status(403)
                .send();
        } else if (accepted_mime_types.indexOf(req.header('Content-Type')) < 0) {
            res.status(400)
                .send();
        } else {
            const current_filename = await getCurrentPhotoName(req.params.id);
            const existed = await petition_photo.setPetitionPhotoById(req.params.id, req.header('Content-Type'), req.body);
            if (existed === null) {
                res.status(201)
                    .send();
            } else {
                await fs.unlink('./storage/photos/' + current_filename[0].photo_filename);
                res.status(200)
                    .send();
            }
        }

    } catch (err) {
        res.status(500)
            .send();
    }
};


async function getCurrentPhotoName (petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
    const [result] = await conn.query(query, [petition_id]);
    conn.release();
    return result
}


async function checkPetitionIdExists(petition_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT title FROM Petition WHERE petition_id = ?';
    const [result] = await conn.query(query, [petition_id]);
    conn.release();
    return result.length > 0
}