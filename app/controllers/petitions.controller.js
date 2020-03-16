const petition = require('../models/petitions.model');

exports.list_petitions = async function (req, res) {

    console.log('\nRequest to list all petitions');

    try {
        const result = await petition.getAll();
        res.status(200)
            .send(result);
    } catch (err) {
        // TODO check which error code to send and how to choose the correct one
        res.status(400)
            .send(`ERROR getting petitions ${err}`)
    }
};