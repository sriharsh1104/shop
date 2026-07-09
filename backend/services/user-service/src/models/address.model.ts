import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddressDoc extends Document {
  userId: Types.ObjectId;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddressDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AddressModel = mongoose.model<IAddressDoc>('Address', addressSchema);
