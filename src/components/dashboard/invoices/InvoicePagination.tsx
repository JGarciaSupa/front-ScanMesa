import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoicePaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export function InvoicePagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}: InvoicePaginationProps) {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t bg-muted/5 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Filas por página
          </p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              onItemsPerPageChange(Number(value));
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
          Mostrando {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} -{" "}
          {Math.min(totalItems, currentPage * itemsPerPage)} de {totalItems}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
