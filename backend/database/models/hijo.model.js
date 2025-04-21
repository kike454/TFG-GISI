const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Hijo', {
    idHijo: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    nombre: DataTypes.STRING
  }, {
    tableName: 'hijos',
    timestamps: false
  });
};
