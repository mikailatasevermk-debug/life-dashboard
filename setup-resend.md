# 📧 Resend Email Setup - Quick Guide (2 minutes)

## Step 1: Sign up for Resend (Free)
1. Go to https://resend.com/signup
2. Create your free account (100 emails/day free tier)
3. Verify your email

## Step 2: Get Your API Key
1. After logging in, go to: https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: "Life Dashboard Production"
4. Copy the API key (starts with `re_`)

## Step 3: Add to Vercel
Run this command and paste your API key when prompted:
```bash
npx vercel env add RESEND_API_KEY production
```

When asked for the value, paste your Resend API key (e.g., `re_123abc...`)

## Step 4: (Optional) Custom Domain Email
If you want to send from your own domain instead of `onboarding@resend.dev`:

1. Go to https://resend.com/domains
2. Add your domain and verify it
3. Then add to Vercel:
```bash
npx vercel env add EMAIL_FROM production
```
Enter: `Life Dashboard <noreply@yourdomain.com>`

## Step 5: Redeploy
```bash
npx vercel --prod
```

## That's it! 🎉

Your emails will now be sent through Resend automatically.

## Test Your Setup

After deploying, test it:
1. Go to https://life-dashboard-five.vercel.app/auth/forgot-password
2. Enter your email
3. Check your inbox - you should receive the email!

## Troubleshooting

If emails aren't sending:
1. Check Resend dashboard for logs: https://resend.com/emails
2. Make sure your API key is correct in Vercel
3. Check the Vercel function logs for errors

## Benefits of Resend
- ✅ No complex SMTP setup
- ✅ Beautiful email dashboard
- ✅ Email analytics
- ✅ Reliable delivery
- ✅ Free tier (100 emails/day)
- ✅ Great developer experience