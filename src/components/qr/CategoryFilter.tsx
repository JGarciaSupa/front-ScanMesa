"use client";

import { cn } from '@/lib/utils';
import { Button } from '../ui/button'
import { useState } from 'react';

interface PropsCategoryFilter {
  categories: {
    id: number,
    name: string
  }[]
}

export default function CategoryFilter({ categories }: PropsCategoryFilter) {

  const [ activeCategory, setActiveCategory ] = useState("all");

  return (
    <div className="flex items-center gap-2 p-4 pb-3 w-max">
      { categories.map(cat => (
        <Button
          key={cat.id}
          variant={activeCategory === cat.name ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(cat.name)}
          className={cn(
            "rounded-full text-xs font-medium px-4 h-8 shrink-0 transition-all duration-200",
            activeCategory === cat.name
              ? "bg-stone-900 text-white border-stone-900 shadow-sm"
              : "bg-transparent text-stone-500 border-stone-200 hover:text-stone-900 hover:border-stone-900"
          )}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
