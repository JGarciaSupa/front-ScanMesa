import React from "react";
import { DateTime } from "luxon";
import { formatPrice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface InvoiceDetailsProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  invoice: any;
}

export function InvoiceDetails({ isOpen, onClose, invoice }: InvoiceDetailsProps) {
  const formatLongDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr)
      .setLocale("es")
      .toFormat("cccc d 'de' MMMM, HH:mm");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Detalle de Venta {invoice?.saleCode}
          </DialogTitle>
          <DialogDescription>
            {invoice?.issuedAt &&
              formatLongDate(invoice.issuedAt)}
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-4 -mr-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
              <div>
                <span className="text-muted-foreground block">Mesa</span>
                <span className="font-medium">
                  {invoice.tableName || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Pagado por
                </span>
                <span className="font-medium">
                  {invoice.payerName || "Anónimo"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Productos consumidos</h4>
              <div className="space-y-1">
                {invoice.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{item.quantity}x</span>{" "}
                      <span className="break-words">{item.productName}</span>
                      <p className="text-xs text-muted-foreground truncate">
                        Pidió: {item.guestName}
                      </p>
                    </div>
                    <span className="font-medium whitespace-nowrap shrink-0">
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
                <span>{formatPrice(invoice.subtotal || "0")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span>{formatPrice(invoice.taxAmount || "0")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">
                  {formatPrice(invoice.totalAmount || "0")}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
