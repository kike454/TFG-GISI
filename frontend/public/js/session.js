const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

const token = localStorage.getItem('token');

if (token) {
  fetch(`${apiBase}/api/users/session-info`, {
    method: "GET",
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
