const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { QuotaProfile, QuotaAssignment, UsageRollup, Group } = require('~/db/models');
const { resolveQuotaProfile, checkQuota, updateUsageRollup, getPeriodRange } = require('./quotaMethods');

let mongoServer;
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await mongoose.connection.dropDatabase();
});

describe('Quota Engine Tests', () => {
    test('resolveQuotaProfile: User override > Global default', async () => {
        const userId = new mongoose.Types.ObjectId();

        const globalProfile = await QuotaProfile.create({
            name: 'Global',
            period: 'day',
            creditLimit: 1000,
        });

        const userProfile = await QuotaProfile.create({
            name: 'User Specific',
            period: 'day',
            creditLimit: 5000,
        });

        await QuotaAssignment.create({ profileId: globalProfile._id, priority: 0 });
        await QuotaAssignment.create({ profileId: userProfile._id, user: userId, priority: 10 });

        const resolved = await resolveQuotaProfile({ _id: userId });
        expect(resolved.name).toBe('User Specific');
    });

    test('resolveQuotaProfile: Group override > Role default', async () => {
        const userId = new mongoose.Types.ObjectId();
        const groupId = new mongoose.Types.ObjectId();

        const roleProfile = await QuotaProfile.create({
            name: 'Role Profile',
            period: 'day',
            creditLimit: 2000,
        });

        const groupProfile = await QuotaProfile.create({
            name: 'Group Profile',
            period: 'day',
            creditLimit: 3000,
        });

        await Group.create({ _id: groupId, name: 'Test Group', memberIds: [userId.toString()] });
        await QuotaAssignment.create({ profileId: roleProfile._id, role: 'user', priority: 1 });
        await QuotaAssignment.create({ profileId: groupProfile._id, group: groupId, priority: 5 });

        const resolved = await resolveQuotaProfile({ _id: userId, role: 'user' });
        expect(resolved.name).toBe('Group Profile');
    });

    test('checkQuota: should block when limit exceeded', async () => {
        const userId = new mongoose.Types.ObjectId();
        const profile = await QuotaProfile.create({
            name: 'Test Profile',
            period: 'day',
            creditLimit: 100,
        });
        await QuotaAssignment.create({ profileId: profile._id, user: userId, priority: 1 });

        // Consume some
        await updateUsageRollup({ user: userId, amount: 90 });

        const check1 = await checkQuota({ user: { _id: userId }, amount: 5 });
        expect(check1.canSpend).toBe(true);

        const check2 = await checkQuota({ user: { _id: userId }, amount: 15 });
        expect(check2.canSpend).toBe(false);
    });

    test('updateUsageRollup: should increment creditsConsumed', async () => {
        const userId = new mongoose.Types.ObjectId();
        const profile = await QuotaProfile.create({
            name: 'Test Profile',
            period: 'day',
            creditLimit: 1000,
        });
        await QuotaAssignment.create({ profileId: profile._id, user: userId, priority: 1 });

        await updateUsageRollup({ user: userId, amount: 100 });
        await updateUsageRollup({ user: userId, amount: 50 });

        const { start } = getPeriodRange(new Date(), 'day');
        const rollup = await UsageRollup.findOne({ user: userId, periodStart: start });
        expect(rollup.creditsConsumed).toBe(150);
    });
});
