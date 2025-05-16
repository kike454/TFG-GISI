const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Reserva', {
    idReserva: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    fechaInicio: DataTypes.DATE,
    fechaFin: DataTypes.DATE,
    estadoReserva: DataTypes.STRING,

    codigoFinalizacion: {
      type: DataTypes.STRING,
      allowNull: false
    }
      
  }, {
    tableName: 'reservas',
    timestamps: false
  });
};
