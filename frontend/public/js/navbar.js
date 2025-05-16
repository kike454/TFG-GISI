document.addEventListener('DOMContentLoaded', async () => {
  const navLinks = document.getElementById('nav-links');
  const token = localStorage.getItem('token');

  if (!navLinks) return;

  navLinks.innerHTML = '';

  const apiBase = window.location.hostname.includes('localhost')
    ? 'http://localhost:3001'
    : 'http://ec2-34-201-229-162.compute-1.amazonaws.com:3001';

  if (token) {
    try {
      const res = await fetch(`${apiBase}/api/users/session-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        <li class="nav-item">
          <a class="nav-link" id="logoutLink" href="#">Logout</a>
        </li>
      `;
    } catch (err) {
      console.error('Error cargando usuario:', err);
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
});
