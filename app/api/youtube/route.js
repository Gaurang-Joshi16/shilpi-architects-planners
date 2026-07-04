import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ success: false, error: 'No video ID provided' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await res.text();
    
    // Extract title
    let title = 'Unknown Title';
    const titleRegexes = [
      /<title>(.*?) - YouTube<\/title>/,
      /<meta name="title" content="(.*?)">/,
      /"title":"(.*?)"/
    ];
    for (const regex of titleRegexes) {
      const match = html.match(regex);
      if (match && match[1]) {
        title = match[1];
        break;
      }
    }
    
    // Decode HTML entities in title
    title = title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

    // Extract duration
    let durationStr = '00:00';
    
    // Method 1: lengthSeconds in JSON
    const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
    // Method 2: meta itemprop
    const metaDurationMatch = html.match(/<meta itemprop="duration" content="PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"/);
    
    if (lengthMatch && lengthMatch[1]) {
      const totalSeconds = parseInt(lengthMatch[1], 10);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      if (h > 0) {
        durationStr = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      } else {
        durationStr = `${m}:${s.toString().padStart(2, '0')}`;
      }
    } else if (metaDurationMatch) {
      const h = parseInt(metaDurationMatch[1] || '0', 10);
      const m = parseInt(metaDurationMatch[2] || '0', 10);
      const s = parseInt(metaDurationMatch[3] || '0', 10);
      if (h > 0) {
        durationStr = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      } else {
        durationStr = `${m}:${s.toString().padStart(2, '0')}`;
      }
    }
    
    return NextResponse.json({ success: true, title, duration: durationStr });
  } catch (error) {
    console.error('Error fetching YouTube info:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
