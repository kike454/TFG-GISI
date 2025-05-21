const express = require('express');
const router = express.Router();
const verifyTokenFrontend = require('../middleware/verifyTokenFrontend');
const verifySuperUserFrontend = require('../middleware/verifySuperUserFrontend');


//USUARIOS
router.get('/dashboard', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
  res.render('super/dashboard', {
    title: 'Panel de Superusuario'
  });
});



router.get('/usuarios', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
    res.render('super/usuarios', { title: 'Gestión de Usuarios' });
});

//USUARIOS IMPORTAR, se pone arriba para evitar colision entre rutas
router.get('/usuarios/importar', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
  res.render('super/importarUsuarios', { title: 'Importar Usuarios por CSV' });
  });

router.get('/usuarios/:id', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
    res.render('super/usuario_detalle', { title: 'Detalle de Usuario' });
});



//LIBROS
router.get('/libros', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
    res.render('super/libros', { title: 'Gestión de Libros' });
});



router.get('/libros/crear', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
    res.render('super/crearLibro', { title: 'Añadir Libro' });
});



//ACTUALIZAR USUARIO
router.get('/usuarios/:id/editar', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
  res.render('super/actualizarUsuario', { title: 'Editar Usuario' });
});


//IMPORTAR LIBROS
router.get('/libros/importar', verifyTokenFrontend, verifySuperUserFrontend, (req, res) => {
    res.render('super/importarLibros', { title: 'Importar Libros por CSV' });
});


module.exports = router;
