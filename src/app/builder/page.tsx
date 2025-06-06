"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import type { Exercise } from '@/lib/types';
import { useRouter } from 'next/navigation';

const exerciseSchema = z.object({
  name: z.string().min(2, "Exercise name is too short."),
  sets: z.coerce.number().min(1, "Sets must be at least 1."),
  reps: z.string().min(1, "Reps are required."),
  // Optional fields can be added here, e.g., weight, duration
});

const workoutFormSchema = z.object({
  name: z.string().min(3, "Workout name must be at least 3 characters."),
  description: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, "Add at least one exercise."),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

const generateId = () => crypto.randomUUID();

export default function WorkoutBuilderPage() {
  const { addWorkout } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [{ name: '', sets: 3, reps: '10-12' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  async function onSubmit(values: WorkoutFormData) {
    setIsSaving(true);
    const newWorkout = {
      name: values.name,
      description: values.description,
      exercises: values.exercises.map(ex => ({ ...ex, id: generateId() } as Exercise)),
    };
    addWorkout(newWorkout);
    toast({
      title: "Workout Saved!",
      description: `${values.name} has been added to your library.`,
    });
    form.reset();
    setIsSaving(false);
    router.push('/library');
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Workout Builder</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Workout Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Full Body Strength A" {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Focus on compound movements, 60s rest." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Exercises</CardTitle>
                <CardDescription>Add exercises to your workout plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                    <h3 className="font-medium">Exercise {index + 1}</h3>
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.name`}
                      render={({ field: exerciseField }) => (
                        <FormItem>
                          <FormLabel>Exercise Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Squats" {...exerciseField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.sets`}
                        render={({ field: exerciseField }) => (
                          <FormItem>
                            <FormLabel>Sets</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 3" {...exerciseField} />
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
                            <FormLabel>Reps/Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 8-12 or 30s" {...exerciseField} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                       <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2"
                        aria-label="Remove exercise"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: '', sets: 3, reps: '10-12' })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Workout'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
