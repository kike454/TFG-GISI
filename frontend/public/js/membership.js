document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stripe-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;

    if (!email || email.trim() === '') {
      alert("El email no está definido. No se puede iniciar la suscripción.");
      return;
    }

    try {
      const checkoutUrl = (typeof apiBase !== 'undefined')
        ? `${apiBase}/api/stripe/create-checkout-session`
        : '/api/stripe/create-checkout-session';

      const response = await fetch(checkoutUrl, {
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
      console.error('Error al llamar al checkout:', err);
      alert('Ocurrió un error al iniciar el pago');
    }
  });


  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {

    window.history.replaceState({}, '', window.location.pathname);


    const sessionUrl = (typeof apiBase !== 'undefined')
      ? `${apiBase}/api/users/session-info`
      : '/api/users/session-info';


    fetch(sessionUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      'Authorization': `Bearer ${token}`
    })
      .then(res => res.json())
      .then(data => {
        if (data.session?.membresiaPagada) {

          localStorage.setItem('usuario', JSON.stringify(data.session));

          window.location.reload();
        } else {
          console.warn('Pago recibido pero membresía aún no marcada en la sesión');
        }
      })
      .catch(err => {
        console.error('Error al refrescar sesión:', err);
      });
  }
});