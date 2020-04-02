const signatures = require('../models/petitions.signatures.model');
const authentication = require('../middleware/authenticate.middleware');


exports.getSignatures = async function (req, res) {
    try {
        const all_signatures = await signatures.getSignaturesById(req.params.id);
        res.status(200)
            .send(all_signatures);
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.addSignature = async function (req, res) {
    try {
        const user_id = req.authenticatedUserId;
        const result = await signatures.addSignatureWithId(req.params.id, user_id);
        if (result === 'User has already signed this petition') {
            res.statusMessage = result;
            res.status(403)
                .send()
        } else if (result === 'Petition has closed') {
            res.statusMessage = result;
            res.status(403)
                .send();
        } else {
            res.status(201)
                .send();
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};


exports.deleteSignature = async function (req, res) {
    try {
        const user_id = req.authenticatedUserId;
        const result = await signatures.deleteSignatureWithId(req.params.id, user_id);
        if (typeof result === "string") {
            res.statusMessage = result;
            res.status(403)
                .send();
        } else {
            res.status(200)
                .send();
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};