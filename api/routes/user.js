const express = require('express');
const router = express.Router();

const db = require('../queries/user');

router.get('/users', db.getAllUsers);
router.get('/user/:login', db.getUserByLogin);
router.put('/user/:login', db.putUserByLogin);
router.post('/user', db.postUserByLogin);
router.delete('/user/:login', db.deleteUserByLogin);

module.exports = router;
