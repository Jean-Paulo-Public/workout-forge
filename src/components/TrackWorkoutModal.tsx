
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Workout, WorkoutSession, SessionExercisePerformance, Exercise as WorkoutExercise } from '@/lib/types';
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
  plannedWeight: z.string().optional(), // For display
  lastUsedWeight: z.string().optional(), // For display
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
  onWorkoutFinallyCompleted: () => void; // Callback after session is marked complete
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
          isWarmupCompleted: currentPerf?.isWarmupCompleted || false,
          // Prioritize current session's weightUsed, then last used, then planned, then "0"
          weightUsed: currentPerf?.weightUsed ?? lastUsedWeight ?? exercise.weight ?? "0",
          isExerciseCompleted: currentPerf?.isExerciseCompleted || false,
          plannedWeight: exercise.weight || "0",
          lastUsedWeight: lastUsedWeight ?? "N/A",
        };
      });
      form.reset({ performances: initialPerformances });
    }
  }, [isOpen, session, workout, form, getLastUsedWeightForExercise]);

  const handlePerformanceChange = useCallback((index: number, fieldName: keyof SessionExercisePerformance, value: any) => {
    const currentPerformanceField = form.getValues(`performances.${index}`);
    if (!currentPerformanceField) return;

    // Update the form state optimistically for UI responsiveness
    const updatedField = { ...currentPerformanceField, [fieldName]: value };
    // This `update` is from useFieldArray, it updates the form's array field
    update(index, updatedField); 

    // Persist the change to AppContext
    // Ensure `weightUsed` is always a string, default to "0" if empty
    const weightToSave = fieldName === 'weightUsed' ? (value === '' || value === undefined || value === null ? "0" : String(value)) : undefined;

    const updatesForContext: Partial<SessionExercisePerformance> = {
      ...(fieldName === 'isWarmupCompleted' && { isWarmupCompleted: value as boolean }),
      ...(fieldName === 'weightUsed' && { weightUsed: weightToSave }),
      ...(fieldName === 'isExerciseCompleted' && { isExerciseCompleted: value as boolean }),
    };
    
    // Filter out undefined properties before sending to context
    const definedUpdates = Object.entries(updatesForContext).reduce((acc, [key, val]) => {
        if (val !== undefined) acc[key as keyof SessionExercisePerformance] = val;
        return acc;
    }, {} as Partial<SessionExercisePerformance>);

    if (Object.keys(definedUpdates).length > 0) {
        updateSessionExercisePerformance(session.id, currentPerformanceField.exerciseId, definedUpdates);
    }
  }, [form, update, session.id, updateSessionExercisePerformance]);


  const allExercisesCompleted = useMemo(() => {
    const performances = form.watch('performances'); // Watch for changes to re-evaluate
    if (!performances || performances.length === 0) return false;
    return performances.every(p => {
      const warmupDone = p.hasWarmup ? p.isWarmupCompleted : true;
      return warmupDone && p.isExerciseCompleted;
    });
  }, [form]);


  const handleFinalizeWorkout = () => {
    completeSession(session.id);
    onWorkoutFinallyCompleted(); // This will trigger deadline modal etc.
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
          <form> {/* No onSubmit here, using button onClick for finalization */}
            <ScrollArea className="h-[60vh] max-h-[calc(100vh-20rem)] my-4 pr-3">
              <div className="space-y-6">
                {fields.map((item, index) => {
                  const exerciseDetails = workout.exercises.find(e => e.id === item.exerciseId);
                  return (
                  <div key={item.id} className="p-4 border rounded-md bg-card shadow-sm">
                    <h3 className="font-semibold text-lg mb-3">{item.exerciseName}</h3>
                    
                    {item.hasWarmup && (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0 mb-3">
                        <Checkbox
                          id={`warmup-${item.exerciseId}`}
                          checked={form.watch(`performances.${index}.isWarmupCompleted`)}
                          onCheckedChange={(checked) => {
                            handlePerformanceChange(index, 'isWarmupCompleted', !!checked);
                          }}
                        />
                        <Label htmlFor={`warmup-${item.exerciseId}`} className="font-normal cursor-pointer flex items-center">
                          <Flame className="mr-2 h-4 w-4 text-orange-500" />
                          Aquecimento Concluído
                        </Label>
                      </FormItem>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <p className="text-sm text-muted-foreground">
                            Planejado: <span className="font-medium text-foreground">{item.plannedWeight || "N/A"}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Último Usado: <span className="font-medium text-foreground">{item.lastUsedWeight || "N/A"}</span>
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
                              onBlur={(e) => { // Save on blur
                                handlePerformanceChange(index, 'weightUsed', e.target.value);
                                field.onBlur(); // Call original onBlur for react-hook-form
                              }}
                              onChange={(e) => field.onChange(e.target.value)} // Let react-hook-form handle immediate input change
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
                        onCheckedChange={(checked) => {
                          handlePerformanceChange(index, 'isExerciseCompleted', !!checked);
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

