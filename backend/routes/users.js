

const express = require('express');
const router = express.Router();
//const Usuario = require('../database/models/user.model');
const { Usuario } = require('../database');


router.get('/', async function(req, res, next) {
  try {
    const users = await Usuario.findAll({ attributes: ['nombre'] });
    const userList = users.map(user => user.nombre);
    res.json({ users: userList });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


router.post('/addNewUser', async function(req, res, next) {
  const { username, password, role, score, correoElectronico, nif } = req.body;

  try {
    const existing = await Usuario.findOne({ where: { nombre: username } });
    if (existing) {
      return res.status(400).json({ error: `Ya existe el usuario ${username}` });
    }

    await Usuario.create({
      nombre: username,
      password,
      rol: role,
      correoElectronico,
      nif
    });

    res.status(201).json({ message: `Usuario ${username} registrado correctamente.` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
