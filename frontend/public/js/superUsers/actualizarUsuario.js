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
  const formUsuario = document.getElementById("form-editar-usuario");

  const formCrearPareja = document.getElementById("form-crear-pareja");
  const formEditarPareja = document.getElementById("form-editar-pareja");

  const formCrearHijo = document.getElementById("form-crear-hijo");
  const formEditarHijo = document.getElementById("form-editar-hijo");

  const id = window.location.pathname.split("/")[3];
  const token = localStorage.getItem("token");

  let parejaId = null;
  let hijoId = null;

  try {

    const res = await fetch(`${apiBase}/api/superusers/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usuarios = await res.json();
    const usuario = usuarios.find((u) => u.id === id);

    if (!usuario) {
      mostrarToast("Usuario no encontrado", "danger");
      return;
    }


    formUsuario.nombre.value = usuario.nombre;
    formUsuario.correoElectronico.value = usuario.correoElectronico;
    formUsuario.nif.value = usuario.nif || "";
    formUsuario.fechaNacimiento.value = usuario.fechaNacimiento?.substring(0, 10) || "";
    formUsuario.telefono.value = usuario.telefono || "";
    formUsuario.direccion.value = usuario.direccion || "";
    formUsuario.webPersonal.value = usuario.webPersonal || "";
    formUsuario.rol.value = usuario.rol;
    formUsuario.membresiaPagada.value = String(usuario.membresiaPagada);
    formUsuario.maxReservas.value = usuario.maxReservas;


    try {
      const resPareja = await fetch(`${apiBase}/api/superusers/usuarios/${id}/pareja`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resPareja.ok) {
        const pareja = await resPareja.json();
        parejaId = pareja.idPareja || pareja.id;
        formEditarPareja.nombre.value = pareja.nombre || "";
        formEditarPareja.nif.value = pareja.nif || "";
        formEditarPareja.fechaNacimiento.value = pareja.fechaNacimiento?.substring(0, 10) || "";
        formEditarPareja.telefono.value = pareja.telefono || "";

        formEditarPareja.classList.remove("d-none");
      } else {
        formCrearPareja.classList.remove("d-none");
      }
    } catch (error) {
      formCrearPareja.classList.remove("d-none");
      console.warn("Pareja no encontrada", error);
    }


    try {
      const resHijo = await fetch(`${apiBase}/api/superusers/usuarios/${id}/hijo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resHijo.ok) {
        const hijo = await resHijo.json();
        hijoId = hijo.idHijo || hijo.id;
        formEditarHijo.nombre.value = hijo.nombre || "";
        formEditarHijo.nif.value = hijo.nif || "";
        formEditarHijo.fechaNacimiento.value = hijo.fechaNacimiento?.substring(0, 10) || "";
        formEditarHijo.telefono.value = hijo.telefono || "";

        formEditarHijo.classList.remove("d-none");
      } else {
        formCrearHijo.classList.remove("d-none");
      }
    } catch (error) {
      formCrearHijo.classList.remove("d-none");
      console.warn("Hijo no encontrado", error);
    }
  } catch (err) {
    mostrarToast("Error al cargar datos", "danger");
    console.error(err);
    return;
  }

  formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formUsuario.nombre.value.trim(),
      correoElectronico: formUsuario.correoElectronico.value.trim(),
      nif: formUsuario.nif.value.trim(),
      fechaNacimiento: formUsuario.fechaNacimiento.value ? new Date(formUsuario.fechaNacimiento.value) : null,
      telefono: formUsuario.telefono.value.trim(),
      direccion: formUsuario.direccion.value.trim(),
      webPersonal: formUsuario.webPersonal.value.trim(),
      rol: formUsuario.rol.value,
      membresiaPagada: formUsuario.membresiaPagada.value === "true",
      maxReservas: parseInt(formUsuario.maxReservas.value),
    };

    const password = formUsuario.password.value.trim();
    if (password) data.password = password;

    Object.keys(data).forEach((key) => {
      if (data[key] === "" || data[key] === undefined || Number.isNaN(data[key])) {
        delete data[key];
      }
    });

    try {
      const res = await fetch(`${apiBase}/api/superusers/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        mostrarToast("Usuario actualizado correctamente");
        setTimeout(() => {
          window.location.href = "/super/usuarios";
        }, 1500);
      } else {
        mostrarToast("Error al actualizar usuario", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red al actualizar usuario", "danger");
    }
  });


  formCrearPareja.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formCrearPareja.nombre.value.trim(),
      nif: formCrearPareja.nif.value.trim(),
      fechaNacimiento: formCrearPareja.fechaNacimiento.value ? new Date(formCrearPareja.fechaNacimiento.value) : null,
      telefono: formCrearPareja.telefono.value.trim(),
      UserId: id,
    };

    try {
      const res = await fetch(`${apiBase}/api/superusers/parejas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        mostrarToast("Pareja creada correctamente");
        parejaId = result.pareja.id;
        window.location.reload();
      } else {
        mostrarToast(result.error || "Error al crear pareja", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red al crear pareja", "danger");
    }
  });


  formEditarPareja.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!parejaId) {
      mostrarToast("Error: ID de pareja no definido", "danger");
      return;
    }

    const data = {
      nombre: formEditarPareja.nombre.value.trim(),
      nif: formEditarPareja.nif.value.trim(),
      fechaNacimiento: formEditarPareja.fechaNacimiento.value ? new Date(formEditarPareja.fechaNacimiento.value) : null,
      telefono: formEditarPareja.telefono.value.trim(),
    };

    try {
      const res = await fetch(`${apiBase}/api/superusers/parejas/${parejaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        mostrarToast("Pareja actualizada correctamente");
      } else {
        const result = await res.json();
        mostrarToast(result.error || "Error al actualizar pareja", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red al actualizar pareja", "danger");
    }
  });


  formCrearHijo.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nombre: formCrearHijo.nombre.value.trim(),
      nif: formCrearHijo.nif.value.trim(),
      fechaNacimiento: formCrearHijo.fechaNacimiento.value ? new Date(formCrearHijo.fechaNacimiento.value) : null,
      telefono: formCrearHijo.telefono.value.trim(),
      UserId: id,
    };

    try {
      const res = await fetch(`${apiBase}/api/superusers/hijos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        mostrarToast("Hijo creado correctamente");
        hijoId = result.hijo.id;
        window.location.reload();
      } else {
        mostrarToast(result.error || "Error al crear hijo", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red al crear hijo", "danger");
    }
  });


  formEditarHijo.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!hijoId) {
      mostrarToast("Error: ID de hijo no definido", "danger");
      return;
    }

    const data = {
      nombre: formEditarHijo.nombre.value.trim(),
      nif: formEditarHijo.nif.value.trim(),
      fechaNacimiento: formEditarHijo.fechaNacimiento.value ? new Date(formEditarHijo.fechaNacimiento.value) : null,
      telefono: formEditarHijo.telefono.value.trim(),
    };

    try {
      const res = await fetch(`${apiBase}/api/superusers/hijos/${hijoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        mostrarToast("Hijo actualizado correctamente");
      } else {
        const result = await res.json();
        mostrarToast(result.error || "Error al actualizar hijo", "danger");
      }
    } catch (err) {
      mostrarToast("Error de red al actualizar hijo", "danger");
    }
  });
});
