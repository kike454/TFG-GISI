var express = require('express');
var router = express.Router();
const database = require('../database');

/* GET users listing. */
router.get('/', function(req, res, next) {

  const userList = Object.keys(database.users.get());
  res.json({ users: userList });

});


router.post('/addNewUser', async function(req, res, next) {

  const { username, password, role, score } = req.body;


  //console.log(req.body, req.body.username);


  try {
    await database.users.register(username, password, role, score);
    res.status(201).json({ message: `Usuario ${username} registrado correctamente.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

});


module.exports = router;

