const express = require('express');
const router = express.Router();
const verifyTokenFrontend = require('../middleware/verifyTokenFrontend');


router.get('/biblioteca', verifyTokenFrontend,  (req, res) => {
  res.render('biblioteca', { title: 'Biblioteca' });
});


router.get('/libros/:id', verifyTokenFrontend,  (req, res) => {
  res.render('detalleLibro', { title: 'Detalle del Libro' });
});

module.exports = router;
