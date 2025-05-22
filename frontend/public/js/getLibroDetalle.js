

const urlParts = window.location.pathname.split('/');
const libroId = urlParts[urlParts.length - 1];

function mostrarToast(mensaje, tipo = "success") {
  const toast = document.getElementById("toastMensaje");
  const texto = document.getElementById("toastMensajeTexto");

  texto.textContent = mensaje;
  toast.classList.remove("bg-success", "bg-danger", "bg-warning");
  toast.classList.add(`bg-${tipo}`);

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
}

async function cargarDetalleLibro() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('usuario'));

  try {
    const res = await fetch(`${apiBase}/api/books/${libroId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Libro no encontrado');

    const libro = await res.json();
    const contenedor = document.getElementById('detalle-libro');

    contenedor.innerHTML = `
  <div class="card mx-auto" style="max-width: 700px;">
    <img src="${libro.portada || '/images/default-cover.jpg'}" class="card-img-top" alt="${libro.titulo}">
    <div class="card-body text-start">
      <h3 class="card-title text-center">${libro.titulo}</h3>
      <hr />
      <p><strong>ID:</strong> ${libro.id}</p>
      <p><strong>ISBN:</strong> ${libro.isbn || 'N/A'}</p>
      <p><strong>Edad recomendada:</strong> ${libro.edad || 'N/A'} años</p>
      <p><strong>Autores:</strong> ${libro.autores || 'Desconocido'}</p>
      <p><strong>Editorial:</strong> ${libro.editorial || 'N/A'}</p>
      <p><strong>Fecha de edición:</strong> ${libro.fechaEdicion ? new Date(libro.fechaEdicion).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Lengua de publicación:</strong> ${libro.lenguaPublicacion || 'N/A'}</p>
      <p><strong>Número de páginas:</strong> ${libro.numeroPaginas || 'N/A'}</p>
      <p><strong>Descripción:</strong> ${libro.descripcion || 'Sin descripción disponible.'}</p>
      <p><strong>Edición:</strong> ${libro.edicion || 'N/A'}</p>
      <p><strong>Formato:</strong> ${libro.formato || 'N/A'}</p>
      <button id="reservarBtn" class="btn btn-primary mt-4 w-100">Reservar</button>
    </div>
  </div>
`;


    document.getElementById('reservarBtn').addEventListener('click', reservarLibro);

  } catch (err) {
    console.error('Error cargando detalles del libro:', err);
    document.getElementById('detalle-libro').innerHTML = '<h2>Error al cargar detalles del libro.</h2>';
  }
}

async function reservarLibro() {
  const token = localStorage.getItem('token');

  if (!token) {
    mostrarToast("Debes iniciar sesión para reservar", "danger");
    return setTimeout(() => window.location.href = '/login', 1800);
  }

  let user;
  try {
    const resUser = await fetch(`${apiBase}/api/users/session-info`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const dataUser = await resUser.json();
    user = dataUser.session;

    if (!user) {
      throw new Error('Usuario no válido');
    }

  } catch (err) {
    console.error('Error obteniendo datos de usuario:', err);
    mostrarToast("Error al validar sesión. Vuelve a iniciar sesión.", "danger");
    return setTimeout(() => window.location.href = '/login', 1800);
  }

  
  

  
  try {
    const res = await fetch(`${apiBase}/api/reservas`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ libroId, userId: user.id })
    });

    const result = await res.json();

    if (res.ok) {
      mostrarToast("Reserva realizada correctamente.");
      setTimeout(() => window.location.href = '/reservas', 1500);
    } else {
      mostrarToast(result.error || 'Error al reservar el libro.', "danger");
    }

  } catch (err) {
    console.error('Error al hacer la reserva:', err);
    mostrarToast("Error de red al reservar", "danger");
  }
}


cargarDetalleLibro();
