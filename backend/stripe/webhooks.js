const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Usuario } = require('../database');


router.post('/webhooks', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
console.log('  LLEGÓ PETICIÓN A /api/stripe/webhooks');
console.log('› RAW BODY BYTES:', req.body.length);
 console.log('Headers recibidas:\n', JSON.stringify(req.headers, null, 2));
 console.log('Raw body length:', req.body.length, 'bytes');
console.log('-- INICIO BODY --\n', req.body.toString('utf8'), '\n-- FIN BODY --');

  const sig = req.headers['stripe-signature'];
console.log('Stripe-Signature header:', sig);
  let event;

  console.log('[Webhook] Intentando verificar firma');

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log('[Webhook] Firma verificada correctamente');
  } catch (err) {
    console.error('[Webhook] Error de firma:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    console.log(`[Webhook] Evento de pago recibido para: ${email}`);

    try {
      const usuario = await Usuario.findOne({ where: { correoElectronico: email } });

      if (usuario) {
        usuario.membresiaPagada = true;
        await usuario.save();
        console.log(`[Webhook] Membresía activada para ${email}`);
      } else {
        console.warn(`[Webhook] Usuario no encontrado: ${email}`);
      }
    } catch (err) {
      console.error('[Webhook] Error al actualizar usuario:', err.message);
      return res.status(500).send('Error interno al actualizar usuario');
    }
  }

  res.status(200).json({ received: true });
});

module.exports = router;