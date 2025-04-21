const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Cuota', {
    idCuota: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    anio: DataTypes.INTEGER
  }, {
    tableName: 'cuotas',
    timestamps: false
  });
};
