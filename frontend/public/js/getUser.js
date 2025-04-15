
//console.log("hola");

fetch('http://localhost:3001/api/users')
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



