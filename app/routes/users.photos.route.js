const user_photos = require('../controllers/users.photos.controller');
const authentication = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(user_photos.getProfilePhoto)
        .put(authentication.checkToken, user_photos.setProfilePhoto);
};
