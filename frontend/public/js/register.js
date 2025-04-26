const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://34.201.229.162:3001";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const correoElectronico = document.getElementById("email").value;
  const nif = document.getElementById("nif").value;

  const response = await fetch(`${apiBase}/api/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
      correoElectronico,
      nif,
      role: "user", // por defecto
    }),
  });

  const result = await response.json();
  const message = document.getElementById("message");

  if (response.ok) {
    message.textContent = result.message;
    message.style.color = "green";
    setTimeout(() => {
        window.location.href = "/biblioteca";
      }, 1000);
  } else {
    message.textContent = result.error || "Error en el registro";
    message.style.color = "red";
  }
});
