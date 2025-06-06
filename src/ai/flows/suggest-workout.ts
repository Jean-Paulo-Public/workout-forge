'use server';

/**
 * @fileOverview AI-powered workout suggestion flow.
 *
 * - suggestWorkout - A function that suggests exercises for a workout based on user input.
 * - SuggestWorkoutInput - The input type for the suggestWorkout function.
 * - SuggestWorkoutOutput - The return type for the suggestWorkout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWorkoutInputSchema = z.object({
  goals: z
    .string()
    .describe(
      'The user specified goals for the workout (e.g., strength, endurance, flexibility).'
    ),
  equipment: z
    .string()
    .describe('The equipment available to the user for the workout.'),
  workoutHistory: z
    .string()
    .describe('A summary of the users previous workout history.'),
});
export type SuggestWorkoutInput = z.infer<typeof SuggestWorkoutInputSchema>;

const SuggestWorkoutOutputSchema = z.object({
  suggestedExercises: z
    .string()
    .describe('A list of suggested exercises for the workout.'),
});
export type SuggestWorkoutOutput = z.infer<typeof SuggestWorkoutOutputSchema>;

export async function suggestWorkout(input: SuggestWorkoutInput): Promise<
  SuggestWorkoutOutput
> {
  return suggestWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkoutPrompt',
  input: {schema: SuggestWorkoutInputSchema},
  output: {schema: SuggestWorkoutOutputSchema},
  prompt: `You are a personal trainer who suggests workout exercises based on the user's goals, available equipment, and workout history.

  Goals: {{{goals}}}
  Equipment: {{{equipment}}}
  Workout History: {{{workoutHistory}}}

  Suggest exercises that align with the goals and can be performed with the available equipment, considering the workout history to provide variety and progression. If workout history is unavailable focus on common exercises.

  Return the suggested exercises as a list.
  `,
});

const suggestWorkoutFlow = ai.defineFlow(
  {
    name: 'suggestWorkoutFlow',
    inputSchema: SuggestWorkoutInputSchema,
    outputSchema: SuggestWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
