"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestWorkout, type SuggestWorkoutInput } from '@/ai/flows/suggest-workout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goals: z.string().min(3, "Goals must be at least 3 characters."),
  equipment: z.string().min(3, "Equipment description must be at least 3 characters."),
  workoutHistory: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AiWorkoutSuggester() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: '',
      equipment: '',
      workoutHistory: '',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const aiInput: SuggestWorkoutInput = {
        goals: values.goals,
        equipment: values.equipment,
        workoutHistory: values.workoutHistory || 'No specific history provided.',
      };
      const result = await suggestWorkout(aiInput);
      setSuggestion(result.suggestedExercises);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get AI workout suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="text-primary" />
          AI Workout Suggestions
        </CardTitle>
        <CardDescription>
          Get personalized workout suggestions based on your goals, available equipment, and history.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Goals</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Build muscle, lose weight, improve endurance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Equipment</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dumbbells, resistance bands, bodyweight only" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workoutHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout History (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Beginner, 3 times a week focusing on full body" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                "Get Suggestions"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {suggestion && (
        <CardContent>
          <h3 className="text-lg font-semibold mb-2 font-headline">Suggested Exercises:</h3>
          <div className="p-4 bg-secondary/50 rounded-md whitespace-pre-line text-sm">
            {suggestion}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
