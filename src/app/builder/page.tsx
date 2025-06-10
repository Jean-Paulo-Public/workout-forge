
"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
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
import { PlusCircle, Trash2, Save, Target, BookOpenCheck, CalendarIcon, Flame, ArrowUp, ArrowDown, BarChartHorizontalBig, Replace } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Exercise, ModelExercise, Workout } from '@/lib/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { MuscleGroupSelectorModal } from '@/components/MuscleGroupSelectorModal';
import { ModelExerciseCategoryModal } from '@/components/ModelExerciseCategoryModal';
import { ModelExerciseSelectionModal } from '@/components/ModelExerciseSelectionModal';
import { modelExerciseData } from '@/lib/model-exercises/index';
import { muscleGroupSuggestedFrequencies } from '@/lib/muscle-group-frequencies';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, addDays, startOfToday, isBefore, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Separator } from '@/components/ui/separator';

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
  hasGlobalWarmup: z.boolean().optional(),
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
  daysForDeadline: z.coerce.number().positive("Deve ser um número positivo.").optional().or(z.literal('')),
  deadline: z.date().optional(),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;
interface MuscleGroupSummary {
  [groupName: string]: number;
}

const generateId = () => crypto.randomUUID();

function determineModelExerciseWarmup(exerciseDetails?: ModelExercise): boolean {
  if (!exerciseDetails) return true; 

  const nameLower = exerciseDetails.name.toLowerCase();
  const isCardio = exerciseDetails.muscleGroups.includes('Cardio');
  const isHIIT = nameLower.includes('hiit');

  if (nameLower === 'prancha abdominal') return false;
  if (nameLower === 'alongamento (geral)') return false;
  if (isCardio && !isHIIT) return false;
  
  return true; 
}

function WorkoutBuilderClientContent() {
  const { addWorkout, updateWorkout, getWorkoutById, userSettings } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingWorkoutId = searchParams.get('editId');

  const [isSaving, setIsSaving] = useState(false);
  const [isMuscleGroupModalOpen, setIsMuscleGroupModalOpen] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  const [exerciseIndexToReplace, setExerciseIndexToReplace] = useState<number | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedExerciseCategory, setSelectedExerciseCategory] = useState<string | null>(null);
  const [currentWorkoutMuscleSummary, setCurrentWorkoutMuscleSummary] = useState<MuscleGroupSummary>({});
  const [operationType, setOperationType] = useState<'add' | 'replace'>('add');


  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      description: '',
      hasGlobalWarmup: true,
      exercises: [],
      repeatFrequencyDays: undefined,
      daysForDeadline: undefined,
      deadline: undefined,
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const isInitialLoadDoneRef = useRef(false);

  const suggestRepeatFrequencyDays = useCallback((exercisesInput?: z.infer<typeof baseExerciseSchema>[]) => {
    let maxSuggestedFrequency = 0;
    const exercisesToEvaluate = (exercisesInput || form.getValues('exercises'))
                                .filter(ex => ex.name && ex.name.trim() !== '');

    exercisesToEvaluate.forEach(exercise => {
      if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        exercise.muscleGroups.forEach(group => {
          if (muscleGroupSuggestedFrequencies[group] && muscleGroupSuggestedFrequencies[group] > maxSuggestedFrequency) {
            maxSuggestedFrequency = muscleGroupSuggestedFrequencies[group];
          }
        });
      }
    });
    
    const currentFrequencyField = form.getValues('repeatFrequencyDays');
    if (currentFrequencyField === '' || currentFrequencyField === undefined || Number(currentFrequencyField) === 0) {
        if (maxSuggestedFrequency > 0) {
            form.setValue('repeatFrequencyDays', maxSuggestedFrequency, { shouldDirty: true, shouldValidate: true });
        }
    }
  }, [form]);


  useEffect(() => {
    isInitialLoadDoneRef.current = false;
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
          hasGlobalWarmup: workoutToEdit.hasGlobalWarmup !== undefined ? workoutToEdit.hasGlobalWarmup : true,
          exercises: formExercises,
          repeatFrequencyDays: workoutToEdit.repeatFrequencyDays || undefined,
          daysForDeadline: workoutToEdit.daysForDeadline || undefined,
          deadline: workoutToEdit.deadline ? parseISO(workoutToEdit.deadline) : undefined,
        });

        if (formExercises.length > 0) {
            setTimeout(() => {
                const currentExercisesInForm = form.getValues('exercises');
                suggestRepeatFrequencyDays(currentExercisesInForm);
            }, 0);
        }
      } else {
        toast({ title: "Erro", description: "Treino para edição não encontrado.", variant: "destructive" });
        router.push('/library');
      }
    } else {
      form.reset({
        name: '',
        description: '',
        hasGlobalWarmup: true,
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
        daysForDeadline: undefined,
        deadline: undefined,
      });
    }
    setTimeout(() => { isInitialLoadDoneRef.current = true; }, 100);
  }, [editingWorkoutId, getWorkoutById, form, toast, router, userSettings.defaultSets, userSettings.defaultReps, suggestRepeatFrequencyDays]);


  const watchedDaysForDeadline = form.watch('daysForDeadline');
  const watchedExercises = form.watch('exercises');

  useEffect(() => {
    const summary: MuscleGroupSummary = {};
    watchedExercises.forEach(ex => {
        if (ex && ex.name && ex.name.trim() !== '') {
            const setsValue = typeof ex.sets === 'string' ? parseInt(ex.sets, 10) : ex.sets;
            if (typeof setsValue === 'number' && !isNaN(setsValue) && setsValue > 0) {
                (ex.muscleGroups || []).forEach(group => {
                    summary[group] = (summary[group] || 0) + setsValue;
                });
            }
        }
    });
    setCurrentWorkoutMuscleSummary(summary);
  }, [watchedExercises]);


  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return;

    const daysString = String(watchedDaysForDeadline);
    if (daysString === '' || daysString === 'undefined' || daysString === 'null') return;

    const days = parseInt(daysString, 10);

    if (!isNaN(days) && days > 0) {
      const todayAnchor = startOfToday();
      const newDeadlineDate = addDays(todayAnchor, days);
      form.setValue('deadline', newDeadlineDate, { shouldValidate: true, shouldDirty: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDaysForDeadline, form.setValue]);


  const appendNewExercise = (isModelExercise = false, modelExerciseDetails?: ModelExercise) => {
    const newExerciseData: z.infer<typeof baseExerciseSchema> = {
      id: generateId(),
      name: modelExerciseDetails?.name || '',
      sets: userSettings.defaultSets,
      reps: userSettings.defaultReps,
      weight: modelExerciseDetails?.defaultWeight || '',
      muscleGroups: modelExerciseDetails?.muscleGroups || [],
      notes: modelExerciseDetails?.description || '',
      hasWarmup: isModelExercise ? determineModelExerciseWarmup(modelExerciseDetails) : false,
    };

    append(newExerciseData);
    setTimeout(() => {
        const currentExercises = form.getValues('exercises');
        suggestRepeatFrequencyDays(currentExercises);
    }, 0);
  };

  const handleOpenMuscleGroupModal = (index: number) => {
    setEditingExerciseIndex(index);
    setIsMuscleGroupModalOpen(true);
  };

  const handleSaveMuscleGroups = (groups: string[]) => {
    if (editingExerciseIndex !== null) {
      form.setValue(`exercises.${editingExerciseIndex}.muscleGroups`, groups, { shouldDirty: true });
      setTimeout(() => {
        const currentExercises = form.getValues('exercises');
        suggestRepeatFrequencyDays(currentExercises);
      }, 0);
    }
    setIsMuscleGroupModalOpen(false);
    setEditingExerciseIndex(null);
  };

  const handleOpenCategoryModalForAdd = () => {
    setOperationType('add');
    setExerciseIndexToReplace(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryModalForReplace = (index: number) => {
    setOperationType('replace');
    setExerciseIndexToReplace(index);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySelected = (category: string) => {
    setSelectedExerciseCategory(category);
    setIsCategoryModalOpen(false);
    setIsSelectionModalOpen(true);
  };

  const handleModelExerciseSelected = (modelExercise: ModelExercise) => {
    if (operationType === 'replace' && exerciseIndexToReplace !== null) {
      const currentExercise = form.getValues(`exercises.${exerciseIndexToReplace}`);
      update(exerciseIndexToReplace, {
        ...currentExercise, // Preserve ID, sets, reps
        name: modelExercise.name,
        muscleGroups: modelExercise.muscleGroups || [],
        notes: modelExercise.description || '',
        weight: modelExercise.defaultWeight || currentExercise.weight || '',
        hasWarmup: determineModelExerciseWarmup(modelExercise),
      });
      toast({
        title: "Exercício Trocado!",
        description: `${modelExercise.name} substituiu o exercício anterior.`,
      });
    } else { // Default to add
      appendNewExercise(true, modelExercise);
      toast({
        title: "Exercício Modelo Adicionado!",
        description: `${modelExercise.name} foi adicionado ao seu treino.`,
      });
    }
    setIsSelectionModalOpen(false);

    if (form.getValues('name').trim() === '' && selectedExerciseCategory && operationType === 'add') {
      form.setValue('name', selectedExerciseCategory, { shouldDirty: true });
    }
    
    setTimeout(() => {
        const currentExercises = form.getValues('exercises');
        suggestRepeatFrequencyDays(currentExercises);
    }, 0);

    setSelectedExerciseCategory(null);
    setExerciseIndexToReplace(null);
  };

  async function onSubmit(values: WorkoutFormData) {
    setIsSaving(true);
    const workoutData: Workout = {
      id: editingWorkoutId || generateId(),
      name: values.name,
      description: values.description,
      hasGlobalWarmup: values.hasGlobalWarmup,
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
      daysForDeadline: values.daysForDeadline ? Number(values.daysForDeadline) : undefined,
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

    if (!editingWorkoutId) {
        form.reset({
            name: '',
            description: '',
            hasGlobalWarmup: true,
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
            daysForDeadline: undefined,
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
                  name="hasGlobalWarmup"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                       <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="hasGlobalWarmup"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <Label htmlFor="hasGlobalWarmup" className="font-normal cursor-pointer">
                          Incluir aquecimento geral na esteira?
                        </Label>
                        <FormDescription className="text-xs">
                           Se marcado, um passo "Concluir Aquecimento (Geral)" aparecerá na tela de progresso antes de acompanhar os exercícios.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="daysForDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias para Deadline (Define o próximo prazo)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ex: 7 (para definir o deadline para 7 dias a partir de hoje/conclusão)" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Número de dias a partir de hoje (ou da data de conclusão do treino) para definir a próxima data limite. Ex: 7 para uma semana.
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
                      <FormLabel>Data Limite (Deadline) - Opcional</FormLabel>
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
                            onSelect={(date) => {
                              field.onChange(date);
                              // If user manually picks a date, clear daysForDeadline if you want the date to be the source of truth
                              // form.setValue('daysForDeadline', '', { shouldDirty: true });
                            }}
                            disabled={(date) => isBefore(date, startOfToday()) && !isEqual(date, startOfToday()) }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Data limite para este treino. Será preenchido automaticamente se "Dias para Deadline" for informado, mas pode ser ajustado manualmente.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="repeatFrequencyDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dias de Descanso Mínimo (Disponibilidade na esteira)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ex: 3 (para reaparecer após 3 dias)" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} value={field.value ?? ''} />
                      </FormControl>
                      <FormDescription>
                        Número mínimo de dias de descanso antes deste treino reaparecer na "Esteira de Treinos" após ser concluído.
                        Será sugerido automaticamente com base nos grupos musculares. Se possível, consulte um profissional.
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
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg pt-1">Exercício {index + 1}</h3>
                        <div className="flex gap-1">
                             <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenCategoryModalForReplace(index)}
                                title="Trocar exercício"
                            >
                                <Replace className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => move(index, index - 1)}
                                disabled={index === 0}
                                title="Mover exercício para cima"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => move(index, index + 1)}
                                disabled={index === fields.length - 1}
                                title="Mover exercício para baixo"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            {fields.length > 0 && ( // Show remove only if there's at least one, or more than one if you want to enforce min 1
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    title="Remover exercício"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

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
                            Incluir série de aquecimento para este exercício?
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
                    onClick={handleOpenCategoryModalForAdd}
                    >
                    <BookOpenCheck className="mr-2 h-4 w-4" /> Adicionar Exercício Modelo
                    </Button>
                </div>
                <FormDescription className="text-xs">
                    Exercícios modelo são sugestões e não constituem uma recomendação de treino profissional. Ajuste conforme suas necessidades.
                    Séries de aquecimento em exercícios modelo são marcadas por padrão, exceto para alguns exercícios específicos (ex: Cardio regular, Prancha).
                    O aquecimento geral do treino (na esteira) pode ser configurado nos Detalhes do Treino.
                </FormDescription>
                
                {Object.keys(currentWorkoutMuscleSummary).length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
                      <BarChartHorizontalBig className="h-5 w-5 text-primary" />
                      Resumo de Séries por Grupo Muscular (Atual)
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-3 gap-x-4">
                      {Object.entries(currentWorkoutMuscleSummary)
                        .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
                        .map(([group, count]) => (
                        <li key={group} className="flex justify-between">
                          <span className="font-medium text-foreground">{group}:</span> 
                          <span>{count} séries</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
            setExerciseIndexToReplace(null); 
          }}
          category={selectedExerciseCategory}
          exercises={modelExerciseData[selectedExerciseCategory] || []}
          onSelectExercise={handleModelExerciseSelected}
        />
      )}
    </AppLayout>
  );
}

export default function WorkoutBuilderPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full text-lg">Carregando construtor...</div>}>
      <WorkoutBuilderClientContent />
    </Suspense>
  );
}
