
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { workoutTemplates } from "@/lib/workout-templates";
import { ScrollArea } from "./ui/scroll-area";

interface WorkoutTemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateKey: string) => void;
}

const templateCategories = Object.keys(workoutTemplates);

export function WorkoutTemplateSelectionModal({ isOpen, onClose, onSelectTemplate }: WorkoutTemplateSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Adicionar Treino via Modelo</DialogTitle>
          <DialogDescription>
            Escolha um modelo de treino para adicionar rapidamente à sua biblioteca.
            Os exercícios usarão suas configurações padrão de séries e repetições.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[40vh] my-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-3">
            {templateCategories.map(categoryKey => (
              <Button
                key={categoryKey}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => {
                  onSelectTemplate(categoryKey);
                  onClose(); // Close modal after selection
                }}
              >
                <div>
                  <p className="font-semibold">{workoutTemplates[categoryKey].name.replace("Treino Modelo - ", "")}</p>
                  <p className="text-xs text-muted-foreground font-normal">{workoutTemplates[categoryKey].description}</p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
