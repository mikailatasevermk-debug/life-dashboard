# 🚀 Life Dashboard Setup Commands

Run these commands **IN ORDER** after setting up your database:

## 1. Update Database URL
First, update the `DATABASE_URL` in your `.env` file with your actual database connection string.

## 2. Generate Prisma Client & Push Schema
```bash
cd C:\Users\mikai\life-dashboard
npx prisma generate
npx prisma db push
```

## 3. Seed Initial Data
```bash
node setup.js
```

## 4. Start Development Server
```bash
npm run dev
```

## 5. Open Your Life Dashboard
Visit: http://localhost:3000

---

## 🔧 If You Get Errors:

### Database Connection Error:
- Make sure your `DATABASE_URL` is correct in `.env`
- Test your database connection

### Missing Dependencies:
```bash
npm install
```

### Prisma Issues:
```bash
npx prisma generate --force
npx prisma db push --force-reset
```

---

## 🆘 Need Help?

1. **Supabase Setup**: https://supabase.com/docs/guides/database
2. **Neon Setup**: https://neon.tech/docs/get-started-with-neon/signing-up
3. **Local PostgreSQL**: https://www.postgresql.org/download/