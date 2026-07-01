import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '../middleware/auth.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const supabase = getSupabase();

  if (req.method === 'GET') {
    // Parse query params
    const {
      page = '1',
      pageSize = '25',
      status,
      priority,
      search,
      sortBy = 'created_at',
      sortDir = 'desc',
      dateFrom,
      dateTo
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(100, Math.max(1, parseInt(pageSize)));
    const offset = (pageNum - 1) * limit;

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .neq('status', 'Archived')
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,company.ilike.%${search}%,lead_id.ilike.%${search}%,country.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      data: data || [],
      total: count || 0,
      page: pageNum,
      pageSize: limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  }

  if (req.method === 'PATCH') {
    // Update a lead by lead_id passed in body
    const { lead_id, ...updates } = req.body || {};
    if (!lead_id) return res.status(400).json({ error: 'lead_id required' });

    // Only allow safe fields to be updated
    const allowedFields = ['status', 'priority', 'assigned_to', 'internal_notes', 'name', 'email', 'phone', 'company'];
    const safeUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) safeUpdates[key] = updates[key];
    }

    const { data, error } = await supabase
      .from('leads')
      .update(safeUpdates)
      .eq('lead_id', lead_id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
