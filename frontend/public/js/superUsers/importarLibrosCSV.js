const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-importar-csv');
  const mensajeImportar = document.getElementById('mensaje-importar');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
      mensajeImportar.textContent = "Por favor selecciona un archivo.";
      mensajeImportar.className = "text-danger";
      return;
    }

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${apiBase}/api/superusers/libros/import`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        mensajeImportar.textContent = "Libros importados correctamente.";
        mensajeImportar.className = "text-success";
        form.reset();
      } else {
        mensajeImportar.textContent = data.error || "Error al importar libros.";
        mensajeImportar.className = "text-danger";
      }
    } catch (error) {
      console.error("Error en importación:", error);
      mensajeImportar.textContent = "Error de red al importar.";
      mensajeImportar.className = "text-danger";
    }
  });
});
