const base = process.env.BASE_URL || 'http://localhost:3001';

async function run() {
  try {
    const h = await (await fetch(`${base}/api/health`)).json();
    console.log('HEALTH', h);

    const loginRes = await fetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@acme.test', password: 'password' })
    });
    if (!loginRes.ok) throw new Error('login failed ' + (await loginRes.text()));
    const login = await loginRes.json();
    console.log('LOGIN token:', !!login.token);

    const token = login.token;
    const notes = await (await fetch(`${base}/api/notes`, { headers: { Authorization: `Bearer ${token}` } })).json();
    console.log('NOTES count:', Array.isArray(notes) ? notes.length : 'err');

    const created = await (await fetch(`${base}/api/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: 'smoke test note' })
    })).json();
    console.log('CREATED id:', created._id);

    const del = await fetch(`${base}/api/notes/${created._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    console.log('DELETE status:', del.status);
  } catch (err) {
    console.error('SMOKE ERROR', err.message || err);
    process.exit(2);
  }
}

run();
