const express = require('express');
const router = express.Router();
const { Reserva, Libro, Usuario } = require('../database');
const verifyToken = require('../middlewares/verifyToken');
const { v4: uuidv4 } = require('uuid'); 



router.post('/', verifyToken, async (req, res) => {
  const { libroId } = req.body;
  const userId = req.user.id;

  try {
    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    
    if (!usuario.membresiaPagada) {
      return res.status(403).json({ error: 'Solo los usuarios con membresía pagada pueden realizar reservas' });
    }

    const reservasActivas = await Reserva.count({
      where: {
        UsuarioId: userId,
        estadoReserva: 'activa'
      }
    });

    if (reservasActivas >= usuario.maxReservas) {
      return res.status(403).json({
        error: `Has alcanzado el máximo de reservas permitidas (${usuario.maxReservas})`
      });
    }

    const libro = await Libro.findByPk(libroId);
    if (!libro || libro.copias <= 0) {
      return res.status(400).json({ error: 'No hay copias disponibles' });
    }

    await Reserva.create({
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      estadoReserva: 'activa',
      UsuarioId: userId,
      LibroId: libroId,
      codigoFinalizacion: `REV-${uuidv4()}`
    });

    libro.copias -= 1;
    await libro.save();

    res.status(201).json({ message: 'Reserva creada correctamente.' });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});


router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const reservas = await Reserva.findAll({
      where: { UsuarioId: userId },
      include: [{ model: Libro }]
    });

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.user.id;

  try {
    const reserva = await Reserva.findByPk(reservaId);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (reserva.UsuarioId !== userId) {
      return res.status(403).json({ error: 'No autorizado para cancelar esta reserva' });
    }

    if (reserva.estadoReserva !== 'activa') {
      return res.status(400).json({ error: 'La reserva ya fue cancelada o finalizada' });
    }

    reserva.estadoReserva = 'cancelada';
    await reserva.save();

    const libro = await Libro.findByPk(reserva.LibroId);
    if (libro) {
      libro.copias += 1;
      await libro.save();
    }

    res.json({ message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.put('/:id/ampliar', verifyToken, async (req, res) => {
  const reservaId = req.params.id;
  const userId = req.user.id;

  try {
    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });

    if (reserva.UsuarioId !== userId) {
      return res.status(403).json({ error: 'No autorizado para ampliar esta reserva' });
    }

    if (reserva.estadoReserva !== 'activa') {
      return res.status(400).json({ error: 'Solo se pueden ampliar reservas activas' });
    }

    const nuevaFechaFin = new Date(reserva.fechaFin);
    nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 7);
    reserva.fechaFin = nuevaFechaFin;

    await reserva.save();
    res.json({ message: 'Reserva ampliada hasta ' + nuevaFechaFin.toLocaleDateString() });
  } catch (error) {
    console.error('Error al ampliar reserva:', error);
    res.status(500).json({ error: 'Error interno al ampliar la reserva' });
  }
});



module.exports = router;
