const jwt = require('jsonwebtoken');

const JWT_SECRET = 'una-clave-super-secreta'; 

function verifyTokenFrontend(req, res, next) {
  const token = req.cookies.token; 
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token inválido o expirado en frontend:', error.message);
    res.redirect('/login');
  }
}

module.exports = verifyTokenFrontend;
