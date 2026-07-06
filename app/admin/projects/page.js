'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { DATA } from '../../../lib/projectsData';

export default function ProjectsManager() {
  const supabase = createClient();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', category: 'architecture', subcategory: '', location: '', year: '', 
    typology: '', use_type: '', size: '', status: '', client: '', icon_url: '',
    images: [], videos: [], texts: []
  });
  const [saving, setSaving] = useState(false);

  const categoryMap = {
    'architecture': DATA.architecture?.subs || [],
    'interiors': DATA.interiors?.subs || [],
    'urban-planning': DATA.urbanism?.subs || [],
    'landscape': DATA.landscape?.subs || [],
    'art': DATA.art?.subs || []
  };
  const subcategoryOptions = categoryMap[formData.category] || [];

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  }

  // --- SEED FUNCTION ---
  async function seedData() {
    if (!confirm('This will insert all hardcoded projects from projectsData.js into the database. Are you sure?')) return;
    
    let allSeedProjects = [];
    
    // Loop through all top-level categories dynamically (architecture, interiors, landscape, urbanism, art)
    Object.keys(DATA).forEach(categoryKey => {
      const categoryData = DATA[categoryKey];
      if (categoryData && categoryData.projects) {
        categoryData.projects.forEach(p => {
          allSeedProjects.push({
            slug: p.id,
            title: p.title,
            category: categoryKey === 'urbanism' ? 'urban-planning' : categoryKey, // map 'urbanism' to 'urban-planning' if needed
            subcategory: p.sub || '',
            location: p.loc || '',
            year: p.year || '',
            typology: p.typology || '',
            use_type: p.Use || '',
            size: p.size || '',
            status: p.status || '',
            client: p.client || '',
            icon_url: p.icon ? (p.icon.startsWith('/') ? p.icon : '/' + p.icon) : '',
            images: (p.imgs || []).map(img => img.startsWith('/') ? img : '/' + img),
            videos: (p.videos || []).map(vid => vid.startsWith('/') ? vid : '/' + vid),
            texts: p.texts || []
          });
        });
      }
    });

    const { error } = await supabase.from('projects').insert(allSeedProjects);
    if (error) {
      alert('Error importing data: ' + error.message);
    } else {
      alert('Projects imported successfully!');
      fetchProjects();
    }
  }

  function handleEdit(p) {
    setEditingId(p.id);
    setFormData({
      title: p.title || '', slug: p.slug || '', category: p.category || 'architecture',
      subcategory: p.subcategory || '', location: p.location || '', year: p.year || '',
      typology: p.typology || '', use_type: p.use_type || '', size: p.size || '',
      status: p.status || '', client: p.client || '', icon_url: p.icon_url || '',
      images: p.images || [], videos: p.videos || [], texts: p.texts || []
    });
  }

  function handleAddNew() {
    setEditingId('new');
    setFormData({
      title: '', slug: '', category: 'architecture', subcategory: '', location: '', year: '', 
      typology: '', use_type: '', size: '', status: '', client: '', icon_url: '',
      images: [], videos: [], texts: []
    });
  }

  function handleCancel() {
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    
    const pData = { ...formData };
    
    if (editingId === 'new') {
      const { error } = await supabase.from('projects').insert([pData]);
      if (error) alert('Error: ' + error.message);
      else { alert('Project created!'); setEditingId(null); fetchProjects(); }
    } else {
      const { error } = await supabase.from('projects').update(pData).eq('id', editingId);
      if (error) alert('Error: ' + error.message);
      else { alert('Project updated!'); fetchProjects(); }
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (confirm('Delete this project permanently?')) {
      await supabase.from('projects').delete().eq('id', id);
      if (editingId === id) setEditingId(null);
      fetchProjects();
    }
  }

  // --- UPLOAD HANDLERS ---
  async function handleIconUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `icon_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_images').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_images').getPublicUrl(fileName);
    setFormData({ ...formData, icon_url: data.publicUrl });
  }

  async function handleImageAdd(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `img_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_images').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_images').getPublicUrl(fileName);
    setFormData({ ...formData, images: [...formData.images, data.publicUrl] });
  }

  async function handleVideoAdd(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `vid_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_videos').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_videos').getPublicUrl(fileName);
    setFormData({ ...formData, videos: [...formData.videos, data.publicUrl] });
  }

  // --- ARRAY REORDERING ---
  function moveItem(arrayName, index, dir) {
    const arr = [...formData[arrayName]];
    if (dir === 'up' && index > 0) {
      [arr[index-1], arr[index]] = [arr[index], arr[index-1]];
    } else if (dir === 'down' && index < arr.length - 1) {
      [arr[index+1], arr[index]] = [arr[index], arr[index+1]];
    }
    setFormData({ ...formData, [arrayName]: arr });
  }

  function removeItem(arrayName, index) {
    const arr = [...formData[arrayName]];
    arr.splice(index, 1);
    setFormData({ ...formData, [arrayName]: arr });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Projects Manager</h1>
          <p style={{ color: '#57564F' }}>Manage portfolio projects, galleries, and descriptive texts.</p>
        </div>
        {projects.length === 0 && (
          <button onClick={seedData} style={{ background: '#e0e0e0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}>
            Import Existing Projects
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* LEFT COLUMN: LIST */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={handleAddNew} style={{ width: '100%', background: '#45A8A1', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
            + Add New Project
          </button>
          
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map(p => (
                <div key={p.id} onClick={() => handleEdit(p)} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: editingId === p.id ? '#f0fdfc' : 'transparent', borderColor: editingId === p.id ? '#45A8A1' : '#eee' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{p.category} - {p.subcategory}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} style={{ marginTop: '8px', padding: '4px 8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        {editingId ? (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>{editingId === 'new' ? 'New Project' : 'Edit Project'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* BASIC INFO */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>BASIC INFO</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Title</label><input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>URL Slug (e.g., ashokjamtani)</label><input required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div>
                    <label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Category</label>
                    <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}}>
                      <option value="architecture">Architecture</option>
                      <option value="interiors">Interiors</option>
                      <option value="urban-planning">Urban Planning</option>
                      <option value="landscape">Landscape</option>
                      <option value="art">Art</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Subcategory</label>
                    <select value={formData.subcategory} onChange={e=>setFormData({...formData, subcategory: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}}>
                      <option value="">Select a subcategory</option>
                      {subcategoryOptions.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* DETAILS MATRIX */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>DETAILS MATRIX</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Location</label><input value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Year</label><input value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Typology</label><input value={formData.typology} onChange={e=>setFormData({...formData, typology: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Use Type</label><input value={formData.use_type} onChange={e=>setFormData({...formData, use_type: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Size / Area</label><input value={formData.size} onChange={e=>setFormData({...formData, size: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Status</label><input value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Client (Optional)</label><input value={formData.client} onChange={e=>setFormData({...formData, client: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                </div>
              </div>

              {/* MEDIA */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>MEDIA (THUMBNAIL & GALLERY)</h3>
                <div style={{ marginBottom: '24px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'8px'}}>Grid Thumbnail Icon</label>
                  {formData.icon_url && <img src={formData.icon_url} alt="Icon" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
                  <input type="file" accept="image/*" onChange={handleIconUpload} />
                </div>

                <div style={{ marginBottom: '24px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'8px'}}>Main Images (Scroll Gallery)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {formData.images.map((img, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <img src={img} alt={`Img ${idx}`} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img}</div>
                        <button type="button" onClick={() => moveItem('images', idx, 'up')} disabled={idx === 0}>↑</button>
                        <button type="button" onClick={() => moveItem('images', idx, 'down')} disabled={idx === formData.images.length - 1}>↓</button>
                        <button type="button" onClick={() => removeItem('images', idx)} style={{ color: 'red' }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageAdd} />
                </div>

                <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'8px'}}>Videos (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {formData.videos.map((vid, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px', border: '1px solid #eee', borderRadius: '6px' }}>
                        <video src={vid} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vid}</div>
                        <button type="button" onClick={() => moveItem('videos', idx, 'up')} disabled={idx === 0}>↑</button>
                        <button type="button" onClick={() => moveItem('videos', idx, 'down')} disabled={idx === formData.videos.length - 1}>↓</button>
                        <button type="button" onClick={() => removeItem('videos', idx)} style={{ color: 'red' }}>✕</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" accept="video/*" onChange={handleVideoAdd} />
                </div>
              </div>

              {/* TEXT PANELS */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>TEXT PANELS</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>These paragraphs appear gracefully interleaved between your images on the project page.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.texts.map((txt, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <textarea 
                        value={txt} 
                        onChange={e => {
                          const newTexts = [...formData.texts];
                          newTexts[idx] = e.target.value;
                          setFormData({ ...formData, texts: newTexts });
                        }}
                        style={{ flex: 1, minHeight: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button type="button" onClick={() => moveItem('texts', idx, 'up')} disabled={idx === 0}>↑</button>
                        <button type="button" onClick={() => moveItem('texts', idx, 'down')} disabled={idx === formData.texts.length - 1}>↓</button>
                        <button type="button" onClick={() => removeItem('texts', idx)} style={{ color: 'red' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setFormData({ ...formData, texts: [...formData.texts, ''] })} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '6px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}>
                  + Add Text Panel
                </button>
              </div>

              {/* SUBMIT */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="submit" disabled={saving} style={{ flex: 1, background: '#45A8A1', color: '#fff', padding: '16px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
                  {saving ? 'Saving...' : 'Save Project'}
                </button>
                <button type="button" onClick={handleCancel} style={{ padding: '16px 24px', background: '#f0f0f0', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', color: '#888' }}>
            Select a project from the left, or create a new one to start editing.
          </div>
        )}
      </div>
    </div>
  );
}
