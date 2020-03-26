const users = require('../models/users.model');


exports.register = async function (req, res) {

    console.log('\nRequest to register a new user');

    try {
        if (req.body.name === undefined) {
            res.status(400)
                .send("ERROR no name given" );
        } else if (!req.body.email.includes('@')) {
            res.status(400)
                .send("ERROR email invalid")
        } else {
            const userId = await users.registerUser(req.body);
            console.log("User registered successfully");
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
            res.statusMessage = "Incorrect credentials";
            res.status(400)
                .send();
        } else {
            console.log("Login successfull");
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
};

exports.logout = async function (req, res) {

    console.log('\nTrying to logout');

    try {
        users.logout(req.authenticatedUserId);
        res.status(200)
            .send();
    } catch (err) {
        res.status(500)
            .send(err);
    }
};

exports.getInfo = async function (req, res) {

    console.log('\nRetrieving user info');

    try {
        const user_info = await users.getUserInfo(req.params.id, req.header('X-Authorization'));
        if (user_info === null) {
            res.statusMessage = 'Could not find user by given user_id';
            res.status(404)
                .send();
        } else {
            res.status(200)
                .send(user_info);
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
};

exports.updateInfo = async function (req, res) {

    console.log('\nAttempting to update user info');

    try {
        if (Object.keys(req.body).length === 0) {
            res.statusMessage = 'no changes provided';
            res.status(400)
                .send();
        } else {
            const result = await users.updateUserInfo(req.params.id, req.body);
            if (result == 'no current password given') {
                res.statusMessage = result;
                res.status(400)
                    .send();
            } else if (result == 'incorrect password') {
                res.statusMessage = result;
                res.status(400)
                    .send();
            } else {
                res.status(200)
                    .send();
            }
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
};
