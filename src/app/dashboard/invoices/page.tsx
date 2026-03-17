"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Search,
  MoreHorizontal,
  Eye,
  Printer,
  Euro,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getInvoicesAction,
  getInvoiceDetailsAction,
  getInvoiceStatsAction,
} from "@/app/actions/invoices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DateTime } from "luxon";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [serverStats, setServerStats] = useState({
    totalRecaudado: 0,
    totalVentas: 0,
    ticketPromedio: 0
  });

  const fetchInvoices = async () => {
    setLoading(true);
    const [invoicesRes, statsRes] = await Promise.all([
      getInvoicesAction({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm
      }),
      getInvoiceStatsAction({ search: searchTerm })
    ]);
    
    if (invoicesRes.success) {
      setInvoices(invoicesRes.items || []);
      setTotalItems(invoicesRes.total || 0);
    }

    if (statsRes.success) {
      setServerStats(statsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, itemsPerPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchInvoices();
      } else {
        setCurrentPage(1); // This will trigger the fetch due to the dependency [currentPage]
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewDetails = async (id: number) => {
    const res = await getInvoiceDetailsAction(id);
    if (res.success) {
      setSelectedInvoice(res.data);
      setIsDetailsOpen(true);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const stats = serverStats;

  const formatShortDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr).setLocale("es").toFormat("dd MMM, HH:mm");
  };

  const formatLongDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr)
      .setLocale("es")
      .toFormat("cccc d 'de' MMMM, HH:mm");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">
          Registro de Ventas
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchInvoices} disabled={loading}>
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recaudado
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRecaudado)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingreso total acumulado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVentas}</div>
            <p className="text-xs text-muted-foreground">Ventas realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.ticketPromedio)}
            </div>
            <p className="text-xs text-muted-foreground">Promedio por venta</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center py-2 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket, mesa o cliente..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Pagó por</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Cargando ventas...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron ventas.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.saleCode}
                  </TableCell>
                  <TableCell>
                    {invoice.issuedAt
                      ? formatShortDate(invoice.issuedAt)
                      : "N/A"}
                  </TableCell>
                  <TableCell>{invoice.tableName || "N/A"}</TableCell>
                  <TableCell>{invoice.payerName || "Anónimo"}</TableCell>
                  <TableCell className="font-bold text-slate-900 text-nowrap">
                    {formatPrice(invoice.totalAmount || "0")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(invoice.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" /> Imprimir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t bg-muted/5 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filas por página</p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-fit min-w-[60px]">
                  <SelectValue placeholder={itemsPerPage} />
                </SelectTrigger>
                <SelectContent side="top" className="min-w-[60px]">
                  {[5, 10, 20, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Mostrando {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(totalItems, currentPage * itemsPerPage)} de {totalItems}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center text-sm font-medium px-2">
              Pág. {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detalle de Factura */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Detalle de Venta {selectedInvoice?.saleCode}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice?.issuedAt &&
                formatLongDate(selectedInvoice.issuedAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                <div>
                  <span className="text-muted-foreground block">Mesa</span>
                  <span className="font-medium">
                    {selectedInvoice.tableName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    Pagado por
                  </span>
                  <span className="font-medium">
                    {selectedInvoice.payerName || "Anónimo"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Productos consumidos</h4>
                <div className="space-y-1">
                  {selectedInvoice.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <span className="font-medium">{item.quantity}x</span>{" "}
                        {item.productName}
                        <p className="text-xs text-muted-foreground">
                          Pidió: {item.guestName}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatPrice(
                          item.quantity * parseFloat(item.priceAtTime || "0"),
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedInvoice.subtotal || "0")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>{formatPrice(selectedInvoice.taxAmount || "0")}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(selectedInvoice.totalAmount || "0")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
