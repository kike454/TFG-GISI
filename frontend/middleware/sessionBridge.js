const getApiBase = (req) => {
  return req.hostname.includes('localhost')
    ? 'http://localhost:3001'
    : 'https://grema.store';
};



async function sessionBridge(req, res, next) {

  const apiBase = process.env.API_ORIGIN || getApiBase(req);
  console.log("APIBASE: ", apiBase);
  const token = req.cookies.token; 

  if (!token) {
    res.locals.session = { user: null };
    return next();
  }

  try {
    const response = await fetch(`${apiBase}/api/users/session-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`
      },

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
