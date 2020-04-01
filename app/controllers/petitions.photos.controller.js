const authentication = require('../middleware/authenticate.middleware');
const petition_photo = require('../models/petitions.photos.model');
const path = require('path');


exports.getPetitionPhoto = async function (req, res) {
    try {
        const petition_photo_name = await petition_photo.getPetitionPhotoById(req.params.id);
        if (petition_photo_name === 'Could not find photo') {
            res.statusMessage = petition_photo_name;
            res.status(404)
                .send();
        } else if (petition_photo_name === null) {
            res.statusMessage = 'Photo not found';
            res.status(404)
                .send();
        } else {
            let type_start = petition_photo_name.indexOf('.') + 1;
            console.log(petition_photo_name);
            res.contentType('image/' + petition_photo_name.slice(type_start));
            res.status(200)
                .sendFile(path.join(__dirname, '../../storage/photos', petition_photo_name));
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.setPetitionPhoto = async function (req, res) {
    try {
        const auth_id = await authentication.getUserId(req.header('X-Authorization'));
        const user_id = await authentication.getUserIdFromPetitionId(req.params.id);
        if (auth_id != user_id[0].author_id) {
            res.status(403)
                .send();
        } else {
            const existed = await petition_photo.setPetitionPhotoById(req.params.id, req.header('Content-Type'), req.body);
            if (existed === null) {
                res.status(201)
                    .send();
            } else {
                res.status(200)
                    .send();
            }
        }

    } catch (err) {
        res.status(500)
            .send();
    }
};