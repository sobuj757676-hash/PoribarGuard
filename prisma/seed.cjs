const { PrismaClient } = require('@prisma/client');
const { hashSync } = require('bcryptjs');

const prisma = new PrismaClient();

// Bcrypt-hashed passwords for seeded users
const ADMIN_HASH = hashSync('admin123', 12);
const PARENT_HASH = hashSync('parent123', 12);

async function main() {
    console.log('🌱 Seeding PoribarGuard BD database...\n');

    // ==========================================
    // 1. ADMIN USER
    // ==========================================
    const admin = await prisma.user.upsert({
        where: { email: 'admin@poribarguard.com' },
        update: {},
        create: {
            email: 'admin@poribarguard.com',
            passwordHash: ADMIN_HASH,
            role: 'ADMIN',
            name: 'System Admin',
            phone: '+880 1XXX XXXXXX',
            country: 'Bangladesh',
            city: 'Dhaka',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // ==========================================
    // 2. PARENT USERS
    // ==========================================
    const parents = [
        { email: 'akarim.dxb@gmail.com', name: 'Abdul Karim', phone: '+971 50 XXX XXXX', country: 'UAE', city: 'Dubai' },
        { email: 'mofiz.ksa@yahoo.com', name: 'Mofizur Rahman', phone: '+966 5X XXX XXXX', country: 'KSA', city: 'Riyadh' },
        { email: 'syed.uk@hotmail.com', name: 'Syed Hossain', phone: '+44 7XXX XXXXXX', country: 'UK', city: 'London' },
        { email: 'tariqul.my@gmail.com', name: 'Tariqul Islam', phone: '+60 1X XXX XXXX', country: 'Malaysia', city: 'Kuala Lumpur' },
        { email: 'sobuj.bhai@gmail.com', name: 'Sobuj Bhai', phone: '+971 55 XXX XXXX', country: 'UAE', city: 'Dubai' },
    ];

    const createdParents = [];
    for (const p of parents) {
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: {},
            create: { ...p, passwordHash: PARENT_HASH, role: 'PARENT' },
        });
        createdParents.push(user);
        console.log('✅ Parent:', user.name, `(${user.city}, ${user.country})`);
    }

    // ==========================================
    // 3. CHILDREN
    // ==========================================
    const childrenData = [
        { parentIdx: 0, name: 'Ayaan', age: 12, phone: '017XX XXXXXX' },
        { parentIdx: 1, name: 'Sumaiya', age: 14, phone: '018XX XXXXXX' },
        { parentIdx: 1, name: 'Rakib', age: 10, phone: '019XX XXXXXX' },
        { parentIdx: 2, name: 'Tahsan', age: 15, phone: '013XX XXXXXX' },
        { parentIdx: 3, name: 'Jisan', age: 11, phone: '016XX XXXXXX' },
        { parentIdx: 4, name: 'Ayaan', age: 12, phone: '017XX XXXXXX' },
    ];

    const createdChildren = [];
    for (const c of childrenData) {
        const child = await prisma.child.create({
            data: { name: c.name, age: c.age, phone: c.phone, parentId: createdParents[c.parentIdx].id },
        });
        createdChildren.push(child);
        console.log(`  👶 ${child.name} (${child.age}y) → ${createdParents[c.parentIdx].name}`);
    }

    // ==========================================
    // 4. DEVICES
    // ==========================================
    const devicesData = [
        { childIdx: 0, model: 'Samsung Galaxy A14', os: 'Android 14', battery: 85, network: '4G', online: true, lat: 23.1634, lng: 89.2182, location: 'Jashore Zilla School Area', speed: 12 },
        { childIdx: 1, model: 'Xiaomi Redmi Note 12', os: 'Android 13', battery: 42, network: 'WiFi', online: false, lat: 23.8103, lng: 90.4125, location: 'Mirpur, Dhaka', speed: 0 },
        { childIdx: 2, model: 'Realme C55', os: 'Android 13', battery: 67, network: '4G', online: true, lat: 23.7104, lng: 90.4074, location: 'Dhanmondi, Dhaka', speed: 5 },
        { childIdx: 3, model: 'Samsung Galaxy M14', os: 'Android 14', battery: 23, network: '3G', online: false, lat: 22.3569, lng: 91.7832, location: 'Chittagong City', speed: 0 },
        { childIdx: 4, model: 'Oppo A78', os: 'Android 13', battery: 91, network: 'WiFi', online: true, lat: 24.3636, lng: 88.6241, location: 'Rajshahi City', speed: 0 },
        { childIdx: 5, model: 'Samsung Galaxy A34', os: 'Android 14', battery: 85, network: '4G', online: true, lat: 23.1634, lng: 89.2182, location: 'Jashore Zilla School Area', speed: 12 },
    ];

    for (const d of devicesData) {
        await prisma.device.create({
            data: {
                deviceId: `PG-BD-${String(d.childIdx + 1).padStart(4, '0')}`,
                model: d.model, osVersion: d.os, batteryLevel: d.battery,
                networkType: d.network, isOnline: d.online,
                latitude: d.lat, longitude: d.lng, locationAccuracy: 5.0,
                speed: d.speed, locationName: d.location,
                locationUpdatedAt: new Date(), childId: createdChildren[d.childIdx].id,
            },
        });
    }
    console.log('📱 Devices created for all children');

    // ==========================================
    // 5. SUBSCRIPTIONS
    // ==========================================
    const subsData = [
        { parentIdx: 0, plan: 'PREMIUM', cycle: 'YEARLY', amount: 7188, months: 12, method: 'bKash' },
        { parentIdx: 1, plan: 'STANDARD', cycle: 'MONTHLY', amount: 299, months: 1, method: 'Nagad' },
        { parentIdx: 2, plan: 'TRIAL', cycle: 'MONTHLY', amount: 0, months: 0, method: null },
        { parentIdx: 3, plan: 'PREMIUM', cycle: 'SEMI_ANNUAL', amount: 3594, months: 6, method: 'bKash' },
        { parentIdx: 4, plan: 'PREMIUM', cycle: 'YEARLY', amount: 7188, months: 12, method: 'bKash' },
    ];

    for (const s of subsData) {
        const start = new Date();
        const end = new Date();
        if (s.plan === 'TRIAL') { end.setDate(end.getDate() - 1); }
        else { end.setMonth(end.getMonth() + s.months); }
        await prisma.subscription.create({
            data: {
                plan: s.plan, status: s.plan === 'TRIAL' ? 'EXPIRED' : 'ACTIVE',
                billingCycle: s.cycle, amount: s.amount,
                startDate: start, endDate: end,
                paymentMethod: s.method, userId: createdParents[s.parentIdx].id,
            },
        });
    }
    console.log('💳 Subscriptions created');

    // ==========================================
    // 6. TRANSACTIONS
    // ==========================================
    const trxData = [
        { parentIdx: 0, trxId: '9X2A8BVZ', gateway: 'bKash', amount: 1200, status: 'SUCCESS', minsAgo: 2 },
        { parentIdx: 1, trxId: 'NAGAD_772', gateway: 'Nagad', amount: 300, status: 'SUCCESS', minsAgo: 15 },
        { parentIdx: 2, trxId: 'BK_FAIL_01', gateway: 'bKash', amount: 1200, status: 'FAILED', minsAgo: 60 },
        { parentIdx: 3, trxId: '8Y3B9CWA', gateway: 'Rocket', amount: 600, status: 'SUCCESS', minsAgo: 180 },
        { parentIdx: 4, trxId: 'BK_SB_001', gateway: 'bKash', amount: 7188, status: 'SUCCESS', minsAgo: 1440 },
    ];

    for (const tx of trxData) {
        const createdAt = new Date();
        createdAt.setMinutes(createdAt.getMinutes() - tx.minsAgo);
        await prisma.transaction.create({
            data: { trxId: tx.trxId, gateway: tx.gateway, amount: tx.amount, status: tx.status, createdAt, userId: createdParents[tx.parentIdx].id },
        });
    }
    console.log('💰 Transactions created');

    // ==========================================
    // 7. ALERTS
    // ==========================================
    const alertsData = [
        { childIdx: 0, type: 'SOS', title: 'SOS Triggered', severity: 'CRITICAL', minsAgo: 285 },
        { childIdx: 0, type: 'GEOFENCE_EXIT', title: 'Left School Zone', severity: 'HIGH', minsAgo: 330 },
        { childIdx: 0, type: 'APP_INSTALL', title: 'New App Installed', desc: 'FreeFire Max', severity: 'MEDIUM', minsAgo: 1635 },
        { childIdx: 1, type: 'LOW_BATTERY', title: 'Battery below 20%', severity: 'LOW', minsAgo: 120 },
        { childIdx: 2, type: 'TAMPER', title: 'App uninstalled by child', severity: 'HIGH', minsAgo: 240 },
        { childIdx: 5, type: 'SOS', title: 'SOS Triggered', severity: 'CRITICAL', minsAgo: 285 },
        { childIdx: 5, type: 'GEOFENCE_EXIT', title: 'Left School Zone', severity: 'HIGH', minsAgo: 330 },
        { childIdx: 5, type: 'APP_INSTALL', title: 'New App Installed', desc: 'FreeFire Max', severity: 'MEDIUM', minsAgo: 1635 },
    ];

    for (const a of alertsData) {
        const createdAt = new Date();
        createdAt.setMinutes(createdAt.getMinutes() - a.minsAgo);
        await prisma.alert.create({
            data: { type: a.type, title: a.title, description: a.desc || null, severity: a.severity, createdAt, childId: createdChildren[a.childIdx].id },
        });
    }
    console.log('🚨 Alerts created');

    // ==========================================
    // 8. GEOFENCE ZONES
    // ==========================================
    const geoData = [
        { childIdx: 0, name: 'Home', lat: 23.1620, lng: 89.2150, radius: 100 },
        { childIdx: 0, name: 'Jashore Zilla School', lat: 23.1634, lng: 89.2182, radius: 200 },
        { childIdx: 0, name: 'Mosque', lat: 23.1640, lng: 89.2170, radius: 50 },
        { childIdx: 5, name: 'Home', lat: 23.1620, lng: 89.2150, radius: 100 },
        { childIdx: 5, name: 'Jashore Zilla School', lat: 23.1634, lng: 89.2182, radius: 200 },
        { childIdx: 5, name: 'Mosque', lat: 23.1640, lng: 89.2170, radius: 50 },
    ];

    for (const g of geoData) {
        await prisma.geofenceZone.create({
            data: { name: g.name, latitude: g.lat, longitude: g.lng, radius: g.radius, childId: createdChildren[g.childIdx].id },
        });
    }
    console.log('📍 Geofence zones created');

    // ==========================================
    // 9. APP CONTROLS
    // ==========================================
    const appData = [
        { childIdx: 0, pkg: 'com.zhiliaoapp.musically', name: 'TikTok', blocked: true, limit: 60, used: 135, color: 'bg-black' },
        { childIdx: 0, pkg: 'com.dts.freefiremax', name: 'FreeFire Max', blocked: false, limit: 120, used: 45, color: 'bg-orange-500' },
        { childIdx: 0, pkg: 'com.google.android.youtube', name: 'YouTube', blocked: false, limit: 90, used: 80, color: 'bg-red-600' },
        { childIdx: 5, pkg: 'com.zhiliaoapp.musically', name: 'TikTok', blocked: true, limit: 60, used: 135, color: 'bg-black' },
        { childIdx: 5, pkg: 'com.dts.freefiremax', name: 'FreeFire Max', blocked: false, limit: 120, used: 45, color: 'bg-orange-500' },
        { childIdx: 5, pkg: 'com.google.android.youtube', name: 'YouTube', blocked: false, limit: 90, used: 80, color: 'bg-red-600' },
    ];

    for (const app of appData) {
        await prisma.appControl.create({
            data: { packageName: app.pkg, appName: app.name, isBlocked: app.blocked, dailyLimit: app.limit, usageToday: app.used, iconColor: app.color, childId: createdChildren[app.childIdx].id },
        });
    }
    console.log('📲 App controls created');

    // ==========================================
    // 10. PRAYER TIME LOCKS
    // ==========================================
    const prayerData = [
        { childIdx: 0, name: 'Fajr', start: '05:00', end: '05:30', active: true },
        { childIdx: 0, name: 'Maghrib', start: '18:15', end: '18:45', active: true },
        { childIdx: 0, name: 'Isha', start: '20:00', end: '20:30', active: false },
        { childIdx: 5, name: 'Fajr', start: '05:00', end: '05:30', active: true },
        { childIdx: 5, name: 'Maghrib', start: '18:15', end: '18:45', active: true },
        { childIdx: 5, name: 'Isha', start: '20:00', end: '20:30', active: false },
    ];

    for (const p of prayerData) {
        await prisma.prayerTimeLock.create({
            data: { name: p.name, startTime: p.start, endTime: p.end, isActive: p.active, childId: createdChildren[p.childIdx].id },
        });
    }
    console.log('🕌 Prayer time locks created');

    // ==========================================
    // 11. CONTENT FILTERS
    // ==========================================
    const filterData = [
        { pattern: '*.bet365.com', type: 'DOMAIN', category: 'Gambling' },
        { pattern: '*1xbet*', type: 'DOMAIN', category: 'Gambling' },
        { pattern: '*baji.live*', type: 'DOMAIN', category: 'Gambling' },
        { pattern: '*.xvideos.com', type: 'DOMAIN', category: 'Adult' },
        { pattern: '*.pornhub.com', type: 'DOMAIN', category: 'Adult' },
        { pattern: 'school bunk', type: 'KEYWORD', category: 'Safety' },
        { pattern: 'palaia', type: 'KEYWORD', category: 'Safety' },
        { pattern: 'morbo', type: 'KEYWORD', category: 'Safety' },
        { pattern: 'help me', type: 'KEYWORD', category: 'Safety' },
        { pattern: 'drugs', type: 'KEYWORD', category: 'Drugs' },
        { pattern: 'yaba', type: 'KEYWORD', category: 'Drugs' },
    ];

    for (const f of filterData) {
        await prisma.contentFilter.create({
            data: { pattern: f.pattern, type: f.type, category: f.category, isGlobal: true, isActive: true },
        });
    }
    console.log('🛡️  Content filters created');

    // ==========================================
    // 12. SUPPORT TICKETS
    // ==========================================
    const ticketData = [
        { parentIdx: 1, title: 'Xiaomi background killed', priority: 'HIGH', minsAgo: 10 },
        { parentIdx: 0, title: 'bKash payment failed', priority: 'MEDIUM', minsAgo: 45 },
        { parentIdx: 2, title: 'Location not updating', priority: 'HIGH', minsAgo: 120 },
        { parentIdx: 3, title: 'How to block FreeFire?', priority: 'LOW', minsAgo: 180 },
        { parentIdx: 0, title: 'App uninstalled by child', priority: 'HIGH', minsAgo: 240 },
    ];

    for (const tk of ticketData) {
        const createdAt = new Date();
        createdAt.setMinutes(createdAt.getMinutes() - tk.minsAgo);
        await prisma.supportTicket.create({
            data: { title: tk.title, status: 'OPEN', priority: tk.priority, createdAt, userId: createdParents[tk.parentIdx].id },
        });
    }
    console.log('🎫 Support tickets created');

    console.log('\n✨ Database seeded successfully!');
    console.log('   Run `npx prisma studio` to explore the data.\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
