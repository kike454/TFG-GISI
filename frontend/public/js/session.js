

const token = localStorage.getItem('token');

if (token) {
  fetch(`${apiBase}/api/users/session-info`, {
    method: "GET",
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      if (data.session) {
        localStorage.setItem("usuario", JSON.stringify(data.session));
        console.log("Sesión:", data.session);
      } else {
        localStorage.removeItem("usuario");
      }
    })
    .catch(err => {
      console.error('Error al verificar sesión:', err);
      localStorage.removeItem("usuario");
    });
}
