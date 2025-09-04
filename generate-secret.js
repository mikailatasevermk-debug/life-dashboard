// Generate a secure NEXTAUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
console.log('\n🔐 Your NEXTAUTH_SECRET:');
console.log(secret);
console.log('\nCopy this value to your .env.local file');
console.log('Keep it secret and never commit it to git!\n');