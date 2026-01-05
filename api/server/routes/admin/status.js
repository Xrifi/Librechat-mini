const express = require('express');
const { User, Message, Conversation, UsageRollup, Session } = require('~/db/models');
const { getLogStores } = require('~/cache');
const { ViolationTypes } = require('librechat-data-provider');
const logger = require('~/config/winston');

const router = express.Router();

/**
 * GET /api/admin/status/overview
 * Basic system overview stats
 */
router.get('/overview', async (req, res) => {
    try {
        const [
            userCount,
            messageCount,
            convoCount,
            sessionCount,
            totalUsage
        ] = await Promise.all([
            User.countDocuments({}),
            Message.countDocuments({}),
            Conversation.countDocuments({}),
            Session.countDocuments({}),
            UsageRollup.aggregate([
                { $group: { _id: null, total: { $sum: '$creditsConsumed' } } }
            ])
        ]);

        res.json({
            users: userCount,
            messages: messageCount,
            conversations: convoCount,
            sessions: sessionCount,
            totalCreditsConsumed: totalUsage[0]?.total || 0,
        });
    } catch (error) {
        logger.error('[admin/status/overview] Error getting overview:', error);
        res.status(500).json({ message: 'Error getting system overview' });
    }
});

/**
 * GET /api/admin/status/usage
 * More detailed credit usage stats
 */
router.get('/usage', async (req, res) => {
    try {
        // Top 10 users by usage
        const topUsers = await UsageRollup.aggregate([
            { $group: { _id: '$user', total: { $sum: '$creditsConsumed' } } },
            { $sort: { total: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    _id: 1,
                    total: 1,
                    email: '$userInfo.email',
                    name: '$userInfo.name'
                }
            }
        ]);

        res.json({ topUsers });
    } catch (error) {
        logger.error('[admin/status/usage] Error getting usage stats:', error);
        res.status(500).json({ message: 'Error getting usage stats' });
    }
});

/**
 * GET /api/admin/status/violations
 * Recent quota/balance violations
 */
router.get('/violations', async (req, res) => {
    try {
        const logs = getLogStores(ViolationTypes.GENERAL);
        res.json({ message: 'Violation listing not fully implemented yet in this version' });
    } catch (error) {
        logger.error('[admin/status/violations] Error getting violations:', error);
        res.status(500).json({ message: 'Error getting violations' });
    }
});

/**
 * GET /api/admin/status/export
 * Export usage data as CSV
 */
router.get('/export', async (req, res) => {
    try {
        const usage = await UsageRollup.aggregate([
            { $group: { _id: { user: '$user', model: '$model' }, credits: { $sum: '$creditsConsumed' } } },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id.user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $project: {
                    email: '$userInfo.email',
                    name: '$userInfo.name',
                    model: '$_id.model',
                    credits: 1
                }
            }
        ]);

        let csv = 'Email,Name,Model,CreditsConsumed\n';
        usage.forEach(row => {
            csv += `"${row.email}","${row.name || ''}","${row.model || ''}",${row.credits}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=usage_export.csv');
        res.status(200).send(csv);
    } catch (error) {
        logger.error('[admin/status/export] Error exporting usage:', error);
        res.status(500).json({ message: 'Error exporting usage' });
    }
});

module.exports = router;
