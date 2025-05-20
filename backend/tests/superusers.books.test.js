const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario, Libro, Reserva } = require('../database');
const { Op } = require('sequelize');

describe('SuperUsers Panel - Gestión de Libros y Reservas', () => {
  let token;
  let superUser;
  let libroId;
  let userId;
  let reservaId;

  const mockSuperUser = {
    nombre: `test_superuser_${Date.now()}`,
    password: 'TestPassword123!',
    correoElectronico: `superuser${Date.now()}@example.com`,
    nif: '00000000S',
    rol: 'superuser',
    membresiaPagada: true,
    maxReservas: 3
  };

  const mockUser = {
    nombre: `test_user_${Date.now()}`,
    password: 'TestPassword123!',
    correoElectronico: `user${Date.now()}@example.com`,
    nif: '11111111U',
    rol: 'user',
    membresiaPagada: true,
    maxReservas: 3
  };

  const mockLibro = {
    titulo: 'Libro de Prueba',
    autores: 'Autor X',
    editorial: 'Editorial Z',
    genero: 'Ficción',
    edad: 12,
    descripcion: 'Descripción breve',
    copias: 5
  };

  before(async () => {
    superUser = await Usuario.create(mockSuperUser);
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: superUser.nombre, password: mockSuperUser.password });

    token = res.body.token;

    const user = await Usuario.create(mockUser);
    userId = user.id;
  });

  it('Debería crear un libro correctamente', async () => {
    const res = await request(app)
      .post('/api/superusers/libros')
      .set('Authorization', `Bearer ${token}`)
      .field('titulo', mockLibro.titulo)
      .field('autores', mockLibro.autores)
      .field('editorial', mockLibro.editorial)
      .field('genero', mockLibro.genero)
      .field('edad', mockLibro.edad)
      .field('descripcion', mockLibro.descripcion)
      .field('copias', mockLibro.copias);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('libro');
    libroId = res.body.libro.id;
  });

  it('Debería obtener la lista de libros', async () => {
    const res = await request(app)
      .get('/api/superusers/libros')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('Debería editar un libro existente', async () => {
    const res = await request(app)
      .put(`/api/superusers/libros/${libroId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('titulo', 'Libro Editado')
      .field('copias', 10);

    expect(res.status).to.equal(200);
    expect(res.body.libro).to.have.property('titulo', 'Libro Editado');
    expect(res.body.libro).to.have.property('copias', 10);
  });

  it('Debería crear una reserva para un usuario', async () => {
    const res = await request(app)
      .post('/api/superusers/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId, libroId });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.include('Reserva creada');
    const reserva = await Reserva.findOne({ where: { UsuarioId: userId, LibroId: libroId } });
    reservaId = reserva.idReserva;
  });


  it('Debería eliminar una reserva creada', async () => {
    const res = await request(app)
      .delete(`/api/superusers/reservas/${reservaId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include('cancelada');
  });

  it('Debería eliminar el libro creado', async () => {
    const res = await request(app)
      .delete(`/api/superusers/libros/${libroId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include('eliminado');
  });

  after(async () => {
    await Usuario.destroy({
      where: {
        nombre: {
          [Op.like]: 'test_%'
        }
      }
    });
  });
});
