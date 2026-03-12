interface ProductCardProps {
  product: any;
  cartQty: number;
  onAdd: () => void;
  onDecrease: () => void;
}

export default function ProductCard({ product, cartQty, onAdd, onDecrease }: ProductCardProps) {
  return (
    <div>ProductCard</div>
  )
}
