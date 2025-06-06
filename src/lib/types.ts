
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
  repeatFrequencyDays?: number; 
  deadline?: string; // ISO Date string for deadline (opcional)
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // Reference to Workout.id
  workoutName: string; // Denormalized for easy display
  date: string; // ISO Date string (start date)
  isCompleted: boolean;
  notes?: string;
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
