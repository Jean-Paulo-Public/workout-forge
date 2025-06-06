
'use client';

import type { ModelExercise, Exercise, Workout, UserSettings } from './types';
import { modelExerciseData } from './model-exercises';

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
  "Ombros": {
    name: "Treino Modelo - Ombros e Trapézio",
    description: "Um treino para desenvolver deltoides e trapézio.",
    targetMuscleGroups: [
      { group: 'Ombros', count: 2 },
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
  "Costas": {
    name: "Treino Modelo - Costas",
    description: "Um treino para construir costas largas e densas.",
    targetMuscleGroups: [
      { group: 'Costas', count: 3 }, 
    ],
    hasGlobalWarmup: true,
  },
  "Core e Acessórios": {
    name: "Treino Modelo - Core e Acessórios",
    description: "Exercícios para fortalecer o abdômen e lombar.",
    targetMuscleGroups: [
      { group: 'Abdômen', count: 2 },
      { group: 'Lombar', count: 1 },
    ],
    hasGlobalWarmup: true,
  }
};

export function generateWorkoutFromTemplate(
  templateKey: string,
  userSettings: UserSettings
): Omit<Workout, 'id' | 'repeatFrequencyDays' | 'deadline'> | null {
  const template = workoutTemplates[templateKey];
  if (!template) {
    console.error(`Template não encontrado: ${templateKey}`);
    return null;
  }

  const exercises: Exercise[] = [];
  const usedExerciseNames = new Set<string>();
  const assignedWarmupForGroup = new Set<string>(); // Tracks groups that got a warmup exercise

  template.targetMuscleGroups.forEach(target => {
    let modelExercisesForGroup = Object.values(modelExerciseData)
      .flat()
      .filter(ex => ex.muscleGroups.includes(target.group) && !usedExerciseNames.has(ex.name) && ex.muscleGroups[0] === target.group);

    if (modelExercisesForGroup.length < target.count) {
        const additionalExercises = Object.values(modelExerciseData)
            .flat()
            .filter(ex => ex.muscleGroups.includes(target.group) && !usedExerciseNames.has(ex.name) && !modelExercisesForGroup.some(me => me.name === ex.name));
        modelExercisesForGroup = [...modelExercisesForGroup, ...additionalExercises];
    }
    
    const shuffled = modelExercisesForGroup.sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, target.count);

    if (selectedExercises.length < target.count) {
        console.warn(`Não foram encontrados exercícios suficientes para o grupo ${target.group} no modelo ${templateKey}. Encontrados: ${selectedExercises.length}, Pedidos: ${target.count}`);
    }

    selectedExercises.forEach(modelEx => {
      let exerciseSpecificWarmup = false;
      if (determineModelExerciseWarmup(modelEx)) { // Check if this exercise type *can* have a warmup
        if (!assignedWarmupForGroup.has(target.group)) { // Is this the first exercise for this group getting a warmup?
          exerciseSpecificWarmup = true;
          assignedWarmupForGroup.add(target.group);
        }
      }

      exercises.push({
        id: generateId(),
        name: modelEx.name,
        sets: userSettings.defaultSets,
        reps: userSettings.defaultReps,
        weight: modelEx.defaultWeight || '',
        muscleGroups: modelEx.muscleGroups,
        notes: modelEx.description,
        hasWarmup: exerciseSpecificWarmup, // Apply determined warmup state
      });
      usedExerciseNames.add(modelEx.name);
    });
  });

  if (exercises.length === 0) {
      console.warn(`Nenhum exercício gerado para o modelo: ${templateKey}`);
      return null;
  }

  return {
    name: template.name,
    description: template.description,
    exercises,
    hasGlobalWarmup: template.hasGlobalWarmup !== undefined ? template.hasGlobalWarmup : true,
  };
}
