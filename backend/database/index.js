const database = {};

database.users = require('./models/user.model');


//database.games = require('./models/games.model');


function initializeUsers(){
    const NAMES = ["carlos", "paloma", "alvaro", "javi"];
    database.users.register("admin", "admin", "admin", 0);
    database.users.register("kike", "1234", "admin", 0);
    NAMES.forEach((username) => {
        database.users.register(username, "1234", "user" , 0);
    });
    //console.log(database.users);
}

function initializeDB(){
    initializeUsers();
    console.log("Base de datos inicializada");
}


initializeDB();

module.exports = database;