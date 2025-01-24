import mongoose, { Schema } from 'mongoose';
import { IPackingList } from '../../types/types';

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
        name: { type: String, required: true, minlength: 2 },
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

export { PackingListModel };
