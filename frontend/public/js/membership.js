document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stripe-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;

    try {
      if (!email || email.trim() === '') {
        alert("El email no está definido. No se puede iniciar la suscripción.");
        return;
      }

      const url = typeof apiBase !== 'undefined'
        ? `${apiBase}/api/stripe/create-checkout-session`
        : '/api/stripe/create-checkout-session';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error iniciando la suscripción');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    fetch(`${apiBase}/api/users/session-info`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.session?.membresiaPagada) {
          localStorage.setItem('usuario', JSON.stringify(data.session));
          location.reload();
        } else {
          console.warn('Pago realizado pero la membresía no está activa en la sesión.');
        }
      })
      .catch(err => console.error('Error al refrescar sesión:', err));
  }
});
