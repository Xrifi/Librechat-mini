import usageRollupSchema from '~/schema/usageRollup';
import type * as t from '~/types';

export function createUsageRollupModel(mongoose: typeof import('mongoose')) {
    return mongoose.models.UsageRollup || mongoose.model<t.IUsageRollup>('UsageRollup', usageRollupSchema);
}
