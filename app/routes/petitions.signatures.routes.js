const petition_signatures = require('../controllers/petitions.signatures.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petition_signatures.getSignatures);
};