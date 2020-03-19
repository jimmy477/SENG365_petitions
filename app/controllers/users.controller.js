const users = require('../models/users.model');


exports.register = async function (req, res) {

    console.log('\nRequest to register a new user');

    try {
        const userId = await users.registerUser(req.body);

        if (req.body.name === undefined) {
            res.status(400)
                .send("ERROR no name given" );
        } else if (!req.body.email.includes('@')) {
            res.status(400)
                .send("ERROR email invalid")
        } else {
                res.status(201)
                    .send({"userId": userId})
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400)
                .send("ERROR duplicate email");
        } else {
            res.status(500)
                .send(`ERROR registering user ${err}`);
        }
    }
};

exports.login = async function (req, res) {

    console.log('\nTrying to login');

    try {
        const result = await users.login(req.body);
        if (result === null) {
            res.status(400)
                .send("ERROR wrong credentials");
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        console.log(err);
        res.status(500)
            .send(err);
    }
};
