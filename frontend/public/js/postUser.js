const form = document.getElementById('userForm');

//console.log(form);
//console.log("wee", document.getElementById('fname'));



form.addEventListener('submit', function(e) {
    e.preventDefault()

    const data = {
        username: document.getElementById('fname').value,
        password: document.getElementById('pass').value,
        role: 'user',     
        score: document.getElementById('Score').value
    };

    fetch("http://localhost:3001/api/users/addNewUser", {

        method: "POST",
        headers: {

            "Content-Type": "application/json",
        
          },
      
        body: JSON.stringify(data),
      
    })
    .then(res => res.json())

    .then(res =>{ console.log(res); 
        form.reset();})

        
    .catch(err => console.error('Error:', err));
})
