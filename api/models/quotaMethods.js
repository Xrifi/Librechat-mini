const { QuotaProfile, QuotaAssignment, UsageRollup, AdminAudit, Group } = require('~/db/models');
const { logger } = require('@librechat/data-schemas');

/**
 * Gets the start and end dates for a given period.
 * @param {Date} date
 * @param {'day' | 'week' | 'month' | 'year'} period
 * @returns {{ start: Date, end: Date }}
 */
const getPeriodRange = (date, period) => {
    const start = new Date(date);
    const end = new Date(date);

    if (period === 'day') {
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
    } else if (period === 'week') {
        const day = start.getUTCDay();
        start.setUTCDate(start.getUTCDate() - day);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCDate(start.getUTCDate() + 6);
        end.setUTCHours(23, 59, 59, 999);
    } else if (period === 'month') {
        start.setUTCDate(1);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCMonth(end.getUTCMonth() + 1);
        end.setUTCDate(0);
        end.setUTCHours(23, 59, 59, 999);
    } else if (period === 'year') {
        start.setUTCMonth(0, 1);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCMonth(11, 31);
        end.setUTCHours(23, 59, 59, 999);
    }

    return { start, end };
};

/**
 * Resolves the effective quota profile for a user.
 * Priority: user override > group override > role default > global default.
 */
const resolveQuotaProfile = async (user) => {
    const userId = user._id;
    const userRole = user.role;

    // 1. User specific
    let assignment = await QuotaAssignment.findOne({ user: userId }).lean();
    if (assignment) {
        return await QuotaProfile.findById(assignment.profileId).lean();
    }

    // 2. Group specific
    const groups = await Group.find({ memberIds: userId.toString() }, { _id: 1 }).lean();
    if (groups.length > 0) {
        const groupIds = groups.map((g) => g._id);
        assignment = await QuotaAssignment.findOne({ group: { $in: groupIds } })
            .sort({ priority: -1 })
            .lean();
        if (assignment) {
            return await QuotaProfile.findById(assignment.profileId).lean();
        }
    }

    // 3. Role specific
    if (userRole) {
        assignment = await QuotaAssignment.findOne({ role: userRole }).lean();
        if (assignment) {
            return await QuotaProfile.findById(assignment.profileId).lean();
        }
    }

    // 4. Global default
    assignment = await QuotaAssignment.findOne({ user: null, group: null, role: null }).lean();
    if (assignment) {
        return await QuotaProfile.findById(assignment.profileId).lean();
    }

    return null;
};

/**
 * Checks if a user has enough quota left.
 */
const checkQuota = async ({ user, amount }) => {
    const profile = await resolveQuotaProfile(user);
    if (!profile) {
        return { canSpend: true };
    }

    const { start } = getPeriodRange(new Date(), profile.period);
    const rollup = await UsageRollup.findOne({
        user: user._id,
        profileId: profile._id,
        periodStart: start,
    }).lean();

    const consumed = rollup ? rollup.creditsConsumed : 0;
    const canSpend = (consumed + amount) <= profile.creditLimit;

    return {
        canSpend,
        consumed,
        limit: profile.creditLimit,
        profile,
    };
};

/**
 * Updates the usage rollup for a user.
 */
const updateUsageRollup = async ({ user, amount }) => {
    const profile = await resolveQuotaProfile({ _id: user });
    if (!profile) {
        return;
    }

    const { start, end } = getPeriodRange(new Date(), profile.period);

    await UsageRollup.findOneAndUpdate(
        {
            user,
            profileId: profile._id,
            periodStart: start,
        },
        {
            $inc: { creditsConsumed: amount },
            $setOnInsert: {
                period: profile.period,
                periodEnd: end,
            },
        },
        { upsert: true, new: true },
    );
};

module.exports = {
    resolveQuotaProfile,
    checkQuota,
    updateUsageRollup,
    getPeriodRange,
};
