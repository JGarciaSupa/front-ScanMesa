/**
 * Estructura de datos para una mesa del restaurante.
 * Incluye información del estado, sesión activa y llamadas de mozo pendientes.
 */
export interface Table {
  id: number;
  name: string;
  status: "free" | "occupied";
  qrCodeHash: string;
  activeSession?: {
    id: number;
    code: string;
    status: string;
    openedAt: string;
  } | null;
  pendingCalls?: {
    id: number;
    reason: string;
    status: string;
    createdAt: string;
  }[];
}

/**
 * Representa un producto dentro de un pedido en curso.
 * Contiene detalles del comensal, precio y estado de preparación en cocina/servicio.
 */
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  guestId: number;
  guestName: string;
  kitchenStatus: "pending" | "served";
  invoiceId?: number | null;
}
