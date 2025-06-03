

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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function validarDNI(dni) {
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
      if (!/^\d{8}[A-Z]$/i.test(dni)) return false;
          const numero = parseInt(dni.slice(0, 8), 10);
          const letra = dni[8].toUpperCase();
          return letras[numero % 23] === letra;
  }

  function validarNIE(nie) {
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  nie = nie.toUpperCase();
  if (!/^[XYZ]\d{7}[A-Z]$/.test(nie)) return false;

  const niePrefix = { X: '0', Y: '1', Z: '2' };
  const numero = parseInt(niePrefix[nie[0]] + nie.slice(1, 8), 10);
  const letraEsperada = letras[numero % 23];
  return nie[8] === letraEsperada;
}


  if (!passwordRegex.test(password)) {
  mostrarToast("Contraseña insegura: usa 8+ caracteres, mayúscula, número y símbolo.", "danger");
  return;
}

if (!emailRegex.test(correoElectronico)) {
  mostrarToast("Correo electrónico no válido", "danger");
  return;
}

if (!validarDNI(nif) && !validarNIE(nif)) {
  mostrarToast("Documento de identidad no válido: DNI o NIE incorrecto", "danger");
  return;
}

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
