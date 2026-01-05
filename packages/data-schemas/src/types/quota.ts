import { Document, Types } from 'mongoose';

export enum QuotaPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export interface IQuotaProfile extends Document {
  name: string;
  description?: string;
  period: QuotaPeriod;
  creditLimit: number;
}

export interface IQuotaAssignment extends Document {
  profileId: Types.ObjectId;
  user?: Types.ObjectId;
  role?: string;
  group?: Types.ObjectId;
  priority: number;
}

export interface IUsageRollup extends Document {
  user: Types.ObjectId;
  profileId: Types.ObjectId;
  period: QuotaPeriod;
  periodStart: Date;
  periodEnd: Date;
  creditsConsumed: number;
}
