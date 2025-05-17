const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-ajustes-usuario");
  const formCrearPareja = document.getElementById("form-crear-pareja");
  const formEditarPareja = document.getElementById("form-editar-pareja");
  const formCrearHijo = document.getElementById("form-crear-hijo");
  const formEditarHijo = document.getElementById("form-editar-hijo");

  const token = localStorage.getItem("token");

  let parejaId = null;
  let hijoId = null;

  try {
    // Cargar datos del usuario
    const res = await fetch(`${apiBase}/api/users/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const usuario = await res.json();

    form.nombre.value = usuario.nombre;
    form.correoElectronico.value = usuario.correoElectronico || "";
    form.nif.value = usuario.nif || "";
    form.fechaNacimiento.value = usuario.fechaNacimiento?.substring(0, 10) || "";
    form.telefono.value = usuario.telefono || "";
    form.direccion.value = usuario.direccion || "";
    form.webPersonal.value = usuario.webPersonal || "";

    // Cargar pareja
    try {
      const resPareja = await fetch(`${apiBase}/api/users/me/pareja`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resPareja.ok) {
        const pareja = await resPareja.json();
        parejaId = pareja.idPareja;
        formEditarPareja.classList.remove('d-none');
        formCrearPareja.classList.add('d-none');
        formEditarPareja.nombre.value = pareja.nombre || "";
        formEditarPareja.nif.value = pareja.nif || "";
        formEditarPareja.fechaNacimiento.value = pareja.fechaNacimiento?.substring(0, 10) || "";
        formEditarPareja.telefono.value = pareja.telefono || "";
      } else {
        formCrearPareja.classList.remove('d-none');
      }
    } catch (error) {
      formCrearPareja.classList.remove('d-none');
    }

    // Cargar hijo
    try {
      const resHijo = await fetch(`${apiBase}/api/users/me/hijo`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resHijo.ok) {
        const hijo = await resHijo.json();
        hijoId = hijo.idHijo;
        formEditarHijo.classList.remove('d-none');
        formCrearHijo.classList.add('d-none');
        formEditarHijo.nombre.value = hijo.nombre || "";
        formEditarHijo.nif.value = hijo.nif || "";
        formEditarHijo.fechaNacimiento.value = hijo.fechaNacimiento?.substring(0, 10) || "";
        formEditarHijo.telefono.value = hijo.telefono || "";
      } else {
        formCrearHijo.classList.remove('d-none');
      }
    } catch (error) {
      formCrearHijo.classList.remove('d-none');
    }

  } catch (err) {
    mostrarToast("Error al cargar datos", "danger");
    console.error(err);
    return;
  }

  // ACTUALIZAR DATOS DE USUARIO
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: form.nombre.value.trim(),
      correoElectronico: form.correoElectronico.value.trim(),
      nif: form.nif.value.trim(),
      fechaNacimiento: form.fechaNacimiento.value || null,
      telefono: form.telefono.value.trim(),
      direccion: form.direccion.value.trim(),
      webPersonal: form.webPersonal.value.trim()
    };

    try {
      const update = await fetch(`${apiBase}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (update.ok) {
        mostrarToast("Datos de usuario actualizados correctamente");
      } else {
        mostrarToast("Error al actualizar usuario", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red", "danger");
      console.error(err);
    }
  });

  // CREAR PAREJA
  formCrearPareja.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formCrearPareja.nombre.value.trim(),
      nif: formCrearPareja.nif.value.trim(),
      fechaNacimiento: formCrearPareja.fechaNacimiento.value || null,
      telefono: formCrearPareja.telefono.value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/api/users/parejas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        mostrarToast("Pareja creada correctamente");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        mostrarToast("Error al crear pareja", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red", "danger");
      console.error(err);
    }
  });

  // ACTUALIZAR PAREJA
  formEditarPareja.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formEditarPareja.nombre.value.trim(),
      nif: formEditarPareja.nif.value.trim(),
      fechaNacimiento: formEditarPareja.fechaNacimiento.value || null,
      telefono: formEditarPareja.telefono.value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/api/users/parejas/${parejaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        mostrarToast("Pareja actualizada correctamente");
      } else {
        mostrarToast("Error al actualizar pareja", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red", "danger");
      console.error(err);
    }
  });

  // CREAR HIJO
  formCrearHijo.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formCrearHijo.nombre.value.trim(),
      nif: formCrearHijo.nif.value.trim(),
      fechaNacimiento: formCrearHijo.fechaNacimiento.value || null,
      telefono: formCrearHijo.telefono.value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/api/users/hijos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        mostrarToast("Hijo creado correctamente");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        mostrarToast("Error al crear hijo", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red", "danger");
      console.error(err);
    }
  });

  // ACTUALIZAR HIJO
  formEditarHijo.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formEditarHijo.nombre.value.trim(),
      nif: formEditarHijo.nif.value.trim(),
      fechaNacimiento: formEditarHijo.fechaNacimiento.value || null,
      telefono: formEditarHijo.telefono.value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/api/users/hijos/${hijoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        mostrarToast("Hijo actualizado correctamente");
      } else {
        mostrarToast("Error al actualizar hijo", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red", "danger");
      console.error(err);
    }
  });

});
