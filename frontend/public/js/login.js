

const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

// Maneja login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${apiBase}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  const msg = document.getElementById("loginMessage");

  if (res.ok) {
    msg.textContent = "Inicio de sesión exitoso.";
    msg.className = "text-success";

    
    const sessionRes = await fetch(`${apiBase}/api/users/session-info`, {
      credentials: "include"
    });

    const session = await sessionRes.json();

    if (session.session) {
      window.location.href = "/biblioteca";
    } else {
      msg.textContent = "Sesión no persistió. Intenta de nuevo.";
      msg.className = "text-danger";
    }
  } else {
    msg.textContent = result.error || "Error en el inicio de sesión.";
    msg.className = "text-danger";
  }
});


