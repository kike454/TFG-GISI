const express = require('express');
const router = express.Router();
const { Libro } = require('../database');

router.get('/', async (req, res) => {
  try {
    const libros = await Libro.findAll();

    const librosConImagenes = libros.map(libro => {
      return {
        ...libro.toJSON(),
        portada: libro.portada ? `data:image/jpeg;base64,${libro.portada.toString('base64')}` : null,
        imagen2: libro.imagen2 ? `data:image/jpeg;base64,${libro.imagen2.toString('base64')}` : null,
        imagen3: libro.imagen3 ? `data:image/jpeg;base64,${libro.imagen3.toString('base64')}` : null
      };
    });

    res.json(librosConImagenes);
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const libro = await Libro.findByPk(id);

    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    res.json(libro);
  } catch (error) {
    console.error('Error al obtener el libro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
