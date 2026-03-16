import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function StaffFilters({ 
  activeTab, 
  onTabChange, 
  searchQuery, 
  onSearchChange 
}: StaffFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="admin">Administradores</TabsTrigger>
          <TabsTrigger value="waiter">Camareros</TabsTrigger>
          <TabsTrigger value="kitchen">Cocineros</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative w-full md:w-80 shadow-sm group">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          type="search" 
          placeholder="Buscar por nombre o correo..." 
          className="pl-9 bg-background focus-visible:ring-primary/20" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
