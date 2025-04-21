
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
      nombre: DataTypes.STRING,
      password: DataTypes.STRING,
      nif: DataTypes.STRING,
      fechaNacimiento: DataTypes.DATE,
      telefono: DataTypes.STRING,
      direccion: DataTypes.STRING,
      correoElectronico: DataTypes.STRING,
      webPersonal: DataTypes.STRING,
      rol: DataTypes.STRING
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
