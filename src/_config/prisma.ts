import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient, Role } from "@prisma/client";

export const db = new PrismaClient();
export const adapter = new PrismaAdapter(db.session, db.user);

function migrate(){
    console.log('Migrating database...');
    
}

async function seedAutoEnrol(){

    await db.$connect()
    const enrollersCount = await db.autoEnrol.count();

    if (enrollersCount < 1) {
        console.log(`Seeding in ${Bun.env.NODE_ENV}...`);

        await db.autoEnrol.createMany({
            data: [
                { email: 'myaddress@email.com', names: 'Frank Simmons', phone: '1234', roles: [Role.ADMIN], supportLevel: 3 },
            ]
        })
    }

    
    // Close Prisma connection
    await db.$disconnect();
}

// Call the seedData function when the server starts
// seedAutoEnrol().then(() => {
//     console.log('[SEEDING] ✅ Seed function completed successfully');
// }).catch((error) => {
//     console.error('[SEEDING] ❌ Error seeding data:', error);
// });