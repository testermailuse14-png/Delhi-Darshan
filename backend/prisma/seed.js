import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a default user for the initial gems
  const hashedPassword = await bcryptjs.hash('admin@123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@delhidiscover.com' },
    update: {},
    create: {
      email: 'admin@delhidiscover.com',
      password: hashedPassword,
    },
  });

  // Define initial hidden gems
  const initialGems = [
    {
      name: 'Agrasen ki Baoli',
      description: 'A 60-meter long and 15-meter wide historical stepwell hidden in the heart of Delhi',
      address: '7B/25, Hailey Rd, Connaught Place, New Delhi, Delhi 110001',
      lat: 28.6304,
      lng: 77.1991,
    },
    {
      name: 'Lodhi Art District',
      description: 'India\'s first public art district featuring stunning street art and murals',
      address: 'Lodhi Rd, Lodhi Colony, New Delhi, Delhi 110003',
      lat: 28.5933,
      lng: 77.2197,
    },
    {
      name: 'Sunder Nursery',
      description: 'A 90-acre heritage park with Mughal-era monuments and beautiful gardens',
      address: 'Sunder Nagar, Nizamuddin West, New Delhi, Delhi 110013',
      lat: 28.5942,
      lng: 77.2470,
    },
  ];

  // Create hidden gems
  for (const gem of initialGems) {
    const existingGem = await prisma.hiddenGem.findFirst({
      where: { name: gem.name },
    });

    if (!existingGem) {
      await prisma.hiddenGem.create({
        data: {
          ...gem,
          userId: user.id,
        },
      });
      console.log(`Created hidden gem: ${gem.name}`);
    } else {
      console.log(`Hidden gem already exists: ${gem.name}`);
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
