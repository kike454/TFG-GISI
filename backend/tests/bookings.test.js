const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario, Libro, Reserva } = require('../database');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

describe('API Bookings', () => {
  let token;
  let testUser;
  let testBook;

  before(async () => {
    const username = `testuser_${Date.now()}`;

    testUser = await Usuario.create({
      id: uuidv4(),
      nombre: username,
      password: 'TestPassword123!',
      correoElectronico: `${username}@test.com`,
      nif: '11111111A',
      membresiaPagada: true,
      maxReservas: 2,
      rol: 'user'
    });

    testBook = await Libro.create({
      id: uuidv4(),
      titulo: 'Libro de Test',
      isbn: 'TEST123',
      edad: 10,
      autores: 'Autor Test',
      editorial: 'Editorial Test',
      numeroPaginas: 100,
      genero: 'Test',
      copias: 3
    });

    const login = await request(app)
      .post('/api/users/login')
      .send({
        username: testUser.nombre,
        password: 'TestPassword123!'
      });

    token = login.body.token;
  });

  it('Debería crear una reserva válida', async () => {
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({ libroId: testBook.id });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.include('Reserva creada');
  });

  it('Debería obtener las reservas del usuario', async () => {
    const res = await request(app)
      .get('/api/reservas')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('No debería permitir reservas si no hay copias disponibles', async () => {
    await testBook.update({ copias: 0 });
    const res = await request(app)
      .post('/api/reservas')
      .set('Authorization', `Bearer ${token}`)
      .send({ libroId: testBook.id });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.include('No hay copias');
  });

  it('No debería permitir cancelar reservas de otro usuario', async () => {
    const otroUsuarioId = uuidv4();

    await Usuario.create({
    id: otroUsuarioId,
    nombre: `testuser_otro_${Date.now()}`,
    password: 'FakePassword123!',
    nif: '00000000T',
    correoElectronico: `otro@example.com`,
    membresiaPagada: true,
    maxReservas: 3
  });

    const otraReserva = await Reserva.create({
      idReserva: uuidv4(),
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      estadoReserva: 'activa',
      UsuarioId: otroUsuarioId, 
      LibroId: testBook.id,
      codigoFinalizacion: `REV-${uuidv4()}`
    });

    const res = await request(app)
      .delete(`/api/reservas/${otraReserva.idReserva}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(403);
  });

  it('Debería permitir cancelar una reserva propia', async () => {
    const nuevaReserva = await Reserva.create({
      idReserva: uuidv4(),
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      estadoReserva: 'activa',
      UsuarioId: testUser.id,
      LibroId: testBook.id,
      codigoFinalizacion: `REV-${uuidv4()}`
    });

    const res = await request(app)
      .delete(`/api/reservas/${nuevaReserva.idReserva}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include('cancelada');
  });

  it('Debería ampliar una reserva activa', async () => {
    const reserva = await Reserva.create({
      idReserva: uuidv4(),
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      estadoReserva: 'activa',
      UsuarioId: testUser.id,
      LibroId: testBook.id,
      codigoFinalizacion: `REV-${uuidv4()}`
    });

    const res = await request(app)
      .put(`/api/reservas/${reserva.idReserva}/ampliar`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include('ampliada');
  });

  after(async () => {
    await Reserva.destroy({ where: {} });
    await Libro.destroy({ where: { titulo: 'Libro de Test' } });
    await Usuario.destroy({
      where: {
        nombre: {
          [Op.like]: 'testuser_%'
        }
      }
    });
  });
});
