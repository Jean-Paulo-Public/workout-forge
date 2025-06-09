
"use client";

import { useId } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConfirmScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutName: string;
  suggestedDeadlineISO: string | undefined;
  suggestedFrequencyDays: number | undefined;
  onConfirm: (useSuggestions: boolean) => void;
}

export function ConfirmScheduleModal({
  isOpen,
  onClose,
  workoutName,
  suggestedDeadlineISO,
  suggestedFrequencyDays,
  onConfirm,
}: ConfirmScheduleModalProps) {
  const descriptionId = useId();

  const handleConfirm = () => {
    onConfirm(true);
  };

  const handleDecline = () => {
    onConfirm(false);
  };

  let descriptionText = `Deseja definir um deadline e uma frequência de repetição para o treino "${workoutName}"?`;
  const hasSuggestions = suggestedDeadlineISO || suggestedFrequencyDays;

  if (suggestedDeadlineISO && suggestedFrequencyDays) {
    descriptionText = `Para o treino "${workoutName}", sugerimos um deadline em ${format(new Date(suggestedDeadlineISO), "PPP", { locale: ptBR })} (repetindo a cada ${suggestedFrequencyDays} dia(s)). Deseja usar essas sugestões?`;
  } else if (suggestedDeadlineISO) {
     descriptionText = `Para o treino "${workoutName}", sugerimos um deadline em ${format(new Date(suggestedDeadlineISO), "PPP", { locale: ptBR })}. A frequência de repetição não foi sugerida automaticamente. Deseja aplicar apenas o deadline?`;
  } else if (suggestedFrequencyDays) {
    descriptionText = `Para o treino "${workoutName}", sugerimos uma frequência de repetição a cada ${suggestedFrequencyDays} dia(s). O deadline não foi sugerido automaticamente. Deseja aplicar apenas a frequência?`;
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Agendar Treino Modelo</DialogTitle>
          <DialogDescription id={descriptionId}>
            {descriptionText}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar Criação</Button>
          <Button variant="secondary" onClick={handleDecline}>Não, deixar em branco</Button>
          <Button onClick={handleConfirm} disabled={!hasSuggestions}>Sim, usar sugestões</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
