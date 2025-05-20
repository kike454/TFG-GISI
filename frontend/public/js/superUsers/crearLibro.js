const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

let usuariosGlobal = [];
let libroIdAEliminar = null;
let libroAEditar = null;

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");
  if (!toast || !texto) return;

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarLibros();

  // NUEVO: manejo del formulario de edición
  document.getElementById("formEditarLibro")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const form = document.getElementById("formEditarLibro");
    const formData = new FormData();

    formData.append("titulo", document.getElementById("editarTitulo").value);
    formData.append("autores", document.getElementById("editarAutores").value);
    formData.append("editorial", document.getElementById("editarEditorial").value);
    formData.append("genero", document.getElementById("editarGenero").value);
    formData.append("edad", document.getElementById("editarEdad").value);
    formData.append("descripcion", document.getElementById("editarDescripcion").value);
    formData.append("copias", document.getElementById("editarCopias").value);
    formData.append("isbn", document.getElementById("editarISBN").value);
    formData.append("fechaEdicion", document.getElementById("editarFechaEdicion").value);
    formData.append("lenguaPublicacion", document.getElementById("editarLenguaPublicacion").value);
    formData.append("numeroPaginas", document.getElementById("editarNumeroPaginas").value);
    formData.append("edicion", document.getElementById("editarEdicion").value);
    formData.append("formato", document.getElementById("editarFormato").value);

    const portada = document.getElementById("editarPortada")?.files[0];
    const imagen2 = document.getElementById("editarImagen2")?.files[0];
    const imagen3 = document.getElementById("editarImagen3")?.files[0];

    if (portada) formData.append("portada", portada);
    if (imagen2) formData.append("imagen2", imagen2);
    if (imagen3) formData.append("imagen3", imagen3);

    try {
      const res = await fetch(`${apiBase}/api/superusers/libros/${libroAEditar}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        mostrarToast("Libro actualizado correctamente.");
        bootstrap.Modal.getInstance(document.getElementById("modalEditarLibro"))?.hide();
        await cargarLibros();
      } else {
        mostrarToast(data.error || "Error al actualizar", "danger");
      }
    } catch (err) {
      console.error("Error al actualizar libro:", err);
      mostrarToast("Error de red al actualizar libro.", "danger");
    }
  });
});

async function cargarLibros() {
  const token = localStorage.getItem("token");
  const contenedor = document.getElementById("contenedor-libros");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  try {
    const res = await fetch(`${apiBase}/api/superusers/libros`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const libros = await res.json();
    console.log("Libros cargados:", libros);

    const tabla = document.createElement("table");
    tabla.classList.add("table", "table-bordered", "table-hover", "text-center");
    tabla.innerHTML = `
      <thead class="table-light">
        <tr>
          <th>Título</th>
          <th>Autor</th>
          <th>Editorial</th>
          <th>Género</th>
          <th>Edad</th>
          <th>Copias</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    libros.forEach(libro => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${libro.titulo}</td>
        <td>${libro.autores}</td>
        <td>${libro.editorial}</td>
        <td>${libro.genero}</td>
        <td>${libro.edad}</td>
        <td>${libro.copias}</td>
        <td>
          <button class="btn btn-danger btn-sm me-1" data-id="${libro.id}" data-action="eliminar">Eliminar</button>
          <button class="btn btn-secondary btn-sm me-1" onclick="asignarReserva('${libro.id}')">Asignar</button>
          <button class="btn btn-warning btn-sm" data-action="editar" data-libro='${JSON.stringify(libro)}'>Editar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    contenedor.appendChild(tabla);

    document.querySelectorAll('[data-action="eliminar"]').forEach(btn => {
      btn.addEventListener("click", () => {
        libroIdAEliminar = btn.getAttribute("data-id");
        new bootstrap.Modal(document.getElementById("modalEliminarLibro")).show();
      });
    });

    document.querySelectorAll('[data-action="editar"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const libro = JSON.parse(btn.getAttribute("data-libro"));
        libroAEditar = libro.id;

        document.getElementById("editarTitulo").value = libro.titulo || '';
        document.getElementById("editarAutores").value = libro.autores || '';
        document.getElementById("editarEditorial").value = libro.editorial || '';
        document.getElementById("editarGenero").value = libro.genero || '';
        document.getElementById("editarEdad").value = libro.edad || 0;
        document.getElementById("editarDescripcion").value = libro.descripcion || '';
        document.getElementById("editarCopias").value = libro.copias || 1;
        document.getElementById("editarISBN").value = libro.isbn || '';
        document.getElementById("editarFechaEdicion").value = libro.fechaEdicion
          ? new Date(libro.fechaEdicion).toISOString().split('T')[0]
          : '';
        document.getElementById("editarLenguaPublicacion").value = libro.lenguaPublicacion || '';
        document.getElementById("editarNumeroPaginas").value = libro.numeroPaginas || '';
        document.getElementById("editarEdicion").value = libro.edicion || '';
        document.getElementById("editarFormato").value = libro.formato || '';

        new bootstrap.Modal(document.getElementById("modalEditarLibro")).show();
      });
    });

    document.getElementById("confirmarEliminarLibro")?.addEventListener("click", async () => {
      try {
        const res = await fetch(`${apiBase}/api/superusers/libros/${libroIdAEliminar}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
          console.log("Libro eliminado:", libroIdAEliminar);
          bootstrap.Modal.getInstance(document.getElementById("modalEliminarLibro"))?.hide();
          mostrarToast("Libro eliminado correctamente.");
          await cargarLibros();
        } else {
          console.warn("Error al eliminar libro:", data.error);
          mostrarToast("Error al eliminar libro: " + data.error, "danger");
        }
      } catch (err) {
        console.error("Error de red al eliminar libro:", err);
        mostrarToast("Error de red al eliminar libro.", "danger");
      }
    });

  } catch (err) {
    console.error("Error cargando libros:", err);
    mostrarToast("Error al cargar libros.", "danger");
  }
}

async function asignarReserva(libroId) {
  document.getElementById("libroIdSeleccionado").value = libroId;

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${apiBase}/api/superusers/usuarios`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    usuariosGlobal = await res.json();
    console.log("Usuarios cargados para asignación:", usuariosGlobal);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    mostrarToast("Error al obtener usuarios.", "danger");
    return;
  }

  new bootstrap.Modal(document.getElementById("modalAsignarReserva")).show();
}

document.getElementById("nombreUsuario")?.addEventListener("input", () => {
  const input = document.getElementById("nombreUsuario").value.toLowerCase();
  const sugerencias = document.getElementById("sugerenciasUsuarios");
  sugerencias.innerHTML = "";

  if (input.length < 1) return;

  const coincidencias = usuariosGlobal.filter(u => u.nombre.toLowerCase().includes(input));
  coincidencias.forEach(usuario => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "list-group-item list-group-item-action";
    item.textContent = usuario.nombre;
    item.onclick = () => {
      document.getElementById("nombreUsuario").value = usuario.nombre;
      sugerencias.innerHTML = "";
    };
    sugerencias.appendChild(item);
  });
});

document.getElementById("formAsignarReserva")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const libroId = document.getElementById("libroIdSeleccionado").value;
  const nombre = document.getElementById("nombreUsuario").value.trim().toLowerCase();
  const token = localStorage.getItem("token");

  const usuario = usuariosGlobal.find(u => u.nombre.toLowerCase() === nombre);
  if (!usuario) {
    console.warn("Usuario no encontrado:", nombre);
    mostrarToast("Usuario no encontrado.", "danger");
    return;
  }

  if (!usuario.membresiaPagada) {
    console.warn("Intento de reserva sin membresía:", usuario);
    mostrarToast("El usuario no tiene la membresía pagada.", "danger");
    return;
  }

  console.log("Asignando reserva para:", { userId: usuario.id, libroId });

  try {
    const res = await fetch(`${apiBase}/api/superusers/reservas`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId: usuario.id, libroId })
    });

    const data = await res.json();
    console.log("Respuesta del backend al asignar reserva:", data);

    if (res.ok) {
      mostrarToast("Reserva asignada correctamente.");
      bootstrap.Modal.getInstance(document.getElementById("modalAsignarReserva"))?.hide();
      await cargarLibros();
    } else {
      mostrarToast("Error al asignar reserva: " + (data.error || "Desconocido"), "danger");
    }
  } catch (err) {
    console.error("Error de red al asignar reserva:", err);
    mostrarToast("Error de red al asignar reserva.", "danger");
  }
});

document.getElementById("form-crear-libro")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const token = localStorage.getItem("token");

  const formData = new FormData(form);

  try {
    const res = await fetch(`${apiBase}/api/superusers/libros`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (res.ok) {
      mostrarToast("Libro creado con éxito.");
      setTimeout(() => window.location.href = "/super/libros", 1500);
    } else {
      console.warn("Error al crear libro:", data);
      mostrarToast("Error al crear libro: " + (data.error || "Desconocido"), "danger");
    }
  } catch (err) {
    console.error("Error de red al crear libro:", err);
    mostrarToast("Error de red al crear libro.", "danger");
  }
});
