'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';

// ------------------------------------------------------------------
// 1. MAIN INFO MANAGER
// ------------------------------------------------------------------
function MainInfoManager({ supabase }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    title: 'Our Practice.',
    subtitle: 'Architects, urbanists, thinkers, facilitators and resource strategists.',
    introHeading: 'At SAP, We don\'t just design spaces...',
    introParagraph: 'Led by Principal Architect Paras Netragaonkar...',
    mainImage: '/Teams/main team image.jpeg',
    portraitImage: '/Teams/principal architects.jpeg',
    slideshow: ['/Teams/slideshow/1.jpeg', '/Teams/slideshow/2.jpeg', '/Teams/slideshow/3.jpeg', '/Teams/slideshow/4.jpeg']
  });

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('value').eq('key', 'practice_page').single();
      if (data?.value) {
        setSettings({ ...settings, ...data.value });
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: 'practice_page', value: settings }, { onConflict: 'key' });
    
    if (error) alert('Error saving settings: ' + error.message);
    else alert('Main page settings saved successfully!');
    setSaving(false);
  }

  async function handleUpload(file, fieldPath, index = null) {
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `practice_${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('team_headshots').upload(fileName, file);
    if (uploadError) return alert('Upload failed');
    const { data } = supabase.storage.from('team_headshots').getPublicUrl(fileName);
    
    if (fieldPath === 'slideshow') {
      const newSlides = [...settings.slideshow];
      newSlides[index] = data.publicUrl;
      setSettings({ ...settings, slideshow: newSlides });
    } else {
      setSettings({ ...settings, [fieldPath]: data.publicUrl });
    }
  }

  if (loading) return <p>Loading settings...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Main Page Texts</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} placeholder="Title" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <input value={settings.subtitle} onChange={e => setSettings({...settings, subtitle: e.target.value})} placeholder="Subtitle" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
        <textarea value={settings.introHeading} onChange={e => setSettings({...settings, introHeading: e.target.value})} placeholder="Intro Heading" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }} />
        <textarea value={settings.introParagraph} onChange={e => setSettings({...settings, introParagraph: e.target.value})} placeholder="Intro Narrative" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '80px' }} />
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px' }}>Images</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Main Full-Width Image</p>
          <img src={settings.mainImage} alt="Main" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
          <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files[0], 'mainImage')} />
        </div>
        <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Portrait Image (Principal Architects)</p>
          <img src={settings.portraitImage} alt="Portrait" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />
          <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files[0], 'portraitImage')} />
        </div>
      </div>

      <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Slideshow Images (4 slots)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {settings.slideshow.map((imgUrl, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <img src={imgUrl} alt={`Slide ${i+1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
              <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files[0], 'slideshow', i)} style={{ fontSize: '12px', width: '100%' }} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{ background: '#45A8A1', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '20px', alignSelf: 'flex-start' }}>
        {saving ? 'Saving...' : 'Save Main Page Info'}
      </button>
    </div>
  );
}

// ------------------------------------------------------------------
// 2. TEAM MEMBERS MANAGER (Used for both Directors and Staff Grid)
// ------------------------------------------------------------------
function TeamManager({ supabase, type }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: '', designation: '', quote: '', bio: '', email: '', linkedin: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const { data } = await supabase.from('team_members').select('*').eq('type', type).order('order_index', { ascending: true });
    if (data) setMembers(data);
    setLoading(false);
  }

  // --- SEED FUNCTION ---
  async function seedData() {
    if (!confirm('This will insert the hardcoded demo data into the database. Are you sure?')) return;
    
    if (type === 'director') {
      const DIRECTORS = [
        {
          name: 'Ar. Paras Subhash Netragaonkar',
          role: 'Founder and Principal Architect',
          image_url: '/Teams/Team grid/Ar. Paras Netragaonkar.jpeg',
          bio: `Ar. Paras Subhash Netragaonkar specializes in Urban Design, Landscape Design, and Strategic Planning...`,
          email: 'pshilpiarchplann@gmail.com',
          linkedin: 'https://www.linkedin.com/in/ar-paras-s-netragaonkar-46470435/',
          type: 'director',
          order_index: 0
        },
        {
          name: 'Ar. Atharvi Paras Netragaonkar',
          role: 'Lead Architect and Urban Planner',
          image_url: '/Teams/Team grid/Ar. Atharvi Netragaonkar.jpeg',
          bio: `Ar. & Urban Planner Atharvi Netragaonkar is an architect, urban planner, researcher...`,
          email: 'shilpi.arch.plann@gmail.com',
          linkedin: 'https://www.linkedin.com/in/atharvi-netragaonkar-381b791ba/',
          type: 'director',
          order_index: 1
        }
      ];
      await supabase.from('team_members').insert(DIRECTORS);
    } else {
      const baseTeamMembers = [
        { name: 'Ar. Paras Subhash Netragaonkar', role: 'Founder and Principal Architect', quote: 'Great architecture is not a singular act of design, but the seamless integration of people, systems, and environments into a meaningful whole.', image_url: '/Teams/Team grid/Ar. Paras Netragaonkar.jpeg', type: 'staff', order_index: 0 },
        { name: 'Ar. Mihir Ghotankar', role: 'Architect', quote: 'I see architecture as a living system—shaped by data, driven by innovation, and designed to adapt to an ever-changing world.', image_url: '/Teams/Team grid/Ar.Mihr Ghotankar.jpg', type: 'staff', order_index: 1 },
        { name: 'Sagar Kalekar', role: 'Licensing Head', quote: 'Projects succeed when relationships are built on trust, communication remains open, and every challenge is approached with a solution-oriented mindset.', image_url: '/Teams/Team grid/Sagar Kalekar.jpeg', type: 'staff', order_index: 2 },
        { name: 'Ar. Akshata Mule', role: 'Architect', quote: 'Architecture succeeds when movement feels effortless, character feels authentic, and nature remains an integral part of the experience.', image_url: '/Teams/Team grid/Ar. Akshata Mule.jpeg', type: 'staff', order_index: 3 },
        { name: 'Mangesh Godse', role: 'Technical Expert', quote: 'Where disciplined thinking and technical clarity come together to create simple, effective solutions.', image_url: '/Teams/Team grid/Mangesh Godse.jpeg', type: 'staff', order_index: 4 },
        { name: 'Ar. Jigar Bhise', role: 'Architect', quote: 'Great design lies at the intersection of aesthetic clarity, seamless coordination, and a vision for the future.', image_url: '/Teams/Team grid/Ar. Jigar Bhise.jpeg', type: 'staff', order_index: 5 },
        { name: 'Kunal Kadu', role: 'Technical Expert', quote: 'Architecture succeeds when creativity is grounded in accuracy, discipline, and timely execution.', image_url: '/Teams/Team grid/Kunal Kadu.jpeg', type: 'staff', order_index: 6 },
        { name: 'Ar. Falguni Joshi', role: 'Architect', quote: 'I believe great design begins with empathy—placing ourselves in the shoes of those who will ultimately call a space their own.', image_url: '/Teams/Team grid/Ar. Falguni Joshi.jpeg', type: 'staff', order_index: 7 },
        { name: 'Er. Sumitraj Shinde', role: 'Engineer', quote: 'The foundation of a successful project lies in balancing design ambition with practical and economic realities.', image_url: '/Teams/Team grid/Er. Sumitraj Shinde.jpeg', type: 'staff', order_index: 8 },
        { name: 'Er. Aditya Tupe', role: 'Engineer', quote: 'Engineering excellence lies in delivering maximum performance with optimum resources and minimum waste.', image_url: '/Teams/Team grid/Er. Aditya Tupe.jpeg', type: 'staff', order_index: 9 },
        { name: 'Pravin Padawal', role: 'Licensing Head', quote: 'The most valuable skill in project delivery is the ability to connect people, resolve complexities, and move ideas forward.', image_url: '/Teams/Team grid/Pravin Padawal.jpeg', type: 'staff', order_index: 10 },
        { name: 'Ar. Atharvi Paras Netragaonkar', role: 'Architect & Urban Planner', quote: 'I bring the ability to think simultaneously at the scale of a room, a building, a neighborhood, and a city.', image_url: '/Teams/Team grid/Ar. Atharvi Netragaonkar.jpeg', type: 'staff', order_index: 11 }
      ];
      await supabase.from('team_members').insert(baseTeamMembers);
    }
    fetchMembers();
  }
  // -------------------------

  function handleEdit(member) {
    setEditingId(member.id);
    setFormData({
      name: member.name || '',
      role: member.role || '',
      designation: member.designation || '',
      quote: member.quote || '',
      bio: member.bio || '',
      email: member.email || '',
      linkedin: member.linkedin || ''
    });
    setFile(null);
  }

  function handleCancel() {
    setEditingId(null);
    setFormData({ name: '', role: '', designation: '', quote: '', bio: '', email: '', linkedin: '' });
    setFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      let image_url = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('team_headshots').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('team_headshots').getPublicUrl(fileName);
        image_url = data.publicUrl;
      }

      const memberData = {
        name: formData.name,
        role: formData.role,
        designation: formData.designation,
        quote: formData.quote,
        bio: formData.bio,
        email: formData.email,
        linkedin: formData.linkedin,
        type: type,
        ...(image_url && { image_url }),
      };

      if (editingId) {
        await supabase.from('team_members').update(memberData).eq('id', editingId);
      } else {
        await supabase.from('team_members').insert([memberData]);
      }
      alert('Saved successfully!');
      handleCancel();
      fetchMembers();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (confirm('Delete this person?')) {
      await supabase.from('team_members').delete().eq('id', id);
      fetchMembers();
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Current {type === 'director' ? 'Directors' : 'Staff Grid'}</h2>
          {members.length === 0 && (
            <button onClick={seedData} style={{ fontSize: '12px', padding: '6px 12px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Import Existing Data
            </button>
          )}
        </div>
        {loading ? <p>Loading...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {m.image_url && <img src={m.image_url} alt={m.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{m.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{m.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(m)} style={{ padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                  <button onClick={() => handleDelete(m.id)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))}
            {members.length === 0 && <p style={{ color: '#888', fontSize: '14px' }}>No members found.</p>}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          {editingId ? 'Edit' : 'Add New'} {type === 'director' ? 'Director' : 'Staff Member'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Role</label>
            <input type="text" required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          
          {type === 'staff' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Designation</label>
                <input type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Hover Quote</label>
                <textarea value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '60px' }} />
              </div>
            </>
          )}

          {type === 'director' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Full Bio (For Modal)</label>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', minHeight: '120px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>LinkedIn URL</label>
                <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>Profile Image</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button type="submit" disabled={uploading} style={{ flex: 1, background: '#45A8A1', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? 'Saving...' : 'Save'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={{ padding: '12px 24px', background: '#f0f0f0', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// MAIN PAGE COMPONENT (WITH TABS)
// ------------------------------------------------------------------
export default function PracticeManager() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('main');

  const tabStyle = (id) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    borderBottom: activeTab === id ? '2px solid #45A8A1' : '2px solid transparent',
    color: activeTab === id ? '#000' : '#888',
    fontWeight: activeTab === id ? '600' : '400',
    transition: 'all 0.2s'
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Practice Manager</h1>
      <p style={{ color: '#57564F', marginBottom: '24px' }}>Manage all text, images, directors, and grid members on the Practice page.</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #ddd', marginBottom: '32px' }}>
        <div onClick={() => setActiveTab('main')} style={tabStyle('main')}>Main Page Info</div>
        <div onClick={() => setActiveTab('directors')} style={tabStyle('directors')}>Directors</div>
        <div onClick={() => setActiveTab('grid')} style={tabStyle('grid')}>Staff Grid</div>
      </div>

      {/* Content */}
      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
        {activeTab === 'main' && <MainInfoManager supabase={supabase} />}
        {activeTab === 'directors' && <TeamManager supabase={supabase} type="director" />}
        {activeTab === 'grid' && <TeamManager supabase={supabase} type="staff" />}
      </div>
    </div>
  );
}
