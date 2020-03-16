const petition = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petition.list_petitions);

};