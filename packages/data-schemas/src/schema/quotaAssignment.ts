import { Schema } from 'mongoose';
import type { IQuotaAssignment } from '~/types';

const quotaAssignmentSchema = new Schema<IQuotaAssignment>({
    profileId: {
        type: Schema.Types.ObjectId,
        ref: 'QuotaProfile',
        required: true,
        index: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    role: {
        type: String,
        index: true,
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        index: true,
    },
    priority: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });


export default quotaAssignmentSchema;
