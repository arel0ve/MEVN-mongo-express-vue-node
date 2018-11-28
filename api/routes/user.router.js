const express = require('express');
const router = express.Router();

const db = require('../queries/user.query');

router.get('/users', db.getAllUsers);
router.get('/users/by-country', db.getUsersByCountry);
router.get('/users/friends', db.getFriendsByLogin);
router.get('/user/:login', db.getUserByLogin);
router.put('/user/:login', db.putUserByLogin);
router.post('/user', db.postUserByLogin);
router.delete('/user/:login', db.deleteUserByLogin);

module.exports = router;
