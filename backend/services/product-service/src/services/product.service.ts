import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types';

const products = new Map<string, Product>();

const seedProducts: Omit<Product, 'id' | 'createdAt'>[] = [
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    price: 149.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    stock: 45,
    rating: 4.5,
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking with heart rate monitor and GPS.',
    price: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    stock: 30,
    rating: 4.7,
  },
  {
    name: 'Leather Backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment.',
    price: 89.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    stock: 60,
    rating: 4.3,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight performance running shoes with cushioned sole.',
    price: 119.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    stock: 80,
    rating: 4.6,
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable drip coffee maker with thermal carafe.',
    price: 79.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    stock: 25,
    rating: 4.2,
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature.',
    price: 49.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    stock: 100,
    rating: 4.4,
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip eco-friendly yoga mat with carrying strap.',
    price: 34.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    stock: 120,
    rating: 4.1,
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with 360° sound.',
    price: 69.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    stock: 55,
    rating: 4.5,
  },
];

function seed(): void {
  const now = new Date().toISOString();
  for (const data of seedProducts) {
    const product: Product = { id: uuidv4(), ...data, createdAt: now };
    products.set(product.id, product);
  }
}

seed();

export const productStore = {
  getAll(): Product[] {
    return Array.from(products.values());
  },

  getById(id: string): Product | undefined {
    return products.get(id);
  },

  getByCategory(category: string): Product[] {
    return Array.from(products.values()).filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  },

  reserveStock(
    id: string,
    quantity: number
  ): { success: boolean; message: string; remainingStock: number; productName: string; price: number } {
    const product = products.get(id);
    if (!product) {
      return { success: false, message: 'Product not found', remainingStock: 0, productName: '', price: 0 };
    }
    if (quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1', remainingStock: product.stock, productName: product.name, price: product.price };
    }
    if (product.stock < quantity) {
      return { success: false, message: 'Insufficient stock', remainingStock: product.stock, productName: product.name, price: product.price };
    }
    product.stock -= quantity;
    products.set(id, product);
    return { success: true, message: 'Stock reserved', remainingStock: product.stock, productName: product.name, price: product.price };
  },
};
