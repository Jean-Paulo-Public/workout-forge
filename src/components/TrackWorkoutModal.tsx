
"use client";

import { useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Workout, WorkoutSession, SessionExercisePerformance } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { Flame, CheckCircle2, Save, Undo2, Dumbbell, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

  const { fields, update } = useFieldArray({
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
  }, [isOpen, session, workout, getLastUsedWeightForExercise]);


  const performancesFromWatch = form.watch('performances');

  const allExercisesCompleted = useMemo(() => {
    if (!performancesFromWatch || performancesFromWatch.length === 0) return false;
    if (workout && performancesFromWatch.length !== workout.exercises.length) return false;
    return performancesFromWatch.every(p => p.isExerciseCompleted);
  }, [performancesFromWatch, workout]);


  const handleMarkWarmupCompleted = (index: number) => {
    const currentPerf = performancesFromWatch[index];
    if (currentPerf) {
      const updatedPerf = { ...currentPerf, isWarmupCompleted: true };
      update(index, updatedPerf);
      updateSessionExercisePerformance(session.id, currentPerf.exerciseId, { isWarmupCompleted: true });
    }
  };

  const handleMarkExerciseCompleted = (index: number) => {
    const currentPerf = performancesFromWatch[index];
    if (currentPerf) {
      const updatedPerf = { ...currentPerf, isExerciseCompleted: true };
      update(index, updatedPerf);
      updateSessionExercisePerformance(session.id, currentPerf.exerciseId, { isExerciseCompleted: true });
    }
  };

  const handleUndoAction = (index: number) => {
    const currentPerf = performancesFromWatch[index];
    if (currentPerf) {
      let updates: Partial<SessionExercisePerformance> = {};
      let updatedPerfData = { ...currentPerf };

      if (currentPerf.isExerciseCompleted) {
        updates.isExerciseCompleted = false;
        updatedPerfData.isExerciseCompleted = false;
      } else if (currentPerf.hasWarmup && currentPerf.isWarmupCompleted) {
        updates.isWarmupCompleted = false;
        updatedPerfData.isWarmupCompleted = false;
      }
      update(index, updatedPerfData);
      updateSessionExercisePerformance(session.id, currentPerf.exerciseId, updates);
    }
  };

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
                  const currentPerf = performancesFromWatch?.[index];
                  if (!currentPerf) return null;

                  const canUndo = currentPerf.isExerciseCompleted || (currentPerf.hasWarmup && currentPerf.isWarmupCompleted);

                  let statusBadge: JSX.Element;
                  if (currentPerf.isExerciseCompleted) {
                    statusBadge = <Badge variant="default" className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-1 h-3 w-3" />Concluído</Badge>;
                  } else if (currentPerf.hasWarmup && !currentPerf.isWarmupCompleted) {
                    statusBadge = <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white"><Flame className="mr-1 h-3 w-3" />Aquecimento Pendente</Badge>;
                  } else {
                    statusBadge = <Badge variant="outline"><Dumbbell className="mr-1 h-3 w-3" />Exercício Pendente</Badge>;
                  }

                  return (
                  <div key={item.id} className="p-4 border rounded-md bg-card shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">{currentPerf.exerciseName}</h3>
                        {statusBadge}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <p className="text-sm text-muted-foreground">
                            Planejado: <span className="font-medium text-foreground">{currentPerf.plannedWeight || "N/A"}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Último Usado: <span className="font-medium text-foreground">{currentPerf.lastUsedWeight || "N/A"}</span>
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
                                  currentPerf.exerciseId,
                                  { weightUsed: weightToSave }
                                );
                              }}
                              disabled={currentPerf.isExerciseCompleted}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 flex flex-wrap gap-2 justify-start">
                        {currentPerf.hasWarmup && !currentPerf.isWarmupCompleted && !currentPerf.isExerciseCompleted && (
                            <Button type="button" size="sm" variant="outline" onClick={() => handleMarkWarmupCompleted(index)}>
                                <Flame className="mr-2 h-4 w-4 text-orange-500" /> Concluir Aquecimento
                            </Button>
                        )}
                        {((currentPerf.hasWarmup && currentPerf.isWarmupCompleted) || !currentPerf.hasWarmup) && !currentPerf.isExerciseCompleted && (
                            <Button type="button" size="sm" onClick={() => handleMarkExerciseCompleted(index)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir Exercício
                            </Button>
                        )}
                        {canUndo && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => handleUndoAction(index)}>
                                <Undo2 className="mr-2 h-4 w-4" /> Desfazer Etapa
                            </Button>
                        )}
                    </div>
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
                title={!allExercisesCompleted ? "Complete todos os exercícios para finalizar." : "Finalizar Treino"}
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

    