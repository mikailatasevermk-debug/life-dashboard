const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const SPACES_DATA = [
  {
    type: 'PROJECTS',
    name: 'Projects / Business',
    color: '#E63946',
    icon: 'briefcase',
    description: 'Your creative ventures and business ideas',
    order: 1
  },
  {
    type: 'FAMILY',
    name: 'Family',
    color: '#06D6A0',
    icon: 'users',
    description: 'Memories and moments with loved ones',
    order: 2
  },
  {
    type: 'HOME',
    name: 'Home / Dreams',
    color: '#118AB2',
    icon: 'home',
    description: 'Your sanctuary and future aspirations',
    order: 3
  },
  {
    type: 'LOVE',
    name: 'Love with Wife',
    color: '#FF8FA3',
    icon: 'heart',
    description: 'Cherished moments and expressions of love',
    order: 4
  },
  {
    type: 'BUYING',
    name: 'Conscious Buying',
    color: '#FFD166',
    icon: 'shopping-bag',
    description: 'Mindful purchases and wishlist',
    order: 5
  },
  {
    type: 'CAREER',
    name: 'Work / Career',
    color: '#5F6C7B',
    icon: 'building-2',
    description: 'Professional growth and achievements',
    order: 6
  },
  {
    type: 'FAITH',
    name: 'Religion / Faith',
    color: '#6A4C93',
    icon: 'church',
    description: 'Spiritual journey and reflections',
    order: 7
  }
]

async function main() {
  console.log('🌱 Seeding spaces...')
  
  for (const spaceData of SPACES_DATA) {
    const space = await prisma.space.upsert({
      where: { type: spaceData.type },
      update: {},
      create: spaceData,
    })
    console.log(`✅ Created space: ${space.name}`)
  }

  console.log('🎉 Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })