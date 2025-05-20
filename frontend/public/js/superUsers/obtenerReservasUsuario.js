const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

let reservaIdSeleccionada = null;

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

async function cargarReservasUsuario(usuarioId) {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${apiBase}/api/superusers/usuarios/${usuarioId}/reservas`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const reservas = await response.json();
    if (!response.ok) throw new Error(reservas.error || 'Error');

    const contenedor = document.getElementById("reservas-lista");
    contenedor.innerHTML = "";

    reservas.forEach((reserva, i) => {
      const imagenes = [reserva.Libro.portada, reserva.Libro.imagen2, reserva.Libro.imagen3]
        .filter(img => typeof img === 'string' && img.startsWith('data:image'));

      const carouselId = `carousel-${i}`;
      const carouselInner = imagenes.map((img, idx) => `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${img}" class="d-block w-100" alt="Imagen del libro">
        </div>
      `).join("");

      const carouselHTML = `
        <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">${carouselInner}</div>
          ${imagenes.length > 1 ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Siguiente</span>
            </button>` : ''
          }
        </div>
      `;

      const card = document.createElement("div");
      card.classList.add("card", "mb-4");
      card.innerHTML = `
        <div class="row g-0">
          <div class="col-md-4">${carouselHTML}</div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${reserva.Libro.titulo}</h5>
              <p class="card-text"><strong>Autor:</strong> ${reserva.Libro.autores}</p>
              <p class="card-text"><strong>Inicio:</strong> ${new Date(reserva.fechaInicio).toLocaleDateString()}</p>
              <p class="card-text"><strong>Fin:</strong> ${new Date(reserva.fechaFin).toLocaleDateString()}</p>
              <p class="card-text"><strong>Estado:</strong> ${reserva.estadoReserva}</p>
              ${reserva.estadoReserva === 'activa' ? `
                <button class="btn btn-warning btn-sm me-2 ampliar-superuser-btn" data-id="${reserva.idReserva}">Ampliar</button>
                <button class="btn btn-danger btn-sm cancelar-superuser-btn" data-id="${reserva.idReserva}">Cancelar</button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });

  } catch (err) {
    console.error("Error al cargar reservas del usuario:", err);
    mostrarToast("Error al cargar reservas", "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const usuarioId = window.location.pathname.split("/").pop();
  cargarReservasUsuario(usuarioId);

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("cancelar-superuser-btn")) {
      reservaIdSeleccionada = e.target.getAttribute("data-id");
      new bootstrap.Modal(document.getElementById("modalConfirmarCancelacion")).show();
    }
    if (e.target.classList.contains("ampliar-superuser-btn")) {
      reservaIdSeleccionada = e.target.getAttribute("data-id");
      new bootstrap.Modal(document.getElementById("modalConfirmarAmpliacion")).show();
    }
  });

  document.getElementById("btnConfirmarCancelacion").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarCancelacion"));
    try {
      const res = await fetch(`${apiBase}/api/superusers/reservas/${reservaIdSeleccionada}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      modal.hide();
      if (res.ok) {
        mostrarToast("Reserva cancelada correctamente.");
        cargarReservasUsuario(usuarioId);
      } else {
        mostrarToast(data.error || "Error al cancelar", "danger");
      }
    } catch (err) {
      modal.hide();
      mostrarToast("Error de red al cancelar.", "danger");
    }
  });

  document.getElementById("btnConfirmarAmpliacion").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalConfirmarAmpliacion"));
    try {
      const res = await fetch(`${apiBase}/api/superusers/reservas/${reservaIdSeleccionada}/ampliar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      modal.hide();
      if (res.ok) {
        mostrarToast(data.message);
        cargarReservasUsuario(usuarioId);
      } else {
        mostrarToast(data.error || "Error al ampliar", "danger");
      }
    } catch (err) {
      modal.hide();
      mostrarToast("Error de red al ampliar.", "danger");
    }
  });
});
