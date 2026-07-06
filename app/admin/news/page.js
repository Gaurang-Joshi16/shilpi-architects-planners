'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { NEWS_ARTICLES } from '../../../lib/newsData';

export default function NewsManager() {
  const supabase = createClient();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', date: '', location: '', year: '', 
    hero_image: '', object_position: '', content: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }

  // --- SEED FUNCTION ---
  async function seedData() {
    if (!confirm('This will insert all hardcoded news from newsData.js into the database. Are you sure?')) return;
    
    const allSeedNews = NEWS_ARTICLES.map(p => ({
      slug: p.slug,
      title: p.title,
      date: p.date || '',
      location: p.location || '',
      year: p.year || '',
      hero_image: p.heroImage ? (p.heroImage.startsWith('/') ? p.heroImage : '/' + p.heroImage) : '',
      object_position: p.objectPosition || '',
      content: p.content ? p.content.map(block => ({
        type: block.type,
        value: block.type === 'image' && block.value ? (block.value.startsWith('/') ? block.value : '/' + block.value) : block.value
      })) : []
    }));

    const { error } = await supabase.from('news').insert(allSeedNews);
    if (error) {
      alert('Error importing data: ' + error.message);
    } else {
      alert('News imported successfully!');
      fetchNews();
    }
  }

  function handleEdit(p) {
    setEditingId(p.id);
    setFormData({
      title: p.title || '', slug: p.slug || '', date: p.date || '',
      location: p.location || '', year: p.year || '',
      hero_image: p.hero_image || '', object_position: p.object_position || '',
      content: p.content || []
    });
  }

  function handleAddNew() {
    setEditingId('new');
    setFormData({
      title: '', slug: '', date: '', location: '', year: '', 
      hero_image: '', object_position: '', content: []
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
      const { error } = await supabase.from('news').insert([pData]);
      if (error) alert('Error: ' + error.message);
      else { alert('News article created!'); setEditingId(null); fetchNews(); }
    } else {
      const { error } = await supabase.from('news').update(pData).eq('id', editingId);
      if (error) alert('Error: ' + error.message);
      else { alert('News article updated!'); fetchNews(); }
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (confirm('Delete this article permanently?')) {
      await supabase.from('news').delete().eq('id', id);
      if (editingId === id) setEditingId(null);
      fetchNews();
    }
  }

  // --- UPLOAD HANDLERS ---
  async function handleHeroUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `news_hero_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_images').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_images').getPublicUrl(fileName);
    setFormData({ ...formData, hero_image: data.publicUrl });
  }

  async function handleContentImageUpload(e, index) {
    const file = e.target.files[0];
    if (!file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `news_inline_${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from('project_images').upload(fileName, file);
    if (error) return alert('Upload failed');
    const { data } = supabase.storage.from('project_images').getPublicUrl(fileName);
    
    const newContent = [...formData.content];
    newContent[index].value = data.publicUrl;
    setFormData({ ...formData, content: newContent });
  }

  // --- CONTENT BUILDER METHODS ---
  function moveContentBlock(index, dir) {
    const arr = [...formData.content];
    if (dir === 'up' && index > 0) {
      [arr[index-1], arr[index]] = [arr[index], arr[index-1]];
    } else if (dir === 'down' && index < arr.length - 1) {
      [arr[index+1], arr[index]] = [arr[index], arr[index+1]];
    }
    setFormData({ ...formData, content: arr });
  }

  function removeContentBlock(index) {
    const arr = [...formData.content];
    arr.splice(index, 1);
    setFormData({ ...formData, content: arr });
  }

  function addContentBlock(type) {
    setFormData({ ...formData, content: [...formData.content, { type, value: '' }] });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700' }}>News Manager</h1>
          <p style={{ color: '#57564F' }}>Manage updates, announcements, and press coverage.</p>
        </div>
        {news.length === 0 && (
          <button onClick={seedData} style={{ background: '#e0e0e0', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', border: 'none' }}>
            Import Existing News Data
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
              {news.map(p => (
                <div key={p.id} onClick={() => handleEdit(p)} style={{ padding: '12px', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: editingId === p.id ? '#f0fdfc' : 'transparent', borderColor: editingId === p.id ? '#45A8A1' : '#eee' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{p.title}</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{p.location} - {p.year}</div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} style={{ marginTop: '8px', padding: '4px 8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        {editingId ? (
          <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>{editingId === 'new' ? 'New News Article' : 'Edit Article'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* BASIC INFO */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>BASIC INFO</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Title</label><input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>URL Slug (e.g., award-win-2026)</label><input required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Location (e.g., Pune, Maharashtra)</label><input value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Year (e.g., 2024)</label><input value={formData.year} onChange={e=>setFormData({...formData, year: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                  <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>Full Date / Subtitle (Optional)</label><input value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
                </div>
              </div>

              {/* HERO IMAGE */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>HERO IMAGE (Grid Thumbnail & Top of Article)</h3>
                <div style={{ marginBottom: '16px', background: '#fafafa', padding: '16px', borderRadius: '8px' }}>
                  {formData.hero_image && <img src={formData.hero_image} alt="Hero" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
                  <input type="file" accept="image/*" onChange={handleHeroUpload} />
                </div>
                <div><label style={{display:'block', fontSize:'12px', marginBottom:'4px'}}>CSS Object Position (e.g., "left center" - Optional, for fine-tuning crop)</label><input value={formData.object_position} onChange={e=>setFormData({...formData, object_position: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}} /></div>
              </div>

              {/* ARTICLE BUILDER */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#888', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>ARTICLE BUILDER</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>Build the article by stacking text paragraphs and images.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.content.map((block, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #eee' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#999', marginBottom: '8px', textTransform: 'uppercase' }}>{block.type} BLOCK</div>
                        {block.type === 'text' ? (
                          <textarea 
                            value={block.value} 
                            onChange={e => {
                              const newContent = [...formData.content];
                              newContent[idx].value = e.target.value;
                              setFormData({ ...formData, content: newContent });
                            }}
                            style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                          />
                        ) : (
                          <div>
                            {block.value && <img src={block.value} alt={`Inline ${idx}`} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }} />}
                            <input type="file" accept="image/*" onChange={(e) => handleContentImageUpload(e, idx)} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button type="button" onClick={() => moveContentBlock(idx, 'up')} disabled={idx === 0}>↑</button>
                        <button type="button" onClick={() => moveContentBlock(idx, 'down')} disabled={idx === formData.content.length - 1}>↓</button>
                        <button type="button" onClick={() => removeContentBlock(idx)} style={{ color: 'red' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={() => addContentBlock('text')} style={{ padding: '8px 16px', borderRadius: '6px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}>
                    + Add Text Block
                  </button>
                  <button type="button" onClick={() => addContentBlock('image')} style={{ padding: '8px 16px', borderRadius: '6px', background: '#e0e0e0', border: 'none', cursor: 'pointer' }}>
                    + Add Image Block
                  </button>
                </div>
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
