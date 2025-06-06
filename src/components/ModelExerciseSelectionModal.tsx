
"use client";

import type { ModelExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription as ExerciseCardDescription, CardHeader, CardTitle as ExerciseCardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface ModelExerciseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  exercises: ModelExercise[];
  onSelectExercise: (exercise: ModelExercise) => void;
}

export function ModelExerciseSelectionModal({ isOpen, onClose, category, exercises, onSelectExercise }: ModelExerciseSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Selecionar Exercício Modelo: {category}</DialogTitle>
          <DialogDescription>
            Escolha um exercício para adicionar ao seu treino. A descrição será adicionada como observação.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] my-4 pr-3">
          <div className="space-y-3">
            {exercises.length === 0 ? (
              <p className="text-muted-foreground text-center">Nenhum exercício modelo encontrado para esta categoria.</p>
            ) : (
              exercises.map(exercise => (
                <Card key={exercise.name} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <ExerciseCardTitle className="text-lg font-semibold">{exercise.name}</ExerciseCardTitle>
                    {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                        <Target className="h-3 w-3" />
                        {exercise.muscleGroups.join(', ')}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <ExerciseCardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {exercise.description}
                    </ExerciseCardDescription>
                     {exercise.defaultWeight && (
                        <p className="text-xs text-muted-foreground">Peso Sugerido: {exercise.defaultWeight}</p>
                    )}
                    <Button size="sm" onClick={() => onSelectExercise(exercise)} className="w-full">
                      Adicionar este Exercício
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
