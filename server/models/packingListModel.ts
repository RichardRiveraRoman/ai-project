import mongoose, { Document, Schema } from 'mongoose';

interface IPackingItem {
  name: string;
  quantity: number;
  category: string;
  isEssential: boolean;
  notes?: string;
}

interface ILocationDetails {
  country: string;
  city: string;
  weatherConditions: string[];
  localRestrictions?: string[];
  recommendedItems: string[];
}

interface ITripDuration {
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

interface IPackingList extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  location: ILocationDetails;
  duration: ITripDuration;
  items: IPackingItem[];
  lastUpdated: Date;
  specialConsiderations?: string[];
}

const packingListSchema = new Schema<IPackingList>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    location: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      weatherConditions: [
        {
          type: String,
          enum: ['HOT', 'COLD', 'RAINY', 'SNOWY', 'MILD', 'HUMID', 'TROPICAL'],
          required: true,
        },
      ],
      localRestrictions: [String],
      recommendedItems: [{ type: String, required: true }],
    },
    duration: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      totalDays: { type: Number, required: true, min: 1, max: 365 },
    },
    items: [
      {
        item: { type: String, required: true, minlength: 2 },
        quantity: { type: Number, required: true, min: 1, max: 100 },
        category: {
          type: String,
          enum: [
            'CLOTHING',
            'ELECTRONICS',
            'TOILETRIES',
            'DOCUMENTS',
            'ACCESSORIES',
            'MEDICATIONS',
            'EQUIPMENT',
          ],
          required: true,
        },
        isEssential: { type: Boolean, required: true, default: false },
        notes: String,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
    specialConsiderations: [String],
  },
  { timestamps: true },
);

// Index for location queries
packingListSchema.index({ 'location.country': 1, 'location.city': 1 });

const PackingListModel = mongoose.model<IPackingList>(
  'PackingList',
  packingListSchema,
);

// Unsure if we will need these export interfaces
// I will probably move to the types file so that they can be used on the front end
export {
  PackingListModel,
  IPackingList,
  IPackingItem,
  ILocationDetails,
  ITripDuration,
};
