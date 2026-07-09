import { Types } from 'mongoose';
import { Address, AddressInput } from '../types';
import { IAddressDoc, AddressModel } from '../models/address.model';

function toAddress(doc: IAddressDoc): Address {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    label: doc.label,
    line1: doc.line1,
    line2: doc.line2,
    city: doc.city,
    state: doc.state,
    pincode: doc.pincode,
    latitude: doc.latitude,
    longitude: doc.longitude,
    isDefault: doc.isDefault,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const addressStore = {
  async listByUserId(userId: string): Promise<Address[]> {
    const docs = await AddressModel.find({ userId: new Types.ObjectId(userId) }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    return docs.map(toAddress);
  },

  async findByIdForUser(id: string, userId: string): Promise<Address | null> {
    const doc = await AddressModel.findOne({ _id: id, userId: new Types.ObjectId(userId) });
    return doc ? toAddress(doc) : null;
  },

  async create(userId: string, data: AddressInput): Promise<Address> {
    if (data.isDefault) {
      await AddressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { $set: { isDefault: false } }
      );
    }

    const isFirst = (await AddressModel.countDocuments({ userId: new Types.ObjectId(userId) })) === 0;
    const doc = await AddressModel.create({
      userId: new Types.ObjectId(userId),
      label: data.label,
      line1: data.line1,
      line2: data.line2 || '',
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isDefault: data.isDefault ?? isFirst,
    });
    return toAddress(doc);
  },

  async update(id: string, userId: string, data: AddressInput): Promise<Address | null> {
    if (data.isDefault) {
      await AddressModel.updateMany(
        { userId: new Types.ObjectId(userId) },
        { $set: { isDefault: false } }
      );
    }

    const doc = await AddressModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      {
        $set: {
          label: data.label,
          line1: data.line1,
          line2: data.line2 || '',
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
        },
      },
      { new: true }
    );
    return doc ? toAddress(doc) : null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const doc = await AddressModel.findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) });
    if (!doc) return false;

    if (doc.isDefault) {
      const next = await AddressModel.findOne({ userId: new Types.ObjectId(userId) }).sort({
        createdAt: -1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    return true;
  },

  async setDefault(id: string, userId: string): Promise<Address | null> {
    await AddressModel.updateMany(
      { userId: new Types.ObjectId(userId) },
      { $set: { isDefault: false } }
    );
    const doc = await AddressModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { $set: { isDefault: true } },
      { new: true }
    );
    return doc ? toAddress(doc) : null;
  },
};
