
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "10-12", "AMRAP", "30s"
  weight?: string; // e.g., "50kg", "Peso Corporal", "Cardio" - This is the PLANNED/TARGET weight
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
  repeatFrequencyDays?: number;
  deadline?: string; // ISO Date string for deadline (opcional)
}

export interface SessionExercisePerformance {
  exerciseId: string; // Corresponds to Exercise.id in the Workout
  exerciseName: string; // Denormalized for easier display
  plannedWeight?: string; // Weight from the workout plan
  weightUsed?: string; // Actual weight used in this session
  // Potentially add setsCompleted, repsCompleted in the future
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // Reference to Workout.id
  workoutName: string; // Denormalized for easy display
  date: string; // ISO Date string (start date)
  isCompleted: boolean;
  notes?: string;
  warmupCompleted?: boolean; // Indica se a fase de aquecimento (se houver) foi concluída
  exercisePerformances?: SessionExercisePerformance[]; // Tracks actual performance
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
