import { Request, Response } from 'express';
import { productStore } from '../services/product.service';

export function getAllProducts(req: Request, res: Response): void {
  const { category } = req.query;

  const products = category
    ? productStore.getByCategory(category as string)
    : productStore.getAll();

  res.json({ products, total: products.length });
}

export function getProductById(req: Request, res: Response): void {
  const product = productStore.getById(req.params.id);
  if (!product) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }
  res.json({ product });
}

export function getCategories(_req: Request, res: Response): void {
  const categories = [...new Set(productStore.getAll().map((p) => p.category))];
  res.json({ categories });
}
