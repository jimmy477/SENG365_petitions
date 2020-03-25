const petition = require('../controllers/petitions.controller');
const authenticate = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petition.listPetitions)
        .post(authenticate.checkToken, petition.newPetition);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petition.getPetition);
};