document.addEventListener('DOMContentLoaded', async () => {
  const navLinks = document.getElementById('nav-links');
  const formBusqueda = document.getElementById('form-busqueda');
  const token = localStorage.getItem('token');

  if (!navLinks) return;

  navLinks.innerHTML = '';

  if (token) {
    try {
      const res = await fetch(`${apiBase}/api/users/session-info`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (!res.ok) throw new Error('No se pudo obtener la sesión');

      const data = await res.json();

      navLinks.innerHTML = `
        <li class="nav-item">
          <a class="nav-link" href="/biblioteca">Biblioteca</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/reservas">Mis Reservas</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="/ajustes">Ajustes</a>
        </li>
        ${data.session.rol === 'superuser' ? `
        <li class="nav-item">
          <a class="nav-link" href="/super/dashboard">Panel Admin</a>
        </li>` : ''}
        ${!data.session.membresiaPagada ? `
        <li class="nav-item">
          <a class="nav-link" href="/membresia">Membresía</a>
        </li>` : ''}
        <li class="nav-item">
          <a class="nav-link" id="logoutLink" href="#">Logout</a>
        </li>
      `;

      if (formBusqueda) {
        formBusqueda.classList.remove('d-none');
      }

    } catch (err) {
      console.error('Error cargando usuario:', err);
      if (formBusqueda) formBusqueda.classList.add('d-none');
    }

  } else {
    navLinks.innerHTML = `
      <li class="nav-item">
        <a class="nav-link" href="/login">Login</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="/register">Registro</a>
      </li>
    `;

    if (formBusqueda) formBusqueda.classList.add('d-none');
  }

  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.href = '/login';
    });
  }

  if (formBusqueda) {
    formBusqueda.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('inputBusqueda').value.trim();
      if (query.length > 0) {
        window.location.href = `/biblioteca?busqueda=${encodeURIComponent(query)}`;
      }
    });
  }
});
