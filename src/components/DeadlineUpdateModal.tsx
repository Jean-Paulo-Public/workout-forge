
"use client";

import { useState, useEffect, useId } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, startOfToday, parseISO, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { CalendarIcon } from 'lucide-react';
import type { Workout } from '@/lib/types';

interface DeadlineUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout;
  onSave: (workoutId: string, newDeadline?: Date) => void;
}

export function DeadlineUpdateModal({ isOpen, onClose, workout, onSave }: DeadlineUpdateModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [minDate, setMinDate] = useState<Date>(startOfToday());
  const descriptionId = useId();

  useEffect(() => {
    if (isOpen && workout) {
      const today = startOfToday();
      let suggestedNewDeadline = today; // Default to today if no daysForDeadline

      if (workout.daysForDeadline && workout.daysForDeadline > 0) {
        suggestedNewDeadline = addDays(today, workout.daysForDeadline);
      } else if (workout.deadline) {
        // If no daysForDeadline but an old deadline exists,
        // and it's in the past, suggest today. Otherwise, keep current or suggest today.
        const currentDeadlineDate = parseISO(workout.deadline);
        suggestedNewDeadline = isBefore(currentDeadlineDate, today) ? today : currentDeadlineDate;
      }
      
      // The minimum date should generally be today for a new deadline.
      // Or, if daysForDeadline dictates a future date, that date.
      const calculatedMinDate = workout.daysForDeadline && workout.daysForDeadline > 0 
                               ? addDays(today, workout.daysForDeadline)
                               : today;

      setMinDate(isBefore(calculatedMinDate, today) ? today : calculatedMinDate); // Ensure minDate is not in the past

      // Set initial selected date
      setSelectedDate(suggestedNewDeadline);
    }
  }, [isOpen, workout]);

  const handleSave = () => {
    onSave(workout.id, selectedDate);
    onClose();
  };

  const handleRemoveDeadline = () => {
    onSave(workout.id, undefined); 
    onClose();
  }

  if (!workout) return null;

  const deadlineDescription = workout.daysForDeadline 
    ? `Sugerimos um novo deadline com base nos 'Dias para Deadline' definidos para este treino (${workout.daysForDeadline} dia(s)).`
    : `O treino foi concluído. Defina um novo deadline ou remova o existente.`;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Atualizar Deadline para "{workout.name}"</DialogTitle>
          <DialogDescription id={descriptionId}>
            {deadlineDescription} Você pode confirmar, alterar a data abaixo ou remover o deadline.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                    <span>Escolha uma data</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, minDate) && !isEqual(date, minDate)}
                    initialFocus
                    locale={ptBR}
                />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            A data mínima para o novo deadline é {format(minDate, "PPP", { locale: ptBR })}.
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="ghost" onClick={handleRemoveDeadline}>Remover Deadline</Button>
          <Button onClick={handleSave} disabled={!selectedDate}>Salvar Novo Deadline</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function, in case it's needed elsewhere or for consistency.
function isEqual(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

