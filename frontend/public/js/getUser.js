
//console.log("hola");

const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://34.201.229.162:3001";

fetch(`${apiBase}/api/users`)
  .then(response => response.json())
  .then(data => {
    console.log("Usuarios:", data); 

    const userList = document.getElementById('userList');

    data.users.forEach(username => {
      const li = document.createElement('li');
      li.textContent = username;
      userList.appendChild(li);
    });
  })
  .catch(error => console.error('Error al obtener los usuarios:', error));



