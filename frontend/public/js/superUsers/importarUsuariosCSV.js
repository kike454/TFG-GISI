const apiBase = window.location.hostname.includes('localhost')
  ? 'http://localhost:3001'
  : 'http://tu-dominio.com:3001';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-importar-usuarios');
  const mensaje = document.getElementById('mensaje-importar');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('csvUsuarios');
    if (!fileInput.files.length) {
      mensaje.textContent = "Por favor selecciona un archivo CSV.";
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${apiBase}/api/superusers/usuarios/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        mensaje.className = 'text-success';
        mensaje.textContent = "Usuarios importados correctamente.";
      } else {
        mensaje.className = 'text-danger';
        mensaje.textContent = result.error || "Error al importar usuarios.";
      }

    } catch (error) {
      console.error('Error importando usuarios:', error);
      mensaje.className = 'text-danger';
      mensaje.textContent = "Error al conectar con el servidor.";
    }
  });
});
