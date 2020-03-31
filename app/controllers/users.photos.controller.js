const photos = require('../models/users.photos.model');
const path = require('path');
const authentication = require('../middleware/authenticate.middleware');


exports.getProfilePhoto = async function (req, res) {
    try {
        const profile_photo_name = await photos.getPhotoById(req.params.id);
        if (profile_photo_name === 'Could not find photo') {
            res.statusMessage = profile_photo_name;
            res.status(404)
                .send();
        } else if (profile_photo_name === null) {
            res.statusMessage = 'Photo not found';
            res.status(404)
                .send();
        } else {
            let type_start = profile_photo_name.indexOf('.') + 1;
            res.contentType('image/' + profile_photo_name.slice(type_start));
            res.status(200)
                .sendFile(path.join(__dirname, '../../storage/photos', profile_photo_name));
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.setProfilePhoto = async function (req, res) {
    try {
        const auth_id = await authentication.getUserId(req.header('X-Authorization'));
        if (auth_id != req.params.id) {
            res.status(403)
                .send();
        } else {
            const existed = await photos.setPhotoForId(req.params.id, req.header('Content-Type'), req.body);
            if (existed === null) {
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
        const auth_id = await authentication.getUserId(req.header('X-Authorization'));
        if (auth_id != req.params.id) {
            res.status(403)
                .send();
        } else {
            const result = await photos.deletePhotoById(req.params.id);
            if (result === 'not found') {
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