import { Document, Types } from 'mongoose';

export interface IAdminAudit extends Document {
    user: Types.ObjectId;
    action: string;
    target?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
