const express = require('express');
const { AdminAudit, User } = require('~/db/models');
const router = express.Router();

// Get audit logs with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;

        const logs = await AdminAudit.find({})
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await AdminAudit.countDocuments({});

        // Populate admin details manually if needed or just use the ID
        const adminIds = [...new Set(logs.map(l => l.adminId))];
        const admins = await User.find({ _id: { $in: adminIds } }).select('name email').lean();

        const logsWithAdmins = logs.map(log => ({
            ...log,
            admin: admins.find(a => a._id.toString() === log.adminId.toString())
        }));

        res.json({
            logs: logsWithAdmins,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
