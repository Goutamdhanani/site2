import bcrypt from 'bcryptjs';
import { createAuthCookie } from '../middleware/auth.js';

// In-memory rate limiting (per-instance, resets on cold start)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(req) {
  return req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
}

function checkRateLimit(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  if (!record) return { allowed: true, remaining: MAX_ATTEMPTS };
  
  // Clean expired entries
  if (now - record.windowStart > WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordAttempt(key) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, windowStart: now });
  } else {
    record.count++;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rateLimitKey = getRateLimitKey(req);
  const rateCheck = checkRateLimit(rateLimitKey);
  
  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${rateCheck.retryAfter} seconds.`,
      retryAfter: rateCheck.retryAfter
    });
  }

  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  console.log('--- AUTH ATTEMPT ---');
  console.log('Incoming Email:', email);
  console.log('Configured Admin Email:', adminEmail);
  console.log('Configured Password Hash:', adminPasswordHash);

  if (!adminEmail || !adminPasswordHash) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured.');
    return res.status(500).json({ error: 'Server authentication not configured.' });
  }

  // Verify email
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    console.log('FAIL: Email mismatch!');
    recordAttempt(rateLimitKey);
    // Deliberate delay to slow brute force
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    return res.status(401).json({ error: 'Invalid credentials.', remaining: rateCheck.remaining - 1 });
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, adminPasswordHash);
  console.log('Bcrypt comparison result:', passwordValid);
  if (!passwordValid) {
    recordAttempt(rateLimitKey);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    return res.status(401).json({ error: 'Invalid credentials.', remaining: rateCheck.remaining - 1 });
  }

  // Success — create JWT cookie
  const cookie = createAuthCookie(email);
  res.setHeader('Set-Cookie', cookie);
  
  return res.status(200).json({
    success: true,
    message: 'Authenticated successfully.',
    email: adminEmail
  });
}
