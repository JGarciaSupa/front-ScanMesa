export type Product = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  trackStock: boolean;
  currentStock: number;
  isAvailable: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
