const apiBase = window.location.hostname.includes("localhost")
  ? "http://localhost:3001"
  : "http://ec2-34-201-229-162.compute-1.amazonaws.com:3001";

async function cargarLibros() {
  const contenedor = document.getElementById('contenedor-libros');
  const token = localStorage.getItem('token');

  const response = await fetch(`${apiBase}/api/books`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const libros = await response.json();

  if (response.ok) {
    libros.forEach((libro, index) => {
      const col = document.createElement('div');
      col.classList.add('col');

      const card = document.createElement('div');
      card.classList.add('card', 'h-100', 'shadow-sm');

      
      const carouselId = `carousel-${index}`;
      const carousel = document.createElement('div');
      carousel.id = carouselId;
      carousel.classList.add('carousel', 'slide');
      carousel.setAttribute('data-bs-ride', 'carousel');

      const inner = document.createElement('div');
      inner.classList.add('carousel-inner');

      const images = [
        { src: libro.portada, alt: 'Portada' },
        { src: libro.imagen2, alt: 'Imagen 2' },
        { src: libro.imagen3, alt: 'Imagen 3' }
      ];

      let activeSet = false;
      images.forEach((imgData) => {
        if (imgData.src) {
          const item = document.createElement('div');
          item.classList.add('carousel-item');
          if (!activeSet) {
            item.classList.add('active');
            activeSet = true;
          }

          const img = document.createElement('img');
          img.classList.add('d-block', 'w-100');
          img.src = imgData.src;
          img.alt = imgData.alt;

          item.appendChild(img);
          inner.appendChild(item);
        }
      });

     
      const prevBtn = document.createElement('button');
      prevBtn.classList.add('carousel-control-prev');
      prevBtn.setAttribute('type', 'button');
      prevBtn.setAttribute('data-bs-target', `#${carouselId}`);
      prevBtn.setAttribute('data-bs-slide', 'prev');
      prevBtn.innerHTML = `<span class="carousel-control-prev-icon" aria-hidden="true"></span>
                           <span class="visually-hidden">Anterior</span>`;

      const nextBtn = document.createElement('button');
      nextBtn.classList.add('carousel-control-next');
      nextBtn.setAttribute('type', 'button');
      nextBtn.setAttribute('data-bs-target', `#${carouselId}`);
      nextBtn.setAttribute('data-bs-slide', 'next');
      nextBtn.innerHTML = `<span class="carousel-control-next-icon" aria-hidden="true"></span>
                           <span class="visually-hidden">Siguiente</span>`;

      carousel.appendChild(inner);
      carousel.appendChild(prevBtn);
      carousel.appendChild(nextBtn);

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const title = document.createElement('h5');
      title.classList.add('card-title');
      title.textContent = libro.titulo;

      const author = document.createElement('p');
      author.classList.add('card-text');
      author.textContent = libro.autores;

      const cardFooter = document.createElement('div');
      cardFooter.classList.add('card-footer');

      const link = document.createElement('a');
      link.href = `/libros/${libro.id}`;
      link.classList.add('btn', 'btn-primary', 'w-100');
      link.textContent = 'Ver más';

      cardBody.appendChild(title);
      cardBody.appendChild(author);
      cardFooter.appendChild(link);

      card.appendChild(carousel);
      card.appendChild(cardBody);
      card.appendChild(cardFooter);
      col.appendChild(card);
      contenedor.appendChild(col);
    });
  } else {
    console.error('Error al cargar los libros');
  }
}

cargarLibros();
