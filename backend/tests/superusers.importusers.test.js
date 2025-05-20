const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { Usuario, Libro } = require('../database');

describe('SuperUsers Panel - Importación de Libros (Excel)', () => {
  let token;

  before(async () => {
    const mockSuperUser = {
      username: `superuser_${Date.now()}`,
      password: 'TestPassword123!',
      role: 'superuser',
      correoElectronico: `super_${Date.now()}@example.com`,
      nif: '99998888A'
    };


    await request(app).post('/api/users/register').send(mockSuperUser);

    const login = await request(app)
      .post('/api/users/login')
      .send({ username: mockSuperUser.username, password: mockSuperUser.password });

    token = login.body.token;
  });

  it('Debería importar libros desde un archivo Excel', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'libros_test.xlsx');

    const res = await request(app)
      .post('/api/superusers/libros/import')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', filePath);

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('message').that.includes('importados');
  });
});

after(async () => {
  console.log('Limpiando libros de prueba...');
  await Libro.destroy({
    where: {
      titulo: {
        [require('sequelize').Op.like]: 'LibroTest%' // ajusta al título de tus pruebas
      }
    }
  });

  await Usuario.destroy({
    where: {
      nombre: {
        [require('sequelize').Op.like]: 'superuser_%'
      }
    }
  });
});
