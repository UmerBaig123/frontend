// Utility functions for data processing

import { DataItem } from "./types";

export const parseListText = (text: string): DataItem[] => {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map((line, index) => {
    const parts = line.split(' - $');
    const name = parts[0]?.trim() || `Item ${index + 1}`;
    const priceText = parts[1]?.replace(/,/g, '') || '0';
    const price = parseFloat(priceText) || 0;
    
    return {
      id: crypto.randomUUID(),
      name,
      price,
      category: ''
    };
  });
};

export const validateFields = (name: string, price: string): string | null => {
  if (!name.trim()) {
    return "Name is required";
  }
  if (!price.trim()) {
    return "Price is required";
  }
  const priceValue = parseFloat(price);
  if (isNaN(priceValue) || priceValue < 0) {
    return "Price must be a valid positive number";
  }
  return null;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const generateListText = (data: DataItem[]): string => {
  return data
    .map(item => `${item.name} - $${item.price.toLocaleString()}`)
    .join('\n');
};
