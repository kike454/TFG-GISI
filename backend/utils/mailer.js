const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function enviarCorreo({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: '"Biblioteca GREMA" <${process.env.EMAIL_USER}>',
      to,
      subject,
      html
    });

    console.log(' Correo enviado:', info.messageId);
  } catch (err) {
    console.error(' Error enviando correo:', err);
  }
}

module.exports = enviarCorreo;
