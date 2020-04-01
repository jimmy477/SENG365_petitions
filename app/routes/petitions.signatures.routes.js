const petition_signatures = require('../controllers/petitions.signatures.controller');
const authentication = require('../middleware/authenticate.middleware');


module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(authentication.checkPetitionIdExists, petition_signatures.getSignatures)
        .post(authentication.checkPetitionIdExists, authentication.checkToken, petition_signatures.addSignature)
        .delete(authentication.checkPetitionIdExists, authentication.checkToken, petition_signatures.deleteSignature);
};