const express = require('express');
const { User, Balance, QuotaAssignment, UsageRollup } = require('~/db/models');
const { logAdminAction } = require('./quotas'); // We can reuse the audit logger
const router = express.Router();

// List users with balances and basic stats
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query)
            .select('email name role createdAt')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await User.countDocuments(query);

        // Fetch balances for these users
        const userIds = users.map(u => u._id);
        const balances = await Balance.find({ user: { $in: userIds } }).lean();

        // Fetch quota assignments
        const assignments = await QuotaAssignment.find({ user: { $in: userIds } }).populate('profileId').lean();

        // Calculate current month start
        const monthStart = new Date();
        monthStart.setUTCDate(1);
        monthStart.setUTCHours(0, 0, 0, 0);

        // Fetch monthly usage
        const monthlyUsage = await UsageRollup.aggregate([
            {
                $match: {
                    user: { $in: userIds },
                    periodStart: { $gte: monthStart }
                }
            },
            {
                $group: {
                    _id: '$user',
                    total: { $sum: '$creditsConsumed' }
                }
            }
        ]);

        const usersWithBalances = users.map(user => ({
            ...user,
            balance: balances.find(b => b.user.toString() === user._id.toString())?.tokenCredits || 0,
            quota: assignments.find(a => a.user.toString() === user._id.toString())?.profileId?.name,
            quotaAssignmentId: assignments.find(a => a.user.toString() === user._id.toString())?._id,
            usageMonth: monthlyUsage.find(u => u._id.toString() === user._id.toString())?.total || 0
        }));

        res.json({
            users: usersWithBalances,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalUsers: count
        });
    } catch (error) {
        console.error('Error listing users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Manually adjust user balance
router.post('/credits', async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        if (!userId || amount === undefined) {
            return res.status(400).json({ message: 'Missing userId or amount' });
        }

        const balance = await Balance.findOneAndUpdate(
            { user: userId },
            { $inc: { tokenCredits: amount } },
            { upsert: true, new: true }
        );

        await logAdminAction(
            req.user.id,
            'CREDIT_ADJUSTMENT',
            'Balance',
            userId,
            { amount, reason },
            { previousBalance: balance.tokenCredits - amount, newBalance: balance.tokenCredits }
        );

        res.json({ message: 'Balance updated', balance: balance.tokenCredits });
    } catch (error) {
        console.error('Error adjusting balance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update user role
router.put('/:id', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: 'Missing role' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await logAdminAction(
            req.user.id,
            'UPDATE',
            'UserRole',
            user._id,
            { role },
            null
        );

        res.json({ message: 'User updated', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
