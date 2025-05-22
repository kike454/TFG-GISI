
let usuarioAEliminar = null;

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

async function cargarUsuarios() {
  const token = localStorage.getItem('token');
  const tbody = document.querySelector("#tabla-usuarios tbody");

  try {
    const response = await fetch(`${apiBase}/api/superusers/usuarios`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const usuarios = await response.json();

    if (response.ok) {
      usuarios.forEach(usuario => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${usuario.nombre}</td>
          <td>${usuario.correoElectronico}</td>
          <td>${usuario.rol}</td>
          <td>${usuario.membresiaPagada ? "Sí" : "No"}</td>
          <td>
            <a href="/super/usuarios/${usuario.id}" class="btn btn-sm btn-primary me-1">Ver</a>
            <a href="/super/usuarios/${usuario.id}/editar" class="btn btn-sm btn-warning me-1">Actualizar</a>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${usuario.id}">Eliminar</button>
          </td>
        `;

        tbody.appendChild(tr);
      });


      document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", () => {
          usuarioAEliminar = btn.getAttribute("data-id");
          const modal = new bootstrap.Modal(document.getElementById("modalConfirmarEliminacion"));
          modal.show();
        });
      });

    } else {
      mostrarToast("Error al cargar usuarios", "danger");
    }

  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    mostrarToast("Error de red al obtener usuarios", "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();

  document.getElementById("btnConfirmarEliminar").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarEliminacion"));

    try {
      const response = await fetch(`${apiBase}/api/superusers/usuarios/${usuarioAEliminar}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await response.json();
      modal.hide();

      if (response.ok) {
        mostrarToast("Usuario eliminado correctamente");
        setTimeout(() => location.reload(), 1200);
      } else {
        mostrarToast(data.error || "Error al eliminar", "danger");
      }

    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      modal.hide();
      mostrarToast("Error de red al eliminar", "danger");
    }
  });
});
