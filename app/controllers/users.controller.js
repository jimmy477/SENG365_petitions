const users = require('../models/users.model');

exports.register = async function (req, res) {

    console.log('\nRequest to register a new user');

    // If the email does not contain '@' return status 400
    try {
        if (req.body.name === undefined) throw "ERROR no name given";
        if (!req.body.email.includes('@')) throw "ERROR email invalid";
        const userId = await users.registerUser(req.body);
        res.status(201)
            .send({"userId": userId})
    } catch (err) {
        if (err == "ERROR email invalid" || err == "ERROR no name given") {
            res.status(400)
                .send(err);
        }
        else {
            res.status(500)
                .send(`ERROR registering user ${err}`);
        }
    }
};
