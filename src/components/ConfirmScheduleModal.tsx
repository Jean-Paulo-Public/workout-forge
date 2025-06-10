
"use client";

import { useId } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfirmScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutName: string;
  // deadline and daysForDeadline are now part of the workoutData passed to the library page
  // We'll receive the initially calculated deadline and the daysForDeadline that led to it.
  initialDeadlineISO: string | undefined; 
  initialDaysForDeadline: number | undefined;
  suggestedRepeatFrequencyDays: number | undefined; // For availability on mat
  onConfirm: (useSuggestedDeadlineAndDays: boolean, useSuggestedRepeatFrequency: boolean) => void;
}

export function ConfirmScheduleModal({
  isOpen,
  onClose,
  workoutName,
  initialDeadlineISO,
  initialDaysForDeadline,
  suggestedRepeatFrequencyDays,
  onConfirm,
}: ConfirmScheduleModalProps) {
  const descriptionId = useId();

  const handleConfirmWithSuggestions = () => {
    onConfirm(true, true);
  };

  const handleConfirmWithoutSuggestions = () => {
    onConfirm(false, false);
  };
  
  const handleConfirmOnlyDeadline = () => {
    onConfirm(true, false);
  };

  const handleConfirmOnlyFrequency = () => {
    onConfirm(false, true);
  };


  let deadlineText = "Nenhum deadline sugerido.";
  if (initialDeadlineISO && initialDaysForDeadline) {
    deadlineText = `Sugerimos um deadline em ${format(parseISO(initialDeadlineISO), "PPP", { locale: ptBR })} (definido por ${initialDaysForDeadline} 'Dias para Deadline').`;
  } else if (initialDeadlineISO) {
    deadlineText = `Sugerimos um deadline em ${format(parseISO(initialDeadlineISO), "PPP", { locale: ptBR })}.`;
  }

  let frequencyText = "Nenhuma frequência de descanso mínimo sugerida.";
  if (suggestedRepeatFrequencyDays) {
    frequencyText = `Sugerimos ${suggestedRepeatFrequencyDays} dia(s) de descanso mínimo (para disponibilidade na esteira).`;
  }

  const descriptionText = `Para o treino "${workoutName}": ${deadlineText} ${frequencyText} Deseja aplicar estas sugestões?`;
  
  const canUseDeadlineSuggestion = !!initialDeadlineISO;
  const canUseFrequencySuggestion = !!suggestedRepeatFrequencyDays;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Agendar Treino Modelo</DialogTitle>
          <DialogDescription id={descriptionId}>
            {descriptionText}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Cancelar Criação</Button>
          <Button variant="secondary" onClick={handleConfirmWithoutSuggestions} className="w-full sm:w-auto">Não, deixar em branco</Button>
          {canUseDeadlineSuggestion && !canUseFrequencySuggestion && (
            <Button onClick={handleConfirmOnlyDeadline} className="w-full sm:w-auto">Sim, usar Deadline</Button>
          )}
          {!canUseDeadlineSuggestion && canUseFrequencySuggestion && (
            <Button onClick={handleConfirmOnlyFrequency} className="w-full sm:w-auto">Sim, usar Descanso Mínimo</Button>
          )}
          {canUseDeadlineSuggestion && canUseFrequencySuggestion && (
            <Button onClick={handleConfirmWithSuggestions} className="w-full sm:w-auto">Sim, usar ambas sugestões</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

