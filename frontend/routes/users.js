var express = require('express');
var router = express.Router();







router.get('/', function(req, res, next) {
  res.render('users', { title: 'Usuarios',
    session: req.session
   });
});

router.get('/register', function(req, res) {
  res.render('register', { title: 'Registro' });
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuario.findOne({ where: { nombre: username } });
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const valid = await user.validarPassword(password);
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' });

    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    };
  
    res.redirect('/biblioteca');

    res.status(200).json({ token, message: 'Login correcto' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});



router.get('/biblioteca', (req, res) => {
  //console.log(" Sesión actual:", req.session.user); 
  if (!res.locals.session.user) return res.redirect('/login');
  res.render('biblioteca', { title: 'Biblioteca' });
});

router.get('/logout', async (req, res) => {
  const apiBase = req.hostname.includes("localhost")
    ? "http://localhost:3001"
    : "http://34.201.229.162:3001";

  try {
    const response = await fetch(`${apiBase}/api/users/logout`, {
      method: "POST",
      headers: {
        cookie: req.headers.cookie
      },
      credentials: "include"
    });

    if (!response.ok) {
      console.error("Error en logout:", await response.text());
    }

    res.redirect('/login');
  } catch (err) {
    console.error("Error al hacer logout:", err);
    res.redirect('/login');
  }
});

router.get('/reservas', (req, res) => {
  if (!res.locals.session.user) return res.redirect('/login');
  res.render('reservas', { title: 'Mis Reservas' });
});

router.get('/ajustes', (req, res) => {
  if (!res.locals.session.user) return res.redirect('/login');
  res.render('ajustes', { title: 'Ajustes' });
});



module.exports = router;
