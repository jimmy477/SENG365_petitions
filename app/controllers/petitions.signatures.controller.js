const signatures = require('../models/petitions.signatures.model');


exports.getSignatures = async function (req, res) {
    try {
        const all_signatures = await signatures.getSignaturesById(req.params.id);
        if (all_signatures === 'Petition does not exist') {
            res.statusMessage = all_signatures;
            res.status(404)
                .send();
        } else {
            res.status(200)
                .send(all_signatures);
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};