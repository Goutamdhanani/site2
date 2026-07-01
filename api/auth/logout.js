import { clearAuthCookie } from '../middleware/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Set-Cookie', clearAuthCookie());
  return res.status(200).json({ success: true, message: 'Logged out.' });
}
