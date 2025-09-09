let Canvas, cron; try { Canvas = require('canvas'); cron = require('node-cron'); } catch {}
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

function supabaseFromEnv() {
  const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null; return createClient(url, key);
}

async function generateWeeklyCollage() {
  try {
    if (!Canvas) return null;
    const supabase = supabaseFromEnv(); if (!supabase) return null;
    const since = new Date(Date.now() - 7*24*60*60*1000).toISOString();
    const { data: stories } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event', 'pet_found')
      .gte('created_at', since)
      .limit(9);
    const list = stories || [];
    const canvas = Canvas.createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0B1220'; ctx.fillRect(0,0,1080,1080);
    for (let i = 0; i < Math.min(9, list.length); i++) {
      const row = Math.floor(i/3), col = i%3; const x = col*360, y = row*360;
      const src = list[i]?.properties?.photo; if (!src) continue;
      const img = await Canvas.loadImage(src).catch(() => null); if (!img) continue;
      ctx.drawImage(img, x, y, 360, 360);
      ctx.fillStyle = 'rgba(16,185,129,0.9)'; ctx.fillRect(x, y+300, 360, 60);
      ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 28px Arial'; ctx.textAlign='center';
      ctx.fillText('BULUNDU! 🎉', x+180, y+340);
    }
    ctx.fillStyle = '#00A7A7'; ctx.fillRect(0,1020,1080,60);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 32px Arial'; ctx.textAlign='left';
    ctx.fillText(`Bu hafta ${list.length} evcil hayvan evine döndü!`, 50, 1055);
    return canvas.toBuffer('image/png');
  } catch (e) { console.error('ugc collage error', e); return null; }
}

function scheduleWeeklySocialPosting() {
  try {
    if (!cron) return;
    cron.schedule('0 18 * * 0', async () => {
      const buf = await generateWeeklyCollage();
      if (!buf || !process.env.N8N_SOCIAL_WEBHOOK) return;
      await fetch(process.env.N8N_SOCIAL_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: buf.toString('base64'), caption: '#PawGuardSuccess #KayıpHayvan' }) });
    });
  } catch {}
}

module.exports = { generateWeeklyCollage, scheduleWeeklySocialPosting };

