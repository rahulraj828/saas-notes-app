import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [tenant, setTenant] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return router.push('/');
    setTenant(localStorage.getItem('tenant') || '');
    setRole(localStorage.getItem('role') || '');
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notes', { headers: { Authorization: `Bearer ${token}` } });
      setNotes(response.data);
    } catch (err) {
      setError('Failed to fetch notes');
    } finally { setLoading(false); }
  };

  const createNote = async () => {
    try {
      await axios.post('/api/notes', { content }, { headers: { Authorization: `Bearer ${token}` } });
      setContent('');
      fetchNotes();
    } catch (err) {
      setError(err.response?.data.error || 'Failed to add note');
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotes();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const upgrade = async () => {
    if (!tenant) return setError('Tenant unknown');
    try {
      await axios.post(`/api/tenants/${tenant}/upgrade`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchNotes();
    } catch (err) {
      setError('Failed to upgrade');
    }
  };

  const isFreeLimitReached = notes.length >= 3; // frontend check; backend enforces

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      <div style={{ width: 820, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Notes — {tenant.toUpperCase()}</h2>
          <div style={{ color: '#666' }}>Role: <strong>{role}</strong></div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <p>Loading...</p>}

        <ul>
          {notes.map(n => (
            <li key={n._id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>{n.content}</span>
              <div>
                <button style={{ marginLeft: 8 }} onClick={() => deleteNote(n._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input style={{ flex: 1, padding: 8 }} placeholder="New note content" value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={createNote} style={{ padding: '8px 12px' }}>Add Note</button>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#666' }}>Notes count: <strong>{notes.length}</strong></div>
          <div>
            {isFreeLimitReached && role === 'admin' && (
              <button onClick={upgrade} style={{ background: '#059669', color: '#fff', padding: '8px 12px', borderRadius: 6 }}>Upgrade to Pro</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
