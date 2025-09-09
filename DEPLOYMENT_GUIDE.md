# 🚀 PawGuard Deployment Guide - GitHub to Rork Integration

## Current Status
✅ Git repository initialized with 137 files  
✅ All security components implemented  
✅ Remote configured: `https://github.com/muhhit/rork-pawguard.git`  
⚠️ **NEXT STEP**: Push to GitHub (authentication required)

## 📋 Quick Deployment Steps

### 0: Configure Environment

Create `.env` from `.env.example` and fill required values (EAS uses EXPO_PUBLIC_* at build time).

Run `sql/schema.sql` in Supabase SQL to create tables/functions. Add RLS.

### Option 1: Personal Access Token (Recommended)

1. **Create GitHub Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Select scopes: `repo` (full repository access)
   - Copy the generated token

2. **Push with Token**:
   ```bash
   cd /Users/macbook/Downloads/rork-pawguard-security/rork-pawguard-main
   git push https://[USERNAME]:[TOKEN]@github.com/muhhit/rork-pawguard.git main
   ```

### Option 2: Manual Upload (Alternative)

1. **Use the ZIP file**: `pawguard-security-complete.zip`
2. **GitHub Web Upload**:
   - Go to: https://github.com/muhhit/rork-pawguard
   - Drag and drop the ZIP contents
   - Commit with message: "Add PawGuard security system with trust verification"

## 🔧 Rork Platform Integration

Once on GitHub, connect to Rork:

1. **Rork Dashboard**: Connect GitHub repository
2. **Environment Variables**: Configure from `.env.example`
3. **Build Settings**: 
   - Framework: React Native (Expo)
   - Node version: 18+
   - Build command: `expo build`

4. **Env Variables**: Add `EXPO_PUBLIC_*` values from `.env` to Rork build settings.

### Optional: Payments Backend (Local/Cloud)

1. `cd assets/pawguard-mvp/server && npm i`
2. Env: `PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE, STRIPE_SECRET_KEY (ops.)`
3. `npm run dev` → API base: `http://localhost:4000`
4. Mobil `.env`: `EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP>:4000`

### Optional: Brandify AI (Gemini)

Add to server env:

```
GOOGLE_GENAI_API_KEY=your_google_ai_studio_key
```

The Brandify endpoint `/render/brandify` will use Gemini 2.5 Flash Image to produce brand-ready images when this key is set. Otherwise it will return mock outputs safely.

### Required Environment Variables for Rork:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
EXPO_PUBLIC_MIN_TRUST_SCORE=40
EXPO_PUBLIC_ENABLE_VERIFICATION=true
EXPO_PUBLIC_ANGELS_HAVEN_API=your_angels_haven_api_key
EXPO_PUBLIC_DONATION_PERCENTAGE=25
```

## 🛡️ Security Features Implemented

✅ **Pet Verification System** - AI-powered ownership verification  
✅ **Privacy Protection** - 4-tier location privacy for street animals  
✅ **Trust Score System** - Comprehensive user verification (0-100 points)  
✅ **Street Animal Feeding** - Gamified care system with XP rewards  

## 📊 Database Setup Required

Run `sql/schema.sql` in Supabase to set up all tables, functions, and indexes. Example excerpts:

```sql
-- Users table updates
ALTER TABLE users ADD COLUMN trust_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN id_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN verification_level VARCHAR(20) DEFAULT 'unverified';

-- Pets table updates  
ALTER TABLE pets ADD COLUMN trust_level VARCHAR(20) DEFAULT 'community';
ALTER TABLE pets ADD COLUMN privacy_level VARCHAR(20) DEFAULT 'community';
ALTER TABLE pets ADD COLUMN verification_score INTEGER DEFAULT 0;

-- New verification table
CREATE TABLE pet_verification_attempts (
  id UUID PRIMARY KEY,
  pet_id UUID REFERENCES pets(id),
  user_id UUID REFERENCES users(id),
  verification_score INTEGER,
  steps_completed JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  approved BOOLEAN DEFAULT false
);

-- Security monitoring table
CREATE TABLE suspicious_activities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50),
  description TEXT,
  severity VARCHAR(10),
  auto_detected BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feeding tracking table
CREATE TABLE feeding_records (
  id UUID PRIMARY KEY,
  animal_id UUID REFERENCES pets(id),
  user_id UUID REFERENCES users(id),
  food_type VARCHAR(100),
  quantity VARCHAR(20),
  photos TEXT[],
  health_notes TEXT,
  location POINT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Next Steps After Deployment

1. **Test Authentication**: Verify Supabase connection
2. **Test Security Systems**: Try pet verification flow
3. **Test Map Privacy**: Confirm location blurring works
4. **Test Trust Scores**: Verify point calculations
5. **Monitor Performance**: Check app responsiveness

## 🚨 Critical Security Reminders

- **NEVER** commit `.env` files to repository
- **ALWAYS** use `protected` privacy level for street animals by default
- **VERIFY** trust score calculations are working correctly
- **MONITOR** for suspicious verification attempts
- **ENCRYPT** all sensitive user data in database

---

**🎉 Ready for Rork deployment!** The security system will protect both pets and users while providing a gamified experience for community animal care.
