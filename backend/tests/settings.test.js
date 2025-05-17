const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario, Pareja, Hijo } = require('../database');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

describe('API Ajustes de Usuario', () => {
  let token;
  let testUser;

  before(async () => {
    const nombre = `testuser_${Date.now()}`;
    testUser = await Usuario.create({
      id: uuidv4(),
      nombre,
      password: 'TestPassword123!',
      correoElectronico: `${nombre}@test.com`,
      nif: '99999999X',
      membresiaPagada: true,
      rol: 'user'
    });

    const res = await request(app)
      .post('/api/users/login')
      .send({ username: testUser.nombre, password: 'TestPassword123!' });

    token = res.body.token;
  });

  it('Debería obtener los datos del usuario (/me)', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('nombre', testUser.nombre);
  });

  it('Debería actualizar los datos del usuario (/me PUT)', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '666777888' });

    expect(res.status).to.equal(200);
    expect(res.body.usuario).to.have.property('telefono', '666777888');
  });

  it('Debería crear una pareja', async () => {
    const res = await request(app)
      .post('/api/users/parejas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Test Pareja',
        nif: '12345678Z',
        telefono: '600123456'
      });

    expect(res.status).to.equal(201);
    expect(res.body.pareja).to.have.property('nombre', 'Test Pareja');
  });

  it('Debería obtener la pareja del usuario', async () => {
    const res = await request(app)
      .get('/api/users/me/pareja')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('nombre');
  });

  it('Debería actualizar la pareja del usuario', async () => {
    const pareja = await Pareja.findOne({ where: { UserId: testUser.id } });

    const res = await request(app)
      .put(`/api/users/parejas/${pareja.idPareja}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '700000000' });

    expect(res.status).to.equal(200);
    expect(res.body.pareja).to.have.property('telefono', '700000000');
  });

  it('Debería crear un hijo', async () => {
    const res = await request(app)
      .post('/api/users/hijos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Test Hijo',
        nif: '12345678Y',
        telefono: '600987654'
      });

    expect(res.status).to.equal(201);
    expect(res.body.hijo).to.have.property('nombre', 'Test Hijo');
  });

  it('Debería obtener el hijo del usuario', async () => {
    const res = await request(app)
      .get('/api/users/me/hijo')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('nombre');
  });

  it('Debería actualizar el hijo del usuario', async () => {
    const hijo = await Hijo.findOne({ where: { UserId: testUser.id } });

    const res = await request(app)
      .put(`/api/users/hijos/${hijo.idHijo}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '711111111' });

    expect(res.status).to.equal(200);
    expect(res.body.hijo).to.have.property('telefono', '711111111');
  });

  after(async () => {
    await Hijo.destroy({ where: {} });
    await Pareja.destroy({ where: {} });
    await Usuario.destroy({
      where: {
        nombre: { [Op.like]: 'testuser_%' }
      }
    });
  });
});
