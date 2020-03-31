const petition_photo = require('../controllers/petitions.photos.controller');
const authentication = require('../middleware/authenticate.middleware');


module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/photo')
        .put(authentication.checkIdExists, authentication.checkToken, petition_photo.setPetitionPhoto);
};