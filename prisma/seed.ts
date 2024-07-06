import { Role } from '@prisma/client';
import { db } from '~config/prisma';

async function main() {
  await db.$connect();

  const enrollersCount = await db.autoEnrol.count();

    if (enrollersCount < 1) {
        console.log(`Seeding autoEnrol in...`);

        await db.autoEnrol.createMany({
            data: [
                { email: 'myaddress@email.com', names: 'Just Chola', phone: '1234', roles: [Role.ADMIN], supportLevel: 3 },
            ]
        })
    }
}


main().then(() => {
    console.log('✅ Seed successful');
    
}).catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1)
}).finally(async ()=>{
    // Close db connection
    await db.$disconnect();

    console.log("Seed complete!");
    
})