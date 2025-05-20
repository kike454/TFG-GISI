const jwt = require('jsonwebtoken');
const JWT_SECRET = 'una-clave-super-secreta';

function verifySuperUserFrontend(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.rol !== 'superuser') {
      return res.status(403).render('error', {
        message: 'Acceso denegado. No tienes permisos de superusuario.',
        error: {}
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token inválido:', err.message);
    res.redirect('/login');
  }
}

module.exports = verifySuperUserFrontend;
