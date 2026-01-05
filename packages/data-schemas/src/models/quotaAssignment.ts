import quotaAssignmentSchema from '~/schema/quotaAssignment';
import type * as t from '~/types';

export function createQuotaAssignmentModel(mongoose: typeof import('mongoose')) {
    return mongoose.models.QuotaAssignment || mongoose.model<t.IQuotaAssignment>('QuotaAssignment', quotaAssignmentSchema);
}
