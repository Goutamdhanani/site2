import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW = '10 m';
let sharedRateLimiter;

function getRateLimiter() {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = process.env;
  if (!url || !token) return null;
  if (!sharedRateLimiter) {
    sharedRateLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(CONTACT_LIMIT, CONTACT_WINDOW),
      analytics: false,
      prefix: 'oddwebs:contact:v1',
    });
  }
  return sharedRateLimiter;
}

function clientKey(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const address = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress;
  const secret = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!address || isIP(address) === 0 || !secret) return null;
  // Keep raw visitor IPs out of the rate-limit database.
  return createHmac('sha256', secret).update(address).digest('hex');
}

async function storeEnquiry(data) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { error } = await db.from('leads').insert({
    lead_id: `studio-${randomUUID()}`,
    name: data.name,
    email: data.email,
    description: data.message,
    services: [data.subject],
    source: 'studio-contact',
    landing_page: '/contact/',
    priority: 'Medium',
  });
  if (error) throw new Error('Enquiry archive unavailable');
  return true;
}

export function validateEnquiry(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const fields = ['name', 'email', 'subject', 'message'];
  if (fields.some(key => typeof body[key] !== 'string')) return null;
  const data = Object.fromEntries(fields.map(key => [key, body[key].trim()]));
  if (
    !data.name || data.name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254 ||
    !data.subject || data.subject.length > 120 ||
    data.message.length < 20 || data.message.length > 5000
  ) return null;
  if (/[\r\n]/.test(data.name + data.email + data.subject)) return null;
  if (body.website) return null;
  return data;
}

export function createHandler(
  send = async payload => new Resend(process.env.RESEND_API_KEY).emails.send(payload),
  store = storeEnquiry,
  rateLimiter = getRateLimiter,
) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ success: false, error: 'Method not allowed.' });
    }

    // Fail closed: the form must not send email unless the shared limiter is live.
    const limiter = typeof rateLimiter === 'function' ? rateLimiter() : rateLimiter;
    const identifier = clientKey(req);
    if (!limiter || !identifier) {
      return res.status(503).json({ success: false, error: 'Enquiry delivery is temporarily unavailable.' });
    }
    try {
      const decision = await limiter.limit(identifier);
      if (!decision || typeof decision.success !== 'boolean') throw new Error('Invalid rate limit response');
      if (!decision.success) {
        const retryAfter = Math.max(1, Math.ceil(((decision.reset ?? Date.now() + 60_000) - Date.now()) / 1000));
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({ success: false, error: 'Too many enquiries. Please try again later.' });
      }
    } catch {
      console.warn('Contact rate limit unavailable; enquiry was not sent.');
      return res.status(503).json({ success: false, error: 'Enquiry delivery is temporarily unavailable.' });
    }

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); }
      catch { return res.status(400).json({ success: false, error: 'Invalid enquiry.' }); }
    }
    const data = validateEnquiry(body);
    if (!data) return res.status(400).json({ success: false, error: 'Please check your name, email, and message.' });
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return res.status(503).json({ success: false, error: 'Email delivery is not configured. Please contact the founder directly.' });
    }

    try {
      const result = await send({
        from: process.env.RESEND_FROM_EMAIL,
        to: process.env.ODD_CONTACT_EMAIL || 'goutamdhanani@gmail.com',
        replyTo: data.email,
        subject: `Oddwebs enquiry: ${data.subject}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\nTopic: ${data.subject}\n\n${data.message}`,
      });
      if (result?.error || !result?.data?.id) {
        return res.status(502).json({ success: false, error: 'Delivery could not be confirmed.' });
      }
      // Email acceptance is authoritative. An optional CRM failure must not invite duplicate sends.
      try { await store(data); }
      catch { console.warn('Contact email accepted; lead archive unavailable.'); }
      return res.status(200).json({ success: true });
    } catch {
      return res.status(502).json({ success: false, error: 'Delivery could not be confirmed.' });
    }
  };
}

export default createHandler();
