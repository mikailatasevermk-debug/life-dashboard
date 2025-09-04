# Supabase Database Setup Guide

## 1. Get Your Supabase Credentials

After creating your project, you'll need:

1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) → **API**
3. Copy these values:
   - **Project URL**: `https://[PROJECT_ID].supabase.co`
   - **Anon Key**: (public key for client-side)
   - **Service Role Key**: (keep secret!)

4. Click **Settings** → **Database**
5. Copy the **Connection string** → **URI**:
   - It looks like: `postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

## 2. Environment Variables Needed

Create `.env.local` with:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# For direct connection (migrations)
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase API (optional for future features)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# NextAuth
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="generate-random-string-here"

# Turn off demo mode
DEMO_MODE=false
NEXT_PUBLIC_DEMO_MODE=false
```

## 3. Commands to Run

After setting up environment variables:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Test connection
node test-connection.js

# 4. Optional: View database in browser
npx prisma studio
```

## 4. Run SQL in Supabase

Go to Supabase SQL Editor and run the provided `create-tables.sql` file to set up initial data.

## 5. For Production (Vercel)

Add these environment variables to Vercel:
- All the above variables
- Use pooler connection for DATABASE_URL
- Generate new NEXTAUTH_SECRET for production