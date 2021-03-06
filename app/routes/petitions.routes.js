const petition = require('../controllers/petitions.controller');
const authenticate = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petition.listPetitions)
        .post(authenticate.checkToken, petition.newPetition);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petition.getCategories);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petition.getPetition)
        .patch(authenticate.checkToken, petition.changePetition)
        .delete(authenticate.checkToken, petition.deletePetition);

};