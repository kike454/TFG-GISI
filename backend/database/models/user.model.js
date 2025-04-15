const bcrypt = require('bcrypt');

users = {};

users.data = {}; 



users.generateHash = function(password, callback){
    bcrypt.hash(password, 10, callback);
}


users.comparePass =  async function(password, hash){
    return await bcrypt.compare(password, hash);
}


users.register = function(username, password, role, score){



    if(users.data.hasOwnProperty(username)){
        throw new Error (` Ya existe el usuario ${username}`)
    }
    users.generateHash(password, function(err, hash){
        if(err){
            throw new Error (`Error al generar el hash de ${username}.`);
        }

        users.data[username] = {username, hash, role,  last_Login: new Date().toISOString(), cookiesAccepted: false, score}
        //console.log(users.data);
    
    });
}

users.isLoginRight = async function (username, password) {
    if(!users.data.hasOwnProperty(username)){
        throw new Error(`El usuario ${username} no está registrado. Por favor, regístrate.`);
    }
    const isValid = await users.comparePass(password, users.data[username].hash);

    if(!isValid){
        throw new Error(`La contraseña para ${username} es incorrecta.`);
    }
    return true;
    
}

users.get =  function(){
    const  datos_usuarios =  users.data;
    return datos_usuarios;
}
module.exports = users;