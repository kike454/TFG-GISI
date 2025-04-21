
require('dotenv').config();

const { Sequelize } = require('sequelize');

//console.log("DIALECT:", process.env.DB_DIALECT);


const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, 
  {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT
});


const Usuario = require('./models/user.model')(sequelize); 
const Libro = require('./models/libro.model')(sequelize);
const Reserva = require('./models/reserva.model')(sequelize);
const Cuota = require('./models/cuota.model')(sequelize);
const Hijo = require('./models/hijo.model')(sequelize);
const Pareja = require('./models/pareja.model')(sequelize);

//Relaciones, cardinalidad, 
Usuario.hasMany(Cuota);
Cuota.belongsTo(Usuario);

Usuario.hasMany(Hijo);
Hijo.belongsTo(Usuario);

Usuario.hasMany(Pareja);
Pareja.belongsTo(Usuario);

Usuario.hasMany(Reserva);
Reserva.belongsTo(Usuario);

Libro.hasMany(Reserva);
Reserva.belongsTo(Libro);



module.exports = {
  sequelize,
  Usuario,
  Libro,
  Reserva,
  Cuota,
  Hijo,
  Pareja
};

