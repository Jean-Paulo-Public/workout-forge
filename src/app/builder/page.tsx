"use client";

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save, Target } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Exercise } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { MuscleGroupSelectorModal } from '@/components/MuscleGroupSelectorModal';

const exerciseSchema = z.object({
  name: z.string().min(2, "O nome do exercício é muito curto."),
  sets: z.coerce.number().min(1, "As séries devem ser pelo menos 1."),
  reps: z.string().min(1, "As repetições são obrigatórias."),
  weight: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
});

const workoutFormSchema = z.object({
  name: z.string().min(3, "O nome do treino deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, "Adicione pelo menos um exercício."),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

const generateId = () => crypto.randomUUID();

export default function WorkoutBuilderPage() {
  const { addWorkout, userSettings } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [{ 
        name: '', 
        sets: userSettings.defaultSets, 
        reps: userSettings.defaultReps,
        weight: '',
        muscleGroups: [],
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });
  
  useEffect(() => {
    if (fields.length === 0) {
       append({ 
        name: '', 
        sets: userSettings.defaultSets, 
        reps: userSettings.defaultReps,
        weight: '',
        muscleGroups: [],
      });
    }
  }, [userSettings, fields.length, append]);

  const handleOpenModal = (index: number) => {
    setEditingExerciseIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveMuscleGroups = (groups: string[]) => {
    if (editingExerciseIndex !== null) {
      form.setValue(`exercises.${editingExerciseIndex}.muscleGroups`, groups);
    }
    setIsModalOpen(false);
    setEditingExerciseIndex(null);
  };

  async function onSubmit(values: WorkoutFormData) {
    setIsSaving(true);
    const newWorkout = {
      name: values.name,
      description: values.description,
      exercises: values.exercises.map(ex => ({ 
        ...ex, 
        id: generateId(),
        weight: ex.weight || undefined,
        muscleGroups: ex.muscleGroups || [],
      } as Exercise)),
    };
    addWorkout(newWorkout);
    toast({
      title: "Treino Salvo!",
      description: `${values.name} foi adicionado à sua biblioteca.`,
    });
    form.reset({
      name: '',
      description: '',
      exercises: [{ 
        name: '', 
        sets: userSettings.defaultSets, 
        reps: userSettings.defaultReps,
        weight: '',
        muscleGroups: [],
      }],
    });
    setIsSaving(false);
    router.push('/library');
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Construtor de Treinos</h1>
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
                    
                    <Button type="button" variant="outline" size="sm" onClick={() => handleOpenModal(index)}>
                      <Target className="mr-2 h-4 w-4" /> Selecionar Grupos Musculares
                    </Button>

                    {form.watch(`exercises.${index}.muscleGroups`) && form.watch(`exercises.${index}.muscleGroups`)!.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Grupos Musculares:</strong> {form.watch(`exercises.${index}.muscleGroups`)!.join(', ')}
                      </div>
                    )}

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ 
                    name: '', 
                    sets: userSettings.defaultSets, 
                    reps: userSettings.defaultReps, 
                    weight: '',
                    muscleGroups: [] 
                  })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exercício
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Salvando...' : 'Salvar Treino'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      {editingExerciseIndex !== null && (
        <MuscleGroupSelectorModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExerciseIndex(null);
          }}
          initialSelectedGroups={form.getValues(`exercises.${editingExerciseIndex}.muscleGroups`) || []}
          onSave={handleSaveMuscleGroups}
        />
      )}
    </AppLayout>
  );
}
