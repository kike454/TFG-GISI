const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const { Usuario } = require('../database');

router.post('/webhooks', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    try {
      const usuario = await Usuario.findOne({ where: { correoElectronico: email } });

      if (usuario) {
        usuario.membresiaPagada = true;
        console.log(`Antes de guardar: ${usuario.membresiaPagada}`);
        await usuario.save();
        console.log(`Después de guardar: ${usuario.membresiaPagada}`);
        await usuario.reload();
        console.log(`Confirmación en BD: ${usuario.membresiaPagada}`);
        console.log(`Usuario ${email} actualizado con membresía pagada.`);
      } else {
        console.warn(`No se encontró usuario con email: ${email}`);
      }
    } catch (err) {
      console.error('Error actualizando usuario:', err.message);
    }
  }

  res.json({ received: true });
});

module.exports = router;