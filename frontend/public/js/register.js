

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const correoElectronico = document.getElementById("email").value;
  const nif = document.getElementById("nif").value;

  try {
    const response = await fetch(`${apiBase}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password,
        correoElectronico,
        nif,
        role: "user"
      })
    });

    const result = await response.json();

    if (response.ok) {
      mostrarToast(result.message || "Registro exitoso");
      setTimeout(() => {
        window.location.href = "/biblioteca";
      }, 1500);
    } else {
      mostrarToast(result.error || "Error en el registro", "danger");
    }
  } catch (error) {
    console.error("Error de red:", error);
    mostrarToast("Error de red al registrar", "danger");
  }
});
