const petition = require('../models/petitions.model');

exports.list_petitions = async function (req, res) {

    console.log('\nRequest to list all petitions');

    let parameters = {
        "startIndex": req.query.startIndex,
        "count": req.query.count,
        "q": req.query.q,
        "categoryId": req.query.categoryId,
        "authorId": req.query.authorId,
        "sortBy": req.query.sortBy
    };

        // res.status(400)
        //     .send('ERROR: parameters given are not correct');


    try {
        let flag = checkParameters(parameters);
        if (flag !== null) {
            res.statusMessage = flag;
            res.status(400)
                .send();
        } else {
            const result = await petition.getAll(parameters);
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR getting petitions ${err}`)
    }
};

function checkParameters(parameters) {
    let sortby_list = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'SIGNATURES_ASC', 'SIGNATURES_DESC'];
    if (parameters.startIndex !== undefined && isNaN(parseFloat(parameters.startIndex))) {
        return 'startIndex given is not a number'
    }
    if (parameters.count !== undefined && isNaN(parseFloat(parameters.count))) {
        return 'count given is not a number'
    }
    if (parameters.categoryId !== undefined && isNaN(parseFloat(parameters.categoryId))) {
        return 'categoryId given is not a number'
    }
    if (parameters.authorId !== undefined && isNaN(parseFloat(parameters.authorId))) {
        return 'authorId given is not a number'
    }
    if (parameters.sortBy !== undefined && sortby_list.indexOf(parameters.sortBy) < 0) {
        return 'sortBy given is invalid'
    }
    return null;
}