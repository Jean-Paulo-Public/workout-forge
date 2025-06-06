export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "10-12", "AMRAP", "30s"
  // Optional fields
  weight?: number | string; // Can be number or "bodyweight"
  duration?: string; // e.g., "60s"
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  // Optional: category, lastPerformed (Date string), etc.
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // Reference to Workout.id
  workoutName: string; // Denormalized for easy display
  date: string; // ISO Date string
  notes?: string;
  // Optional: detailed performance log per exercise
  // exercisesPerformed?: Array<Exercise & { actualSets?: number; actualReps?: string; actualWeight?: number | string }>;
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  dateTime: string; // ISO DateTime string
  // Optional: completed (boolean)
}
