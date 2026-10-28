# Vibespot — Kakinada Food Discovery Platform

**Vibespot** is a modern, mobile-first food discovery web platform designed to help students, young professionals, and families discover restaurants, cafés, tiffin centers, and street food spots in **Kakinada, Andhra Pradesh**.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Firebase Authentication**, and **Supabase PostgreSQL**.

---

## ✨ Features

- **Dynamic Dataset Discovery**: 54 verified places across Kakinada loaded directly from Supabase (with automatic local offline fallback).
- **Dynamic Category Filtering**: Dynamically populated categories (`Street Food & Quick Bites`, `Restaurants & Family Dining`, `Tiffin & Breakfast`, `Cafés`, `Tea, Coffee & Juice`, `Bakeries, Sweets, Desserts & Ice Cream`) with smooth horizontal scrolling.
- **Dynamic Tag Filtering (All Dataset Tags)**: All unique tags extracted directly from the places data (including `Student-Friendly`, `Budget-Friendly`, `Pure Vegetarian`, `Non-Veg Options`, `Café & Hangout`, etc.) with selectable chips and configurable **OR / AND** logic.
- **Price-for-Two Range Slider**: Interactive range slider and quick-budget presets (Under ₹400, Under ₹750, Under ₹1,200) with clear Indian Rupee formatting (`₹XXX`). Unknown prices are handled gracefully.
- **Current-Location Distance Sorting (Haversine Formula)**: One-click GPS location detection calculates straight-line distance to each restaurant in kilometers (`0.8 km away`) and sorts from nearest to farthest.
- **Restaurant Cards & Tasteful Category Placeholders**: Clean mobile-first cards with permitted photo support, category-themed gradient visual badges with icons, genuine rating averages, and distance tags.
- **Rich Place Detail Pages (`/place/[id]`)**: Full address, category, approximate price for two, all tags, GPS coordinates (`lat/lon`), interactive map embed, "Open in Google Maps" navigation action, and community ratings.
- **Ratings System**: Authenticated users can rate spots on **Food Quality**, **Ambience**, and **Value for Money** (1–5 stars) and update existing ratings.
- **Secure Server-side Ratings API (`/api/ratings`)**: Verifies Firebase ID tokens server-side with Firebase Admin, securely derives user UID, and performs atomic upserts via Supabase.
- **Responsive Layout**: Designed intentionally for smartphones, tablets, and desktop displays with smooth navigation.

---

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Server & Client Components) |
| **Language** | TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Authentication** | Firebase Authentication (Email/Password & Google Sign-In) |
| **Database** | Supabase (PostgreSQL with Row Level Security & Summary Views) |
| **Server Operations** | Firebase Admin SDK + Supabase Server Client |
| **Deployment** | Vercel |

---

## 🚀 Getting Started Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Supabase credentials (see the guide below).

> **Note:** Even without API keys configured, Vibespot runs out of the box with bundled fallback data for all 54 Kakinada places!

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## ☁️ Cloud Setup & Configuration

### A. Firebase Authentication Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.
2. In the left sidebar, navigate to **Build** → **Authentication** → **Sign-in method**.
3. Enable **Email/Password** and **Google**.
4. In **Settings** → **Authorized domains**, ensure `localhost` is listed, and add your Vercel deployment domain (e.g. `your-app.vercel.app`).
5. In **Project settings** (gear icon) → **General** → **Your apps** → Web app, copy the Firebase client config into `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
   ```
6. In **Project settings** → **Service accounts**, click **Generate new private key**. Download the JSON and copy the admin credentials:
   ```env
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n"
   ```

### B. Supabase Database Setup

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left sidebar, open the **SQL Editor**.
3. Run the schema script located at `supabase/schema.sql`. This creates:
   - `places` table with Row Level Security (`public read published places`).
   - `place_ratings` table (`place_id`, `firebase_uid`, `price_rating`, `ambience_rating`, `food_quality_rating`).
   - `place_rating_summary` view computing averages and review counts.
4. If your `places` table is empty, run `supabase/seed.sql` to populate the 54 Kakinada places.
5. In **Project Settings** → **API**, copy your API keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

---

## 🌐 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete vibespot food discovery platform"
   git push origin main
   ```
2. Import the repository in [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add the variables from `.env.example`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (wrap with double quotes to preserve newlines)
4. Click **Deploy**.

---

## 🔒 Security & Data Integrity

- **Server-Side Token Verification**: The `/api/ratings` route strictly validates Firebase ID tokens via the Firebase Admin SDK. The client UID is never trusted directly from the client body.
- **Row Level Security**: Read queries to `places` and `place_rating_summary` operate under Supabase RLS policies (`is_published = true`).
- **No Secret Leaks**: Service role keys and Firebase Admin private keys are kept strictly on the server and are never exposed via `NEXT_PUBLIC_` prefixes.
- **Authorized Imagery Only**: No scraped Google Maps photographs are republished; places without uploaded images use curated category placeholder badges.
- **Haversine Distance**: All distance indications explicitly represent straight-line geographical distance calculated from verified coordinates.
