import { Response } from 'express';
import { addressStore } from '../services/address.service';
import { AddressInput } from '../types';
import { AuthRequest } from '../middleware';

function validateAddressInput(data: AddressInput, res: Response): boolean {
  if (!data.label?.trim() || !data.line1?.trim() || !data.city?.trim() || !data.state?.trim() || !data.pincode?.trim()) {
    res.status(400).json({ message: 'Label, address line, city, state, and pincode are required' });
    return false;
  }
  if (!/^\d{6}$/.test(data.pincode.trim())) {
    res.status(400).json({ message: 'Pincode must be a 6-digit number' });
    return false;
  }
  return true;
}

export async function listAddresses(req: AuthRequest, res: Response): Promise<void> {
  const addresses = await addressStore.listByUserId(req.userId!);
  res.json({ addresses });
}

export async function createAddress(req: AuthRequest, res: Response): Promise<void> {
  const data: AddressInput = req.body;
  if (!validateAddressInput(data, res)) return;

  const address = await addressStore.create(req.userId!, data);
  res.status(201).json({ message: 'Address saved', address });
}

export async function updateAddress(req: AuthRequest, res: Response): Promise<void> {
  const data: AddressInput = req.body;
  if (!validateAddressInput(data, res)) return;

  const address = await addressStore.update(req.params.id, req.userId!, data);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return;
  }
  res.json({ message: 'Address updated', address });
}

export async function deleteAddress(req: AuthRequest, res: Response): Promise<void> {
  const deleted = await addressStore.delete(req.params.id, req.userId!);
  if (!deleted) {
    res.status(404).json({ message: 'Address not found' });
    return;
  }
  res.json({ message: 'Address deleted' });
}

export async function setDefaultAddress(req: AuthRequest, res: Response): Promise<void> {
  const address = await addressStore.setDefault(req.params.id, req.userId!);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return;
  }
  res.json({ message: 'Default address updated', address });
}

export async function getAddressById(req: AuthRequest, res: Response): Promise<void> {
  const address = await addressStore.findByIdForUser(req.params.id, req.userId!);
  if (!address) {
    res.status(404).json({ message: 'Address not found' });
    return;
  }
  res.json({ address });
}
