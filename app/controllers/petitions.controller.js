const petition = require('../models/petitions.model');

exports.listPetitions = async function (req, res) {

    let parameters = {
        "startIndex": req.query.startIndex,
        "count": req.query.count,
        "q": req.query.q,
        "categoryId": req.query.categoryId,
        "authorId": req.query.authorId,
        "sortBy": req.query.sortBy
    };

    try {
        let flag = checkGetParameters(parameters);
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

exports.newPetition = async function (req, res) {
    try {
        const flag = await checkPostParameters(req.body);
        if (flag !== null) {
            res.statusMessage = flag;
            res.status(400)
                .send();
        } else {
            console.log(req.header('X-Authorization'));
            const petition_id = await petition.addNewPetition(req.header('X-Authorization'), req.body);
            res.status(201)
                .send({ "petitionId" : petition_id});
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.getPetition = async function (req, res) {
    try {
        const petition_info = await petition.getPetitionById(req.params.id);
        if (petition_info.petitionId === null) {
            res.statusMessage = 'Could not find petition';
            res.status(404)
                .send();
        } else {
            res.status(200)
                .send(petition_info);
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.changePetition =async function (req, res) {
    try {
        const flag = await checkPatchParameters(req.body);
        if (flag !== null) {
            res.statusMessage = flag;
            res.status(400)
                .send();
        } else {
            const result = await petition.changePetitionById(req.header('X-Authorization'), req.params.id, req.body);
            if (result === 'cannot change petitions that are not your own') {
                res.statusMessage = result;
                res.status(403)
                    .send();
            } else {
                res.status(200)
                    .send();
            }
        }
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send();
    }
};

exports.deletePetition = async function (req, res) {
    try {
        const result = await petition.deletePetitionById(req.header('X-Authorization'), req.params.id);
        if (result === 'cannot delete petitions that are not your own') {
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
}

function checkGetParameters(parameters) {
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

async function checkPostParameters(parameters) {
    let current_date = new Date();
    let now = current_date.toISOString().replace('Z', '').replace('T', ' ');
    const exists = await petition.checkCategoryId(parameters.categoryId);
    if (parameters.title === undefined) {
        return 'no title given';
    }
    if (parameters.description === undefined) {
        return 'no description given';
    }
    if (parameters.categoryId === undefined) {
        return 'no categoryId given';
    }
    if (parameters.closingDate === undefined) {
        return 'no closingDate given';
    }
    if (parameters.closingDate < now) {
        return 'closingDate is not in the future';
    }
    if (!exists) {
        return 'categoryId does not exist';
    }
    return null;
}

async function checkPatchParameters(parameters) {
    let current_date = new Date();
    let now = current_date.toISOString().replace('Z', '').replace('T', ' ');
    const exists = await petition.checkCategoryId(parameters.categoryId);
    if (parameters.closingDate !== undefined && parameters.closingDate < now) {
        return 'closingDate is not in the future';
    }
    if (parameters.categoryId !== undefined && !exists) {
        return 'categoryId does not exist';
    }
    return null;
}