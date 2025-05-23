
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const { email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1RS262RSBvIVgG5k4xBnxEVw',
        quantity: 1
      }],
      success_url: 'https://grema.store/membresia?success=true',
      cancel_url: 'https://grema.store/membresia?success=false',
      customer_email: email
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
