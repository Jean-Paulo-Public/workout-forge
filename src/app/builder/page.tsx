
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { PlusCircle, Trash2, Save, Target, BookOpenCheck, CalendarIcon } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Exercise, ModelExercise, Workout } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { MuscleGroupSelectorModal } from '@/components/MuscleGroupSelectorModal';
import { ModelExerciseCategoryModal } from '@/components/ModelExerciseCategoryModal';
import { ModelExerciseSelectionModal } from '@/components/ModelExerciseSelectionModal';
import { modelExerciseData } from '@/lib/model-exercises';
import { muscleGroupSuggestedFrequencies } from '@/lib/muscle-group-frequencies';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, addDays, startOfToday, isBefore, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const baseExerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string(), 
  sets: z.coerce.number().optional(), 
  reps: z.string().optional(), 
  weight: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  notes: z.string().optional(),
  hasWarmup: z.boolean().optional(),
});

const exerciseSchema = baseExerciseSchema.superRefine((data, ctx) => {
  if (data.name.trim() !== '') { 
    if (data.name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: 2,
        type: "string",
        inclusive: true,
        message: "O nome do exercício é muito curto.",
        path: ['name'],
      });
    }

    if (data.sets === undefined || data.sets === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As séries são obrigatórias.", path: ['sets'] });
    } else if (typeof data.sets === 'number' && isNaN(data.sets)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As séries devem ser um número válido.", path: ['sets'] });
    } else if (typeof data.sets === 'number' && data.sets < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "As séries devem ser pelo menos 1.", path: ['sets'] });
    } else if (typeof data.sets !== 'number') { 
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato inválido para séries.", path: ['sets']});
    }

    if (data.reps === undefined || data.reps === null || data.reps.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As repetições são obrigatórias.",
        path: ['reps'],
      });
    }
  }
});


const workoutFormSchema = z.object({
  name: z.string().min(3, "O nome do treino deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema)
    .transform(exercises => {
      return exercises.filter(ex => ex.name.trim() !== '');
    })
    .refine(filteredExercises => {
      return filteredExercises.length > 0;
    }, {
      message: "Adicione pelo menos um exercício preenchido.",
    }),
  repeatFrequencyDays: z.coerce.number().positive("A frequência deve ser um número positivo.").optional().or(z.literal('')),
  deadline: z.date().optional(),
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
      deadline: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const isInitialLoadDoneRef = useRef(false);

  const updateWorkoutFrequencyAndSuggestDeadline = useCallback((currentExercises: z.infer<typeof baseExerciseSchema>[] = []) => {
    let maxSuggestedFrequency = 0;
    const exercisesToEvaluate = currentExercises.length > 0 ? currentExercises : form.getValues('exercises');
    
    exercisesToEvaluate.forEach(exercise => {
      if (exercise.name.trim() !== '' && exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        exercise.muscleGroups.forEach(group => {
          if (muscleGroupSuggestedFrequencies[group] && muscleGroupSuggestedFrequencies[group] > maxSuggestedFrequency) {
            maxSuggestedFrequency = muscleGroupSuggestedFrequencies[group];
          }
        });
      }
    });

    if (maxSuggestedFrequency > 0) {
      const currentFrequencyField = form.getValues('repeatFrequencyDays');
      const currentFrequency = currentFrequencyField === '' || currentFrequencyField === undefined ? 0 : Number(currentFrequencyField); 

      if (currentFrequency === 0 || currentFrequency < maxSuggestedFrequency) {
         form.setValue('repeatFrequencyDays', maxSuggestedFrequency);
         // Se a frequência mudou E o deadline está vazio, sugira o deadline
         if (!form.getValues('deadline')) {
            const today = startOfToday();
            const suggestedDeadlineDate = addDays(today, maxSuggestedFrequency);
            form.setValue('deadline', suggestedDeadlineDate);
         }
      }
    }
  }, [form]);

  useEffect(() => {
    isInitialLoadDoneRef.current = false; // Reset on new load or ID change
    if (editingWorkoutId) {
      const workoutToEdit = getWorkoutById(editingWorkoutId);
      if (workoutToEdit) {
        const formExercises = workoutToEdit.exercises.map(ex => ({
            id: ex.id || generateId(),
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || '',
            muscleGroups: ex.muscleGroups || [],
            notes: ex.notes || '',
            hasWarmup: ex.hasWarmup || false,
          }));

        form.reset({
          name: workoutToEdit.name,
          description: workoutToEdit.description || '',
          exercises: formExercises,
          repeatFrequencyDays: workoutToEdit.repeatFrequencyDays || undefined,
          deadline: workoutToEdit.deadline ? parseISO(workoutToEdit.deadline) : undefined,
        });
        
        if (formExercises.length > 0) {
            updateWorkoutFrequencyAndSuggestDeadline(formExercises);
        }
      } else {
        toast({ title: "Erro", description: "Treino para edição não encontrado.", variant: "destructive" });
        router.push('/library');
      }
    } else {
      form.reset({ // Reset para um formulário limpo se não estiver editando
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
        deadline: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(() => { isInitialLoadDoneRef.current = true; }, 0); // Allow initial form state to settle
  }, [editingWorkoutId, getWorkoutById, form.reset, router, toast, userSettings.defaultSets, userSettings.defaultReps, updateWorkoutFrequencyAndSuggestDeadline]);
  // Nota: form.reset e updateWorkoutFrequencyAndSuggestDeadline são estáveis, mas incluídos por completude. append foi removido.


  const watchedRepeatFrequencyDays = form.watch('repeatFrequencyDays');

  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return; // Don't run on initial load after reset

    const frequencyString = String(watchedRepeatFrequencyDays);
    const frequency = parseInt(frequencyString, 10);

    if (!isNaN(frequency) && frequency > 0) {
      const today = startOfToday();
      const suggestedDeadlineDate = addDays(today, frequency);
      const currentDeadline = form.getValues('deadline');

      if (!currentDeadline || isBefore(startOfToday(currentDeadline), suggestedDeadlineDate) || !isEqual(startOfToday(currentDeadline), suggestedDeadlineDate)) {
        form.setValue('deadline', suggestedDeadlineDate, { shouldValidate: true, shouldDirty: true });
      }
    }
  }, [watchedRepeatFrequencyDays, form]);


  const appendNewExercise = (isModelExercise = false, modelExerciseDetails?: ModelExercise) => {
    const newExerciseData = { 
      id: generateId(),
      name: modelExerciseDetails?.name || '', 
      sets: userSettings.defaultSets, 
      reps: userSettings.defaultReps,
      weight: modelExerciseDetails?.defaultWeight || '',
      muscleGroups: modelExerciseDetails?.muscleGroups || [],
      notes: modelExerciseDetails?.description || '',
      hasWarmup: isModelExercise, 
    };
    append(newExerciseData);
    
    // Passar a lista de exercícios atualizada explicitamente
    const currentExercises = form.getValues('exercises'); //Pega os valores após o append
    updateWorkoutFrequencyAndSuggestDeadline(currentExercises); 
  };

  const handleOpenMuscleGroupModal = (index: number) => {
    setEditingExerciseIndex(index);
    setIsMuscleGroupModalOpen(true);
  };

  const handleSaveMuscleGroups = (groups: string[]) => {
    if (editingExerciseIndex !== null) {
      form.setValue(`exercises.${editingExerciseIndex}.muscleGroups`, groups); 
      updateWorkoutFrequencyAndSuggestDeadline(form.getValues('exercises'));
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

    if (!form.getValues('name').trim() && selectedExerciseCategory) {
      form.setValue('name', selectedExerciseCategory);
    }
    
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
        sets: ex.sets as number, 
        reps: ex.reps as string, 
        weight: ex.weight || undefined,
        muscleGroups: ex.muscleGroups || [],
        notes: ex.notes || undefined,
        hasWarmup: ex.hasWarmup || false,
      })),
      repeatFrequencyDays: values.repeatFrequencyDays ? Number(values.repeatFrequencyDays) : undefined,
      deadline: values.deadline ? values.deadline.toISOString() : undefined,
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
    
    // Reset form for new workout entry only if not editing
    if (!editingWorkoutId) {
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
            deadline: undefined,
        });
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
                        Ajuste os dias de descanso conforme suas necessidades. Se possível, consulte um profissional de educação física.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline (Data Limite) - Opcional</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Escolha uma data limite</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => isBefore(date, startOfToday()) && !isEqual(date, startOfToday()) } 
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Defina uma data limite para este treino aparecer destacado na esteira. Será sugerido automaticamente se "Repetir a cada (dias)" for preenchido.
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
                <CardDescription>Adicione exercícios ao seu plano de treino. Exercícios com nome não preenchido serão ignorados ao salvar.</CardDescription>
                 <FormField
                  control={form.control}
                  name="exercises"
                  render={() => ( 
                    <FormItem>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-md space-y-4 relative">
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

                    {fields.length > 0 && ( 
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
      {editingExerciseIndex !== null && form.getValues('exercises')?.[editingExerciseIndex] && ( 
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
