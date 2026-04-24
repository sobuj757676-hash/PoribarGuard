const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.paymentMethod.createMany({
    data: [
      {
        name: 'bKash',
        type: 'Manual',
        logoUrl: '/logos/bkash.svg',
        instructions: 'Send money to our Merchant Number: 017XXXXXXXX',
        phoneNumber: '017XXXXXXXX',
        priorityOrder: 1,
      },
      {
        name: 'Nagad',
        type: 'Manual',
        logoUrl: '/logos/nagad.svg',
        instructions: 'Send money to our Merchant Number: 018XXXXXXXX',
        phoneNumber: '018XXXXXXXX',
        priorityOrder: 2,
      }
    ]
  });
  console.log('Payment methods seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
