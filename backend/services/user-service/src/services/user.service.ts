import { User, SignupRequest, ProfileUpdate } from '../types';
import { hashPassword } from '../utils';
import { IUserDoc, UserModel } from '../models/user.model';

function toUser(doc: IUserDoc): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    username: doc.username,
    phone: doc.phone,
    passwordHash: doc.passwordHash,
    isVerified: doc.isVerified,
    tokenVersion: doc.tokenVersion ?? 0,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const userStore = {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? toUser(doc) : null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    return doc ? toUser(doc) : null;
  },

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toUser(doc) : null;
  },

  async create(data: SignupRequest): Promise<User> {
    const doc = await UserModel.create({
      email: data.email.toLowerCase(),
      username: data.username,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      isVerified: false,
    });
    return toUser(doc);
  },

  async deleteById(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  },

  async markVerified(id: string): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    return doc ? toUser(doc) : null;
  },

  async incrementTokenVersion(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
  },

  async updateProfile(id: string, data: ProfileUpdate): Promise<User | null> {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return doc ? toUser(doc) : null;
  },
};
