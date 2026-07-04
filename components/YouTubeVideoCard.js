'use client';

import { useState, useEffect } from 'react';

export default function YouTubeVideoCard({ url, tag, defaultTitle, date }) {
  const [data, setData] = useState({ title: defaultTitle || 'Loading...', duration: '--:--', id: '' });
  
  useEffect(() => {
    if (!url) return;
    
    // Extract video ID from URL
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    const videoId = match ? match[1] : '';
    
    if (videoId) {
      setData(prev => ({ ...prev, id: videoId }));
      
      // Fetch dynamic title and duration from our API route
      fetch(`/api/youtube?videoId=${videoId}`)
        .then(res => res.json())
        .then(info => {
          if (info.success) {
            setData(prev => ({ ...prev, title: info.title, duration: info.duration }));
          }
        })
        .catch(console.error);
    }
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="video-card"
      data-reveal=""
    >
      <div className="video-thumb-wrap">
        {data.id ? (
          <img
            src={`https://img.youtube.com/vi/${data.id}/maxresdefault.jpg`}
            alt={data.title}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#eee' }}></div>
        )}
        <div className="video-play-btn">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" />
            <polygon points="10,8 17,12 10,16" fill="currentColor" />
          </svg>
        </div>
        <div className="video-duration">{data.duration}</div>
      </div>
      <div className="video-meta">
        <span className="video-tag">{tag}</span>
        <h3 className="video-title">{data.title}</h3>
        <span className="video-date">{date}</span>
      </div>
    </a>
  );
}
