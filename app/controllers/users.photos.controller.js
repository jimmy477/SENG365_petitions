const photos = require('../models/users.photos.model');
const path = require('path');

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