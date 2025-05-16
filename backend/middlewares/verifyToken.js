const jwt = require('jsonwebtoken');

const JWT_SECRET = 'una-clave-super-secreta'; 

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('Error verificando token:', err.message);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verifyToken;
