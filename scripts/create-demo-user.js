const { PrismaClient } = require('@prisma/client');

async function createDemoUser() {
  const prisma = new PrismaClient();
  
  try {
    // Create or update demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {
        name: 'Demo User'
      },
      create: {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User'
      }
    });
    
    console.log('✅ Demo user created/updated:', demoUser);
    
    // Create a sample note for testing
    const sampleNote = await prisma.note.create({
      data: {
        userId: demoUser.id,
        spaceType: 'PROJECTS',
        title: 'Welcome to Database Integration!',
        content: {
          text: 'This note was created in the database. The hybrid system is working!'
        },
        isPinned: true
      }
    });
    
    console.log('✅ Sample note created:', sampleNote.title);
    console.log('\n🎉 Database is ready for testing!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();