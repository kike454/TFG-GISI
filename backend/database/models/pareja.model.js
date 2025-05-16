const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Pareja', {
    idPareja: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nif: {
      type: DataTypes.STRING
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fechaNacimiento: {
      type: DataTypes.DATE
    },
    telefono: {
      type: DataTypes.STRING
    },
    imagen: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'parejas',
    timestamps: false
  });
};
