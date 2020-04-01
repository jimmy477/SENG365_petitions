const users = require('../models/users.model');


exports.register = async function (req, res) {
    try {
        if (req.body.name === undefined) {
            res.statusMessage = 'No user name given';
            res.status(400)
                .send();
        } else if (req.body.password.length < 1) {
            res.statusMessage = 'No password given';
            res.status(400)
                .send();
        } else if (!req.body.email.includes('@')) {
            res.statusMessage = "Email invalid";
            res.status(400)
                .send()
        } else {
            const userId = await users.registerUser(req.body);
            res.status(201)
                .send({"userId": userId})
        }
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.statusMessage = 'Email is already registered to a user';
            res.status(400)
                .send();
        } else {
            res.status(500)
                .send(`ERROR registering user ${err}`);
        }
    }
};


exports.login = async function (req, res) {
    try {
        const result = await users.login(req.body);
        if (result === null) {
            res.statusMessage = "Incorrect credentials";
            res.status(400)
                .send();
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(err);
    }
};


exports.logout = async function (req, res) {
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
    try {
        if (Object.keys(req.body).length === 0) {  // No details provided to change (Bad Request)
            res.statusMessage = 'No changes provided';
            res.status(400)
                .send();
        } else if (req.authenticatedUserId !== req.params.id) {  // Check if trying to change data of a different user
            res.status(403)
                .send();
        } else {
            const result = await users.updateUserInfo(req.authenticatedUserId, req.body);
            if (result === 'No current password given') {
                res.statusMessage = result;
                res.status(400)
                    .send();
            } else if (result === 'Incorrect password') {
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
