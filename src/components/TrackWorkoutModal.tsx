
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Workout, WorkoutSession, SessionExercisePerformance } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { Flame, CheckCircle2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';

const exercisePerformanceSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  hasWarmup: z.boolean().optional(),
  isWarmupCompleted: z.boolean().optional(),
  weightUsed: z.string().optional(),
  isExerciseCompleted: z.boolean().optional(),
  plannedWeight: z.string().optional(),
  lastUsedWeight: z.string().optional(),
});

const trackWorkoutFormSchema = z.object({
  performances: z.array(exercisePerformanceSchema),
});

type TrackWorkoutFormData = z.infer<typeof trackWorkoutFormSchema>;

interface TrackWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkoutSession;
  workout: Workout;
  onWorkoutFinallyCompleted: () => void;
}

export function TrackWorkoutModal({ isOpen, onClose, session, workout, onWorkoutFinallyCompleted }: TrackWorkoutModalProps) {
  const { updateSessionExercisePerformance, completeSession, getLastUsedWeightForExercise } = useAppContext();

  const form = useForm<TrackWorkoutFormData>({
    resolver: zodResolver(trackWorkoutFormSchema),
    defaultValues: {
      performances: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "performances",
  });

  useEffect(() => {
    if (isOpen && session && workout) {
      const initialPerformances = workout.exercises.map(exercise => {
        const currentPerf = session.exercisePerformances.find(p => p.exerciseId === exercise.id);
        const lastUsedWeight = getLastUsedWeightForExercise(workout.id, exercise.id);

        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          hasWarmup: exercise.hasWarmup || false,
          isWarmupCompleted: currentPerf?.isWarmupCompleted ?? false,
          weightUsed: currentPerf?.weightUsed ?? lastUsedWeight ?? exercise.weight ?? "0",
          isExerciseCompleted: currentPerf?.isExerciseCompleted ?? false,
          plannedWeight: exercise.weight || "0",
          lastUsedWeight: lastUsedWeight ?? "N/A",
        };
      });
      form.reset({ performances: initialPerformances });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session, workout, getLastUsedWeightForExercise]); // form.reset removed from deps as it's stable


  const performancesFromWatch = form.watch('performances');

  const allExercisesCompleted = useMemo(() => {
    if (!performancesFromWatch || performancesFromWatch.length === 0) return false;
    if (workout && performancesFromWatch.length !== workout.exercises.length) return false;

    return performancesFromWatch.every(p => {
      const warmupDone = p.hasWarmup ? p.isWarmupCompleted : true;
      return warmupDone && p.isExerciseCompleted;
    });
  }, [performancesFromWatch, workout]);


  const handleFinalizeWorkout = () => {
    completeSession(session.id);
    onWorkoutFinallyCompleted();
    onClose();
  };

  if (!session || !workout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <DialogContent className="max-w-xl w-full">
        <DialogHeader>
          <DialogTitle className="font-headline">Acompanhar Treino: {workout.name}</DialogTitle>
          <DialogDescription>
            Marque os exercícios e seus aquecimentos (se houver) como concluídos e registre o peso utilizado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form>
            <ScrollArea className="h-[60vh] max-h-[calc(100vh-20rem)] my-4 pr-3">
              <div className="space-y-6">
                {fields.map((item, index) => {
                  const currentExercisePerformance = performancesFromWatch?.[index];
                  return (
                  <div key={item.id} className="p-4 border rounded-md bg-card shadow-sm">
                    <h3 className="font-semibold text-lg mb-3">{currentExercisePerformance?.exerciseName || item.exerciseName}</h3>

                    {(currentExercisePerformance?.hasWarmup || item.hasWarmup) && (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 mb-3">
                        <Checkbox
                          id={`warmup-${item.exerciseId}`}
                          checked={form.watch(`performances.${index}.isWarmupCompleted`)}
                          onCheckedChange={(checkedState) => {
                            const isChecked = checkedState === true;
                            form.setValue(`performances.${index}.isWarmupCompleted`, isChecked, { shouldDirty: true });
                            updateSessionExercisePerformance(
                              session.id,
                              item.exerciseId, // Use item.exerciseId from RHF field array item
                              { isWarmupCompleted: isChecked }
                            );
                          }}
                        />
                        <Label htmlFor={`warmup-${item.exerciseId}`} className="font-normal cursor-pointer flex items-center">
                          <Flame className="mr-2 h-4 w-4 text-orange-500" />
                          Aquecimento deste Exercício Concluído
                        </Label>
                      </FormItem>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <p className="text-sm text-muted-foreground">
                            Planejado: <span className="font-medium text-foreground">{form.watch(`performances.${index}.plannedWeight`) || "N/A"}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Último Usado: <span className="font-medium text-foreground">{form.watch(`performances.${index}.lastUsedWeight`) || "N/A"}</span>
                        </p>
                    </div>

                    <FormField
                      control={form.control}
                      name={`performances.${index}.weightUsed`}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Peso Utilizado Atual</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ex: 50kg"
                              {...field}
                              value={field.value ?? ""}
                              onBlur={(e) => {
                                field.onBlur(); 
                                const currentVal = e.target.value;
                                const weightToSave = (currentVal === '' || currentVal === undefined || currentVal === null) ? "0" : String(currentVal);
                                updateSessionExercisePerformance(
                                  session.id,
                                  item.exerciseId, 
                                  { weightUsed: weightToSave }
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                       <Checkbox
                        id={`exercise-${item.exerciseId}`}
                        checked={form.watch(`performances.${index}.isExerciseCompleted`)}
                        onCheckedChange={(checkedState) => {
                          const isChecked = checkedState === true;
                          form.setValue(`performances.${index}.isExerciseCompleted`, isChecked, { shouldDirty: true });
                          updateSessionExercisePerformance(
                            session.id,
                            item.exerciseId,
                            { isExerciseCompleted: isChecked }
                          );
                        }}
                      />
                      <Label htmlFor={`exercise-${item.exerciseId}`} className="font-normal cursor-pointer flex items-center">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        Exercício Concluído
                      </Label>
                    </FormItem>
                    {index < fields.length - 1 && <Separator className="mt-6" />}
                  </div>
                )})}
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button
                type="button"
                onClick={handleFinalizeWorkout}
                disabled={!allExercisesCompleted}
                title={!allExercisesCompleted ? "Complete todos os exercícios (e aquecimentos, se aplicável) para finalizar." : "Finalizar Treino"}
              >
                <Save className="mr-2 h-4 w-4" />
                Finalizar Treino
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
