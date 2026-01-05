import { Schema } from 'mongoose';
import type { IQuotaProfile } from '~/types';

const quotaProfileSchema = new Schema<IQuotaProfile>({
    name: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: String,
    period: {
        type: String,
        enum: ['day', 'week', 'month', 'year'],
        required: true,
    },
    creditLimit: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

export default quotaProfileSchema;
