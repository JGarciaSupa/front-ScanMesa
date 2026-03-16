import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Loader2, Pencil, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  searchTerm: string;
  onToggleActive: (id: number, currentState: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onDragEnd: (result: any) => void;
}

export function CategoryTable({
  categories,
  loading,
  searchTerm,
  onToggleActive,
  onEdit,
  onDelete,
  onDragEnd,
}: CategoryTableProps) {
  return (
    <div className="bg-background border rounded-xl overflow-hidden shadow-sm">
      <DragDropContext onDragEnd={onDragEnd}>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">
                Descripción
              </TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="categories">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={loading ? "opacity-50 pointer-events-none" : ""}
              >
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">
                          Cargando categorías...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : categories.length > 0 ? (
                  categories.map((category, index) => (
                    <Draggable
                      key={category.id}
                      draggableId={category.id.toString()}
                      index={index}
                      isDragDisabled={!!searchTerm}
                    >
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group hover:bg-muted/20 transition-colors ${snapshot.isDragging ? "bg-muted shadow-lg ring-1 ring-primary/20 z-50 display-table" : ""}`}
                          style={{
                            ...provided.draggableProps.style,
                            display: snapshot.isDragging ? "table" : "table-row",
                          }}
                        >
                          <TableCell className="text-center p-0 align-middle">
                            <div
                              {...provided.dragHandleProps}
                              className={`flex items-center justify-center p-2 text-muted-foreground/50 group-hover:text-muted-foreground active:cursor-grabbing rounded-md ${!!searchTerm ? "cursor-not-allowed opacity-30" : "cursor-grab"}`}
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">
                            {category.name}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                            {category.description || (
                              <span className="italic text-muted-foreground/50">
                                Sin descripción
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={category.isActive}
                                onCheckedChange={() =>
                                  onToggleActive(category.id, category.isActive)
                                }
                                className="scale-90"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-muted"
                                onClick={() => onEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10"
                                onClick={() => onDelete(category)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No se encontraron categorías.
                    </TableCell>
                  </TableRow>
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </div>
  );
}
