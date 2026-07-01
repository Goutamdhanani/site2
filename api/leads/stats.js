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

  // Fetch all non-archived leads for aggregation
  const { data: leads, error } = await supabase
    .from('leads')
    .select('status, priority, lead_score, spam_score, created_at, services, country, source, utm_source, device_type, visitor_id, meeting_date, budget')
    .neq('status', 'Archived');

  if (error) {
    console.error('Stats query error:', error);
    return res.status(500).json({ error: error.message });
  }

  const all = leads || [];
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Status counts
  const statusCounts = {};
  all.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });

  // Time-based counts
  const todayLeads = all.filter(l => new Date(l.created_at) >= todayStart).length;
  const weekLeads = all.filter(l => new Date(l.created_at) >= weekStart).length;
  const monthLeads = all.filter(l => new Date(l.created_at) >= monthStart).length;

  // Meetings scheduled (has meeting_date)
  const meetingsScheduled = all.filter(l => l.meeting_date && l.meeting_date !== 'Not scheduled').length;

  // Conversion rate
  const won = statusCounts['Won'] || 0;
  const conversionRate = all.length > 0 ? ((won / all.length) * 100).toFixed(1) : '0.0';

  // Average lead score
  const scores = all.map(l => l.lead_score || 0);
  const avgLeadScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Spam leads
  const spamLeads = all.filter(l => (l.spam_score || 0) > 60).length;

  // Revenue pipeline (parse budget strings)
  let totalPipeline = 0;
  all.forEach(l => {
    const b = l.budget || '';
    if (b.includes('25,000')) totalPipeline += 30000;
    else if (b.includes('10,000')) totalPipeline += 17500;
    else if (b.includes('5,000') && b.includes('10')) totalPipeline += 7500;
    else totalPipeline += 2500;
  });

  // Visitors
  const visitorIds = new Set(all.map(l => l.visitor_id).filter(Boolean));
  const returningVisitors = all.filter(l => l.returning_visitor).length;

  // Top services
  const serviceCounts = {};
  all.forEach(l => {
    (l.services || []).forEach(s => { serviceCounts[s] = (serviceCounts[s] || 0) + 1; });
  });
  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top countries
  const countryCounts = {};
  all.forEach(l => {
    if (l.country) countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top sources
  const sourceCounts = {};
  all.forEach(l => {
    const src = l.utm_source || l.source || 'direct';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });
  const topSources = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Device breakdown
  const deviceCounts = {};
  all.forEach(l => {
    const d = l.device_type || 'desktop';
    deviceCounts[d] = (deviceCounts[d] || 0) + 1;
  });

  return res.status(200).json({
    total: all.length,
    today: todayLeads,
    thisWeek: weekLeads,
    thisMonth: monthLeads,
    meetingsScheduled,
    statusCounts,
    conversionRate: parseFloat(conversionRate),
    avgLeadScore,
    spamLeads,
    revenuePipeline: totalPipeline,
    totalVisitors: visitorIds.size,
    returningVisitors,
    newVisitors: visitorIds.size - returningVisitors,
    topServices,
    topCountries,
    topSources,
    deviceBreakdown: deviceCounts
  });
}
