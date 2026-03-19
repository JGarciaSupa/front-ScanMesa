"use client";

import React, { useState } from "react";
import { Download, CalendarIcon } from "lucide-react";
import { DateTime } from "luxon";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getInvoicesAction } from "@/app/actions/invoices";

interface ReportModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  searchTerm: string;
}

export function ReportModal({ isOpen, onClose, searchTerm }: ReportModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Usar Luxon para manejar correctamente las zonas horarias
      const startISO = startDate ? DateTime.fromJSDate(startDate).startOf("day").toISO() : "";
      const endISO = endDate ? DateTime.fromJSDate(endDate).endOf("day").toISO() : "";

      // Fetch ALL invoices for the report, not just the paged ones
      const allInvoicesRes = await getInvoicesAction({
        limit: 5000, // Large enough for most reports
        search: searchTerm,
        startDate: startISO || undefined,
        endDate: endISO || undefined
      });

      if (allInvoicesRes.success) {
        const dataToExport = allInvoicesRes.items.map((inv: any) => ({
          "Código": inv.saleCode,
          "Cliente": inv.payerName || "S/N",
          "Mesa": inv.tableName,
          "Total": parseFloat(inv.totalAmount),
          "Fecha": inv.issuedAt ? DateTime.fromISO(inv.issuedAt).setLocale("es").toFormat("dd/MM/yyyy HH:mm") : "N/A"
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte de Ventas");
        
        // Generate filename with date
        const filename = `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        onClose(false);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Descargar Reporte</DialogTitle>
          <DialogDescription>
            Selecciona un rango de fechas para generar el reporte de ventas en Excel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Desde
            </label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Hasta
            </label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : <span>Selecciona fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={loading}>
            {loading ? "Generando..." : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
