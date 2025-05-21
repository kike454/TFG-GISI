
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    nif: DataTypes.STRING,
    fechaNacimiento: DataTypes.DATE,
    telefono: DataTypes.STRING,
    direccion: DataTypes.STRING,
    correoElectronico: DataTypes.STRING,
    webPersonal: DataTypes.STRING,
    rol: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    membresiaPagada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maxReservas: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExp: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'usuarios',
    timestamps: false,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  Usuario.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Usuario;
};
