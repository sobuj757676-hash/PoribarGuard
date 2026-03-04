const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: {
      email: 'parent@example.com',
      name: 'Test Parent',
      password: 'test',
      children: {
        create: {
          name: 'Test Child',
          age: 12,
          device: {
            create: {
              deviceId: 'test-device-id',
              isOnline: false,
              batteryLevel: 50,
              networkType: 'LTE',
              locationUpdatedAt: new Date()
            }
          }
        }
      }
    }
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
