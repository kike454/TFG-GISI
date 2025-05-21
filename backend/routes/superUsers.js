const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const verifySuperUser = require('../middlewares/verifySuperUsers');
const { Usuario, Libro, Reserva, Pareja, Hijo} = require('../database');
const enviarCorreo = require('../utils/mailer');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

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



router.post('/users/import', verifyToken, verifySuperUser, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó archivo Excel.' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(hoja, { defval: null });

    for (const userData of data) {

      if (!userData.nombre || !userData.password) continue;

      const usuario = await Usuario.create({
        nombre: userData.nombre?.toString().trim(),
        password: await bcrypt.hash(userData.password.toString(), 10),
        nif: userData.nif?.toString().trim() || null,
        fechaNacimiento: userData.fechaNacimiento ? new Date(userData.fechaNacimiento) : null,
        telefono: userData.telefono?.toString().trim() || null,
        direccion: userData.direccion?.toString().trim() || null,
        correoElectronico: userData.correoElectronico?.toString().trim() || null,
        webPersonal: userData.webPersonal?.toString().trim() || null,
        rol: userData.rol?.toString().trim() || 'user',
        membresiaPagada: userData.membresiaPagada === 'true' || userData.membresiaPagada === true,
        maxReservas: parseInt(userData.maxReservas) || 3
      });

      if (userData.parejaNombre) {
        await Pareja.create({
          UserId: usuario.id,
          nombre: userData.parejaNombre?.toString().trim(),
          nif: userData.parejaNif?.toString().trim(),
          fechaNacimiento: userData.parejaFechaNacimiento ? new Date(userData.parejaFechaNacimiento) : null,
          telefono: userData.parejaTelefono?.toString().trim() || null,
          imagen: null
        });
      }

      if (userData.hijoNombre) {
        await Hijo.create({
          UserId: usuario.id,
          nombre: userData.hijoNombre?.toString().trim(),
          nif: userData.hijoNif?.toString().trim(),
          fechaNacimiento: userData.hijoFechaNacimiento ? new Date(userData.hijoFechaNacimiento) : null,
          telefono: userData.hijoTelefono?.toString().trim() || null,
          imagen: null
        });
      }
    }

    fs.unlinkSync(req.file.path);
    res.status(201).json({ message: 'Usuarios importados correctamente.' });

  } catch (error) {
    console.error('Error al importar usuarios:', error);
    res.status(500).json({ error: 'Error interno durante la importación.' });
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

    const usuario = await Usuario.findByPk(reserva.UsuarioId);
    const libro = await Libro.findByPk(reserva.LibroId);

    if (usuario?.correoElectronico && libro) {
      await enviarCorreo({
        to: usuario.correoElectronico,
        subject: `Reserva cancelada - ${libro.titulo}`,
        html: `
          <h3>Hola ${usuario.nombre},</h3>
          <p>Se ha cancelado tu reserva del libro <strong>${libro.titulo}</strong>.</p>
          <p>Si no solicitaste esta acción, por favor contacta con el equipo de Biblioteca Grema.</p>
        `
      });
    }


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

    const usuario = await Usuario.findByPk(reserva.UsuarioId);
const libro = await Libro.findByPk(reserva.LibroId);

if (usuario?.correoElectronico && libro) {
  await enviarCorreo({
    to: usuario.correoElectronico,
    subject: `Reserva ampliada - ${libro.titulo}`,
    html: `
      <h3>Hola ${usuario.nombre},</h3>
      <p>Tu reserva del libro <strong>${libro.titulo}</strong> ha sido ampliada 7 días más.</p>
      <ul>
        <li><strong>Autores:</strong> ${libro.autores || 'Desconocido'}</li>
        <li><strong>Nueva fecha de finalización:</strong> ${new Date(reserva.fechaFin).toLocaleDateString()}</li>
      </ul>
      <p>Gracias por seguir disfrutando de Biblioteca Grema.</p>
    `
  });
}

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

     const nuevaReserva  = await Reserva.create({
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
        subject: `Reserva asignada - ${libro.titulo}`,
        html: `
          <h3>Hola ${usuario.nombre},</h3>
          <p>Se te ha asignado una nueva reserva del libro <strong>${libro.titulo}</strong>.</p>
          <ul>
            <li><strong>Autores:</strong> ${libro.autores || 'Desconocido'}</li>
            <li><strong>Fecha de inicio:</strong> ${new Date(nuevaReserva.fechaInicio).toLocaleDateString()}</li>
            <li><strong>Fecha de fin:</strong> ${new Date(nuevaReserva.fechaFin).toLocaleDateString()}</li>
            <li><strong>Código de finalización:</strong> ${nuevaReserva.codigoFinalizacion}</li>
          </ul>
          <p>Gracias por formar parte de Biblioteca Grema.</p>
        `
      });
    }

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

router.post('/libros/import', verifyToken, verifySuperUser, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se proporcionó archivo Excel.' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(hoja, { defval: null });

    const parseFecha = (valor) => {
      const fecha = new Date(valor);
      return isNaN(fecha.getTime()) ? null : fecha;
    };


    const libros = data.map(row => ({
      titulo: row['Titulo']?.toString().trim(),
      autores: row['Autores']?.toString().trim(),
      editorial: row['Editorial']?.toString().trim(),
      isbn: row['ISBN']?.toString().trim(),
      edad: parseInt(row['Edad']) || 0,
      descripcion: row['Descripción.1']?.toString().trim(),
      fechaEdicion: parseFecha(row['Fecha Edición']),
      lenguaPublicacion: row['Lengua Publicación']?.toString().trim(),
      numeroPaginas: parseInt(row['Nº Páginas']) || null,
      edicion: row['Edición']?.toString().trim(),
      formato: row['Formato']?.toString().trim(),
      copias: parseInt(row['Copias']) || 1
    }));

    await Libro.bulkCreate(libros);
    res.status(201).json({ message: 'Libros importados correctamente.' });

  } catch (error) {
    console.error('Error al importar libros:', error);
    res.status(500).json({ error: 'Error interno durante la importación.' });
  }
});



//por subir



module.exports = router;
