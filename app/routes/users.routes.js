const users = require('../controllers/users.controller');
const authenticate = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/logout')
        .post(authenticate.checkToken, users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getInfo)
};