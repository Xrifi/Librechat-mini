const express = require('express');
const { QuotaProfile, QuotaAssignment } = require('~/db/models');
const { logAdminAction } = require('~/models/adminMethods');
const logger = require('~/config/winston');

const router = express.Router();

/**
 * GET /api/admin/quotas/profiles
 * List all quota profiles
 */
router.get('/profiles', async (req, res) => {
    try {
        const profiles = await QuotaProfile.find({});
        res.json(profiles);
    } catch (error) {
        logger.error('[admin/quotas/profiles] Error listing profiles:', error);
        res.status(500).json({ message: 'Error listing profiles' });
    }
});

/**
 * POST /api/admin/quotas/profiles
 * Create a new quota profile
 */
router.post('/profiles', async (req, res) => {
    try {
        const { name, description, period, creditLimit } = req.body;
        if (!name || !period || creditLimit === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const profile = await QuotaProfile.create({
            name,
            description,
            period,
            creditLimit,
        });

        await logAdminAction({
            userId: req.user.id,
            action: 'CREATE_QUOTA_PROFILE',
            target: profile._id.toString(),
            metadata: { name, period, creditLimit },
        });

        res.status(201).json(profile);
    } catch (error) {
        logger.error('[admin/quotas/profiles] Error creating profile:', error);
        res.status(500).json({ message: 'Error creating profile' });
    }
});

/**
 * PUT /api/admin/quotas/profiles/:id
 * Update an existing quota profile
 */
router.put('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, period, creditLimit } = req.body;

        const profile = await QuotaProfile.findByIdAndUpdate(
            id,
            { name, description, period, creditLimit },
            { new: true, runValidators: true },
        );

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        await logAdminAction({
            userId: req.user.id,
            action: 'UPDATE_QUOTA_PROFILE',
            target: id,
            metadata: { name, period, creditLimit },
        });

        res.json(profile);
    } catch (error) {
        logger.error(`[admin/quotas/profiles] Error updating profile ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

/**
 * DELETE /api/admin/quotas/profiles/:id
 * Delete a profile
 */
router.delete('/profiles/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if any assignments use this profile
        const assigned = await QuotaAssignment.exists({ profileId: id });
        if (assigned) {
            return res.status(400).json({ message: 'Cannot delete profile that is still assigned' });
        }

        const profile = await QuotaProfile.findByIdAndDelete(id);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        await logAdminAction({
            userId: req.user.id,
            action: 'DELETE_QUOTA_PROFILE',
            target: id,
            metadata: { name: profile.name },
        });

        res.json({ message: 'Profile deleted' });
    } catch (error) {
        logger.error(`[admin/quotas/profiles] Error deleting profile ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting profile' });
    }
});

/**
 * GET /api/admin/quotas/assignments
 * List all quota assignments
 */
router.get('/assignments', async (req, res) => {
    try {
        const assignments = await QuotaAssignment.find({})
            .populate('profileId', 'name period creditLimit')
            .sort({ priority: -1 });
        res.json(assignments);
    } catch (error) {
        logger.error('[admin/quotas/assignments] Error listing assignments:', error);
        res.status(500).json({ message: 'Error listing assignments' });
    }
});

/**
 * POST /api/admin/quotas/assignments
 * Create a new quota assignment
 */
router.post('/assignments', async (req, res) => {
    try {
        const { profileId, user, role, group, priority } = req.body;

        if (!profileId || priority === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const assignment = await QuotaAssignment.create({
            profileId,
            user,
            role,
            group,
            priority,
        });

        await logAdminAction({
            userId: req.user.id,
            action: 'CREATE_QUOTA_ASSIGNMENT',
            target: assignment._id.toString(),
            metadata: { profileId, user, role, group, priority },
        });

        res.status(201).json(assignment);
    } catch (error) {
        logger.error('[admin/quotas/assignments] Error creating assignment:', error);
        res.status(500).json({ message: 'Error creating assignment' });
    }
});

/**
 * DELETE /api/admin/quotas/assignments/:id
 * Delete an assignment
 */
router.delete('/assignments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await QuotaAssignment.findByIdAndDelete(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        await logAdminAction({
            userId: req.user.id,
            action: 'DELETE_QUOTA_ASSIGNMENT',
            target: id,
        });

        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        logger.error(`[admin/quotas/assignments] Error deleting assignment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error deleting assignment' });
    }
});

module.exports = router;
