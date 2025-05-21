const apiBase = window.location.hostname.includes('localhost')
  ? 'http://localhost:3001'
  : 'http://ec2-34-201-229-162.compute-1.amazonaws.com:3001';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-importar-usuarios');
  const mensaje = document.getElementById('mensaje-importar');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('csvUsuarios');
    const file = fileInput.files[0];

    if (!file) {
      mensaje.className = 'text-danger';
      mensaje.textContent = "Por favor selecciona un archivo Excel (.xlsx).";
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      mensaje.className = 'text-danger';
      mensaje.textContent = "Solo se permiten archivos Excel (.xlsx).";
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${apiBase}/api/superusers/users/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`

        },
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        mensaje.className = 'text-success';
        mensaje.textContent = "Usuarios importados correctamente.";
        form.reset();
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
