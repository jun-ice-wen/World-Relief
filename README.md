# Croc & Hamster's World Relief Atlas

A playful, mobile-first field journal and interactive world map where **Mr Crocodile** and **Ms Hamster** plot dated city stops, toggle between individual and consolidated views, and sync live across phones for **$0/month**.

## 100% Free Deployment Guide (GitHub Pages + Supabase)

### Step 1: Create Your Free Supabase Database
1. Sign in at [supabase.com](https://supabase.com) (free Spark/Starter tier, no credit card needed) and create a new project.
2. Open **SQL Editor** in the Supabase dashboard, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings -> API** and copy:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **anon / public key** (`VITE_SUPABASE_ANON_KEY`)

### Step 2: Deploy for Free on GitHub Pages
1. Push this project to a GitHub repository (`main` branch).
2. In your GitHub repo, go to **Settings -> Secrets and variables -> Actions** and add two **Repository secrets**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Go to **Settings -> Pages**, under **Build and deployment -> Source**, select **GitHub Actions**.
4. Every push to `main` automatically builds and publishes your app to `https://<your-username>.github.io/<your-repo>/`.

### Step 3: Install on Your Phones
- **iPhone (Safari)**: Open your GitHub Pages URL -> tap **Share** -> **Add to Home Screen**.
- **Android (Chrome)**: Open the URL -> tap the in-app **Install App** button (or browser menu -> **Install app**).
