const express = require('express');
const router = express.Router();
//const middleware = require('../middleware/authorization');
const jwtManager = require('../jwt/jwtManager');
const env = require('dotenv').config();
const student_collection = process.env.STUDENTSCOLLECTION;

//http://localhost:4000/api/v1/authenticate/login POST
router.post('/login', (req, res) => {
    req.db.collection(student_collection)
        .findOne({ 'email': req.body.email })
        .then(data => {
            if (data.password == req.body.password) {
                const payload = {};
                payload.email = data.email;
                payload._id = data._id;

                const token = jwtManager.generate(payload);
                res.json({ status: 'success', result: token, email: data.email, studentId: data._id });
            } else {
                res.json({ status: 'invalid_user' });
            }
        })
        .catch(err => {
            res.json({ status: 'invalid_user' });
        })
});


//http://localhost:4000/api/v1/authenticate/signup POST
router.post('/signup', (req, res) => {

    req.db.collection(student_collection).findOne({ 'email': req.body.email })
        .then(doc => {
            if (doc) {
                res.json({ status: 'user exists' });
            } else {
                const student = req.body;
                req.db.collection(student_collection).insertOne(student)
                    .then(data => {
                        res.json({ status: 'success' });
                    })
                    .catch(err => {
                        res.json({ status: "fail" })
                    })
            }
        })
        .catch(err => {
            res.json({ status: "fail" })
        })
});


module.exports = router;





















module.exports = router;