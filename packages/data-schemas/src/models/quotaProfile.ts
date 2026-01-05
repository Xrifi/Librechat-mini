import quotaProfileSchema from '~/schema/quotaProfile';
import type * as t from '~/types';

export function createQuotaProfileModel(mongoose: typeof import('mongoose')) {
    return mongoose.models.QuotaProfile || mongoose.model<t.IQuotaProfile>('QuotaProfile', quotaProfileSchema);
}
