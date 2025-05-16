const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define('Libro', {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true
    },
    titulo: DataTypes.STRING,
    isbn: DataTypes.STRING,
    edad: DataTypes.INTEGER,
    autores: DataTypes.STRING,
    editorial: DataTypes.STRING,
    fechaEdicion: DataTypes.DATE,
    lenguaPublicacion: DataTypes.STRING,
    lenguaTraduccion: DataTypes.STRING,
    numeroPaginas: DataTypes.INTEGER,
    descripcion: DataTypes.TEXT,
    edicion: DataTypes.STRING,
    formato: DataTypes.STRING,
    genero: DataTypes.STRING,
    copias: DataTypes.INTEGER,
    portada: DataTypes.BLOB('long'),
    imagen2: DataTypes.BLOB('long'),
    imagen3: DataTypes.BLOB('long')
  }, {
    tableName: 'libros',
    timestamps: false
  });
};
