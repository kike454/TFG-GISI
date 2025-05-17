const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

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
      <div class="card mx-auto" style="max-width: 600px;">
        <img src="${libro.portada || '/images/default-cover.jpg'}" class="card-img-top" alt="${libro.titulo}">
        <div class="card-body">
          <h3 class="card-title">${libro.titulo}</h3>
          <p class="card-text"><strong>Autor:</strong> ${libro.autores}</p>
          <p class="card-text"><strong>Editorial:</strong> ${libro.editorial}</p>
          <p class="card-text"><strong>Género:</strong> ${libro.genero}</p>
          <p class="card-text"><strong>Edad recomendada:</strong> ${libro.edad} años</p>
          <p class="card-text"><strong>Descripción:</strong> ${libro.descripcion || 'Sin descripción disponible.'}</p>
          <button id="reservarBtn" class="btn btn-primary mt-3 w-100">Reservar</button>
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
