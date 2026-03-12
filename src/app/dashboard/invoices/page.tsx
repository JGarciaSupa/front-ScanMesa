import React from "react";
import { 
  Download, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Printer, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  CreditCard 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const INVOICES_DATA = [
  {
    id: "#INV-001",
    date: "15 Oct, 2025",
    client: "Juan Pérez",
    table: "Mesa 7",
    method: "Tarjeta",
    total: 45.00,
    status: "Pagado",
  },
  {
    id: "#INV-002",
    date: "15 Oct, 2025",
    client: "María Gómez",
    table: "Mesa 2",
    method: "Efectivo",
    total: 12.50,
    status: "Pendiente",
  },
  {
    id: "#INV-003",
    date: "14 Oct, 2025",
    client: "Cliente Anónimo",
    table: "Mesa 12",
    method: "Tarjeta",
    total: 89.90,
    status: "Pagado",
  },
  {
    id: "#INV-004",
    date: "14 Oct, 2025",
    client: "Carlos Ruiz",
    table: "Para llevar",
    method: "Efectivo",
    total: 25.00,
    status: "Cancelado",
  },
];

export default function InvoicesPage() {
  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Facturación y Ventas</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar a Excel/PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recaudado Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 1,245.00</div>
            <p className="text-xs text-muted-foreground">+15% respecto a ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Cobro</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 150.00</div>
            <p className="text-xs text-muted-foreground">4 mesas abiertas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ 32.50</div>
            <p className="text-xs text-muted-foreground">+2% respecto al mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket o cliente..."
            className="pl-8"
          />
        </div>
        <Select defaultValue="todos">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="pagado">Pagado</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 border border-input rounded-md px-3 h-9 bg-transparent shadow-xs w-full sm:w-auto">
          <Input 
            type="date" 
            className="border-0 p-0 h-auto w-full min-w-[130px] bg-transparent shadow-none focus-visible:ring-0 text-sm" 
            defaultValue={new Date().toISOString().split('T')[0]}
            aria-label="Filtrar por fecha"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Ticket</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVOICES_DATA.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No se encontraron facturas.
                </TableCell>
              </TableRow>
            ) : (
              INVOICES_DATA.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.table}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-muted-foreground whitespace-nowrap">
                      {invoice.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">€ {invoice.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        invoice.status === "Pagado" ? "default" : 
                        invoice.status === "Pendiente" ? "secondary" : 
                        "destructive"
                      }
                      className={
                        invoice.status === "Pagado" ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" :
                        invoice.status === "Pendiente" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" :
                        ""
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Ver detalle</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Re-imprimir</span>
                        </DropdownMenuItem>
                        {invoice.status !== "Cancelado" && (
                          <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 dark:focus:text-red-300">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Anular</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
