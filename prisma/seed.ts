import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  const enrollersCount = await prisma.autoEnrol.count();

    if (enrollersCount < 1) {
        console.log(`Seeding autoEnrol in ${Bun.env.NODE_ENV ?? ''}...`);

        await prisma.autoEnrol.createMany({
            data: [
                { email: 'myaddress@email.com', names: 'Just Chola', phone: '1234', roles: [Role.ADMIN], supportLevel: 3 },
            ]
        })
    }

  // Close Prisma connection
  await prisma.$disconnect();
}


main().then(async () => {
    console.log('✅ Seed successful');
    
    // await prisma.$disconnect();
}).catch(async (e) => {
    console.error('❌ Error seeding:', e);
    // await prisma.$disconnect()
    process.exit(1)
})