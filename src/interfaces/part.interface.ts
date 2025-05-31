import { PartType } from '../models/Part';

export interface CreatePartData {
  name: string;
  type: PartType;
  description?: string;
  parts?: { id: string; quantity: number }[];
}

export interface InventoryResponse {
  status: 'SUCCESS' | 'FAILED';
  message?: string;
}

export interface ComponentData {
  id: string;
  quantity: number;
}

export interface PartComponent {
  id: string;
  name: string;
  quantity: number;
}

export interface PartWithComponents {
  id: string;
  name: string;
  type: PartType;
  description?: string;
  quantityInStock: number;
  createdAt: Date;
  updatedAt: Date;
  parts?: PartComponent[];
} 