'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    practice: 0,
    labs: 0,
    news: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      // Fetch counts from Supabase
      const { count: projectsCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      const { count: practiceCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true });
      const { count: labsCount } = await supabase.from('labs').select('*', { count: 'exact', head: true });
      const { count: newsCount } = await supabase.from('news').select('*', { count: 'exact', head: true });

      setStats({
        projects: projectsCount || 0,
        practice: practiceCount || 0,
        labs: labsCount || 0,
        news: newsCount || 0,
      });
    }

    fetchStats();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <img src="/logo.png" alt="Shilpi Architects" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '0.02em', color: '#0E0E12', lineHeight: '1.2' }}>SHILPI ARCHITECTS & PLANNERS</h1>
          <p style={{ color: '#8A887D', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Panel</p>
        </div>
      </div>

      <p style={{ color: '#57564F', marginBottom: '40px', fontSize: '16px' }}>Select a section from the sidebar to start editing your website.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', color: '#8A887D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Projects</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: '#163B5E' }}>{stats.projects}</p>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', color: '#8A887D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Members</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: '#163B5E' }}>{stats.practice}</p>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', color: '#8A887D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Articles</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: '#163B5E' }}>{stats.labs}</p>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '14px', color: '#8A887D', textTransform: 'uppercase', letterSpacing: '0.05em' }}>News Items</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: '#163B5E' }}>{stats.news}</p>
        </div>

      </div>
    </div>
  );
}
