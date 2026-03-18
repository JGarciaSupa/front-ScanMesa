import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function InvoiceFilters({ searchTerm, setSearchTerm }: InvoiceFiltersProps) {
  return (
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
  );
}
