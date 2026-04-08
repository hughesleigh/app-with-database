# Personal Link Dashboard (Astro + HTMX + Alpine + SQLite)

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:4321`.

The SQLite database is created automatically at `data/dashboard.db`.

## Why SQLite instead of Supabase for local use?

You can use Supabase, but for a local new-tab dashboard SQLite is usually better:
- no extra service to run
- no account/project setup
- starts instantly and works fully offline

So you **do not need to download anything else** beyond Node dependencies; the app initializes SQLite itself.
