
"use client";

import { useEffect, useMemo, useCallback, useId, useState } from 'react';
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
import { Flame, CheckCircle2, Save, Undo2, Dumbbell, Timer, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RestTimerModal } from '@/components/RestTimerModal'; 
import { useToast } from '@/hooks/use-toast';

const exercisePerformanceSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  hasWarmup: z.boolean().optional(),
  isWarmupCompleted: z.boolean().optional(),
  weightUsed: z.string().optional(),
  isExerciseCompleted: z.boolean().optional(),
  plannedWeight: z.string().optional(),
  lastUsedWeight: z.string().optional(),
  restTimeSeconds: z.number().optional(), 
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
  const { updateSessionExercisePerformance, completeSession, getLastUsedWeightForExercise, userSettings } = useAppContext();
  const { toast } = useToast();
  const descriptionId = useId();

  const [isRestTimerModalOpen, setIsRestTimerModalOpen] = useState(false);
  const [currentExerciseForRest, setCurrentExerciseForRest] = useState<SessionExercisePerformance | null>(null);
  const [currentExerciseIndexForRest, setCurrentExerciseIndexForRest] = useState<number | null>(null);


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
          restTimeSeconds: currentPerf?.restTimeSeconds,
        };
      });
      form.reset({ performances: initialPerformances });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, session, workout]);


  const performancesFromWatch = form.watch('performances');

  const allExercisesCompleted = useMemo(() => {
    if (!performancesFromWatch || performancesFromWatch.length === 0) return false;
    if (workout && performancesFromWatch.length !== workout.exercises.length) return false;
    return performancesFromWatch.every(p => p.isExerciseCompleted);
  }, [performancesFromWatch, workout]);


  const handleMarkWarmupCompleted = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    const updatedFieldItem = { ...fieldItem, isWarmupCompleted: true };
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(session.id, fieldItem.exerciseId, { isWarmupCompleted: true });
  };

  const handleMarkExerciseCompleted = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    const updatedFieldItem = { ...fieldItem, isExerciseCompleted: true };
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(session.id, fieldItem.exerciseId, { isExerciseCompleted: true });
  };

  const handleUndoAction = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    let updatesToPersist: Partial<SessionExercisePerformance> = {};
    let updatedFieldItem = { ...fieldItem };

    if (fieldItem.isExerciseCompleted) {
      updatesToPersist.isExerciseCompleted = false;
      updatedFieldItem.isExerciseCompleted = false;
    } else if (fieldItem.hasWarmup && fieldItem.isWarmupCompleted) {
      updatesToPersist.isWarmupCompleted = false;
      updatedFieldItem.isWarmupCompleted = false;
    } else {
      return; 
    }
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(session.id, fieldItem.exerciseId, updatesToPersist);
  };


  const handleFinalizeWorkout = () => {
    completeSession(session.id);
    onWorkoutFinallyCompleted();
    onClose();
  };

  const openRestTimer = (performanceData: SessionExercisePerformance, index: number) => {
    const sessionPerf = session.exercisePerformances.find(p => p.exerciseId === performanceData.exerciseId);
    setCurrentExerciseForRest(sessionPerf || performanceData);
    setCurrentExerciseIndexForRest(index);
    setIsRestTimerModalOpen(true);
  };

  const handleSaveRestTime = (exerciseId: string, restSeconds: number) => {
    if (currentExerciseIndexForRest !== null) {
        const fieldItem = form.getValues(`performances.${currentExerciseIndexForRest}`);
        const updatedFieldItem = { ...fieldItem, restTimeSeconds: restSeconds };
        update(currentExerciseIndexForRest, updatedFieldItem);
    }
    updateSessionExercisePerformance(session.id, exerciseId, { restTimeSeconds: restSeconds });
    setIsRestTimerModalOpen(false);
    setCurrentExerciseForRest(null);
    setCurrentExerciseIndexForRest(null);
  };

  const formatSecondsToMMSS = (totalSeconds: number | undefined): string => {
    if (totalSeconds === undefined || totalSeconds === null) return 'N/A';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleClearLastRestTime = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    const updatedFieldItem = { ...fieldItem, restTimeSeconds: undefined };
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(session.id, fieldItem.exerciseId, { restTimeSeconds: undefined });
    toast({ title: "Descanso Removido", description: `O último tempo de descanso para ${fieldItem.exerciseName} foi removido.` });
  };

  if (!session || !workout) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
        <DialogContent className="max-w-xl w-full" aria-describedby={descriptionId}>
          <DialogHeader>
            <DialogTitle className="font-headline">Acompanhar Treino: {workout.name}</DialogTitle>
            <DialogDescription id={descriptionId}>
              Marque os exercícios e seus aquecimentos (se houver) como concluídos e registre o peso utilizado e o tempo de descanso.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form>
              <ScrollArea className="h-[60vh] max-h-[calc(100vh-20rem)] my-4 pr-3">
                <div className="space-y-6">
                  {fields.map((item, index) => {
                    const currentItemState = performancesFromWatch?.[index];
                    if (!currentItemState) return null; 

                    const canUndo = currentItemState.isExerciseCompleted || (currentItemState.hasWarmup && currentItemState.isWarmupCompleted);

                    let statusBadge: JSX.Element;
                    if (currentItemState.isExerciseCompleted) {
                      statusBadge = <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-primary-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Concluído</Badge>;
                    } else if (currentItemState.hasWarmup && !currentItemState.isWarmupCompleted) {
                      statusBadge = <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white"><Flame className="mr-1 h-3 w-3" />Aquecimento Pendente</Badge>;
                    } else {
                      statusBadge = <Badge variant="outline"><Dumbbell className="mr-1 h-3 w-3" />Exercício Pendente</Badge>;
                    }

                    return (
                    <div key={item.id} className="p-4 border rounded-md bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">{currentItemState.exerciseName}</h3>
                          {statusBadge}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-3">
                          <p className="text-sm text-muted-foreground">
                              Planejado: <span className="font-medium text-foreground">{currentItemState.plannedWeight || "N/A"}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                              Último Usado: <span className="font-medium text-foreground">{currentItemState.lastUsedWeight || "N/A"}</span>
                          </p>
                           <div className="text-sm text-muted-foreground col-span-1 sm:col-span-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                <span>Último descanso registrado: </span>
                                <span className="font-medium text-foreground ml-1">
                                  {formatSecondsToMMSS(currentItemState.restTimeSeconds)}
                                </span>
                              </div>
                              {currentItemState.restTimeSeconds !== undefined && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleClearLastRestTime(index)}
                                  title="Limpar último descanso registrado"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
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
                                  if (currentItemState.exerciseId) {
                                    updateSessionExercisePerformance(
                                      session.id,
                                      currentItemState.exerciseId,
                                      { weightUsed: weightToSave }
                                    );
                                  }
                                }}
                                disabled={currentItemState.isExerciseCompleted}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4 flex flex-wrap gap-2 justify-start items-center">
                          {currentItemState.hasWarmup && !currentItemState.isWarmupCompleted && !currentItemState.isExerciseCompleted && (
                              <Button type="button" size="sm" variant="outline" onClick={() => handleMarkWarmupCompleted(index)}>
                                  <Flame className="mr-2 h-4 w-4 text-orange-500" /> Concluir Aquecimento
                              </Button>
                          )}
                          {((currentItemState.hasWarmup && currentItemState.isWarmupCompleted) || !currentItemState.hasWarmup) && !currentItemState.isExerciseCompleted && (
                              <Button type="button" size="sm" onClick={() => handleMarkExerciseCompleted(index)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir Exercício
                              </Button>
                          )}
                           {!currentItemState.isExerciseCompleted && (
                            <Button type="button" variant="secondary" size="sm" onClick={() => openRestTimer(currentItemState, index)}>
                                <Timer className="mr-2 h-4 w-4" /> Registrar Descanso
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

      {currentExerciseForRest && (
        <RestTimerModal
          isOpen={isRestTimerModalOpen}
          onClose={() => {
            setIsRestTimerModalOpen(false);
            setCurrentExerciseForRest(null);
            setCurrentExerciseIndexForRest(null);
          }}
          session={session}
          exercisePerformance={currentExerciseForRest}
          workoutId={workout.id}
          defaultAlarmTimeSeconds={userSettings.defaultRestAlarmSeconds}
          onSaveRestTime={handleSaveRestTime}
        />
      )}
    </>
  );
}
