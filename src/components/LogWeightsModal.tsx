
"use client";

// This component is no longer used and can be deleted.
// Its functionality has been superseded by TrackWorkoutModal.tsx.

// Keeping the file to avoid breaking imports if any exist, but it's deprecated.
// To fully remove, delete this file and remove any import statements referencing it.

import { useEffect, useId } from 'react'; // Added useId for consistency if ever reactivated
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Workout, WorkoutSession, SessionExercisePerformance, Exercise } from '@/lib/types';
import { Save } from 'lucide-react';

const performanceSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  plannedWeight: z.string().optional(),
  weightUsed: z.string().optional().default("0"), 
});

const logWeightsFormSchema = z.object({
  performances: z.array(performanceSchema),
});

type LogWeightsFormData = z.infer<typeof logWeightsFormSchema>;

interface LogWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: Workout | undefined; 
  session: WorkoutSession | undefined; 
  onSave: (performances: SessionExercisePerformance[]) => void;
}

export function LogWeightsModal({ isOpen, onClose, workout, session, onSave }: LogWeightsModalProps) {
  const form = useForm<LogWeightsFormData>({
    resolver: zodResolver(logWeightsFormSchema),
    defaultValues: {
      performances: [],
    },
  });
  const descriptionId = useId();

  const { fields } = useFieldArray({
    control: form.control,
    name: "performances",
  });

  useEffect(() => {
    if (isOpen && workout && session) {
      const initialPerformances = workout.exercises.map(exercise => {
        const existingPerf = session.exercisePerformances?.find(p => p.exerciseId === exercise.id);
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          plannedWeight: exercise.weight || "0",
          weightUsed: existingPerf?.weightUsed || exercise.weight || "0",
        };
      });
      form.reset({ performances: initialPerformances });
    }
  }, [isOpen, workout, session, form]);

  const handleSubmit = (data: LogWeightsFormData) => {
    onSave(data.performances.map(p => ({
        exerciseId: p.exerciseId,
        exerciseName: p.exerciseName,
        plannedWeight: p.plannedWeight,
        weightUsed: p.weightUsed || "0", 
    })));
    onClose();
  };

  if (!workout || !session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Pesos Utilizados: {workout.name}</DialogTitle>
          <DialogDescription id={descriptionId}>
            Confirme ou atualize os pesos que você utilizou para cada exercício nesta sessão.
            O valor padrão é o peso planejado no treino ou "0" se não especificado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[50vh] my-4 pr-3">
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <FormField
                      control={form.control}
                      name={`performances.${index}.weightUsed`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">{form.getValues(`performances.${index}.exerciseName`)}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={form.getValues(`performances.${index}.plannedWeight`) || "0"}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground mt-1">
                            Peso Planejado: {form.getValues(`performances.${index}.plannedWeight`) || "N/A"}
                          </p>
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> Salvar Pesos e Concluir Treino
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`border rounded-md ${className}`}>
    {children}
  </div>
);
