var express = require('express');
var router = express.Router();
const verifyTokenFrontend = require('../middleware/verifyTokenFrontend');

router.get('/', function(req, res, next) {
  res.render('users', { title: 'Usuarios' });
});

router.get('/register', function(req, res) {
  res.render('register', { title: 'Registro' });
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});



router.get('/logout', (req, res) => {
  res.redirect('/login'); 
});

router.get('/reservas', verifyTokenFrontend,  (req, res) => {
  res.render('reservas', { title: 'Mis Reservas' });
});


router.get('/ajustes', verifyTokenFrontend, (req, res) => {
  res.render('ajustes', { title: 'Ajustes' });
});




module.exports = router;
