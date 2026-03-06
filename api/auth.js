const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

async function supabase(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal'
    },
    body: body ? JSON.stringify(body) : null
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

function hashPassword(password) {
  // Simple hash for demo - in production use bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + password.length.toString(36);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, name, salon_name } = req.body;

  try {
    if (action === 'register') {
      // Check if exists
      const existing = await supabase(`/salons?email=eq.${encodeURIComponent(email)}`);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Account already exists' });
      }
      // Create salon
      const salon = await supabase('/salons', 'POST', {
        email,
        password_hash: hashPassword(password),
        owner_name: name,
        name: salon_name || name + "'s Salon",
        created_at: new Date().toISOString()
      });
      return res.status(201).json({ success: true, salon: salon[0] });
    }

    if (action === 'login') {
      const salons = await supabase(`/salons?email=eq.${encodeURIComponent(email)}`);
      if (!salons || !salons.length) return res.status(401).json({ error: 'Invalid email or password' });
      const salon = salons[0];
      if (salon.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      // Don't return password hash
      delete salon.password_hash;
      return res.status(200).json({ success: true, salon });
    }

    if (action === 'update_twilio') {
      const { salon_id, twilio_sid, twilio_token, twilio_from } = req.body;
      await supabase(`/salons?id=eq.${salon_id}`, 'PATCH', { twilio_sid, twilio_token, twilio_from });
      return res.status(200).json({ success: true });
    }

    if (action === 'update_salon') {
      const { salon_id, ...updates } = req.body;
      delete updates.password_hash;
      delete updates.action;
      await supabase(`/salons?id=eq.${salon_id}`, 'PATCH', updates);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
