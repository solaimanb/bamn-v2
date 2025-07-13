'use client';

import { memo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterOption } from '@/constants/filters';

interface FilterSelectProps {
  options: FilterOption[];
  value?: string[];
  placeholder?: string;
  emptyMessage?: string;
  onSelect: (value: string) => void;
  isSelected?: (value: string) => boolean;
}

export const FilterSelect = memo(function FilterSelect({
  options,
  value = [],
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  onSelect,
  isSelected
}: FilterSelectProps) {
  const groupedOptions = options.reduce<Record<string, FilterOption[]>>((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {});

  return (
    <Command 
      className="rounded-lg border shadow-sm"
      aria-label={`Filter select with ${value.length} items selected`}
    >
      <CommandInput placeholder={placeholder} />
      <CommandEmpty>{emptyMessage}</CommandEmpty>
      <ScrollArea className="h-40">
        {Object.entries(groupedOptions).map(([group, items]) => (
          <CommandGroup key={group} heading={group !== 'default' ? group : undefined}>
            {items.map((option) => (
              <CommandItem
                key={option.id}
                value={option.value}
                onSelect={() => onSelect(option.value)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded-sm border transition-colors ${
                      isSelected?.(option.value) ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                  <span>{option.label}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </ScrollArea>
    </Command>
  );
}); 