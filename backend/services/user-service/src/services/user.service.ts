import { v4 as uuidv4 } from 'uuid';
import { User, SignupRequest } from '../types';
import { hashPassword } from '../utils';

const users = new Map<string, User>();

export const userStore = {
  findByEmail(email: string): User | undefined {
    return Array.from(users.values()).find((u) => u.email === email);
  },

  findByUsername(username: string): User | undefined {
    return Array.from(users.values()).find((u) => u.username === username);
  },

  findById(id: string): User | undefined {
    return users.get(id);
  },

  async create(data: SignupRequest): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: uuidv4(),
      email: data.email,
      username: data.username,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    };
    users.set(user.id, user);
    return user;
  },

  markVerified(id: string): User | undefined {
    const user = users.get(id);
    if (!user) return undefined;
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();
    users.set(id, user);
    return user;
  },
};
