import { Schema } from 'mongoose';
import type { IUsageRollup } from '~/types';

const usageRollupSchema = new Schema<IUsageRollup>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    profileId: {
        type: Schema.Types.ObjectId,
        ref: 'QuotaProfile',
        required: true,
        index: true,
    },
    period: {
        type: String,
        enum: ['day', 'week', 'month', 'year'],
        required: true,
    },
    periodStart: {
        type: Date,
        required: true,
    },
    periodEnd: {
        type: Date,
        required: true,
    },
    creditsConsumed: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

usageRollupSchema.index({ user: 1, profileId: 1, periodStart: 1 }, { unique: true });

export default usageRollupSchema;
