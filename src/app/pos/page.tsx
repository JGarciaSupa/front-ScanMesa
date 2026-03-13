"use client";

import { useState } from "react";
import { 
  Users, 
  Clock, 
  BellRing, 
  CreditCard, 
  Printer, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  PencilIcon,
  Save,
  Armchair,
  MoreVertical,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// --- Tipos ---
type TableStatus = "free" | "occupied" | "attention" | "ready_to_pay";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Diner {
  id: string;
  name: string;
  items: OrderItem[];
  paymentMethod?: "Tarjeta" | "Efectivo" | "App";
}

interface TableData {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  diners?: Diner[];
  totalAmount?: number;
  paymentMethod?: "Tarjeta" | "Efectivo" | "App";
  billingData?: { documentType: string; documentNumber: string; name: string };
  timeActive?: string;
  alerts?: string[];
}

const INITIAL_TABLES: TableData[] = [
  { id: "T1", number: "1", capacity: 2, status: "free" },
  { id: "T2", number: "2", capacity: 4, status: "free" },
  { 
    id: "T3", 
    number: "3", 
    capacity: 4, 
    status: "occupied", 
    timeActive: "45 min",
    diners: [
      { id: "d1", name: "Carlos", items: [{ id: "i1", name: "Ceviche Mixto", price: 35.0, quantity: 1 }, { id: "i2", name: "Limonada", price: 8.0, quantity: 1 }] },
      { id: "d2", name: "María", items: [{ id: "i3", name: "Lomo Saltado", price: 40.0, quantity: 1 }, { id: "i4", name: "Chicha Morada", price: 6.0, quantity: 1 }] }
    ]
  },
  { 
    id: "T4", 
    number: "4", 
    capacity: 2, 
    status: "attention", 
    timeActive: "1 h 10 min",
    alerts: ["Mesa solicitando al mozo"],
    diners: [
      { id: "d3", name: "Diner 1", items: [{ id: "i5", name: "Café Americano", price: 7.0, quantity: 2 }] }
    ]
  },
  { 
    id: "T5", 
    number: "5", 
    capacity: 6, 
    status: "ready_to_pay", 
    timeActive: "1 h 30 min",
    totalAmount: 185.50,
    paymentMethod: "Tarjeta",
    billingData: { documentType: "RUC", documentNumber: "20123456789", name: "Empresa XYZ SAC" },
    diners: [
      { id: "d4", name: "Ana", items: [{ id: "i6", name: "Pizza Familiar", price: 65.0, quantity: 1 }, { id: "i7", name: "Cerveza Artesanal", price: 15.0, quantity: 4 }] },
      { id: "d5", name: "Luis", items: [{ id: "i8", name: "Piqueo Snack", price: 45.5, quantity: 1 }] }
    ]
  },
  { id: "T6", number: "6", capacity: 2, status: "free" },
  { 
    id: "T7", 
    number: "7", 
    capacity: 4, 
    status: "occupied", 
    timeActive: "15 min",
    diners: [
      { id: "d6", name: "Mesa 7 - Anónimo", items: [{ id: "i9", name: "Menú del día", price: 20.0, quantity: 2 }] }
    ]
  },
  { id: "T8", number: "8", capacity: 4, status: "free" },
];

export default function PosPage() {
  const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  
  // State for editing table metadata
  const [editForm, setEditForm] = useState<Partial<TableData>>({});

  const getCardStyles = (status: TableStatus) => {
    switch(status) {
      case "free":
        return "bg-card border-border text-muted-foreground hover:border-accent hover:bg-accent/50 shadow-sm transition-all text-card-foreground";
      case "occupied":
        return "bg-primary text-primary-foreground border-primary shadow-md transform hover:-translate-y-1 transition-all";
      case "attention":
        return "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/20 animate-[pulse_2s_ease-in-out_infinite] transform hover:-translate-y-1 transition-all";
      case "ready_to_pay":
        return "bg-emerald-600 text-white border-emerald-600 shadow-md transform hover:-translate-y-1 transition-all";
      default:
        return "bg-card text-card-foreground border-border";
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch(status) {
      case "attention": return <BellRing className="h-5 w-5 animate-bounce drop-shadow-md" />;
      case "ready_to_pay": return <CheckCircle2 className="h-5 w-5 drop-shadow-md" />;
      default: return null;
    }
  };

  const openTableModal = (table: TableData) => {
    setSelectedTable(table);
    setEditForm({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    });
  };

  const calculateTotal = (diners?: Diner[]) => {
    if (!diners) return 0;
    return diners.reduce((acc, diner) => {
      const dinerTotal = diner.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return acc + dinerTotal;
    }, 0);
  };

  const handleSaveEdit = () => {
    if (!selectedTable) return;
    
    setTables(prev => prev.map(t => {
      if (t.id === selectedTable.id) {
        return {
          ...t,
          ...editForm as TableData
        };
      }
      return t;
    }));
    
    setSelectedTable(prev => prev ? { ...prev, ...editForm as TableData } : null);
  };

  const moveItemToDiner = (sourceDinerId: string, targetDinerId: string, item: OrderItem) => {
    if (!selectedTable || !selectedTable.diners) return;
    
    const updatedDiners = selectedTable.diners.map(diner => {
      // Remover del dueño original
      if (diner.id === sourceDinerId) {
        return {
          ...diner,
          items: diner.items.filter(i => i.id !== item.id)
        };
      }
      // Agregar al nuevo dueño
      if (diner.id === targetDinerId) {
        return {
          ...diner,
          items: [...diner.items, { ...item, id: `${item.id}_moved_${Date.now()}` }] // Evitamos ids duplicados si ya lo tenía
        };
      }
      return diner;
    });

    const newData = { ...selectedTable, diners: updatedDiners };
    setSelectedTable(newData);
    setTables(prev => prev.map(t => t.id === newData.id ? newData : t));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mapa de Mesas</h1>
          <p className="text-sm text-muted-foreground mt-1">Supervisa en tiempo real, gestiona pedidos y realiza cobros.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <Badge variant="outline" className="bg-card shadow-sm border-border px-3 py-1 text-sm"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 mr-2"></span> Libre</Badge>
           <Badge variant="outline" className="bg-card shadow-sm border-border px-3 py-1 text-sm"><span className="w-2 h-2 rounded-full bg-primary mr-2"></span> Ocupada</Badge>
           <Badge variant="outline" className="bg-card shadow-sm border-border px-3 py-1 text-sm"><span className="w-2 h-2 rounded-full bg-destructive mr-2 animate-pulse"></span> Atención</Badge>
           <Badge variant="outline" className="bg-card shadow-sm border-border px-3 py-1 text-sm"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Pago Listo</Badge>
        </div>
      </div>

      {/* Grilla de Mesas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {tables.map((table) => (
          <Card 
            key={table.id} 
            className={`cursor-pointer overflow-hidden border-2 rounded-2xl ${getCardStyles(table.status)}`}
            onClick={() => openTableModal(table)}
          >
            <CardContent className="p-0 flex flex-col h-full min-h-[140px] md:min-h-[160px] relative">
              
              {/* Controles de esquina superior */}
              <div className="absolute top-3 right-3 flex gap-1">
                 {getStatusIcon(table.status)}
              </div>

              {/* Centro de la tarjeta (Número de mesa) */}
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <span className="text-5xl md:text-6xl font-black mb-1 opacity-95 tracking-tighter">
                  {table.number}
                </span>
                
                {table.status === "free" && (
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-50 mt-1">Disponible</span>
                )}
                {table.status === "attention" && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-background text-foreground px-3 py-1 rounded-full backdrop-blur-md shadow-sm mt-2 border border-border/50">
                    Llamando
                  </span>
                )}
                {table.status === "ready_to_pay" && (
                  <span className="text-xs font-bold uppercase tracking-wider bg-black/20 text-white px-3 py-1 rounded-full mt-2 border border-white/10">
                    Por Cobrar
                  </span>
                )}
              </div>

              {/* Pie de la tarjeta: Datos adicionales */}
              {table.status !== "free" && (
                <div className={`text-xs px-4 py-2.5 flex justify-between items-center bg-black/15 backdrop-blur-sm w-full border-t ${table.status === 'attention' ? 'border-destructive-foreground/30 text-destructive-foreground' : 'border-white/10 text-white'}`}>
                   <div className="flex items-center gap-1.5 font-medium">
                     <Users className="w-3.5 h-3.5 opacity-80" />
                     {table.diners?.length || 1}/{table.capacity}
                   </div>
                   <div className="flex items-center gap-1.5 font-medium">
                     <Clock className="w-3.5 h-3.5 opacity-80" />
                     {table.timeActive}
                   </div>
                </div>
              )}
              {table.status === "free" && (
                <div className="text-xs px-4 py-2.5 flex justify-center items-center bg-muted/20 border-t border-border w-full text-muted-foreground font-medium">
                   Capacidad: {table.capacity} pers.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL / DIALOG PARA DETALLE Y EDICIÓN */}
      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl shadow-2xl">
          <DialogTitle className="sr-only">Detalles de Mesa {selectedTable?.number}</DialogTitle>
          <DialogDescription className="sr-only">Gestión de estado, pedidos e información de clientes para esta mesa.</DialogDescription>
          {selectedTable && (
            <>
              {/* Header Modal - Cambia de color según el estado */}
              <div className={`px-6 py-5 flex justify-between items-start 
                ${selectedTable.status === 'ready_to_pay' ? 'bg-emerald-600 text-white border-b border-emerald-700' : 
                  selectedTable.status === 'attention' ? 'bg-destructive text-destructive-foreground border-b border-destructive/50' : 
                  selectedTable.status === 'free' ? 'bg-card text-card-foreground border-b border-border' :
                  'bg-primary text-primary-foreground border-b border-primary/50'}`}
              >
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    Mesa {selectedTable.number}
                    {selectedTable.status === "attention" && <AlertCircle className="w-5 h-5 animate-pulse" />}
                  </h2>
                  <p className="text-sm font-medium opacity-80 mt-1">
                    {selectedTable.status === "ready_to_pay" ? "Checkout Solicitado" : 
                     selectedTable.status === "attention" ? "El cliente requiere atención." : 
                     selectedTable.status === "free" ? "Mesa libre y disponible" :
                     "En Consumo"}
                     {(selectedTable.timeActive && selectedTable.status !== 'free') && ` • ${selectedTable.timeActive}`}
                  </p>
                </div>
                
                {selectedTable.status !== "free" && (
                  <div className="flex bg-black/10 rounded-xl px-3 py-1.5 items-center gap-2 shadow-inner border border-black/5">
                    <Users className="w-4 h-4 opacity-70" />
                    <span className="font-bold text-sm">{selectedTable.diners?.length || 1} personas</span>
                  </div>
                )}
              </div>

              {/* Tabs para Resumen vs Editar */}
              <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-4 bg-muted/40 border-b border-border">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted border border-border">
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="edit" className="flex items-center gap-1.5">
                      <PencilIcon className="w-3.5 h-3.5" /> Estado de Mesa
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 px-6 py-4 bg-muted/20 overflow-y-auto">
                  {/* TAB: RESUMEN */}
                  <TabsContent value="summary" className="mt-0 focus-visible:outline-none">
                    
                    {selectedTable.status === "free" && (
                      <div className="text-center py-10">
                        <Armchair className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <h3 className="text-foreground font-medium">La mesa está actualmente libre.</h3>
                        <p className="text-sm text-muted-foreground">Puedes asignar clientes o reservarla desde el POS.</p>
                      </div>
                    )}

                    {/* --- SECCIÓN DE COBRO --- (Solo si está en Verde) */}
                    {selectedTable.status === "ready_to_pay" && (
                      <div className="mb-6 bg-card text-card-foreground rounded-2xl border border-border shadow-sm p-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                        <h3 className="text-emerald-700 font-bold mb-4 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" /> 
                          Resumen de Pago
                        </h3>
                        
                        <div className="flex justify-between items-end border-b border-border pb-4 mb-4">
                          <span className="text-muted-foreground font-medium">Monto Total:</span>
                          <span className="text-4xl font-black tracking-tighter text-foreground">
                            S/ {selectedTable.totalAmount?.toFixed(2) || calculateTotal(selectedTable.diners).toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-primary">Pago individualizado</p>
                            <p className="text-[13px] text-foreground/80 mt-1">
                              Los comensales de esta mesa están listos para ser cobrados. Puedes cobrar a cada persona con métodos de pago separados (tarjeta, efectivo, etc).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- SECCIÓN DE COMENSALES Y PEDIDOS --- */}
                    {selectedTable.status !== "free" && (
                      <>
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex justify-between items-center">
                          Pedidos por Comensal
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                            Total Pedidos: S/ {calculateTotal(selectedTable.diners).toFixed(2)}
                          </Badge>
                        </h3>

                        <div className="space-y-4">
                          {selectedTable.diners?.map((diner, idx) => (
                            <Card key={diner.id} className="border-border shadow-sm overflow-visible rounded-xl bg-card">
                              <div className="bg-muted/50 px-4 py-3 border-b border-border flex justify-between items-center flex-wrap gap-2">
                                <span className="font-semibold text-foreground flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold border border-border">{idx + 1}</div>
                                  {diner.name}
                                  {selectedTable.status === "ready_to_pay" && (
                                    <Select 
                                      defaultValue={diner.paymentMethod || "Efectivo"}
                                      onValueChange={(val) => {
                                        setTables(prev => prev.map(t => {
                                          if (t.id === selectedTable.id) {
                                            const newDiners = t.diners?.map(d => d.id === diner.id ? { ...d, paymentMethod: val as any } : d);
                                            const newTable = { ...t, diners: newDiners };
                                            setSelectedTable(newTable);
                                            return newTable;
                                          }
                                          return t;
                                        }));
                                      }}
                                    >
                                      <SelectTrigger className="h-7 text-xs px-2 w-[110px] bg-background border-primary/30 text-primary ml-2 shadow-sm font-semibold">
                                        <SelectValue placeholder="Pago con..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="App">Plin / Yape</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  )}
                                </span>
                                <span className="text-sm font-black text-foreground">
                                   S/ {diner.items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="px-4 py-3">
                                {diner.items.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">No hay pedidos asignados.</p>
                                ) : (
                                  <ul className="space-y-3">
                                    {diner.items.map(item => (
                                      <li key={item.id} className="flex justify-between items-start text-sm group">
                                        <span className="text-foreground flex items-center gap-2">
                                          <Badge variant="outline" className="px-1.5 py-0 text-xs font-bold bg-muted text-muted-foreground border-border">{item.quantity}x</Badge> 
                                          {item.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="text-foreground font-semibold flex items-center h-6">S/ {(item.price * item.quantity).toFixed(2)}</span>
                                          {selectedTable.diners && selectedTable.diners.length > 1 && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-7 w-7 p-0 flex items-center justify-center shrink-0 bg-muted/50 hover:bg-accent hover:text-accent-foreground rounded-md border border-border/50">
                                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-48 border-border">
                                                <DropdownMenuLabel className="text-xs text-muted-foreground">Mover a comensal...</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {selectedTable.diners.filter(d => d.id !== diner.id).map(targetDiner => (
                                                  <DropdownMenuItem 
                                                    key={targetDiner.id}
                                                    onClick={() => moveItemToDiner(diner.id, targetDiner.id, item)}
                                                    className="cursor-pointer font-medium"
                                                  >
                                                    <ArrowRightLeft className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span className="truncate">{targetDiner.name}</span>
                                                  </DropdownMenuItem>
                                                ))}
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* TAB: EDITAR */}
                  <TabsContent value="edit" className="mt-0 focus-visible:outline-none space-y-5">
                    <div className="space-y-4 bg-card p-5 rounded-xl border border-border">
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="table-status" className="text-foreground font-medium">Forzar Estado de Mesa</Label>
                        <Select 
                          value={editForm.status} 
                          onValueChange={(val: TableStatus) => setEditForm({ ...editForm, status: val })}
                        >
                          <SelectTrigger className="w-full bg-background border-border">
                            <SelectValue placeholder="Estado..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Libre</SelectItem>
                            <SelectItem value="occupied">Ocupada</SelectItem>
                            <SelectItem value="attention">Requiere Atención</SelectItem>
                            <SelectItem value="ready_to_pay">Lista para Pagar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                    </div>

                    <div className="flex justify-end pt-2">
                       <Button onClick={handleSaveEdit} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                         <Save className="w-4 h-4" />
                         Guardar Cambios
                       </Button>
                    </div>
                  </TabsContent>

                </div>

                {/* Footer Modal - Acciones Rápidas (Solo visible en Resumen y si no es free) */}
                <TabsContent value="summary" className="m-0 focus-visible:outline-none">
                  {selectedTable.status !== "free" && (
                    <div className="p-4 bg-card border-t border-border flex flex-col sm:flex-row gap-3">
                      {selectedTable.status === "ready_to_pay" ? (
                         <>
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-base h-11 transition-all hover:shadow-lg"
                            onClick={() => {
                              setSelectedTable(null);
                              // Simulate closing table -> free
                              setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: "free", diners: [] } : t));
                            }}
                          >
                            <LogOut className="w-5 h-5 mr-2" />
                            Cobrar y Liberar Mesa
                          </Button>
                         </>
                      ) : (
                         <>
                          <Button variant="outline" className="w-full sm:w-auto flex-1 font-medium hover:bg-accent hover:text-accent-foreground text-foreground border-border">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Añadir Pedido
                          </Button>
                          {selectedTable.status === "attention" && (
                             <Button 
                               className="w-full sm:w-auto flex-1 font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
                               onClick={() => {
                                 setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: "occupied", alerts: [] } : t));
                                 setSelectedTable(null);
                               }}
                             >
                               Marcar Resuelto
                             </Button>
                          )}
                         </>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

