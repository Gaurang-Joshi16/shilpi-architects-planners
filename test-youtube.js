async function test() {
  const videoId = 'ev0YKCMommE';
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
  const html = await res.text();
  
  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/) || html.match(/<meta name="title" content="(.*?)">/);
  const title = titleMatch ? titleMatch[1] : 'Unknown Title';
  
  const durationMatch = html.match(/<meta itemprop="duration" content="PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"/);
  let durationStr = '00:00';
  if (durationMatch) {
    const h = parseInt(durationMatch[1] || '0');
    const m = parseInt(durationMatch[2] || '0');
    const s = parseInt(durationMatch[3] || '0');
    if (h > 0) {
      durationStr = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      durationStr = `${m}:${s.toString().padStart(2, '0')}`;
    }
  }
  
  console.log({ title, durationStr });
}
test();
