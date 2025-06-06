
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "10-12", "AMRAP", "30s"
  weight?: string; // e.g., "50kg", "Peso Corporal", "Cardio"
  muscleGroups?: string[]; // e.g., ["Peito", "Tríceps"]
  notes?: string; // Campo opcional para observações
  hasWarmup?: boolean; // Novo campo para série de aquecimento
  // Optional fields
  duration?: string; // e.g., "60s"
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  repeatFrequencyDays?: number; // Novo campo para frequência de repetição
  // Optional: category, lastPerformed (Date string), etc.
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // Reference to Workout.id
  workoutName: string; // Denormalized for easy display
  date: string; // ISO Date string (start date)
  isCompleted: boolean;
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

export interface UserSettings {
  defaultSets: number;
  defaultReps: string;
}

// Tipos para Exercícios Modelo
export interface ModelExercise {
  name: string;
  muscleGroups: string[];
  description: string; // Usado para o campo 'notes'
  defaultWeight?: string;
}

export interface ModelExerciseCategories {
  [category: string]: ModelExercise[];
}
