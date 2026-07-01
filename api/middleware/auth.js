import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'ow_admin_token';

/**
 * Validates the admin JWT from HttpOnly cookie.
 * Returns decoded payload on success, null on failure.
 */
export function validateAuth(req) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured.');
    return null;
  }

  // Parse cookies from header
  const cookieHeader = req.headers?.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );

  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (err) {
    console.warn('JWT validation failed:', err.message);
    return null;
  }
}

/**
 * Creates a signed JWT and returns Set-Cookie header value.
 */
export function createAuthCookie(email) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  const token = jwt.sign(
    { email, role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';

  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

/**
 * Returns a Set-Cookie header value that clears the auth cookie.
 */
export function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Middleware helper: returns 401 if not authenticated.
 * Use in API routes: const user = requireAuth(req, res); if (!user) return;
 */
export function requireAuth(req, res) {
  const user = validateAuth(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
    return null;
  }
  return user;
}
