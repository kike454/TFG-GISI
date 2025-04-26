
const getApiBase = (req) => {
    return req.hostname.includes('localhost')
      ? 'http://localhost:3001'
      : 'http://34.201.229.162:3001';
  };


async function sessionBridge(req, res, next) {
    const apiBase = getApiBase(req);
  try {
    const response = await fetch(`${apiBase}/api/users/session-info`, {
      headers: {
        cookie: req.headers.cookie
      },
      credentials: 'include'
    });

    const result = await response.json();
    res.locals.session = { user: result.session || null };
  } catch (error) {
    console.error('[sessionBridge] Error al obtener sesión:', error.message);
    res.locals.session = { user: null };
  }

  next();
}

module.exports = sessionBridge;
