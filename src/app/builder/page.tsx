
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Save, Target, BookOpenCheck } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Exercise, ModelExercise, Workout } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { MuscleGroupSelectorModal } from '@/components/MuscleGroupSelectorModal';
import { ModelExerciseCategoryModal } from '@/components/ModelExerciseCategoryModal';
import { ModelExerciseSelectionModal } from '@/components/ModelExerciseSelectionModal';
import { modelExerciseData } from '@/lib/model-exercises';
import { muscleGroupSuggestedFrequencies } from '@/lib/muscle-group-frequencies';

const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "O nome do exercício é muito curto."),
  sets: z.coerce.number().min(1, "As séries devem ser pelo menos 1."),
  reps: z.string().min(1, "As repetições são obrigatórias."),
  weight: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  notes: z.string().optional(),
  hasWarmup: z.boolean().optional(),
});

const workoutFormSchema = z.object({
  name: z.string().min(3, "O nome do treino deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, "Adicione pelo menos um exercício."),
  repeatFrequencyDays: z.coerce.number().positive("A frequência deve ser um número positivo.").optional().or(z.literal('')),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

const generateId = () => crypto.randomUUID();

export default function WorkoutBuilderPage() {
  const { addWorkout, updateWorkout, getWorkoutById, userSettings } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingWorkoutId = searchParams.get('editId');

  const [isSaving, setIsSaving] = useState(false);
  const [isMuscleGroupModalOpen, setIsMuscleGroupModalOpen] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState<string | null>(null);
  
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [],
      repeatFrequencyDays: undefined,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const updateWorkoutFrequencyBasedOnExercises = useCallback((currentExercises: Exercise[] = []) => {
    let maxSuggestedFrequency = 0;
    (currentExercises.length > 0 ? currentExercises : form.getValues('exercises')).forEach(exercise => {
      if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        exercise.muscleGroups.forEach(group => {
          if (muscleGroupSuggestedFrequencies[group] && muscleGroupSuggestedFrequencies[group] > maxSuggestedFrequency) {
            maxSuggestedFrequency = muscleGroupSuggestedFrequencies[group];
          }
        });
      }
    });

    if (maxSuggestedFrequency > 0) {
      const currentFrequency = form.getValues('repeatFrequencyDays');
      if (currentFrequency === '' || currentFrequency === undefined || Number(currentFrequency) < maxSuggestedFrequency) {
        form.setValue('repeatFrequencyDays', maxSuggestedFrequency);
      }
    }
  }, [form]);

  useEffect(() => {
    if (editingWorkoutId) {
      const workoutToEdit = getWorkoutById(editingWorkoutId);
      if (workoutToEdit) {
        form.reset({
          name: workoutToEdit.name,
          description: workoutToEdit.description || '',
          exercises: workoutToEdit.exercises.map(ex => ({
            id: ex.id || generateId(),
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || '',
            muscleGroups: ex.muscleGroups || [],
            notes: ex.notes || '',
            hasWarmup: ex.hasWarmup || false,
          })),
          repeatFrequencyDays: workoutToEdit.repeatFrequencyDays || undefined,
        });
      } else {
        toast({ title: "Erro", description: "Treino para edição não encontrado.", variant: "destructive" });
        router.push('/library');
      }
    } else {
      // Se não estiver editando e não houver exercícios, adicione um
      if (form.getValues('exercises').length === 0) {
        append({ 
          id: generateId(),
          name: '', 
          sets: userSettings.defaultSets, 
          reps: userSettings.defaultReps,
          weight: '',
          muscleGroups: [],
          notes: '',
          hasWarmup: false,
        });
      }
    }
  }, [editingWorkoutId, getWorkoutById, form, router, toast, userSettings.defaultSets, userSettings.defaultReps]);


  const appendNewExercise = (isModelExercise = false, modelExerciseData?: ModelExercise) => {
    const newExercise: Exercise = { 
      id: generateId(),
      name: modelExerciseData?.name || '', 
      sets: userSettings.defaultSets, 
      reps: userSettings.defaultReps,
      weight: modelExerciseData?.defaultWeight || '',
      muscleGroups: modelExerciseData?.muscleGroups || [],
      notes: modelExerciseData?.description || '',
      hasWarmup: isModelExercise,
    };
    append(newExercise);
    if (newExercise.muscleGroups && newExercise.muscleGroups.length > 0) {
      updateWorkoutFrequencyBasedOnExercises([...fields, newExercise]);
    }
  };

  const handleOpenMuscleGroupModal = (index: number) => {
    setEditingExerciseIndex(index);
    setIsMuscleGroupModalOpen(true);
  };

  const handleSaveMuscleGroups = (groups: string[]) => {
    if (editingExerciseIndex !== null) {
      const currentExercises = form.getValues('exercises');
      currentExercises[editingExerciseIndex].muscleGroups = groups;
      form.setValue(`exercises.${editingExerciseIndex}.muscleGroups`, groups);
      updateWorkoutFrequencyBasedOnExercises(currentExercises);
    }
    setIsMuscleGroupModalOpen(false);
    setEditingExerciseIndex(null);
  };

  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCategorySelected = (category: string) => {
    setSelectedExerciseCategory(category);
    setIsCategoryModalOpen(false);
    setIsSelectionModalOpen(true);
  };

  const handleModelExerciseSelected = (modelExercise: ModelExercise) => {
    appendNewExercise(true, modelExercise);
    setIsSelectionModalOpen(false);
    setSelectedExerciseCategory(null);
    toast({
      title: "Exercício Modelo Adicionado!",
      description: `${modelExercise.name} foi adicionado ao seu treino.`,
    });
  };

  async function onSubmit(values: WorkoutFormData) {
    setIsSaving(true);
    const workoutData: Workout = {
      id: editingWorkoutId || generateId(),
      name: values.name,
      description: values.description,
      exercises: values.exercises.map(ex => ({ 
        id: ex.id || generateId(), 
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || undefined,
        muscleGroups: ex.muscleGroups || [],
        notes: ex.notes || undefined,
        hasWarmup: ex.hasWarmup || false,
      } as Exercise)),
      repeatFrequencyDays: values.repeatFrequencyDays ? Number(values.repeatFrequencyDays) : undefined,
    };

    if (editingWorkoutId) {
      updateWorkout(workoutData);
      toast({
        title: "Treino Atualizado!",
        description: `${values.name} foi atualizado na sua biblioteca.`,
      });
    } else {
      addWorkout(workoutData);
      toast({
        title: "Treino Salvo!",
        description: `${values.name} foi adicionado à sua biblioteca.`,
      });
    }
    
    form.reset({
      name: '',
      description: '',
      exercises: [{ 
        id: generateId(),
        name: '', 
        sets: userSettings.defaultSets, 
        reps: userSettings.defaultReps,
        weight: '',
        muscleGroups: [],
        notes: '',
        hasWarmup: false,
      }],
      repeatFrequencyDays: undefined,
    });
    if (!editingWorkoutId && form.getValues('exercises').length === 0) {
        appendNewExercise(false);
    }

    setIsSaving(false);
    router.push('/library');
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">
          {editingWorkoutId ? 'Editar Treino' : 'Construtor de Treinos'}
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Detalhes do Treino</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Treino</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Força Total A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="ex: Foco em movimentos compostos, 60s de descanso." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repeatFrequencyDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repetir a cada (dias) - Opcional</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ex: 7 (para repetir semanalmente)" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Define com que frequência este treino aparecerá na "Esteira de Treinos" após ser concluído ou se ainda não foi feito.
                        Lembre-se de ajustar os dias de descanso conforme suas necessidades e, se possível, consulte um profissional de educação física.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Exercícios</CardTitle>
                <CardDescription>Adicione exercícios ao seu plano de treino.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                    <h3 className="font-medium">Exercício {index + 1}</h3>
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.name`}
                      render={({ field: exerciseField }) => (
                        <FormItem>
                          <FormLabel>Nome do Exercício</FormLabel>
                          <FormControl>
                            <Input placeholder="ex: Agachamentos" {...exerciseField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.sets`}
                        render={({ field: exerciseField }) => (
                          <FormItem>
                            <FormLabel>Séries</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="ex: 3" {...exerciseField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.reps`}
                        render={({ field: exerciseField }) => (
                          <FormItem>
                            <FormLabel>Reps/Duração</FormLabel>
                            <FormControl>
                              <Input placeholder="ex: 8-12 ou 30s" {...exerciseField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.weight`}
                        render={({ field: exerciseField }) => (
                          <FormItem>
                            <FormLabel>Peso (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="ex: 50kg, Peso Corporal" {...exerciseField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="button" variant="outline" size="sm" onClick={() => handleOpenMuscleGroupModal(index)}>
                      <Target className="mr-2 h-4 w-4" /> Selecionar Grupos Musculares
                    </Button>

                    {form.watch(`exercises.${index}.muscleGroups`) && form.watch(`exercises.${index}.muscleGroups`)!.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Grupos Musculares:</strong> {form.watch(`exercises.${index}.muscleGroups`)!.join(', ')}
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.hasWarmup`}
                      render={({ field: exerciseField }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-2">
                           <FormControl>
                            <Checkbox
                              checked={exerciseField.value}
                              onCheckedChange={exerciseField.onChange}
                              id={`hasWarmup-${index}`}
                            />
                          </FormControl>
                          <Label htmlFor={`hasWarmup-${index}`} className="font-normal cursor-pointer">
                            Incluir série de aquecimento?
                          </Label>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`exercises.${index}.notes`}
                      render={({ field: exerciseField }) => (
                        <FormItem>
                          <FormLabel>Observações (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="ex: Focar na execução lenta, aquecer bem antes." {...exerciseField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fields.length > 1 && (
                       <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2"
                        aria-label="Remover exercício"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendNewExercise(false)}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exercício
                    </Button>
                    <Button
                    type="button"
                    variant="secondary"
                    onClick={handleOpenCategoryModal}
                    >
                    <BookOpenCheck className="mr-2 h-4 w-4" /> Adicionar Exercício Modelo
                    </Button>
                </div>
                <FormDescription className="text-xs">
                    Exercícios modelo são sugestões e não constituem uma recomendação de treino profissional. Ajuste conforme suas necessidades.
                    Séries de aquecimento em exercícios modelo são marcadas por padrão.
                </FormDescription>

              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Salvando...' : (editingWorkoutId ? 'Salvar Alterações' : 'Salvar Treino')}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      {editingExerciseIndex !== null && (
        <MuscleGroupSelectorModal
          isOpen={isMuscleGroupModalOpen}
          onClose={() => {
            setIsMuscleGroupModalOpen(false);
            setEditingExerciseIndex(null);
          }}
          initialSelectedGroups={form.getValues(`exercises.${editingExerciseIndex}.muscleGroups`) || []}
          onSave={handleSaveMuscleGroups}
        />
      )}
      <ModelExerciseCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={handleCategorySelected}
      />
      {selectedExerciseCategory && (
        <ModelExerciseSelectionModal
          isOpen={isSelectionModalOpen}
          onClose={() => {
            setIsSelectionModalOpen(false);
            setSelectedExerciseCategory(null);
          }}
          category={selectedExerciseCategory}
          exercises={modelExerciseData[selectedExerciseCategory] || []}
          onSelectExercise={handleModelExerciseSelected}
        />
      )}
    </AppLayout>
  );
}
