import { Schema } from 'mongoose';
import type { IAdminAudit } from '~/types';

const adminAuditSchema = new Schema<IAdminAudit>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    action: {
        type: String,
        required: true,
        index: true,
    },
    target: String,
    metadata: Schema.Types.Mixed,
}, { timestamps: true });

export default adminAuditSchema;
