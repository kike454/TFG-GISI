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

const uploadImgs = multer().fields([
  { name: 'portada', maxCount: 1 },
  { name: 'imagen2', maxCount: 1 },
  { name: 'imagen3', maxCount: 1 }
]);


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

//Libros

router.put('/libros/:id', verifyToken, verifySuperUser, uploadImgs, async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    autores,
    editorial,
    genero,
    edad,
    descripcion,
    copias
  } = req.body;

  try {
    const libro = await Libro.findByPk(id);

    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    await libro.update({
      titulo: titulo ?? libro.titulo,
      autores: autores ?? libro.autores,
      editorial: editorial ?? libro.editorial,
      genero: genero ?? libro.genero,
      edad: edad !== undefined ? parseInt(edad) : libro.edad,
      descripcion: descripcion ?? libro.descripcion,
      copias: copias !== undefined ? parseInt(copias) : libro.copias,
      portada: req.files?.portada?.[0]?.buffer ?? libro.portada,
      imagen2: req.files?.imagen2?.[0]?.buffer ?? libro.imagen2,
      imagen3: req.files?.imagen3?.[0]?.buffer ?? libro.imagen3
    });

    res.json({ message: 'Libro actualizado correctamente', libro });
  } catch (error) {
    console.error('Error actualizando libro con imágenes:', error);
    res.status(500).json({ error: 'Error interno al actualizar libro' });
  }
});


router.get('/libros', verifyToken, verifySuperUser, async (req, res) => {
  try {
    const libros = await Libro.findAll();
    res.json(libros);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ error: 'Error interno al obtener libros' });
  }
});


router.delete('/libros/:id', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;

  try {
    const reservasActivas = await Reserva.count({
      where: {
        LibroId: id,
        estadoReserva: 'activa'
      }
    });

    if (reservasActivas > 0) {
      return res.status(400).json({ error: 'No puedes eliminar este libro porque tiene reservas activas.' });
    }

    const libro = await Libro.findByPk(id);
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    await libro.destroy();
    res.status(200).json({ message: 'Libro eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({ error: 'Error interno al eliminar el libro' });
  }
});


router.post('/reservas', verifyToken, verifySuperUser, async (req, res) => {
  const { userId, libroId } = req.body;

  if (!userId || !libroId) {
    return res.status(400).json({ error: 'Faltan datos (userId o libroId)' });
  }

  try {
    const usuario = await Usuario.findByPk(userId);

    
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    //console.log("Membresía del usuario XOXOXOXOXOXOXXO:", usuario.membresiaPagada);

    if (usuario.membresiaPagada !== true) {
      console.log(' Bloqueado por membresía'); 
      return res.status(403).json({ error: 'El usuario no tiene una membresía activa' });
    }

    const libro = await Libro.findByPk(libroId);
    if (!libro || libro.copias <= 0) {
      return res.status(400).json({ error: 'No hay copias disponibles del libro' });
    }

    const reservasActuales = await Reserva.count({
      where: {
        UsuarioId: userId,
        estadoReserva: 'activa'
      }
    });

    if (reservasActuales >= usuario.maxReservas) {
      return res.status(403).json({
        error: `El usuario ya tiene el máximo permitido de reservas (${usuario.maxReservas})`
      });
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

    res.status(201).json({ message: `Reserva creada para ${usuario.nombre}` });
  } catch (error) {
    console.error('Error al crear reserva como superuser:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});




router.post('/libros', verifyToken, verifySuperUser, uploadImgs, async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILES:", req.files);
  const {
    titulo,
    autores,
    editorial,
    genero,
    edad,
    descripcion,
    copias
  } = req.body;

  try {
    const nuevoLibro = await Libro.create({
      titulo,
      autores,
      editorial,
      genero,
      edad: parseInt(edad) || 0,
      descripcion,
      copias: parseInt(copias) || 1,
      portada: req.files?.portada?.[0]?.buffer || null,
      imagen2: req.files?.imagen2?.[0]?.buffer || null,
      imagen3: req.files?.imagen3?.[0]?.buffer || null
    });

    res.status(201).json({ message: 'Libro añadido correctamente', libro: nuevoLibro });
  } catch (error) {
    console.error('Error al crear libro con imágenes:', error);
    res.status(500).json({ error: 'Error interno al crear el libro con imágenes' });
  }
});

//AJUSTES
router.get('/usuarios/:id/pareja', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;

  try {
    const pareja = await Pareja.findOne({ where: { UserId: id } });

    if (!pareja) {
      return res.status(404).json({ error: 'Pareja no encontrada para este usuario' });
    }

    res.json(pareja);
  } catch (error) {
    console.error('Error al obtener la pareja:', error);
    res.status(500).json({ error: 'Error interno al obtener pareja' });
  }
});


router.get('/usuarios/:id/hijo', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;

  try {
    const hijo = await Hijo.findOne({ where: { UserId: id } });

    if (!hijo) {
      return res.status(404).json({ error: 'Hijo no encontrado para este usuario' });
    }

    res.json(hijo);
  } catch (error) {
    console.error('Error al obtener el hijo:', error);
    res.status(500).json({ error: 'Error interno al obtener hijo' });
  }
});

router.put('/usuarios/:id', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  console.log("Intentando actualizar usuario con:", updates); 

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.update(updates);
    res.json({ message: 'Usuario actualizado correctamente', usuario });
  } catch (error) {
    console.error('Error al actualizar usuario:', error); 
    res.status(500).json({ error: 'Error interno' });
  }
});


router.post('/parejas', verifyToken, verifySuperUser, async (req, res) => {
  const { UserId, nombre, nif, fechaNacimiento, telefono } = req.body;

  if (!UserId || !nombre) {
    return res.status(400).json({ error: 'Faltan datos requeridos para crear pareja' });
  }

  try {
    const nuevaPareja = await Pareja.create({
      UserId,
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

router.put('/parejas/:id', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const pareja = await Pareja.findByPk(id);
    if (!pareja) {
      return res.status(404).json({ error: 'Pareja no encontrada' });
    }

    await pareja.update(updates);
    res.json({ message: 'Pareja actualizada correctamente', pareja });
  } catch (error) {
    console.error('Error actualizando pareja:', error);
    res.status(500).json({ error: 'Error interno al actualizar pareja' });
  }
});



router.post('/hijos', verifyToken, verifySuperUser, async (req, res) => {
  const { UserId, nombre, nif, fechaNacimiento, telefono } = req.body;

  if (!UserId || !nombre) {
    return res.status(400).json({ error: 'Faltan datos requeridos para crear hijo' });
  }

  try {
    const nuevoHijo = await Hijo.create({
      UserId,
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


router.put('/hijos/:id', verifyToken, verifySuperUser, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const hijo = await Hijo.findByPk(id);
    if (!hijo) {
      return res.status(404).json({ error: 'Hijo no encontrado' });
    }

    await hijo.update(updates);
    res.json({ message: 'Hijo actualizado correctamente', hijo });
  } catch (error) {
    console.error('Error actualizando hijo:', error);
    res.status(500).json({ error: 'Error interno al actualizar hijo' });
  }
});



module.exports = router;
