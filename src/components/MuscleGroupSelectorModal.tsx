
"use client";

import { useState, useEffect, useId } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MuscleGroupSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedGroups: string[];
  onSave: (selectedGroups: string[]) => void;
}

const ALL_MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
  'Pernas (Quadríceps)', 'Pernas (Posteriores)', 'Glúteos', 'Panturrilhas', 
  'Abdômen', 'Antebraço', 'Lombar', 'Trapézio', 'Cardio'
];

export function MuscleGroupSelectorModal({ isOpen, onClose, initialSelectedGroups, onSave }: MuscleGroupSelectorModalProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(initialSelectedGroups);
  const descriptionId = useId();

  useEffect(() => {
    setSelectedGroups(initialSelectedGroups);
  }, [initialSelectedGroups, isOpen]);

  const handleGroupToggle = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleSave = () => {
    onSave(selectedGroups);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Selecionar Grupos Musculares</DialogTitle>
          <DialogDescription id={descriptionId}>
            Marque os principais grupos musculares trabalhados neste exercício.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4 my-4">
            <div className="grid grid-cols-2 gap-4">
            {ALL_MUSCLE_GROUPS.map(group => (
                <div key={group} className="flex items-center space-x-2">
                <Checkbox
                    id={`mg-${group}`}
                    checked={selectedGroups.includes(group)}
                    onCheckedChange={() => handleGroupToggle(group)}
                />
                <Label htmlFor={`mg-${group}`} className="text-sm font-normal cursor-pointer">
                    {group}
                </Label>
                </div>
            ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar Seleção</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
