import adminAuditSchema from '~/schema/adminAudit';
import type * as t from '~/types';

export function createAdminAuditModel(mongoose: typeof import('mongoose')) {
    return mongoose.models.AdminAudit || mongoose.model<t.IAdminAudit>('AdminAudit', adminAuditSchema);
}
