'use client';
import { useState, useEffect } from 'react';
import { login, signup } from './actions';
import { createClient } from '../../../utils/supabase/client';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('get_admin_count');
      console.log('get_admin_count result:', data, error);
      if (data && data > 0) {
        setHasAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f6f1',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '12px',
        border: '1px solid rgba(14, 14, 18, 0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#0E0E12', marginBottom: '8px', textAlign: 'center', fontSize: '24px' }}>Admin Login</h1>
        <p style={{ color: '#57564F', marginBottom: '32px', textAlign: 'center', fontSize: '14px' }}>Enter the master password to access the site controls.</p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#f8f6f1',
                border: '1px solid rgba(14, 14, 18, 0.15)',
                color: '#0E0E12',
                outline: 'none',
                fontSize: '16px',
                marginBottom: '16px'
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                background: '#f8f6f1',
                border: '1px solid rgba(14, 14, 18, 0.15)',
                color: '#0E0E12',
                outline: 'none',
                fontSize: '16px'
              }}
              required
            />
          </div>
          {error && <div style={{ color: '#e74c3c', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: '#45A8A1',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? '...' : 'Enter Dashboard'}
            </button>

            {!hasAdmin && (
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                style={{
                  background: 'transparent',
                  color: '#57564F',
                  border: '1px solid #8A887D',
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: loading ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                Create Account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
