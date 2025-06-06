
"use client";

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (isOpen && workout) {
      const today = startOfToday();
      let suggestedMinDate = today;
      if (workout.repeatFrequencyDays && workout.repeatFrequencyDays > 0) {
        suggestedMinDate = addDays(today, workout.repeatFrequencyDays);
      }
      
      setMinDate(suggestedMinDate);

      // Set initial selected date
      if (workout.deadline) {
        const currentDeadline = parseISO(workout.deadline);
        // If current deadline is in the past, or before new minDate, suggest new minDate
        if (isBefore(currentDeadline, suggestedMinDate)) {
          setSelectedDate(suggestedMinDate);
        } else {
          setSelectedDate(currentDeadline);
        }
      } else {
        setSelectedDate(suggestedMinDate);
      }
    }
  }, [isOpen, workout]);

  const handleSave = () => {
    onSave(workout.id, selectedDate);
    onClose();
  };

  const handleRemoveDeadline = () => {
    onSave(workout.id, undefined); // Pass undefined to remove deadline
    onClose();
  }

  if (!workout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Atualizar Deadline para "{workout.name}"</DialogTitle>
          <DialogDescription>
            O treino foi concluído. Sugerimos um novo deadline com base na sua frequência de repetição de {workout.repeatFrequencyDays} dia(s).
            Você pode confirmar ou alterar a data abaixo, ou remover o deadline.
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
            A data mínima para o novo deadline é {format(minDate, "PPP", { locale: ptBR })}, considerando a frequência de repetição do treino.
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
