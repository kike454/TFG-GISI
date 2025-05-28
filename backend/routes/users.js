const express = require('express');
const router = express.Router();
const { Usuario, Pareja, Hijo } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const enviarCorreo = require('../utils/mailer');

const JWT_SECRET = 'una-clave-super-secreta';


router.post('/forgot-password', async (req, res) => {
  const { correoElectronico } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correoElectronico } });

    if (!usuario) {
      return res.status(404).json({ error: 'Correo no registrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = Date.now() + 1000 * 60 * 15; // 15 minutos

    await usuario.update({
      resetToken: token,
      resetTokenExp: expiracion
    });
    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = host.includes('localhost')
      ? `${protocol}://localhost:5000`
      : `${protocol}://${host}`;

    const link = `${baseUrl}/reset-password/${token}`

    await enviarCorreo({
      to: correoElectronico,
      subject: 'Restablecer contraseña - Biblioteca Grema',
      html: `
        <h3>Hola ${usuario.nombre},</h3>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}">${link}</a>
        <p><strong>Este enlace expirará en 15 minutos.</strong></p>
        <p>Si no solicitaste esto, puedes ignorar el mensaje.</p>
      `
    });

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno al enviar el correo' });
  }
});



router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  try {
    const usuario = await Usuario.findOne({
      where: {
        resetToken: token,
        resetTokenExp: { [Op.gt]: Date.now() }
      }
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    await usuario.update({
      password: nuevaPassword,
      resetToken: null,
      resetTokenExp: null
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.post('/register', async (req, res) => {
  const { username, password, role, correoElectronico, nif } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.' });
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correoElectronico)) {
    return res.status(400).json({ error: 'Correo electrónico no válido.' });
  }


 function validarDNI(dni) {
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';

      if (!/^\d{8}[A-Z]$/i.test(dni)) return false;

      const numero = parseInt(dni.slice(0, 8), 10);
      const letra = dni[8].toUpperCase();
      const letraEsperada = letras[numero % 23];

      return letra === letraEsperada;
}

  if (!validarDNI(nif)) {
      return res.status(400).json({ error: 'El DNI no es válido. La letra no corresponde.' });
  }

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


router.get('/session-info', verifyToken, async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      session: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        correoElectronico: user.correoElectronico,
        membresiaPagada: user.membresiaPagada
      }
    });
  } catch (error) {
    console.error('Error al obtener información de sesión:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});



router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout correcto. Borra el token en el cliente.' });
});

//AJUTES DE USUARIO:
router.get('/me', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.put('/me', verifyToken, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update(req.body);
    res.json({ message: 'Usuario actualizado correctamente', usuario });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.get('/me/pareja', verifyToken, async (req, res) => {
  try {
    const pareja = await Pareja.findOne({ where: { UserId: req.user.id } });
    if (!pareja) {
      return res.status(404).json({ error: 'Pareja no encontrada' });
    }
    res.json(pareja);
  } catch (error) {
    console.error('Error al obtener pareja:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.post('/parejas', verifyToken, async (req, res) => {
  try {
    const { nombre, nif, fechaNacimiento, telefono } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre de la pareja es obligatorio' });
    }

    const nuevaPareja = await Pareja.create({
      UserId: req.user.id,
      nombre,
      nif,
      fechaNacimiento,
      telefono,
      imagen: null
    });

    res.status(201).json({ message: 'Pareja creada correctamente', pareja: nuevaPareja });
  } catch (error) {
    console.error('Error al crear pareja:', error);
    res.status(500).json({ error: 'Error interno al crear pareja' });
  }
});


router.put('/parejas/:id', verifyToken, async (req, res) => {
  try {
    const pareja = await Pareja.findByPk(req.params.id);
    if (!pareja || pareja.UserId !== req.user.id) {
      return res.status(404).json({ error: 'Pareja no encontrada o no autorizada' });
    }

    await pareja.update(req.body);
    res.json({ message: 'Pareja actualizada correctamente', pareja });
  } catch (error) {
    console.error('Error al actualizar pareja:', error);
    res.status(500).json({ error: 'Error interno al actualizar pareja' });
  }
});


router.get('/me/hijo', verifyToken, async (req, res) => {
  try {
    const hijo = await Hijo.findOne({ where: { UserId: req.user.id } });
    if (!hijo) {
      return res.status(404).json({ error: 'Hijo no encontrado' });
    }
    res.json(hijo);
  } catch (error) {
    console.error('Error al obtener hijo:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.post('/hijos', verifyToken, async (req, res) => {
  try {
    const { nombre, nif, fechaNacimiento, telefono } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre del hijo es obligatorio' });
    }

    const nuevoHijo = await Hijo.create({
      UserId: req.user.id,
      nombre,
      nif,
      fechaNacimiento,
      telefono,
      imagen: null
    });

    res.status(201).json({ message: 'Hijo creado correctamente', hijo: nuevoHijo });
  } catch (error) {
    console.error('Error al crear hijo:', error);
    res.status(500).json({ error: 'Error interno al crear hijo' });
  }
});


router.put('/hijos/:id', verifyToken, async (req, res) => {
  try {
    const hijo = await Hijo.findByPk(req.params.id);
    if (!hijo || hijo.UserId !== req.user.id) {
      return res.status(404).json({ error: 'Hijo no encontrado o no autorizado' });
    }

    await hijo.update(req.body);
    res.json({ message: 'Hijo actualizado correctamente', hijo });
  } catch (error) {
    console.error('Error al actualizar hijo:', error);
    res.status(500).json({ error: 'Error interno al actualizar hijo' });
  }
});

module.exports = router;
