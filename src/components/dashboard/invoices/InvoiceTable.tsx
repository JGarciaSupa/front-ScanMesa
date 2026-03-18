
import { Eye } from "lucide-react";
import { DateTime } from "luxon";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceTableProps {
  invoices: any[];
  loading: boolean;
  onViewDetails: (id: number) => void;
}

export function InvoiceTable({ invoices, loading, onViewDetails }: InvoiceTableProps) {
  const formatShortDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr).setLocale("es").toFormat("dd MMM, HH:mm");
  };

  return (
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewDetails(invoice.id)}
                    title="Ver detalle"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
