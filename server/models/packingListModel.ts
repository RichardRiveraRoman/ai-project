import mongoose, { Document, Schema } from 'mongoose';

interface PackingListInterface extends Document {
  item: string;
  quantity: number;
  userId: mongoose.Schema.Types.ObjectId;
}

const packingListSchema = new Schema<PackingListInterface>({
  item: { type: String, required: true, unique: true },
  quantity: { type: Number, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

const PackingList = mongoose.model<PackingListInterface>(
  'PackingList',
  packingListSchema,
);

export default PackingList;
