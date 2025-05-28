const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { Usuario, Pareja, Hijo } = require('../database');
const { Op } = require('sequelize');

describe('SuperUsers Panel - Importación de Usuarios (Excel)', () => {
  let token;

  before(async () => {
    const mockSuperUser = {
      username: `superuser_${Date.now()}`,
      password: 'TestPassword123!',
      role: 'superuser',
      correoElectronico: `super_${Date.now()}@example.com`,
      nif: '12345678Z'
    };

    await request(app).post('/api/users/register').send(mockSuperUser);

    const login = await request(app)
      .post('/api/users/login')
      .send({ username: mockSuperUser.username, password: mockSuperUser.password });

    token = login.body.token;
  });

  it('Debería importar usuarios desde un archivo Excel', async function () {
  this.timeout(5000);

  const filePath = path.join(__dirname, 'fixtures', 'usuarios_import.xlsx');

  const res = await request(app)
    .post('/api/superusers/users/import')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', filePath);

  expect(res.status).to.equal(201);
  expect(res.body).to.have.property('message').that.includes('Usuarios importados');
});

  after(async () => {
    console.log(' Limpiando usuarios, parejas e hijos de prueba...');

    await Pareja.destroy({
      where: {
        nombre: {
          [Op.like]: 'Ana Gomez%'
        }
      }
    });

    await Hijo.destroy({
      where: {
        nombre: {
          [Op.like]: 'Lucas%'
        }
      }
    });

    await Usuario.destroy({
      where: {
        nombre: {
          [Op.or]: [
            { [Op.like]: 'juan.perez' },
            { [Op.like]: 'maria.lopez' },
            { [Op.like]: 'carlos.sanchez' },
            { [Op.like]: 'superuser_%' }
          ]
        }
      }
    });
  });
});
