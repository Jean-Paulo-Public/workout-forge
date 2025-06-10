
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
import type { Workout, WorkoutSession, SessionExercisePerformance, Exercise as WorkoutExercise, ModelExercise } from '@/lib/types';
import { useAppContext } from '@/contexts/AppContext';
import { Flame, CheckCircle2, Save, Undo2, Dumbbell, Timer, Clock, X, Info, Replace, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RestTimerModal } from '@/components/RestTimerModal';
import { useToast } from '@/hooks/use-toast';
import { ModelExerciseCategoryModal } from '@/components/ModelExerciseCategoryModal';
import { ModelExerciseSelectionModal } from '@/components/ModelExerciseSelectionModal';
import { modelExerciseData } from '@/lib/model-exercises/index';


const exercisePerformanceSchema = z.object({
  exerciseId: z.string(),
  exerciseName: z.string(),
  hasWarmup: z.boolean().optional(),
  isWarmupCompleted: z.boolean().optional(),
  weightUsed: z.string().optional(),
  isExerciseCompleted: z.boolean().optional(),
  plannedWeight: z.string().optional(),
  lastUsedWeight: z.string().optional(),
  restTimes: z.array(z.number()).optional(),
  averageRestTimeDisplay: z.string().optional(),
  // Fields for exercise substitution
  isSubstitution: z.boolean().optional(),
  originalExerciseId: z.string().optional(),
  originalExerciseName: z.string().optional(),
  // RHF specific fields, not directly on SessionExercisePerformance type
  sets: z.number().optional(), // For display from original workout plan
  reps: z.string().optional(), // For display from original workout plan
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

export function TrackWorkoutModal({ isOpen, onClose, session: sessionProp, workout: workoutProp, onWorkoutFinallyCompleted }: TrackWorkoutModalProps) {
  const {
    updateSessionExercisePerformance,
    completeSession,
    getLastUsedWeightForExercise,
    userSettings,
    getAverageRestTimeForExercise,
    getSessionById,
    substituteSessionExercise,
    undoSubstituteSessionExercise
  } = useAppContext();
  const { toast } = useToast();
  const descriptionId = useId();

  const [isRestTimerModalOpen, setIsRestTimerModalOpen] = useState(false);
  const [currentExerciseForRest, setCurrentExerciseForRest] = useState<SessionExercisePerformance | null>(null);

  const [isReplaceCategoryModalOpen, setIsReplaceCategoryModalOpen] = useState(false);
  const [isReplaceSelectionModalOpen, setIsReplaceSelectionModalOpen] = useState(false);
  const [selectedReplaceCategory, setSelectedReplaceCategory] = useState<string | null>(null);
  const [performanceIndexToReplace, setPerformanceIndexToReplace] = useState<number | null>(null);


  const formatSecondsToMMSS = useCallback((totalSeconds: number | undefined | null): string => {
    if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) return 'N/A';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);


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
    if (isOpen && sessionProp && workoutProp) {
      const currentSessionFromContext = getSessionById(sessionProp.id);
      const sessionToUse = currentSessionFromContext || sessionProp;
      const workoutPlan = workoutProp; // Use the passed workoutProp as the source of truth for plan

      const initialPerformances = sessionToUse.exercisePerformances.map((perfEntry: SessionExercisePerformance) => {
        // Find the corresponding exercise in the workout plan
        // If it's a substitution, the originalExerciseId links to the plan
        // Otherwise, exerciseId links to the plan
        const planExerciseId = perfEntry.isSubstitution ? perfEntry.originalExerciseId : perfEntry.exerciseId;
        const exerciseInPlan = workoutPlan.exercises.find(ex => ex.id === planExerciseId);

        return {
            exerciseId: perfEntry.exerciseId,
            exerciseName: perfEntry.exerciseName,
            hasWarmup: perfEntry.hasWarmup,
            isWarmupCompleted: perfEntry.isWarmupCompleted,
            weightUsed: perfEntry.weightUsed,
            isExerciseCompleted: perfEntry.isExerciseCompleted,
            plannedWeight: perfEntry.plannedWeight || (exerciseInPlan?.weight || "N/A"),
            lastUsedWeight: getLastUsedWeightForExercise(workoutPlan.id, perfEntry.isSubstitution ? perfEntry.originalExerciseId! : perfEntry.exerciseId) || "N/A",
            restTimes: perfEntry.restTimes || [],
            averageRestTimeDisplay: formatSecondsToMMSS(getAverageRestTimeForExercise(perfEntry.isSubstitution ? perfEntry.originalExerciseName! : perfEntry.exerciseName, 30)),
            isSubstitution: perfEntry.isSubstitution,
            originalExerciseId: perfEntry.originalExerciseId,
            originalExerciseName: perfEntry.originalExerciseName,
            sets: exerciseInPlan?.sets, // Get from plan
            reps: exerciseInPlan?.reps, // Get from plan
        };
      });
      form.reset({ performances: initialPerformances });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionProp, workoutProp, getSessionById, getLastUsedWeightForExercise, getAverageRestTimeForExercise, formatSecondsToMMSS, form.reset]);


  const performancesFromWatch = form.watch('performances');

  const allExercisesCompleted = useMemo(() => {
    if (!performancesFromWatch || performancesFromWatch.length === 0) {
        return workoutProp.exercises.length === 0;
    }
    return performancesFromWatch.every(perf => perf.isExerciseCompleted === true);
  }, [performancesFromWatch, workoutProp.exercises]);


  const handleMarkWarmupCompleted = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    const updatedFieldItem = { ...fieldItem, isWarmupCompleted: true };
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(sessionProp.id, fieldItem.exerciseId, { isWarmupCompleted: true });
  };

  const handleMarkExerciseCompleted = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId) return;

    const updatedFieldItem = { ...fieldItem, isExerciseCompleted: true };
    update(index, updatedFieldItem);
    updateSessionExercisePerformance(sessionProp.id, fieldItem.exerciseId, { isExerciseCompleted: true });
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
    updateSessionExercisePerformance(sessionProp.id, fieldItem.exerciseId, updatesToPersist);
  };


  const handleFinalizeWorkout = () => {
    completeSession(sessionProp.id);
    onWorkoutFinallyCompleted();
    onClose();
  };

  const openRestTimer = (performanceData: z.infer<typeof exercisePerformanceSchema>) => {
     const sessionDataFromContext = getSessionById(sessionProp.id);
     const perfFromContext = sessionDataFromContext?.exercisePerformances.find(p => p.exerciseId === performanceData.exerciseId);

     const exercisePerformanceForModal: SessionExercisePerformance = {
        exerciseId: performanceData.exerciseId,
        exerciseName: performanceData.exerciseName,
        hasWarmup: performanceData.hasWarmup,
        isWarmupCompleted: performanceData.isWarmupCompleted,
        isExerciseCompleted: performanceData.isExerciseCompleted,
        plannedWeight: performanceData.plannedWeight,
        weightUsed: performanceData.weightUsed,
        restTimes: perfFromContext?.restTimes || performanceData.restTimes || [],
        isSubstitution: performanceData.isSubstitution,
        originalExerciseId: performanceData.originalExerciseId,
        originalExerciseName: performanceData.originalExerciseName,
     };

    setCurrentExerciseForRest(exercisePerformanceForModal);
    setIsRestTimerModalOpen(true);
  };

  const handleSaveRestTime = (exerciseId: string, restSeconds: number) => {
    updateSessionExercisePerformance(sessionProp.id, exerciseId, { logNewRestTime: restSeconds });

    const perfIndex = form.getValues('performances').findIndex(p => p.exerciseId === exerciseId);
    if (perfIndex !== -1) {
        const currentPerf = form.getValues(`performances.${perfIndex}`);
        const newRestTimes = [...(currentPerf.restTimes || []) , restSeconds];
        if (newRestTimes.length > 3) newRestTimes.shift();
        update(perfIndex, {...currentPerf, restTimes: newRestTimes});
    }

    setIsRestTimerModalOpen(false);
    setCurrentExerciseForRest(null);
  };

  const handleClearLastRestTime = (index: number) => {
    const fieldItem = form.getValues(`performances.${index}`);
    if (!fieldItem || !fieldItem.exerciseId || !fieldItem.restTimes || fieldItem.restTimes.length === 0) return;

    const updatedRestTimesArray = [...fieldItem.restTimes];
    updatedRestTimesArray.pop(); 

    update(index, { ...fieldItem, restTimes: updatedRestTimesArray });
    updateSessionExercisePerformance(sessionProp.id, fieldItem.exerciseId, { restTimes: updatedRestTimesArray });
    toast({ title: "Último Descanso Removido", description: `O último tempo de descanso para ${fieldItem.exerciseName} foi removido.` });
  };

  const handleOpenReplaceCategoryModal = (index: number) => {
    setPerformanceIndexToReplace(index);
    setIsReplaceCategoryModalOpen(true);
  };

  const handleReplaceCategorySelected = (category: string) => {
    setSelectedReplaceCategory(category);
    setIsReplaceCategoryModalOpen(false);
    setIsReplaceSelectionModalOpen(true);
  };

  const handleReplaceExerciseSelected = (modelExercise: ModelExercise) => {
    if (performanceIndexToReplace !== null) {
        const originalPerformance = form.getValues(`performances.${performanceIndexToReplace}`);
        substituteSessionExercise(sessionProp.id, performanceIndexToReplace, modelExercise);
        toast({
          title: "Exercício Trocado!",
          description: `${originalPerformance.exerciseName} foi substituído por ${modelExercise.name} nesta sessão.`,
        });
    }
    setIsReplaceSelectionModalOpen(false);
    setSelectedReplaceCategory(null);
    setPerformanceIndexToReplace(null);
  };

  const handleUndoReplaceExercise = (index: number) => {
    const performanceToUndo = form.getValues(`performances.${index}`);
    if (performanceToUndo && performanceToUndo.isSubstitution) {
        undoSubstituteSessionExercise(sessionProp.id, index);
        toast({
            title: "Troca Desfeita!",
            description: `A troca de ${performanceToUndo.originalExerciseName} por ${performanceToUndo.exerciseName} foi desfeita.`
        });
    }
  };


  if (!isOpen || !sessionProp || !workoutProp) return null;

  const restLabels = ["Último", "Penúltimo", "Antepenúltimo"];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
        <DialogContent className="max-w-xl w-full" aria-describedby={descriptionId}>
          <DialogHeader>
            <DialogTitle className="font-headline">Acompanhar Treino: {workoutProp.name}</DialogTitle>
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

                    const canUndoThisStep = currentItemState.isExerciseCompleted || (currentItemState.hasWarmup && currentItemState.isWarmupCompleted);
                    const isWarmupDoneOrNotApplicable = (currentItemState.hasWarmup && currentItemState.isWarmupCompleted) || !currentItemState.hasWarmup;
                    const canMarkExerciseCompleted = isWarmupDoneOrNotApplicable && !currentItemState.isExerciseCompleted;
                    const canRegisterOrClearRest = isWarmupDoneOrNotApplicable && !currentItemState.isExerciseCompleted;

                    let statusBadge: JSX.Element;
                    if (currentItemState.isExerciseCompleted) {
                      statusBadge = <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-primary-foreground"><CheckCircle2 className="mr-1 h-3 w-3" />Concluído</Badge>;
                    } else if (currentItemState.hasWarmup && !currentItemState.isWarmupCompleted) {
                      statusBadge = <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white"><Flame className="mr-1 h-3 w-3" />Aquecimento Pendente</Badge>;
                    } else {
                      statusBadge = <Badge variant="outline"><Dumbbell className="mr-1 h-3 w-3" />Exercício Pendente</Badge>;
                    }

                    const currentRestTimes = currentItemState.restTimes || [];

                    return (
                    <div key={item.id} className="p-4 border rounded-md bg-card shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg">{currentItemState.exerciseName}</h3>
                          {statusBadge}
                      </div>
                      {currentItemState.isSubstitution && currentItemState.originalExerciseName && (
                        <Badge variant="outline" className="text-xs mb-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                            <AlertTriangle className="mr-1 h-3 w-3 text-yellow-600" />
                            Substituído (Original: {currentItemState.originalExerciseName})
                        </Badge>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mb-3">
                          <p className="text-sm text-muted-foreground">
                              Peso planejado: <span className="font-medium text-foreground">{currentItemState.plannedWeight || "N/A"}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                              Último peso usado: <span className="font-medium text-foreground">{currentItemState.lastUsedWeight || "N/A"}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                              Planejado: <span className="font-medium text-foreground">{currentItemState.sets || 'N/A'} séries x {currentItemState.reps || 'N/A'}</span>
                          </p>

                          <div className="text-sm text-muted-foreground col-span-1 sm:col-span-2 space-y-0.5">
                            <div className="flex items-center">
                                <Info className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                                <span>Tempo médio de descanso (30d): </span>
                                <span className="font-medium text-foreground ml-1">
                                  {currentItemState.averageRestTimeDisplay}
                                </span>
                            </div>
                            {currentRestTimes.slice().reverse().map((time, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                                        <span>{restLabels[i]} descanso registrado: </span>
                                        <span className="font-medium text-foreground ml-1">
                                            {formatSecondsToMMSS(time)}
                                        </span>
                                    </div>
                                    {i === 0 && currentRestTimes.length > 0 && (
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleClearLastRestTime(index)}
                                        title="Limpar último descanso registrado"
                                        disabled={!canRegisterOrClearRest}
                                        >
                                        <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )).filter((_, i) => i < 3)}
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
                                      sessionProp.id,
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
                          {canMarkExerciseCompleted && (
                              <Button type="button" size="sm" onClick={() => handleMarkExerciseCompleted(index)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir Exercício
                              </Button>
                          )}
                           <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openRestTimer(currentItemState)}
                            disabled={!canRegisterOrClearRest}
                            title={!canRegisterOrClearRest ? (currentItemState.isExerciseCompleted ? "Exercício já concluído" : "Conclua o aquecimento primeiro") : "Registrar tempo de descanso"}
                            >
                                <Timer className="mr-2 h-4 w-4" /> Registrar Descanso
                            </Button>
                          {canUndoThisStep && (
                              <Button type="button" size="sm" variant="ghost" onClick={() => handleUndoAction(index)}>
                                  <Undo2 className="mr-2 h-4 w-4" /> Desfazer Etapa
                              </Button>
                          )}
                          {!currentItemState.isExerciseCompleted && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReplaceCategoryModal(index)}
                                title="Trocar este exercício para esta sessão"
                              >
                                <Replace className="mr-2 h-4 w-4" /> Trocar Exercício
                              </Button>
                              {currentItemState.isSubstitution && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUndoReplaceExercise(index)}
                                  title="Desfazer troca do exercício"
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Undo2 className="mr-2 h-4 w-4" /> Desfazer Troca
                                </Button>
                              )}
                            </>
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

      {currentExerciseForRest && sessionProp && (
        <RestTimerModal
          isOpen={isRestTimerModalOpen}
          onClose={() => {
            setIsRestTimerModalOpen(false);
            setCurrentExerciseForRest(null);
          }}
          session={sessionProp}
          exercisePerformance={currentExerciseForRest}
          workoutId={workoutProp.id}
          defaultAlarmTimeSeconds={userSettings.defaultRestAlarmSeconds}
          onSaveRestTime={handleSaveRestTime}
        />
      )}

      <ModelExerciseCategoryModal
        isOpen={isReplaceCategoryModalOpen}
        onClose={() => {
            setIsReplaceCategoryModalOpen(false);
            setPerformanceIndexToReplace(null);
        }}
        onSelectCategory={handleReplaceCategorySelected}
      />
      {selectedReplaceCategory && performanceIndexToReplace !== null && (
        <ModelExerciseSelectionModal
          isOpen={isReplaceSelectionModalOpen}
          onClose={() => {
            setIsReplaceSelectionModalOpen(false);
            setSelectedReplaceCategory(null);
            setPerformanceIndexToReplace(null);
          }}
          category={selectedReplaceCategory}
          exercises={modelExerciseData[selectedReplaceCategory] || []}
          onSelectExercise={handleReplaceExerciseSelected}
        />
      )}
    </>
  );
}
