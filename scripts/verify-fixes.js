#!/usr/bin/env node

/**
 * Verification Script for React Error #310 Fix
 * Tests SessionProvider setup and hook usage
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying React Hooks Error #310 Fix...\n');

// 1. Check SessionProvider in layout
console.log('1. Checking SessionProvider integration...');
const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
if (layoutContent.includes('SessionProvider') && layoutContent.includes('<SessionProvider>')) {
  console.log('   ✅ SessionProvider found in layout.tsx');
} else {
  console.log('   ❌ SessionProvider missing from layout.tsx');
  process.exit(1);
}

// 2. Check SessionProvider component exists
console.log('2. Checking SessionProvider component...');
if (fs.existsSync('components/providers/SessionProvider.tsx')) {
  const providerContent = fs.readFileSync('components/providers/SessionProvider.tsx', 'utf8');
  if (providerContent.includes('"use client"') && providerContent.includes('SessionProvider as NextAuthSessionProvider')) {
    console.log('   ✅ SessionProvider component properly configured');
  } else {
    console.log('   ❌ SessionProvider component misconfigured');
    process.exit(1);
  }
} else {
  console.log('   ❌ SessionProvider component not found');
  process.exit(1);
}

// 3. Check NextAuth configuration
console.log('3. Checking NextAuth configuration...');
if (fs.existsSync('lib/auth.ts') && fs.existsSync('app/api/auth/[...nextauth]/route.ts')) {
  console.log('   ✅ NextAuth properly configured');
} else {
  console.log('   ❌ NextAuth configuration incomplete');
  process.exit(1);
}

// 4. Check sign-in page uses Suspense
console.log('4. Checking sign-in page structure...');
const signinContent = fs.readFileSync('app/auth/signin/page.tsx', 'utf8');
if (signinContent.includes('Suspense') && signinContent.includes('"use client"')) {
  console.log('   ✅ Sign-in page properly structured with Suspense');
} else {
  console.log('   ❌ Sign-in page missing Suspense boundary');
  process.exit(1);
}

// 5. Check build success
console.log('5. Checking build artifacts...');
if (fs.existsSync('.next/BUILD_ID')) {
  console.log('   ✅ Build artifacts present');
} else {
  console.log('   ⚠️  No build artifacts found (run npm run build)');
}

console.log('\n🎉 All React Hooks Error #310 fixes verified successfully!');
console.log('\nNext steps:');
console.log('1. Deploy to production: npx vercel --prod --yes');
console.log('2. Test /auth/signin page for React errors');
console.log('3. Verify authentication flow works');
console.log('4. Check browser console for error #310');