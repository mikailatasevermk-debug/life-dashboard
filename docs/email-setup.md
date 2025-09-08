# Email Configuration Guide

## Option 1: Gmail SMTP Setup (Recommended for Quick Start)

### Steps:
1. Go to your Google Account settings
2. Enable 2-factor authentication (required)
3. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Copy the generated 16-character password

### Add these to Vercel Environment Variables:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM="Life Dashboard <your-email@gmail.com>"
```

## Option 2: SendGrid (Professional)

### Steps:
1. Sign up for free at https://sendgrid.com (100 emails/day free)
2. Create an API key
3. Verify your sender email

### Add to Vercel:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM="Life Dashboard <noreply@yourdomain.com>"
```

## Option 3: Resend (Modern & Developer-Friendly)

### Steps:
1. Sign up at https://resend.com (100 emails/day free)
2. Get your API key
3. Add domain or use their test domain

### Add to Vercel:
```
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM="Life Dashboard <onboarding@resend.dev>"
```

## Option 4: Temporary Solution - Mailtrap (Testing)

### Steps:
1. Sign up at https://mailtrap.io (free tier available)
2. Get SMTP credentials from inbox settings
3. All emails go to Mailtrap inbox (not real recipients)

### Add to Vercel:
```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM="Life Dashboard <test@lifedashboard.app>"
```

## How to Add to Vercel:

```bash
# Example for Gmail:
npx vercel env add SMTP_HOST production
# Enter: smtp.gmail.com

npx vercel env add SMTP_PORT production
# Enter: 587

npx vercel env add SMTP_SECURE production
# Enter: false

npx vercel env add SMTP_USER production
# Enter: your-email@gmail.com

npx vercel env add SMTP_PASSWORD production
# Enter: your-app-password

npx vercel env add EMAIL_FROM production
# Enter: "Life Dashboard <your-email@gmail.com>"
```

Then redeploy:
```bash
npx vercel --prod
```