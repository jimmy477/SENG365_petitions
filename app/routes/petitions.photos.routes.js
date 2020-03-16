const petition_photo = require('../controllers/petitions.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(petition_photo.get_photo)
        .put(petition_photo.set_image);
};