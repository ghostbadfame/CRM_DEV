"use client";
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Label } from "./label";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "./calendar";

interface CustomCalendarProps {
  date?: string | null;
  onDateChange: (date: string) => void;
  label: string;
  readMode?: boolean;
  disabled?: boolean;
  dateFormat?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  date,
  onDateChange,
  label,
  readMode = false,
  disabled = false,
  dateFormat = "PPP",
}) => {
  const [calOpen, setCalOpen] = useState(false);

  const handleDayClick = (date: Date) => {
    onDateChange(date.toISOString());
    setCalOpen(false);
  };

  return (
    <Popover
      open={calOpen && !disabled}
      onOpenChange={(open) => setCalOpen(open)}
    >
      <PopoverTrigger asChild>
        <div className="grid gap-2">
          <Label htmlFor="datePicker">{label}</Label>
          <Button
            variant="outline"
            className={`justify-start text-left font-normal ${
              !date ? "text-muted-foreground" : ""
            }`}
            type="button"
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(new Date(date), dateFormat)
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          selected={date ? new Date(date) : undefined}
          onDayClick={handleDayClick}
          disabled={readMode}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CustomCalendar;
