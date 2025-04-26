

const express = require('express');
const router = express.Router();
const { Usuario } = require('../database');
const bcrypt = require('bcrypt');



router.get('/', async function(req, res, next) {
  try {
    const users = await Usuario.findAll({ attributes: ['nombre'] });
    const userList = users.map(user => user.nombre);
    res.json({ users: userList });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


router.get('/session-info', (req, res) => {
  res.json({ session: req.session.user || null });
});

router.post('/register', async function(req, res, next) {
  const { username, password, role, correoElectronico, nif } = req.body;

  try {
    const existing = await Usuario.findOne({ where: { nombre: username } });
    if (existing) {
      return res.status(400).json({ error: `Ya existe el usuario ${username}` });
    }

    const user = await Usuario.create({
      nombre: username,
      password,
      rol: role,
      correoElectronico,
      nif
    });

  
    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    };

    res.status(201).json({ message: `Usuario ${username} registrado correctamente.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Usuario.findOne({ where: { nombre: username } });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const valid = await user.validarPassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }


    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    };

    res.status(200).json({ message: 'Login correcto' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/reservas', async (req, res) => {
 
  res.json({ message: `Reservas del usuario ${req.user.nombre}` });
});



router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Error al cerrar sesión' });

    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout correcto' });
  });
});

module.exports = router;
