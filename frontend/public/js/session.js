const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://34.201.229.162:3001";

fetch(`${apiBase}/api/users/session-info`, {
  credentials: "include"
})
  .then(res => res.json())
  .then(data => {
   
    if (data.session) {
      localStorage.setItem("usuario", JSON.stringify(data.session));
      console.log("Sesión:", data.session);
    } else {
      localStorage.removeItem("usuario");
    }
  });
