const getApiBase = (req) => {
  return req.hostname.includes('localhost')
    ? 'http://localhost:3001'
    : 'http://34.201.229.162:3001';
};

async function sessionBridge(req, res, next) {
  const apiBase = getApiBase(req);
  const token = req.cookies.token; 

  if (!token) {
    res.locals.session = { user: null };
    return next();
  }

  try {
    const response = await fetch(`${apiBase}/api/users/session-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    const result = await response.json();
    res.locals.session = { user: result.session || null };
  } catch (error) {
    console.error('[sessionBridge] Error:', error.message);
    res.locals.session = { user: null };
  }

  next();
}

module.exports = sessionBridge;
