require('dotenv').config();


const {
    sequelize,
    Usuario,
    Libro,
    Reserva,
    Cuota,
    Hijo,
    Pareja
  } = require('./index');
  
  async function seedDatabase() {
    try {
      await sequelize.sync({ force: true });
  
      

      const usuarios = await Usuario.bulkCreate([
        { nombre: 'admin', password: 'admin', rol: 'admin', correoElectronico: 'admin@email.com', nif: '00000000X' },
        { nombre: 'kike', password: '1234', rol: 'admin', correoElectronico: 'kike@email.com', nif: '00000001X' },
        { nombre: 'carlos', password: '1234', rol: 'user', correoElectronico: 'carlos@email.com', nif: '00000002X' },
        { nombre: 'paloma', password: '1234', rol: 'user', correoElectronico: 'paloma@email.com', nif: '00000003X' }
      ], { individualHooks: true }); 
  
      
      const libros = await Libro.bulkCreate([
        { titulo: 'El Principito', isbn: '1234567890', edad: 8, autores: 'Antoine de Saint-Exupéry', editorial: 'Planeta', numeroPaginas: 100, genero: 'Fábula', copias: 5 },
        { titulo: '1984', isbn: '0987654321', edad: 16, autores: 'George Orwell', editorial: 'Debolsillo', numeroPaginas: 300, genero: 'Distopía', copias: 2 }
      ]);
  
      
      await Reserva.bulkCreate([
        {
          fechaInicio: new Date(),
          fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
          estadoReserva: 'activa',
          UsuarioId: usuarios[0].id,
          LibroId: libros[0].id
        },
        {
          fechaInicio: new Date(),
          fechaFin: new Date(new Date().setDate(new Date().getDate() + 14)),
          estadoReserva: 'activa',
          UsuarioId: usuarios[1].id,
          LibroId: libros[1].id
        }
      ]);
  
      
      await Cuota.bulkCreate([
        { anio: 2024, UsuarioId: usuarios[0].id },
        { anio: 2025, UsuarioId: usuarios[1].id }
      ]);
  
      
      await Hijo.bulkCreate([
        { nombre: 'Lucas', UsuarioId: usuarios[0].id },
        { nombre: 'Ana', UsuarioId: usuarios[1].id }
      ]);
  
      
      await Pareja.bulkCreate([
        { nombre: 'Laura', UsuarioId: usuarios[0].id },
        { nombre: 'Pedro', UsuarioId: usuarios[1].id }
      ]);
  
      console.log(' Datos de prueba insertados correctamente.');
    } catch (error) {
      console.error(' Error al insertar usuarios:', error);
    } finally {
      await sequelize.close();
    }
  }
  
  seedDatabase();
  