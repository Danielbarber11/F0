# F0

Updated README: Added instructions for connecting Supabase and deploying to Vercel.

## Setup local
1. Copy .env.example to .env and set the values:
   - VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   - VITE_SUPABASE_ANON_KEY=your-anon-key

2. Install dependencies:
   npm install

3. Run locally:
   npm run dev

## Supabase setup
1. Create a project at https://app.supabase.com.
2. In the Project Settings -> API copy the Project URL and anon key.
3. In the SQL editor, run the SQL in `db/init.sql` to create tables.
4. Create a Storage bucket (e.g. `uploads`) for file uploads.
5. Enable RLS for tables and add policies so users can only access their own rows.

## Deployment (Vercel recommended)
1. Connect your GitHub account and import this repo into Vercel.
2. In Project Settings -> Environment Variables, add:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. Build Command: `npm run build`
4. Output Directory: `dist`

## Security note
Do NOT commit real keys into the repo. If you shared any API keys publicly, please rotate/regenerate them immediately.
