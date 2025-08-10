"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
}

/**
 * Renders a searchable dropdown combobox for selecting an option from a list.
 *
 * Displays the selected option's label or a placeholder, and allows users to filter and choose options via a popover. Selecting an already-selected option clears the selection. The component provides customizable placeholders for the main button, search input, and empty state.
 *
 * @param options - The list of selectable options, each with a value and label.
 * @param value - The currently selected option's value, or undefined if none is selected.
 * @param onChange - Callback invoked with the new value when the selection changes, or an empty string if the selection is cleared.
 * @param placeholder - Placeholder text shown when no option is selected.
 * @param searchPlaceholder - Placeholder text for the search input field.
 * @param emptyPlaceholder - Text displayed when no options match the search.
 * @returns The combobox React element.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No options found.",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? "combobox-list" : undefined}
          className="w-full justify-between"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  aria-selected={value === option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? null : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
