'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getAdminUser } from './login/actions';
import { createClient } from '../../utils/supabase/client';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const email = await getAdminUser();
      if (email) {
        setUserEmail(email);
      } else {
        setUserEmail('');
      }
    }
    fetchUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Practice', path: '/admin/practice' },
    { name: 'Projects', path: '/admin/projects' },
    { name: 'Labs', path: '/admin/labs' },
    { name: 'News', path: '/admin/news' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8f6f1', color: '#0E0E12', fontFamily: 'sans-serif', cursor: 'auto', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#0E0E12', color: '#ECE8DC', padding: '32px 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '0 24px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.05em' }}>SAP ADMIN</h2>
          <p style={{ fontSize: '12px', color: '#8A887D', marginTop: '4px' }}>Site Control Panel</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  background: isActive ? 'rgba(69, 168, 161, 0.15)' : 'transparent',
                  color: isActive ? '#45A8A1' : '#B5B2A6',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'background 0.2s, color 0.2s',
                  fontSize: '14px'
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {userEmail && (
            <div style={{ padding: '0 8px', fontSize: '11px', color: '#8A887D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Logged in as:<br />
              <strong style={{ color: '#ECE8DC', display: 'block', marginTop: '4px', fontSize: '12px' }}>{userEmail}</strong>
            </div>
          )}

          <form action={logout} style={{ margin: 0, padding: 0 }}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '6px',
                background: 'transparent',
                color: '#8A887D',
                border: '1px solid rgba(138, 136, 125, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#8A887D'; e.currentTarget.style.borderColor = 'rgba(138, 136, 125, 0.3)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
