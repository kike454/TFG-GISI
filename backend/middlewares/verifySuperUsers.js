function verifySuperUser(req, res, next) {
  if (!req.user || req.user.rol !== 'superuser') {
    return res.status(403).json({ error: 'Acceso restringido solo a superusuarios' });
  }
  next();
}
module.exports = verifySuperUser;