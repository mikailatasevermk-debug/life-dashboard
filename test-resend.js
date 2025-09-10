console.log('🧪 Testing Resend Integration\n');

const testEmail = 'test@example.com';

console.log('1. Sign up for Resend:');
console.log('   https://resend.com/signup');
console.log('   (Free account - 100 emails/day)');

console.log('\n2. Get your API key:');
console.log('   https://resend.com/api-keys');
console.log('   Copy the key that starts with "re_"');

console.log('\n3. Add to Vercel:');
console.log('   npx vercel env add RESEND_API_KEY production');
console.log('   (Paste your API key when prompted)');

console.log('\n4. Redeploy:');
console.log('   npx vercel --prod');

console.log('\n5. Test:');
console.log('   https://life-dashboard-five.vercel.app/auth/forgot-password');

console.log('\n✅ After setup, emails will be delivered to real inboxes!');
console.log('\n💡 Current Status: Console logging (no real emails until RESEND_API_KEY added)');

// Check if this is running in the right environment
if (process.env.RESEND_API_KEY) {
  console.log('\n🎉 RESEND_API_KEY detected! Emails should be working.');
} else {
  console.log('\n⚠️  RESEND_API_KEY not found. Add it to Vercel for production emails.');
}