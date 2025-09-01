const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  console.log('Testing Supabase connection...');
  console.log('Database URL configured successfully');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Supabase!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Database query successful:', result);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Existing tables:', tables);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Timeout issue detected. This might be due to:');
      console.log('   - Network restrictions (public WiFi, firewall)');
      console.log('   - Supabase connection pooler issues');
      console.log('   - Try using a direct connection or VPN');
    }
  } finally {
    await prisma.$disconnect();
    console.log('Connection test completed');
  }
}

testConnection();