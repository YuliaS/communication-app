# 🎯 30-Day Communication Trainer

A Progressive Web App (PWA) to master confident, eloquent speaking in 15 minutes a day.

## Features

- 📅 **30-day structured curriculum** covering voice, structure, presence, and mastery
- 🔊 **Audio playback** for all practice scripts
- ⏱️ **Built-in timers** for exercises
- 📱 **PWA support** - install on iPhone/Android like a native app
- ☁️ **Cloud sync** (optional) - save progress across devices with Supabase
- 💾 **Offline support** - works without internet

---

## 🚀 Quick Start (Local Development)

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📱 Deploy as PWA (Free)

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

### Option 2: Netlify

```bash
# Build the app
npm run build

# Deploy dist folder to Netlify
npx netlify deploy --prod --dir=dist
```

### Option 3: Cloudflare Pages

1. Push to GitHub
2. Connect repo at [pages.cloudflare.com](https://pages.cloudflare.com)
3. Build command: `npm run build`
4. Output directory: `dist`

---

## 📲 Install on iPhone

1. Open your deployed URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

Done! The app icon appears on your home screen.

---

## ☁️ Add Cloud Sync (Optional)

The app works offline with localStorage. To sync across devices, add Supabase:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run this:

```sql
-- Create progress table
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  completed_days integer[] default '{}',
  current_day integer default 1,
  streak integer default 0,
  last_completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table user_progress enable row level security;

-- Users can only access their own data
create policy "Users can view own progress" 
  on user_progress for select 
  using (auth.uid() = user_id);

create policy "Users can insert own progress" 
  on user_progress for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own progress" 
  on user_progress for update 
  using (auth.uid() = user_id);
```

### 2. Configure Authentication

1. Go to **Authentication > Providers**
2. Enable **Email** (Magic Link is enabled by default)
3. Optional: Enable Apple, Google, etc.

### 3. Add Environment Variables

1. Go to **Settings > API** in Supabase
2. Copy your URL and anon key
3. Create `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

4. Add these to your hosting platform (Vercel/Netlify/Cloudflare)

---

## 🗂️ Project Structure

```
communication-app/
├── public/              # Static assets (icons for PWA)
├── src/
│   ├── components/      # React components
│   │   ├── AuthModal.jsx
│   │   ├── ScriptPlayer.jsx
│   │   └── Timer.jsx
│   ├── data/
│   │   └── program.js   # 30-day curriculum
│   ├── hooks/
│   │   └── useProgress.js  # Progress state + Supabase sync
│   ├── lib/
│   │   └── supabase.js  # Supabase client
│   ├── App.jsx          # Main app component
│   ├── App.css          # Styles
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js       # Vite + PWA config
└── package.json
```

---

## 🎨 PWA Icons

Before deploying, add these icons to the `public/` folder:

- `pwa-192x192.png` (192×192 px)
- `pwa-512x512.png` (512×512 px)  
- `apple-touch-icon.png` (180×180 px)
- `favicon.ico`

You can generate these from a single image using [realfavicongenerator.net](https://realfavicongenerator.net).

---

## 📖 Curriculum Overview

| Week | Focus | Days |
|------|-------|------|
| 1 | **Foundation** - Voice, pace, confidence | 1-7 |
| 2 | **Structure** - Clarity, hooks, closes | 8-14 |
| 3 | **Presence** - Listening, storytelling, bridging | 15-21 |
| 4 | **Mastery** - Meetings, persuasion, executive presence | 22-30 |

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **vite-plugin-pwa** - PWA support
- **Supabase** - Auth + Database (optional)
- **Web Speech API** - Text-to-speech for practice scripts

---

## 📄 License

MIT - Feel free to use and modify for personal use.

---

## 🤝 Contributing

Suggestions and improvements welcome! Open an issue or PR.
