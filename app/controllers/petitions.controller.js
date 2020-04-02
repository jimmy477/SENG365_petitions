const petition = require('../models/petitions.model');
const db = require('../../config/db');

exports.listPetitions = async function (req, res) {
    const parameters = {
        "startIndex": req.query.startIndex,
        "count": req.query.count,
        "q": req.query.q,
        "categoryId": req.query.categoryId,
        "authorId": req.query.authorId,
        "sortBy": req.query.sortBy
    };
    try {
        const flag = checkGetParameters(parameters);
        if (flag !== null) {  // Then parameters are invalid
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
            const petition_id = await petition.addNewPetition(req.authenticatedUserId, req.body);
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
        if (flag !== null) {  // Then parameters are invalid
            res.statusMessage = flag;
            res.status(400)
                .send();
        } else {
            const result = await petition.changePetitionById(req.authenticatedUserId, req.params.id, req.body);
            if (result === 'Petition does not exist') {
                res.status(404)
                    .send();
            } else if (result === 'Cannot change petitions that are not your own') {
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
        const result = await petition.deletePetitionById(req.authenticatedUserId, req.params.id);
        if (result === 'cannot delete petitions that are not your own') {
            res.statusMessage = result;
            res.status(403)
                .send();
        } else if (result === 'Petition does not exist') {
            res.status(404)
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

exports.getCategories = async function (req, res) {
    try {
        const categories = await petition.getAllCategories();
        res.status(200)
            .send(categories);
    } catch (err) {
        res.statusMessage = err;
        res.status(500)
            .send()
    }
};

function checkGetParameters(parameters) {
    const sortby_list = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'SIGNATURES_ASC', 'SIGNATURES_DESC'];
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
    const current_date = new Date();
    const now = current_date.toISOString().replace('Z', '').replace('T', ' ');
    const exists = await checkCategoryId(parameters.categoryId);
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
    const current_date = new Date();
    const now = current_date.toISOString().replace('Z', '').replace('T', ' ');
    const exists = await checkCategoryId(parameters.categoryId);
    if (parameters.closingDate !== undefined && parameters.closingDate < now) {
        return 'closingDate is not in the future';
    }
    if (parameters.categoryId !== undefined && !exists) {
        return 'categoryId does not exist';
    }
    return null;
}

async function checkCategoryId(categoryId) {
    /*Checks the given categoryId exists within the db*/
    const conn = await db.getPool().getConnection();
    const query = 'SELECT category_id FROM Category WHERE category_id = ?';
    const [result] = await conn.query(query, [categoryId]);
    conn.release();
    return result[0] !== undefined;
};