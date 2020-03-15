const petition = require('../controllers/petitions.controller`');

module.exports = function (app) {
    app.route(app.rootUrl + '/petition')
        .get(petition.list)
        .post(petition.create);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petition.read)
        .patch(petition.update)
        .delete(petition.delete);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petition.list_category);
};