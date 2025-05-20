const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifySuperUser = require('../middlewares/verifySuperUsers'); 
const { Usuario, Libro, Reserva, Pareja, Hijo} = require('../database');
const { v4: uuidv4 } = require('uuid');

const multer = require('multer');
//const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' });


router.get('/usuarios', verifyToken, verifySuperUser, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: [
        'id', 'nombre', 'correoElectronico', 'nif', 'rol', 'membresiaPagada',
        'fechaNacimiento', 'telefono', 'direccion', 'webPersonal', 'maxReservas'
      ]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.delete('/usuarios/:id', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar el usuario' });
  }
});



router.get('/usuarios/:id/reservas', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;

  try {
    const reservas = await Reserva.findAll({
      where: { UsuarioId: id },
      include: [{ model: Libro }]
    });

    const reservasConImagenes = reservas.map(reserva => {
      const libro = reserva.Libro;

      return {
        ...reserva.toJSON(),
        Libro: {
          ...libro.toJSON(),
          portada: libro.portada ? `data:image/jpeg;base64,${libro.portada.toString('base64')}` : null,
          imagen2: libro.imagen2 ? `data:image/jpeg;base64,${libro.imagen2.toString('base64')}` : null,
          imagen3: libro.imagen3 ? `data:image/jpeg;base64,${libro.imagen3.toString('base64')}` : null
        }
      };
    });

    res.json(reservasConImagenes);
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.delete('/reservas/:id', verifyToken, verifySuperUser, async (req, res) => {
  const reservaId = req.params.id;

  try {
    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (reserva.estadoReserva !== 'activa') {
      return res.status(400).json({ error: 'La reserva ya está cancelada o finalizada' });
    }

    reserva.estadoReserva = 'cancelada';
    await reserva.save();

    const libro = await Libro.findByPk(reserva.LibroId);
    if (libro) {
      libro.copias += 1;
      await libro.save();
    }

    res.json({ message: 'Reserva cancelada correctamente por el superusuario' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error interno al cancelar reserva' });
  }
});

router.put('/reservas/:id/ampliar', verifyToken, verifySuperUser, async (req, res) => {
  const reservaId = req.params.id;

  try {
    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva || reserva.estadoReserva !== 'activa') {
      return res.status(400).json({ error: 'Reserva inválida o no activa' });
    }


    const nuevaFecha = new Date(reserva.fechaFin);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);

    reserva.fechaFin = nuevaFecha;
    await reserva.save();

    res.json({ message: 'Reserva ampliada correctamente por superusuario' });
  } catch (error) {
    console.error('Error al ampliar reserva como superuser:', error);
    res.status(500).json({ error: 'Error interno al ampliar' });
  }
});





module.exports = router;
