const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario, Pareja, Hijo } = require('../database');

describe('SuperUsers Panel - Actualización de Usuario, Pareja e Hijo', () => {
  let token;
  let userId, parejaId, hijoId;

  const mockSuperUser = {
    username: `superuser_${Date.now()}`,
    password: 'TestPassword123!',
    role: 'superuser',
    correoElectronico: `super_${Date.now()}@example.com`,
    nif: '12345678Z'
  };

  before(async () => {

    const res = await request(app).post('/api/users/register').send(mockSuperUser);
    const loginRes = await request(app)
      .post('/api/users/login')
       .send({ username: mockSuperUser.username, password: mockSuperUser.password });

    token = loginRes.body.token;


    const session = await request(app)
      .get('/api/users/session-info')
      .set('Authorization', `Bearer ${token}`);

    userId = session.body.session.id;
  });

  it('Debería actualizar los datos del usuario', async () => {
    const res = await request(app)
      .put(`/api/superusers/usuarios/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        telefono: '600123456',
        direccion: 'Calle Actualizada 123'
      });

    expect(res.status).to.equal(200);
    expect(res.body.usuario).to.have.property('telefono', '600123456');
  });

  it('Debería crear una pareja asociada al usuario', async () => {
    const res = await request(app)
      .post('/api/superusers/parejas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        UserId: userId,
        nombre: 'María Pareja',
        nif: '22334455A',
        telefono: '611223344'
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('pareja');
    parejaId = res.body.pareja.idPareja;
  });

  it('Debería obtener los datos de la pareja del usuario', async () => {
    const res = await request(app)
      .get(`/api/superusers/usuarios/${userId}/pareja`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('nombre', 'María Pareja');
  });

  it('Debería actualizar los datos de la pareja', async () => {
    const res = await request(app)
      .put(`/api/superusers/parejas/${parejaId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '699887766' });

    expect(res.status).to.equal(200);
    expect(res.body.pareja).to.have.property('telefono', '699887766');
  });

  it('Debería crear un hijo asociado al usuario', async () => {
    const res = await request(app)
      .post('/api/superusers/hijos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        UserId: userId,
        nombre: 'Carlos Hijo',
        nif: '55667788H',
        telefono: '688778899'
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('hijo');
    hijoId = res.body.hijo.idHijo;
  });

  it('Debería obtener los datos del hijo del usuario', async () => {
    const res = await request(app)
      .get(`/api/superusers/usuarios/${userId}/hijo`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('nombre', 'Carlos Hijo');
  });

  it('Debería actualizar los datos del hijo', async () => {
    const res = await request(app)
      .put(`/api/superusers/hijos/${hijoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '677889900' });

    expect(res.status).to.equal(200);
    expect(res.body.hijo).to.have.property('telefono', '677889900');
  });
});

after(async () => {
  console.log(' Limpiando usuarios de prueba...');
  await Pareja.destroy({ where: {} });
  await Hijo.destroy({ where: {} });
  await Usuario.destroy({ where: { nombre: { [require('sequelize').Op.like]: 'superuser_%' } } });
});
