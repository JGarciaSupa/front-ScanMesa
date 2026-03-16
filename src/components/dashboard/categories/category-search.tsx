import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CategorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function CategorySearch({ searchTerm, onSearchChange }: CategorySearchProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-muted/50">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categoría por nombre..."
          className="pl-9 h-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
