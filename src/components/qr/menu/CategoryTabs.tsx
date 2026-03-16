"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Category {
  id: number;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: number;
  onSelectCategory: (id: number) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory
}: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-stone-200/60 py-3">
      <div className="max-w-7xl mx-auto">
        <ScrollArea className="w-full">
          <div className="flex w-max space-x-2 px-4 pb-2">
            <Button
              variant={selectedCategoryId === 0 ? "default" : "secondary"}
              className={`rounded-full px-5 font-medium transition-all ${
                selectedCategoryId === 0 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-stone-200"
              }`}
              onClick={() => onSelectCategory(0)}
            >
              Todos
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "secondary"}
                className={`rounded-full px-5 font-medium transition-all ${
                  selectedCategoryId === cat.id 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-stone-200"
                }`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </div>
  );
}
