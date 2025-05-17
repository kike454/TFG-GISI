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

let reservaIdAAmpliar = null;

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('usuario'));

  if (!user || !token) {
    return window.location.href = '/login';
  }

  try {
    const res = await fetch(`${apiBase}/api/reservas`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (!res.ok) throw new Error('No autorizado o sesión expirada');

    const reservas = await res.json();
    const container = document.getElementById('reservas-container');

    if (reservas.length === 0) {
      container.innerHTML = '<p class="text-center">No tienes reservas aún.</p>';
      return;
    }

    reservas.forEach(r => {
  const card = document.createElement('div');
  card.className = 'card mb-3';

  const portada = r.Libro && r.Libro.portada ? r.Libro.portada : '/images/default-cover.jpg';
  const titulo = r.Libro && r.Libro.titulo ? r.Libro.titulo : 'Título no disponible';
  const autores = r.Libro && r.Libro.autores ? r.Libro.autores : 'Autor desconocido';

  card.innerHTML = `
    <div class="row g-0">
      <div class="col-md-4">
        <img src="${portada}" class="img-fluid rounded-start" alt="${titulo}">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">${titulo}</h5>
          <p class="card-text"><strong>Autor:</strong> ${autores}</p>
          <p class="card-text"><strong>Fecha inicio:</strong> ${new Date(r.fechaInicio).toLocaleDateString()}</p>
          <p class="card-text"><strong>Fecha fin:</strong> ${new Date(r.fechaFin).toLocaleDateString()}</p>
          <p class="card-text"><strong>Código de Finalización:</strong> ${r.codigoFinalizacion || 'N/A'}</p>
          <p class="card-text"><small class="text-muted">${r.estadoReserva}</small></p>
          ${r.estadoReserva === 'activa' ? `
            <button class="btn btn-warning btn-sm mt-2 ampliar-reserva-btn me-2" data-id="${r.idReserva}">Ampliar Reserva</button>
            <button class="btn btn-danger btn-sm mt-2 cancelar-reserva-btn" data-id="${r.idReserva}">Cancelar Reserva</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  container.appendChild(card);
});

  } catch (err) {
    console.error('Error cargando reservas:', err);
    window.location.href = '/login';
  }


  document.addEventListener('click', async (e) => {
    const token = localStorage.getItem('token');


    if (e.target.classList.contains('cancelar-reserva-btn')) {
      const reservaId = e.target.getAttribute('data-id');

      try {
        const res = await fetch(`${apiBase}/api/reservas/${reservaId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        if (res.ok) {
          mostrarToast("Reserva cancelada correctamente.");
          setTimeout(() => location.reload(), 1500);
        } else {
          mostrarToast("Error: " + (data.error || "No se pudo cancelar"), "danger");
        }
      } catch (err) {
        mostrarToast("Error de red al cancelar reserva.", "danger");
      }
    }


    if (e.target.classList.contains('ampliar-reserva-btn')) {
      reservaIdAAmpliar = e.target.getAttribute('data-id');
      const modal = new bootstrap.Modal(document.getElementById('modalAmpliarReserva'));
      modal.show();
    }
  });

 
  document.getElementById('btnConfirmarAmpliacion').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    const modalElement = bootstrap.Modal.getInstance(document.getElementById('modalAmpliarReserva'));

    try {
      const res = await fetch(`${apiBase}/api/reservas/${reservaIdAAmpliar}/ampliar`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (res.ok) {
        modalElement.hide();
        mostrarToast(data.message);
        setTimeout(() => location.reload(), 1500);
      } else {
        modalElement.hide();
        mostrarToast("Error al ampliar: " + (data.error || "No se pudo ampliar"), "danger");
      }
    } catch (err) {
      modalElement.hide();
      mostrarToast("Error de red al ampliar reserva.", "danger");
    }
  });
});
