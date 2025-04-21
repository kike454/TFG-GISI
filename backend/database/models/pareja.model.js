const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Pareja', {
    idPareja: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    nombre: DataTypes.STRING
  }, {
    tableName: 'parejas',
    timestamps: false
  });
};
