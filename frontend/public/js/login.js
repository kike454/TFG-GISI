


function mostrarToast(mensaje, tipo = "danger") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${apiBase}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const result = await res.json();

    if (res.ok) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("usuario", JSON.stringify(result.user));
      document.cookie = `token=${result.token}; path=/`;
      window.location.href = "/biblioteca";
    } else {
      mostrarToast(result.error || "Error en el login", "danger");
    }
  } catch (err) {
    console.error("Error en login:", err);
    mostrarToast("Error de red", "danger");
  }
});
