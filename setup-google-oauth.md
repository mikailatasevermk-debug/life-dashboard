# 🔐 Google OAuth Setup Guide (5 minutes)

## Step 1: Create Google OAuth Application

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

## Step 2: Configure OAuth Consent Screen

1. Click **"CONFIGURE CONSENT SCREEN"**
2. Choose **"External"** user type
3. Fill in:
   - App name: **Life Dashboard**
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email` and `profile`
5. Add test users: Your email addresses

## Step 3: Create OAuth Client ID

1. Application type: **Web application**
2. Name: **Life Dashboard Production**
3. Add Authorized JavaScript origins:
   ```
   https://life-dashboard-five.vercel.app
   http://localhost:3003
   ```
4. Add Authorized redirect URIs:
   ```
   https://life-dashboard-five.vercel.app/api/auth/callback/google
   http://localhost:3003/api/auth/callback/google
   ```
5. Click **CREATE**

## Step 4: Copy Your Credentials

You'll get:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123def456`

## Step 5: Add to Vercel

```bash
# Add Google Client ID
npx vercel env add GOOGLE_CLIENT_ID production
# Paste your Client ID

# Add Google Client Secret
npx vercel env add GOOGLE_CLIENT_SECRET production
# Paste your Client Secret
```

## Step 6: Deploy

```bash
npx vercel --prod
```

## That's it! 🎉

Google Sign-In button will now work on your site.

## Testing

1. Go to: https://life-dashboard-five.vercel.app/auth/signin
2. Click "Google" button
3. Sign in with your Google account
4. You'll be logged into the dashboard!

## Troubleshooting

- **Error 400**: Check redirect URIs match exactly
- **Access blocked**: Make sure app is published or user is in test users
- **Invalid client**: Verify Client ID and Secret are correct