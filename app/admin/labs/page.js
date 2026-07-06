'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { LABS_DATA } from '../../../lib/labsData';

export default function LabsManager() {
  const supabase = createClient();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', category: 'ai-computation', subcategory: '', location: '', year: '', 
    typology: '', size: '', status: '', client: '', icon_url: '', hero_image: '',
    images: [], videos: [], texts: [], is_certificates: false
  });
  const [saving, setSaving] = useState(false);

  const categoryMap = {
    'ai-computation': LABS_DATA['ai-computation']?.subs || [],
    'civic-reform': LABS_DATA['civic-reform']?.subs || [],
    'urban-futures': LABS_DATA['urban-futures']?.subs || [],
  };
  const subcategoryOptions = categoryMap[formData.category] || [];

  useEffect(() => {
    fetchLabs();
  }, []);

  async function fetchLabs() {
    const { data } = await supabase.from('labs').select('*').order('created_at', { ascending: false });
    if (data) setLabs(data);
    setLoading(false);
  }

  // --- SEED FUNCTION ---
  async function seedData() {
    if (!confirm('This will insert all hardcoded labs from labsData.js into the database. Are you sure?')) return;
    
    let allSeedLabs = [];
    
    Object.keys(LABS_DATA).forEach(categoryKey => {
      const categoryData = LABS_DATA[categoryKey];
      if (categoryData && categoryData.projects) {
        categoryData.projects.forEach(p => {
          allSeedLabs.push({
            slug: p.id,
            title: p.title,
            category: categoryKey,
            subcategory: p.sub || '',
            location: p.loc || '',
            year: p.year || '',
            typology: p.typology || '',
            size: p.size || '',
            status: p.status || '',
            client: p.client || '',
            icon_url: p.icon ? (p.icon.startsWith('/') ? p.icon : '/' + p.icon) : '',
            hero_image: p.heroImage ? (p.heroImage.startsWith('/') ? p.heroImage : '/' + p.heroImage) : '',
            images: (p.imgs || []).map(img => img.startsWith('/') ? img : '/' + img),
            videos: (p.videos || []).map(vid => vid.startsWith('/') ? vid : '/' + vid),
            texts: p.texts || [],
            is_certificates: p.isCertificates || false
          });
        });
      }
    });

    const { error } = await supabase.from('labs').insert(allSeedLabs);
    if (error) {
      alert('Error importing data: ' + error.message);
    } else {
      alert('Labs imported successfully!');
      fetchLabs();
    }
  }

  function handleEdit(p) {
    setEditingId(p.id);
    setFormData({
      title: p.title || '', slug: p.slug || '', category: p.category || 'ai-computation',
      subcategory: p.subcategory || '', location: p.location || '', year: p.year || '',
      typology: p.typology || '', size: p.size || '',
      status: p.status || '', client: p.client || '', icon_url: p.icon_url || '',
      hero_image: p.hero_image || '', images: p.images || [], videos: p.videos || [], 
      texts: p.texts || [], is_certificates: p.is_certificates || false
    });
  }

  function handleAddNew() {
    setEditingId('new');
    setFormData({
      title: '', slug: '', category: 'ai-computation', subcategory: '', location: '', year: '', 
      typology: '', size: '', status: '', client: '', icon_url: '', hero_image: '',
      images: [], videos: [], texts: [], is_certificates: false
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
      const { error } = await supabase.from('labs').insert([pData]);
      if (error) alert('Error: ' + error.message);
      else { alert('Lab article created!'); setEditingId(null); fetchLabs(); }
    } else {
      const { error } = await supabase.from('labs').update(pData).eq('id', editingId);
      if (error) alert('Error: ' + error.message);
      else { alert('Lab article updated!'); fetchLabs(); }
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (confirm('Delete this article permanently?')) {
      await supabase.from('labs').delete().eq('id', id);
      if (editingId === id) setEditingId(null);
      fetchLabs();
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
  
  async function handleHeroUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `hero_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_images').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_images').getPublicUrl(fileName);
    setFormData({ ...formData, hero_image: data.publicUrl });
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
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Labs Manager</h1>
          <p style={{ color: '#57564F' }}>Manage research, publications, academia and civic reforms.</p>
        </div>
        {labs.length === 0 && (
          <button onClick={seedData} style={{ background: '#e0e0e0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}>
            Import Existing Labs Data
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* LEFT COLUMN: LIST */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={handleAddNew} style={{ width: '100%', background: '#45A8A1', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
            + Add New Article
          </button>
          
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {labs.map(p => (
                <div key={p.id} onClick={() => handleEdit(p)} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: editingId === p.id ? '#f0fdfc' : 'transparent', borderColor: editingId === p.id ? '#45A8A1' : '#eee' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{LABS_DATA[p.category]?.title || p.category} - {p.subcategory}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} style={{ marginTop: '8px', padding: '4px 8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        {editingId ? (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>{editingId === 'new' ? 'New Lab Article' : 'Edit Article'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* BASIC INFO */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>BASIC INFO</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Title</label><input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>URL Slug (e.g., ai-pedagogy-1)</label><input required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div>
                    <label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Lab Category</label>
                    <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}}>
                      <option value="ai-computation">AI & Computation</option>
                      <option value="civic-reform">Civic Reform Studio</option>
                      <option value="urban-futures">Urban Futures Lab</option>
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
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Year</label><input value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: '1 / -1', marginTop: '8px' }}>
                    <input type="checkbox" id="certs" checked={formData.is_certificates} onChange={e=>setFormData({...formData, is_certificates: e.target.checked})} />
                    <label htmlFor="certs" style={{fontSize:'12px'}}>Is Certificates Grid?</label>
                  </div>
                </div>
              </div>



              {/* MEDIA */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>MEDIA</h3>
                <div style={{ marginBottom: '24px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'8px'}}>Hero Image (Top of inner page)</label>
                  {formData.hero_image && <img src={formData.hero_image} alt="Hero" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
                  <input type="file" accept="image/*" onChange={handleHeroUpload} />
                </div>
                
                <div style={{ marginBottom: '24px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'8px'}}>Small List Icon (Optional)</label>
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
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>These paragraphs appear on the article detail page.</p>
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
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
                <button type="button" onClick={handleCancel} style={{ padding: '16px 24px', background: '#f0f0f0', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', color: '#888' }}>
            Select an article from the left, or create a new one to start editing.
          </div>
        )}
      </div>
    </div>
  );
}
