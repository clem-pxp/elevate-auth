"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import CalendarIcon from "@/components/Icons/CalendarIcon"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ 
  date, 
  onDateChange, 
  placeholder = "Sélectionner une date",
  disabled = false
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal shadow-base bg-white h-10 border-[0.5px] border-input"
          disabled={disabled}
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, "dd/MM/yyyy", { locale: fr }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar 
          mode="single" 
          selected={date} 
          onSelect={onDateChange}
          locale={fr}
          captionLayout="dropdown" // ⬅️ AJOUT ICI
          fromYear={1950} // ⬅️ AJOUT ICI
          toYear={new Date().getFullYear()} // ⬅️ AJOUT ICI
        />
      </PopoverContent>
    </Popover>
  )
}