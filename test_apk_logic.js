const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding dummy APKs...");

    // Create 1 child and 1 wizard
    const child1 = await prisma.apkRelease.create({
        data: {
            appType: 'CHILD',
            version: 'v1.0.0',
            buildNumber: 1,
            targetSdk: 34,
            fileSize: '10 MB',
            filePath: 'public/uploads/apk/dummy_child.apk',
            status: 'LIVE',
            isCriticalUpdate: false,
            uploadedBy: 'admin',
        }
    });

    const wizard1 = await prisma.apkRelease.create({
        data: {
            appType: 'WIZARD',
            version: 'v1.0.0',
            buildNumber: 1,
            targetSdk: 34,
            fileSize: '3 MB',
            filePath: 'public/uploads/apk/dummy_wizard.apk',
            status: 'LIVE',
            isCriticalUpdate: false,
            uploadedBy: 'admin',
        }
    });

    console.log("Created 1 CHILD LIVE and 1 WIZARD LIVE.");

    // Now insert a second CHILD as ARCHIVED
    const child2 = await prisma.apkRelease.create({
        data: {
            appType: 'CHILD',
            version: 'v2.0.0',
            buildNumber: 2,
            targetSdk: 34,
            fileSize: '12 MB',
            filePath: 'public/uploads/apk/dummy_child2.apk',
            status: 'ARCHIVED',
            isCriticalUpdate: false,
            uploadedBy: 'admin',
        }
    });

    console.log("Created 2nd CHILD (ARCHIVED). Triggering 'Set Active' logic for child2...");

    // The logic from our PUT route:
    await prisma.$transaction(async (tx) => {
        const target = await tx.apkRelease.findUnique({ where: { id: child2.id } });

        // 1. Archive same types
        await tx.apkRelease.updateMany({
            where: { status: 'LIVE', appType: target.appType },
            data: { status: 'ARCHIVED' }
        });

        // 2. Set active
        await tx.apkRelease.update({
            where: { id: target.id },
            data: { status: 'LIVE' }
        });
    });

    console.log("Transaction finished. Fetching final state...");
    const all = await prisma.apkRelease.findMany({ select: { appType: true, version: true, status: true } });
    console.table(all);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
