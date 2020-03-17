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

    // TODO Find out how to uncomment this without it causing promise errors.
    // try {
    //     checkParameters(parameters);
    // } catch {
    //     res.status(400)
    //         .send('ERROR: parameters given are not correct');
    // }

    try {
        const result = await petition.getAll(parameters);
        res.status(200)
            .send(result);
    } catch (err) {
        // TODO check which error code to send and how to choose the correct one
        res.status(400)
            .send(`ERROR getting petitions ${err}`)
    }
};

function checkParameters(parameters) {
    if (parameters.startIndex !== undefined && isNaN(parseFloat(parameters.startIndex))) {
        throw 'ERROR: startIndex given is not a number'
    }
}