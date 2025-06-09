
"use client";

import { useId } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { modelExerciseData } from "@/lib/model-exercises"; // Atualizado para o novo caminho

interface ModelExerciseCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
}

const categories = Object.keys(modelExerciseData);

export function ModelExerciseCategoryModal({ isOpen, onClose, onSelectCategory }: ModelExerciseCategoryModalProps) {
  const descriptionId = useId();
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Selecionar Categoria de Exercício Modelo</DialogTitle>
          <DialogDescription id={descriptionId}>
            Escolha uma categoria para ver os exercícios modelo disponíveis.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {categories.map(category => (
            <Button
              key={category}
              variant="outline"
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
