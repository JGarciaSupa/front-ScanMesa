export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  isAvailable: boolean;
  trackStock: boolean;
  currentStock: number;
}

export interface Category {
  id: number;
  name: string;
}
