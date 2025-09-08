const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            notes: true,
            sessions: true
          }
        }
      }
    })
    
    console.log('\n📊 Database User Report\n')
    console.log('='.repeat(60))
    
    if (users.length === 0) {
      console.log('❌ No users found in the database')
      console.log('\nTo create a test account:')
      console.log('1. Go to http://localhost:3003/auth/signin')
      console.log('2. Click "Don\'t have an account? Register"')
      console.log('3. Enter email and password')
      console.log('4. Check console for verification email (dev mode)')
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`)
      
      users.forEach((user, index) => {
        console.log(`User #${index + 1}:`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Name: ${user.name || 'Not set'}`)
        console.log(`  Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`)
        console.log(`  Notes: ${user._count.notes}`)
        console.log(`  Active Sessions: ${user._count.sessions}`)
        console.log(`  Created: ${user.createdAt.toLocaleDateString()}`)
        console.log('')
      })
    }
    
    console.log('='.repeat(60))
    
    // Check for demo user
    const demoUser = users.find(u => u.email === 'demo@example.com')
    if (!demoUser) {
      console.log('\n💡 Tip: You can create a demo account with:')
      console.log('   Email: demo@example.com')
      console.log('   Password: demo123')
    }
    
  } catch (error) {
    console.error('Error checking users:', error.message)
    console.log('\nMake sure your database is connected properly.')
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()