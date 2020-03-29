const user_photos = require('../controllers/users.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(user_photos.getProfilePhoto);
};
