const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario, Libro, Reserva } = require('../database');
const { Op } = require('sequelize');

describe(' SuperUsers Panel - Gestión de Usuarios y Reservas', () => {
  let superToken;
  let userTest;
  let libroTest;
  let reservaTest;


  before(async () => {
    userTest = await Usuario.create({
      nombre: `user_${Date.now()}`,
      password: 'Test1234!',
      correoElectronico: `user_${Date.now()}@test.com`,
      nif: '12345678Z',
      rol: 'superuser',
      membresiaPagada: true,
      maxReservas: 5
    });

    const login = await request(app)
      .post('/api/users/login')
      .send({ username: userTest.nombre, password: 'Test1234!' });

    superToken = login.body.token;


    libroTest = await Libro.create({
      titulo: 'Test Book',
      autores: 'Autor Test',
      editorial: 'Editorial Test',
      genero: 'Ficción',
      edad: 10,
      descripcion: 'Libro para pruebas',
      copias: 10
    });


    reservaTest = await Reserva.create({
      UsuarioId: userTest.id,
      LibroId: libroTest.id,
      estadoReserva: 'activa',
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      codigoFinalizacion: 'REV-TEST-CODE'
    });
  });




  it(' Debería obtener todos los usuarios', async () => {
    const res = await request(app)
      .get('/api/superusers/usuarios')
      .set('Authorization', `Bearer ${superToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body.some(u => u.id === userTest.id)).to.be.true;
  });

  it(' Debería eliminar un usuario', async () => {
    const userToDelete = await Usuario.create({
      nombre: `delete_me_${Date.now()}`,
      password: '12345678',
      correoElectronico: `delete${Date.now()}@test.com`,
      nif: '98765432Z',
      rol: 'user'
    });

    const res = await request(app)
      .delete(`/api/superusers/usuarios/${userToDelete.id}`)
      .set('Authorization', `Bearer ${superToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message').that.includes('eliminado');
  });


  // TESTS DE RUTAS DE DETALLE DE USUARIO / RESERVAS


  it(' Debería obtener las reservas de un usuario', async () => {
    const res = await request(app)
      .get(`/api/superusers/usuarios/${userTest.id}/reservas`)
      .set('Authorization', `Bearer ${superToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
    expect(res.body[0]).to.have.property('Libro');
    expect(res.body[0].Libro).to.have.property('titulo', 'Test Book');
  });

  let reservaNueva;



   it(' Debería ampliar una reserva activa', async () => {

  reservaNueva = await Reserva.create({
    UsuarioId: userTest.id,
    LibroId: libroTest.id,
    estadoReserva: 'activa',
    fechaInicio: new Date(),
    fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
    codigoFinalizacion: 'REV-AMPLIAR-TEST'
  });

  const res = await request(app)
    .put(`/api/superusers/reservas/${reservaNueva.idReserva}/ampliar`)
    .set('Authorization', `Bearer ${superToken}`);

  expect(res.status).to.equal(200);
  expect(res.body.message).to.include('ampliada');
});

it(' Debería cancelar una reserva activa', async () => {
  const res = await request(app)
    .delete(`/api/superusers/reservas/${reservaNueva.idReserva}`)
    .set('Authorization', `Bearer ${superToken}`);

  expect(res.status).to.equal(200);
  expect(res.body.message).to.include('cancelada');
});

  after(async () => {
    await Reserva.destroy({ where: { UsuarioId: userTest.id } });
    await Libro.destroy({ where: { id: libroTest.id } });
    await Usuario.destroy({ where: { id: userTest.id } });
  });
});
