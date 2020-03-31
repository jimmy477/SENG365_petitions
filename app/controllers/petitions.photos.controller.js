const authentication = require('../middleware/authenticate.middleware');
const petition_photo = require('../models/petitions.photos.model');


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