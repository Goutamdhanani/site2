import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();
  const { status, priority, search, dateFrom, dateTo } = req.query || {};

  let query = supabase
    .from('leads')
    .select('lead_id, name, email, phone, company, services, meeting_date, meeting_time, status, priority, country, source, utm_source, lead_score, created_at, budget, timeline, description')
    .neq('status', 'Archived')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,lead_id.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('Export query error:', error);
    return res.status(500).json({ error: error.message });
  }

  const leads = data || [];

  // Build CSV
  const headers = ['Lead ID', 'Status', 'Priority', 'Name', 'Email', 'Phone', 'Company', 'Services', 'Meeting Date', 'Meeting Time', 'Country', 'Source', 'Lead Score', 'Budget', 'Timeline', 'Description', 'Created At'];
  
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = leads.map(l => [
    l.lead_id,
    l.status,
    l.priority,
    l.name,
    l.email,
    l.phone,
    l.company,
    Array.isArray(l.services) ? l.services.join('; ') : l.services,
    l.meeting_date,
    l.meeting_time,
    l.country,
    l.utm_source || l.source,
    l.lead_score,
    l.budget,
    l.timeline,
    l.description,
    l.created_at
  ].map(escapeCSV).join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="oddwebs-leads-${new Date().toISOString().split('T')[0]}.csv"`);
  return res.status(200).send(csv);
}
