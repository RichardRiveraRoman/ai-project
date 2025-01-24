import mongoose, { Document } from 'mongoose';

export interface IPackingItem {
  name: string;
  quantity: number;
  category: string;
  isEssential: boolean;
  notes?: string;
}

export interface ILocationDetails {
  country: string;
  city: string;
  weatherConditions: string[];
  localRestrictions?: string[];
  recommendedItems: string[];
}

export interface ITripDuration {
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export interface IPackingList extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  location: ILocationDetails;
  duration: ITripDuration;
  items: IPackingItem[];
  lastUpdated: Date;
  specialConsiderations?: string[];
}

export type ServerError = {
  log: string;
  status: number;
  message: { err: string };
};
