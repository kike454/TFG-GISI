const express = require('express');
const router = express.Router();
const { Usuario, Pareja, Hijo } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');

const JWT_SECRET = 'una-clave-super-secreta';


router.post('/register', async (req, res) => {
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

    res.status(201).json({ message: `Usuario ${username} registrado correctamente.` });
  } catch (error) {
    console.error('Error en registro:', error);
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

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
      
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.get('/session-info', verifyToken, (req, res) => {
  res.json({ session: req.user });
});


router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout correcto. Borra el token en el cliente.' });
});



module.exports = router;
