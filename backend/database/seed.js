require('dotenv').config();
const { v4: uuidv4 } = require('uuid');



const {
    sequelize,
    Usuario,
    Libro
  } = require('./index');
  
  async function seedDatabase() {
    try {

      //await sequelize.sync({ force: true }); 
      const usuariosExistentes = await Usuario.count();

      if (usuariosExistentes > 0) {
        console.log('La base de datos ya contiene usuarios. Se omite el seed.');
        return;
      }
  
      

      const usuarios = await Usuario.bulkCreate([
        { nombre: 'admin', password: 'TestPassword123!', rol: 'superuser', correoElectronico: 'admin@email.com', nif: '12345678Z', maxReservas: 3 },
        { nombre: 'kike', password: 'TestPassword123!', rol: 'superuser', correoElectronico: 'kike@email.com', nif: '12345678Z', maxReservas: 3 },
        { nombre: 'admin1', password: 'TestPassword123!', rol: 'superuser', correoElectronico: 'admin1@email.com', nif: '12345678Z', maxReservas: 3 },
        { nombre: 'carlos', password: 'TestPassword123!', rol: 'user', correoElectronico: 'carlos@email.com', nif: '12345678Z', maxReservas: 3 },
        { nombre: 'paloma', password: 'TestPassword123!', rol: 'user', correoElectronico: 'paloma@email.com', nif: '12345678Z', maxReservas: 3 },
        { nombre: 'stripeUser',password: 'TestPassword123!', rol: 'user', correoElectronico: 'test@example.com', nif: '12345678Z', maxReservas: 3, membresiaPagada: false},
        { nombre: 'admin2', password: 'TestPassword123', rol: 'superuser', correoElectronico: 'admin2@email.com', nif: '00000002X', maxReservas: 3 },
        { nombre: 'admin3', password: 'TestPassword123', rol: 'superuser', correoElectronico: 'admin3@email.com', nif: '00000003X', maxReservas: 3 },
        { nombre: 'admin4', password: 'TestPassword123', rol: 'superuser', correoElectronico: 'admin4@email.com', nif: '00000004X', maxReservas: 3 },
        { nombre: 'admin5', password: 'TestPassword123', rol: 'superuser', correoElectronico: 'admin5@email.com', nif: '00000005X', maxReservas: 3 },
        { nombre: 'usuarioMembresia', password: 'TestPassword123!', rol: 'user', correoElectronico: 'membresia@email.com', nif: '00000006X', maxReservas: 5, membresiaPagada: true }
      ], { individualHooks: true });
  
      
      const libros = await Libro.bulkCreate([
        { titulo: 'El Principito', isbn: '1234567890', edad: 8, autores: 'Antoine de Saint-Exupéry', editorial: 'Planeta', numeroPaginas: 100, genero: 'Fábula', copias: 5, portada: 'https://upload.wikimedia.org/wikipedia/en/0/05/Littleprince.JPG' },
        { titulo: '1984', isbn: '0987654321', edad: 16, autores: 'George Orwell', editorial: 'Debolsillo', numeroPaginas: 300, genero: 'Distopía', copias: 2, portada: 'https://upload.wikimedia.org/wikipedia/en/c/c3/1984first.jpg' },
        { titulo: 'Cien años de soledad', isbn: '1122334455', edad: 16, autores: 'Gabriel García Márquez', editorial: 'Sudamericana', numeroPaginas: 417, genero: 'Realismo Mágico', copias: 4, portada: 'https://upload.wikimedia.org/wikipedia/en/1/10/Cien_a%C3%B1os_de_soledad_%28book_cover%29.jpg' },
        { titulo: 'Don Quijote de la Mancha', isbn: '2233445566', edad: 18, autores: 'Miguel de Cervantes', editorial: 'Espasa', numeroPaginas: 863, genero: 'Novela', copias: 3, portada: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Don_Quijote_and_Sancho_Panza.jpg/800px-Don_Quijote_and_Sancho_Panza.jpg' },
        { titulo: 'La Odisea', isbn: '3344556677', edad: 14, autores: 'Homero', editorial: 'Gredos', numeroPaginas: 500, genero: 'Épica', copias: 2, portada: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/The_Odyssey_Cover.png/800px-The_Odyssey_Cover.png' },
        { titulo: 'El Hobbit', isbn: '4455667788', edad: 10, autores: 'J.R.R. Tolkien', editorial: 'Minotauro', numeroPaginas: 310, genero: 'Fantasía', copias: 6, portada: 'https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg' },
        { titulo: 'Orgullo y prejuicio', isbn: '5566778899', edad: 14, autores: 'Jane Austen', editorial: 'Penguin', numeroPaginas: 432, genero: 'Romántica', copias: 5, portada: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/PrideAndPrejudiceTitlePage.jpg/800px-PrideAndPrejudiceTitlePage.jpg' },
        { titulo: 'Los juegos del hambre', isbn: '6677889900', edad: 12, autores: 'Suzanne Collins', editorial: 'RBA', numeroPaginas: 374, genero: 'Ciencia ficción', copias: 4, portada: 'https://upload.wikimedia.org/wikipedia/en/d/dc/The_Hunger_Games.jpg' },
        { titulo: 'El código Da Vinci', isbn: '7788990011', edad: 18, autores: 'Dan Brown', editorial: 'Umbriel', numeroPaginas: 454, genero: 'Thriller', copias: 5, portada: 'https://upload.wikimedia.org/wikipedia/en/6/6b/DaVinciCode.jpg' },
        { titulo: 'Harry Potter y la piedra filosofal', isbn: '8899001122', edad: 10, autores: 'J.K. Rowling', editorial: 'Salamandra', numeroPaginas: 256, genero: 'Fantasía', copias: 7, portada: 'https://upload.wikimedia.org/wikipedia/en/6/62/Philosophers_Stone.jpg' },
        { titulo: 'Sapiens: De animales a dioses', isbn: '9900112233', edad: 16, autores: 'Yuval Noah Harari', editorial: 'Debate', numeroPaginas: 472, genero: 'Ensayo', copias: 3, portada: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Sapiens_A_Brief_History_of_Humankind.jpg' },
        { titulo: 'El señor de las moscas', isbn: '1011121314', edad: 14, autores: 'William Golding', editorial: 'Alianza', numeroPaginas: 304, genero: 'Novela', copias: 3, portada: 'https://upload.wikimedia.org/wikipedia/en/9/9b/LordOfTheFliesBookCover.jpg' },
        { titulo: 'Matar a un ruiseñor', isbn: '1213141516', edad: 14, autores: 'Harper Lee', editorial: 'HarperCollins', numeroPaginas: 281, genero: 'Drama', copias: 4, portada: 'https://upload.wikimedia.org/wikipedia/en/7/79/To_Kill_a_Mockingbird.JPG' },
        { titulo: 'Crónica de una muerte anunciada', isbn: '1415161718', edad: 16, autores: 'Gabriel García Márquez', editorial: 'Sudamericana', numeroPaginas: 122, genero: 'Realismo Mágico', copias: 3, portada: 'https://upload.wikimedia.org/wikipedia/en/e/e3/Chronicle_of_a_Death_Foretold_cover.jpg' },
        { titulo: 'La sombra del viento', isbn: '1617181920', edad: 18, autores: 'Carlos Ruiz Zafón', editorial: 'Planeta', numeroPaginas: 576, genero: 'Misterio', copias: 4, portada: 'https://upload.wikimedia.org/wikipedia/en/5/5d/La_Sombra_del_Viento.jpg' }
      ]);
      
  
      
   
  
      console.log(' Datos de prueba insertados correctamente.');
    } catch (error) {
      console.error(' Error al insertar usuarios:', error);
    }
  }
  
  module.exports = { seedDatabase };
  