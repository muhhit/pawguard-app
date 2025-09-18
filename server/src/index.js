import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Import AutopilotSystem
import { createRequire } from 'module';
let collageWorker = null; try { collageWorker = require('../workers/ugc-collage'); } catch {}
let pdfGen = null; try { pdfGen = require('./pdf'); } catch {}
const require = createRequire(import.meta.url);
const AutopilotSystem = require('../../scripts/autopilot-system.js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const supabase = (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE)
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE)
  : null;

// Initialize Autopilot System
const autopilot = new AutopilotSystem();

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Autopilot endpoint
app.post('/autopilot', async (req, res) => {
  try {
    const { enabled, mode = 'safe', periodMs = 600000, concurrency = 2, maxTasks = 6 } = req.body || {};
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'enabled parameter required' });
    }
    
    const config = autopilot.updateConfig({
      enabled,
      mode,
      periodMs,
      concurrency,
      maxTasks
    });
    
    const status = autopilot.getStatus();
    
    console.log(`🤖 [AUTOPILOT] ${enabled ? 'Enabled' : 'Disabled'} - Mode: ${mode}`);
    
    res.json({
      success: true,
      status,
      message: `Autopilot ${enabled ? 'enabled' : 'disabled'} in ${mode} mode`
    });
  } catch (error) {
    console.error('Autopilot error:', error);
    res.status(500).json({ error: 'autopilot_failed', details: error.message });
  }
});

// Agents status endpoint
app.get('/agents', async (req, res) => {
  try {
    const specTasksDir = path.join(process.cwd(), 'spec_tasks');
    const agents = [];
    
    if (!fs.existsSync(specTasksDir)) {
      return res.json({ agents: [], total: 0, active: 0, completed: 0 });
    }
    
    const taskDirs = fs.readdirSync(specTasksDir)
      .filter(dir => dir.startsWith('T') && dir.includes(':'))
      .sort();
    
    let activeCount = 0;
    let completedCount = 0;
    
    for (const taskDir of taskDirs) {
      const taskPath = path.join(specTasksDir, taskDir);
      const statusPath = path.join(taskPath, 'status.json');
      const planPath = path.join(taskPath, 'plan.json');
      
      let status = { state: 'unknown' };
      let plan = {};
      
      if (fs.existsSync(statusPath)) {
        try {
          status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        } catch (e) {
          console.error(`Error reading status for ${taskDir}:`, e);
        }
      }
      
      if (fs.existsSync(planPath)) {
        try {
          plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
        } catch (e) {
          console.error(`Error reading plan for ${taskDir}:`, e);
        }
      }
      
      const agent = {
        id: taskDir,
        name: taskDir.split(':_')[1] || taskDir,
        status: status.state,
        model: plan.model || 'unknown',
        provider: plan.provider || 'unknown',
        complexity: plan.complexity || 1,
        unicornPotential: plan.unicornPotential || 1,
        lastUpdate: status.lastUpdate || 'unknown',
        notes: status.notes || ''
      };
      
      agents.push(agent);
      
      if (status.state === 'completed') {
        completedCount++;
      } else if (status.state === 'running' || status.state === 'in_progress') {
        activeCount++;
      }
    }
    
    const autopilotStatus = autopilot.getStatus();
    
    res.json({
      agents,
      total: agents.length,
      active: activeCount,
      completed: completedCount,
      autopilot: autopilotStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agents status error:', error);
    res.status(500).json({ error: 'agents_status_failed', details: error.message });
  }
});

// Brandify (Premium) mock endpoint
app.post('/render/brandify', async (req, res) => {
  try {
    const { petPhotoUrl, template = 'pawfora' } = req.body || {};
    if (!petPhotoUrl) return res.status(400).json({ error: 'petPhotoUrl required' });

    const genaiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!genaiKey) {
      // Safe mock
      return res.json({ success: true, template, assets: { front: petPhotoUrl, left15: petPhotoUrl, right15: petPhotoUrl } });
    }

    // Fetch pet image as base64
    const petBase64 = await urlToBase64(petPhotoUrl);

    const basePrompt = (angle) => (
      `Use the pet_photo (inline) as the subject. Preserve breed and markings.
Apply PawFora brand style: primary #00A7A7, dark #1E1E1E, flat, rounded frame, soft rim-light on subject, shallow DOF, glossy pedestal.
Compose a hero card view ${angle}. No text distortions. Output PNG.`
    );

    const views = ['front', '15° left', '15° right'];
    const assets = {};
    for (const v of views) {
      const b64 = await generateGeminiImage(genaiKey, basePrompt(v), [{ mime_type: 'image/jpeg', data: petBase64 }]);
      if (b64) {
        if (supabase && process.env.SUPABASE_SERVICE_ROLE && process.env.SUPABASE_URL) {
          const url = await uploadBase64ToStorage(b64, `brandify/${Date.now()}-${v.replace(/\s/g,'')}.png`);
          assets[mapViewKey(v)] = url || `data:image/png;base64,${b64}`;
        } else {
          assets[mapViewKey(v)] = `data:image/png;base64,${b64}`;
        }
      }
    }
    return res.json({ success: true, template, assets });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'brandify_failed' });
  }
});

// Simple in-memory rate limit to protect endpoints
const rateMap = new Map();
function rateLimited(req, limitPerMin = 30) {
  const key = req.ip + req.path;
  const now = Date.now();
  const windowMs = 60000;
  const arr = rateMap.get(key)?.filter(t => now - t < windowMs) || [];
  arr.push(now);
  rateMap.set(key, arr);
  return arr.length > limitPerMin;
}

// Parallax (Standard) endpoint - Lightweight 2.5D effect
app.post('/render/parallax', async (req, res) => {
  try {
    const { petPhotoUrl, depth = 'medium' } = req.body || {};
    if (!petPhotoUrl) return res.status(400).json({ error: 'petPhotoUrl required' });
    
    // Generate parallax layers with different depths
    const layers = {
      background: { url: petPhotoUrl, depth: 0.1, blur: 2 },
      midground: { url: petPhotoUrl, depth: 0.5, blur: 1 },
      foreground: { url: petPhotoUrl, depth: 1.0, blur: 0 }
    };
    
    // Depth settings
    const depthSettings = {
      light: { maxOffset: 5, layers: 2 },
      medium: { maxOffset: 10, layers: 3 },
      heavy: { maxOffset: 15, layers: 4 }
    };
    
    const settings = depthSettings[depth] || depthSettings.medium;
    
    return res.json({ 
      success: true, 
      asset: petPhotoUrl,
      parallax: {
        layers,
        settings,
        type: '2.5D',
        implementation: 'client-side'
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'parallax_failed' });
  }
});

// Iyzico init (placeholder)
app.post('/payments/iyzico/init', async (req, res) => {
  try {
    const { amount, sellerId, claimId, petName } = req.body || {};
    if (!amount || !claimId) return res.status(400).json({ success: false, error: 'missing params' });
    // TODO: Integrate with Iyzipay SDK
    const token = `mock_${Date.now()}`;
    return res.json({ success: true, token, paymentPageUrl: `https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/1/token/${token}` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'init_failed' });
  }
});

// Iyzico webhook (placeholder)
app.post('/payments/iyzico/webhook', async (req, res) => {
  try {
    const event = req.body;
    // Verify signature here
    const claimId = event?.data?.claimId;
    const paymentId = event?.data?.paymentId;
    if (supabase && claimId && paymentId) {
      await supabase.from('reward_claims').update({ status: 'paid', payment_id: paymentId, payment_method: 'iyzico', updated_at: new Date().toISOString() }).eq('id', claimId);
    }
    return res.json({ received: true });
  } catch (e) {
    console.error(e);
    return res.status(400).send('webhook_error');
  }
});

// Stripe init (placeholder)
app.post('/payments/stripe/init', async (req, res) => {
  try {
    if (!stripe) return res.status(400).json({ success: false, error: 'stripe_disabled' });
    const { amount, currency = 'GBP', claimId } = req.body || {};
    const pi = await stripe.paymentIntents.create({ amount: Math.round(Number(amount) * 100), currency });
    res.json({ success: true, clientSecret: pi.client_secret, id: pi.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: 'stripe_init_failed' });
  }
});

// Stripe webhook (placeholder)
app.post('/payments/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // TODO: verify signature
    const event = JSON.parse(req.body.toString());
    if (event.type === 'payment_intent.succeeded') {
      const claimId = event?.data?.object?.metadata?.claimId;
      const paymentId = event?.data?.object?.id;
      if (supabase && claimId) {
        await supabase.from('reward_claims').update({ status: 'paid', payment_id: paymentId, payment_method: 'stripe', updated_at: new Date().toISOString() }).eq('id', claimId);
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error(e);
    res.status(400).send('webhook_error');
  }
});

// Simple QR Poster (SVG) generator
app.post('/poster/generate', async (req, res) => {
  if (rateLimited(req, 60)) return res.status(429).json({ error: 'rate_limited' });
  const { petName = 'Pet', reward = 0, link = 'pawguard://pet/unknown' } = req.body || {};
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(link)}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="1024" height="1448" viewBox="0 0 1024 1448" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1448" fill="#0B1220"/>
    <text x="512" y="140" font-family="Arial" font-size="56" fill="#6EE7B7" text-anchor="middle">PAWGUARD ALERT</text>
    <text x="512" y="220" font-family="Arial" font-size="44" fill="#FFFFFF" text-anchor="middle">${escapeXml(petName)}</text>
    <text x="512" y="280" font-family="Arial" font-size="36" fill="#0EA5E9" text-anchor="middle">Ödül: ₺${reward}</text>
    <image href="${qrSrc}" x="352" y="360" width="320" height="320"/>
    <text x="512" y="720" font-family="Arial" font-size="28" fill="#FFFFFF" text-anchor="middle">Tara veya Aç</text>
    <text x="512" y="760" font-family="Arial" font-size="24" fill="#6EE7B7" text-anchor="middle">${escapeXml(link)}</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// UGC Collage (SVG) generator
app.post('/ugc/collage', async (req, res) => {
  if (rateLimited(req, 60)) return res.status(429).json({ error: 'rate_limited' });
  const { images = [] } = req.body || {};
  const tile = 320; const cols = 2; const rows = Math.ceil(Math.min(images.length, 4)/cols);
  let content = '';
  images.slice(0,4).forEach((url, i) => {
    const x = (i % cols) * (tile + 20) + 20; const y = Math.floor(i / cols) * (tile + 20) + 20;
    content += `<image href="${url}" x="${x}" y="${y}" width="${tile}" height="${tile}" preserveAspectRatio="xMidYMid slice"/>`;
  });
  const width = cols * (tile + 20) + 20; const height = rows * (tile + 20) + 20 + 80;
  const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
  <svg width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\" xmlns=\"http://www.w3.org/2000/svg\">
    <rect width=\"${width}\" height=\"${height}\" fill=\"#0B1220\"/>
    ${content}
    <text x=\"${width/2}\" y=\"${height-30}\" font-family=\"Arial\" font-size=\"20\" fill=\"#6EE7B7\" text-anchor=\"middle\">PawGuard - Birlikte Daha Güçlüyüz</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Payments backend listening on :${port}`));

// Helpers
function mapViewKey(v) {
  const k = v.toLowerCase();
  if (k.includes('front')) return 'front';
  if (k.includes('left')) return 'left15';
  if (k.includes('right')) return 'right15';
  return 'front';
}

async function urlToBase64(url) {
  const r = await fetch(url);
  const buf = await r.arrayBuffer();
  return Buffer.from(buf).toString('base64');
}

async function generateGeminiImage(apiKey, prompt, inlineImages) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...inlineImages.map(img => ({ inline_data: img }))
          ]
        }
      ],
      generationConfig: { responseMimeType: 'image/png' }
    };
    const resp = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) throw new Error(`Gemini error: ${resp.status}`);
    const json = await resp.json();
    const data = json?.candidates?.[0]?.content?.parts?.find(p => p.inline_data?.data)?.inline_data?.data;
    return data || null;
  } catch (e) {
    console.error('Gemini generate error', e);
    return null;
  }
}

async function uploadBase64ToStorage(base64, pathKey) {
  try {
    if (!supabase) return null;
    const bin = Buffer.from(base64, 'base64');
    const { data, error } = await supabase.storage.from('brandify').upload(pathKey, bin, { contentType: 'image/png', upsert: true });
    if (error) { console.error('upload error', error); return null; }
    const pub = supabase.storage.from('brandify').getPublicUrl(data.path);
    return pub?.data?.publicUrl || null;
  } catch (e) {
    console.error('storage upload error', e);
    return null;
  }
}

function escapeXml(s='') {
  return String(s).replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

// Schedule worker if available
try { collageWorker?.scheduleWeeklySocialPosting?.(); } catch {}
// PDF Poster endpoint (uses optional deps)
app.post('/poster/generate-pdf', async (req, res) => {
  if (rateLimited(req, 30)) return res.status(429).json({ error: 'rate_limited' });
  try {
    if (!pdfGen?.generatePosterPDF) return res.status(501).json({ error: 'pdf_not_enabled' });
    const arr = pdfGen.generatePosterPDF({ petName: req.body?.petName, link: req.body?.link, reward: req.body?.reward });
    res.setHeader('Content-Type', 'application/pdf');
    return res.send(Buffer.from(arr));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'poster_pdf_failed' });
  }
});
