
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "10-12", "AMRAP", "30s"
  weight?: string; // e.g., "50kg", "Peso Corporal", "Cardio" - This is the PLANNED/TARGET weight
  muscleGroups?: string[]; // e.g., ["Peito", "Tríceps"]
  notes?: string; // Campo opcional para observações
  hasWarmup?: boolean; // Indicates if this specific exercise has a warmup phase
  // Optional fields
  duration?: string; // e.g., "60s"
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  repeatFrequencyDays?: number; // Minimum rest days before appearing on the mat again
  daysForDeadline?: number; // Days from completion/creation to set the next deadline
  deadline?: string; // ISO Date string for deadline (opcional)
  hasGlobalWarmup?: boolean; // New field for general warm-up
}

export interface SessionExercisePerformance {
  exerciseId: string; // Corresponds to Exercise.id in the Workout
  exerciseName: string; // Denormalized for easier display
  plannedWeight?: string; // Weight from the workout plan
  weightUsed?: string; // Actual weight used in this session for this exercise
  hasWarmup?: boolean; // Copied from exercise for easier access in modal
  isWarmupCompleted?: boolean; // Tracks if the warmup for this specific exercise is done
  isExerciseCompleted?: boolean; // Tracks if this specific exercise is done
  restTimes?: number[]; // Array to store up to 3 last rest times in seconds

  // Fields for exercise substitution during a session
  isSubstitution?: boolean;
  originalExerciseId?: string; // ID of the exercise that was replaced
  originalExerciseName?: string; // Name of the exercise that was replaced
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // Reference to Workout.id
  workoutName: string; // Denormalized for easy display
  date: string; // ISO Date string (start date)
  isCompleted: boolean; // Overall session completion
  notes?: string;
  exercisePerformances: SessionExercisePerformance[]; // Tracks actual performance for each exercise
  isGlobalWarmupCompleted?: boolean; // Tracks if the general warm-up for the session is done
}

export interface UserSettings {
  defaultSets: number;
  defaultReps: string;
  defaultRestAlarmSeconds: number; // Default alarm time for rest timer in seconds
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
