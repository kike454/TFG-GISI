const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Usuario } = require('../database'); 
const { Op } = require('sequelize');

describe(' API Users', () => {

  const usernameTest = `testuser_${Date.now()}`;

  const mockUser = {
    username: usernameTest,
    password: 'TestPassword123!',
    correoElectronico: `${usernameTest}@example.com`,
    nif: '12345678X',
    role: 'user'
  };

  it('Debería registrar un nuevo usuario', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(mockUser);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message').that.includes('registrado');
  });

  it('Debería NO registrar usuario duplicado', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(mockUser);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error').that.includes('Ya existe');
  });

  it('Debería loguear usuario registrado', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: mockUser.username,
        password: mockUser.password
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('token').that.is.a('string');
    expect(res.body).to.have.property('user').that.is.an('object');
    expect(res.body.user).to.have.property('nombre', mockUser.username);
  });

  it('Debería fallar login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        username: mockUser.username,
        password: 'WrongPassword123!'
      });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('error').that.includes('Contraseña incorrecta');
  });

});


after(async () => {
  console.log(' Borrando usuarios de prueba...');
  await Usuario.destroy({
    where: {
      nombre: {
        [Op.like]: 'testuser_%'
      }
    }
  });
});
