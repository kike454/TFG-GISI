const express = require('express');
const router = express.Router();
const verifyTokenFrontend = require('../middleware/verifyTokenFrontend');


router.get('/biblioteca', verifyTokenFrontend,  (req, res) => {
  const busqueda = req.query.busqueda || '';
  res.render('biblioteca', { title: 'Biblioteca', busqueda });
});


router.get('/libros/:id', verifyTokenFrontend,  (req, res) => {
  res.render('detalleLibro', { title: 'Detalle del Libro' });
});

module.exports = router;
