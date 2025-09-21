import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tenant', response.data.tenant);
      localStorage.setItem('role', response.data.role);
      router.push('/dashboard');
    } catch (err) {
      setError('Authentication failed');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 460, margin: '80px auto' }}>
        <div className="header">
          <div>
            <h1 className="h1">SaaS Notes</h1>
            <div className="subtitle">Login to continue</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-row">
              <button className="btn" type="submit">Sign in</button>
            </div>
          </form>

          <div style={{ marginTop: 14 }} className="small">
            <strong>Test accounts:</strong>
            <ul>
              <li>admin@acme.test / password</li>
              <li>user@acme.test / password</li>
              <li>admin@globex.test / password</li>
              <li>user@globex.test / password</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
