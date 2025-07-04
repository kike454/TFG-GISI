const express = require('express');
const router = express.Router();
const { Reserva, Libro, Usuario } = require('../database');
const verifyToken = require('../middlewares/verifyToken');
const { v4: uuidv4 } = require('uuid');
const enviarCorreo = require('../utils/mailer');



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

     const nuevaReserva = await Reserva.create({
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      estadoReserva: 'activa',
      UsuarioId: userId,
      LibroId: libroId,
      codigoFinalizacion: `REV-${uuidv4()}`
    });

    libro.copias -= 1;
    await libro.save();


    if (usuario.correoElectronico) {
      await enviarCorreo({
        to: usuario.correoElectronico,
        subject: `Confirmación de reserva - ${libro.titulo}`,
        html: `
          <h3>Hola ${usuario.nombre},</h3>
          <p>Has reservado correctamente el libro <strong>${libro.titulo}</strong>.</p>
          <ul>
            <li><strong>Autores:</strong> ${libro.autores || 'Desconocido'}</li>
            <li><strong>Fecha de inicio:</strong> ${new Date(nuevaReserva.fechaInicio).toLocaleDateString()}</li>
            <li><strong>Fecha de fin:</strong> ${new Date(nuevaReserva.fechaFin).toLocaleDateString()}</li>
            <li><strong>Código de finalización:</strong> ${nuevaReserva.codigoFinalizacion}</li>
          </ul>
          <p>Gracias por utilizar el sistema de gestión bibliotecaria.</p>
        `
      });
    }

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

    const usuario = await Usuario.findByPk(userId);
    if (usuario && usuario.correoElectronico) {
      await enviarCorreo({
        to: usuario.correoElectronico,
        subject: `Reserva cancelada - ${libro ? libro.titulo : 'libro desconocido'}`,
        html: `
          <h3>Hola ${usuario.nombre},</h3>
          <p>Has cancelado la reserva del libro <strong>${libro ? libro.titulo : 'no disponible'}</strong>.</p>
          ${libro?.autores ? `<p><strong>Autor:</strong> ${libro.autores}</p>` : ''}
          <p><strong>Código de reserva:</strong> ${reserva.codigoFinalizacion}</p>
          <p>Fecha de cancelación: ${new Date().toLocaleDateString()}</p>
          <p>Gracias por usar Biblioteca Grema.</p>
        `
      });
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


    const usuario = await Usuario.findByPk(userId);
    const libro = await Libro.findByPk(reserva.LibroId);

    if (usuario && usuario.correoElectronico && libro) {
      await enviarCorreo({
        to: usuario.correoElectronico,
        subject: `Ampliación de reserva - ${libro.titulo}`,
        html: `
          <h3>Hola ${usuario.nombre},</h3>
          <p>Tu reserva del libro <strong>${libro.titulo}</strong> ha sido ampliada correctamente.</p>
          <ul>
            <li><strong>Autor:</strong> ${libro.autores || 'Desconocido'}</li>
            <li><strong>Nueva fecha de devolución:</strong> ${nuevaFechaFin.toLocaleDateString()}</li>
            <li><strong>Código de reserva:</strong> ${reserva.codigoFinalizacion}</li>
          </ul>
          <p>Gracias por seguir utilizando Biblioteca Grema.</p>
        `
      });
    }

    res.json({ message: 'Reserva ampliada hasta ' + nuevaFechaFin.toLocaleDateString() });

  } catch (error) {
    console.error('Error al ampliar reserva:', error);
    res.status(500).json({ error: 'Error interno al ampliar la reserva' });
  }
});



module.exports = router;
