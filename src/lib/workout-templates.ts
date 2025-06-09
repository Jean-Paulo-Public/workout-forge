
'use client';

import type { ModelExercise, Exercise, Workout, UserSettings } from './types';
import { modelExerciseData } from './model-exercises'; // Atualizado para o novo caminho
import { muscleGroupSuggestedFrequencies } from './muscle-group-frequencies';
import { startOfToday, addDays } from 'date-fns';

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Copied from src/app/builder/page.tsx and adapted
function determineModelExerciseWarmup(exerciseDetails?: ModelExercise): boolean {
  if (!exerciseDetails) return true;
  const nameLower = exerciseDetails.name.toLowerCase();
  const isCardio = exerciseDetails.muscleGroups.includes('Cardio');
  const isHIIT = nameLower.includes('hiit');

  if (nameLower === 'prancha abdominal' || nameLower === 'alongamento (geral)' || (isCardio && !isHIIT)) {
    return false;
  }
  return true;
}

const generateId = () => crypto.randomUUID();

export interface WorkoutTemplate {
  name: string;
  description: string;
  targetMuscleGroups: { group: string; count: number }[];
  hasGlobalWarmup?: boolean;
}

export const workoutTemplates: Record<string, WorkoutTemplate> = {
  "Pernas": {
    name: "Treino Modelo - Pernas",
    description: "Um treino completo para as pernas, incluindo quadríceps, posteriores, glúteos e panturrilhas.",
    targetMuscleGroups: [
      { group: 'Pernas (Quadríceps)', count: 2 },
      { group: 'Pernas (Posteriores)', count: 2 },
      { group: 'Glúteos', count: 2 },
      { group: 'Panturrilhas', count: 2 },
    ],
    hasGlobalWarmup: false,
  },
  "Pernas_Mini": {
    name: "Treino Modelo - Pernas [ Mini ]",
    description: "Versão compacta do treino de Pernas, com um exercício por grupo muscular principal.",
    targetMuscleGroups: [
      { group: 'Pernas (Quadríceps)', count: 1 },
      { group: 'Pernas (Posteriores)', count: 1 },
      { group: 'Glúteos', count: 1 },
      { group: 'Panturrilhas', count: 1 },
    ],
    hasGlobalWarmup: false,
  },
  "Braços": {
    name: "Treino Modelo - Braços",
    description: "Um treino focado em bíceps, tríceps e antebraços.",
    targetMuscleGroups: [
      { group: 'Bíceps', count: 2 },
      { group: 'Tríceps', count: 2 },
      { group: 'Antebraço', count: 2 },
    ],
    hasGlobalWarmup: true,
  },
  "Braços_Mini": {
    name: "Treino Modelo - Braços [ Mini ]",
    description: "Versão compacta do treino de Braços, com foco em um exercício para bíceps, tríceps e antebraço.",
    targetMuscleGroups: [
      { group: 'Bíceps', count: 1 },
      { group: 'Tríceps', count: 1 },
      { group: 'Antebraço', count: 1 },
    ],
    hasGlobalWarmup: true,
  },
  "Ombros": {
    name: "Treino Modelo - Ombros e Trapézio",
    description: "Um treino para desenvolver deltoides e trapézio.",
    targetMuscleGroups: [
      { group: 'Ombros', count: 2 },
      { group: 'Trapézio', count: 1 },
    ],
    hasGlobalWarmup: true,
  },
  "Ombros_Mini": {
    name: "Treino Modelo - Ombros e Trapézio [ Mini ]",
    description: "Versão compacta para deltoides e trapézio, com um exercício chave para cada.",
    targetMuscleGroups: [
      { group: 'Ombros', count: 1 },
      { group: 'Trapézio', count: 1 },
    ],
    hasGlobalWarmup: true,
  },
  "Peitoral": {
    name: "Treino Modelo - Peitoral",
    description: "Um treino focado no desenvolvimento do peitoral.",
    targetMuscleGroups: [
      { group: 'Peito', count: 3 },
    ],
    hasGlobalWarmup: true,
  },
  "Peitoral_Mini": {
    name: "Treino Modelo - Peitoral [ Mini ]",
    description: "Versão compacta para o desenvolvimento do peitoral, com um exercício principal.",
    targetMuscleGroups: [
      { group: 'Peito', count: 1 },
    ],
    hasGlobalWarmup: true,
  },
  "Costas": {
    name: "Treino Modelo - Costas",
    description: "Um treino para construir costas largas e densas.",
    targetMuscleGroups: [
      { group: 'Costas', count: 3 },
    ],
    hasGlobalWarmup: true,
  },
  "Costas_Mini": {
    name: "Treino Modelo - Costas [ Mini ]",
    description: "Versão compacta para as costas, com um exercício fundamental.",
    targetMuscleGroups: [
      { group: 'Costas', count: 1 },
    ],
    hasGlobalWarmup: true,
  },
  "CoreEAcessorios": {
    name: "Treino Modelo - Core e Acessórios",
    description: "Exercícios para fortalecer o abdômen e lombar.",
    targetMuscleGroups: [
      { group: 'Abdômen', count: 2 },
      { group: 'Lombar', count: 1 },
    ],
    hasGlobalWarmup: true, 
  },
  "CoreEAcessorios_Mini": {
    name: "Treino Modelo - Core e Acessórios [ Mini ]",
    description: "Versão compacta para fortalecer abdômen e lombar, com um exercício para cada.",
    targetMuscleGroups: [
      { group: 'Abdômen', count: 1 },
      { group: 'Lombar', count: 1 },
    ],
    hasGlobalWarmup: true,
  }
};

interface GeneratedWorkoutOutput {
  workoutData: Omit<Workout, 'id'>;
  suggestedFrequencyDays?: number;
  suggestedDeadlineISO?: string;
}

export function generateWorkoutFromTemplate(
  templateKey: string,
  userSettings: UserSettings,
  existingWorkouts: Workout[] = []
): GeneratedWorkoutOutput | null {
  const template = workoutTemplates[templateKey];
  if (!template) {
    console.error(`Template não encontrado: ${templateKey}`);
    return null;
  }

  const generatedExercises: Exercise[] = [];
  const usedExerciseNamesInCurrentWorkout = new Set<string>();
  const assignedWarmupForGroup = new Set<string>();

  const allExistingExerciseNames = new Set<string>();
  existingWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => allExistingExerciseNames.add(ex.name));
  });

  const allModelExercisesFlat = Object.values(modelExerciseData).flat();

  template.targetMuscleGroups.forEach(target => {
    const exercisesForThisGroupTarget: ModelExercise[] = [];
    
    let candidates = allModelExercisesFlat.filter(modelEx => 
        modelEx.muscleGroups.includes(target.group) && 
        !usedExerciseNamesInCurrentWorkout.has(modelEx.name)
    );

    const brandNewCandidates = candidates.filter(c => !allExistingExerciseNames.has(c.name));
    const existingElsewhereCandidates = candidates.filter(c => allExistingExerciseNames.has(c.name));

    shuffleArray(brandNewCandidates);
    shuffleArray(existingElsewhereCandidates);

    let needed = target.count;

    for (const newEx of brandNewCandidates) {
        if (needed === 0) break;
        exercisesForThisGroupTarget.push(newEx);
        usedExerciseNamesInCurrentWorkout.add(newEx.name);
        needed--;
    }

    if (needed > 0) {
        for (const existingEx of existingElsewhereCandidates) {
            if (needed === 0) break;
            if (!usedExerciseNamesInCurrentWorkout.has(existingEx.name)) { 
                exercisesForThisGroupTarget.push(existingEx);
                usedExerciseNamesInCurrentWorkout.add(existingEx.name);
                needed--;
            }
        }
    }
    
    if (exercisesForThisGroupTarget.length < target.count) {
      console.warn(`Não foram encontrados exercícios suficientes para o grupo ${target.group} no modelo ${templateKey} após considerar os existentes. Encontrados: ${exercisesForThisGroupTarget.length}, Pedidos: ${target.count}`);
    }

    exercisesForThisGroupTarget.forEach(modelEx => {
      let exerciseSpecificWarmup = false;
      if (determineModelExerciseWarmup(modelEx)) {
        if (target.count === 1 || !assignedWarmupForGroup.has(target.group)) {
          exerciseSpecificWarmup = true;
          assignedWarmupForGroup.add(target.group);
        }
      }

      generatedExercises.push({
        id: generateId(),
        name: modelEx.name,
        sets: userSettings.defaultSets,
        reps: userSettings.defaultReps,
        weight: modelEx.defaultWeight || '',
        muscleGroups: modelEx.muscleGroups,
        notes: modelEx.description,
        hasWarmup: exerciseSpecificWarmup,
      });
    });
  });

  if (generatedExercises.length === 0 && template.targetMuscleGroups.length > 0) {
      console.warn(`Nenhum exercício gerado para o modelo: ${templateKey}`);
  }

  let suggestedFrequencyDays: number | undefined = undefined;
  let suggestedDeadlineISO: string | undefined = undefined;
  const today = startOfToday();

  const majorMuscleGroupsForMini = [
      'Peito', 'Costas', 
      'Pernas (Quadríceps)', 'Pernas (Posteriores)', 'Glúteos', 
      'Lombar' 
    ];

  if (templateKey.includes("_Mini")) {
    let calculatedRepeatFrequency = 1; // Default para mini (músculos menores)
    for (const exercise of generatedExercises) {
        if (exercise.muscleGroups?.some(group => majorMuscleGroupsForMini.includes(group))) {
            calculatedRepeatFrequency = 2; // Músculos grandes -> 2 dias
            break;
        }
    }
    suggestedFrequencyDays = calculatedRepeatFrequency;
  } else {
    // Para modelos normais, calcular a frequência máxima sugerida
    let maxSuggestedFrequency = 0;
    generatedExercises.forEach(exercise => {
      if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
        exercise.muscleGroups.forEach(group => {
          if (muscleGroupSuggestedFrequencies[group] && muscleGroupSuggestedFrequencies[group] > maxSuggestedFrequency) {
            maxSuggestedFrequency = muscleGroupSuggestedFrequencies[group];
          }
        });
      }
    });
    if (maxSuggestedFrequency > 0) {
      suggestedFrequencyDays = maxSuggestedFrequency;
    }
  }

  if (suggestedFrequencyDays && suggestedFrequencyDays > 0) {
    suggestedDeadlineISO = addDays(today, suggestedFrequencyDays).toISOString();
  }


  const workoutData: Omit<Workout, 'id'> = {
    name: template.name,
    description: template.description,
    exercises: generatedExercises,
    hasGlobalWarmup: template.hasGlobalWarmup !== undefined ? template.hasGlobalWarmup : true,
    repeatFrequencyDays: undefined, // Será definido pelo usuário no modal
    deadline: undefined, // Será definido pelo usuário no modal
  };

  return {
    workoutData,
    suggestedFrequencyDays,
    suggestedDeadlineISO,
  };
}
