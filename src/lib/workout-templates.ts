
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
  "CoreEAcessorios": { // Chave alterada para evitar espaços e caracteres especiais
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
    // Prioritize exercises where the target group is listed first
    let modelExercisesForGroup = Object.values(modelExerciseData)
      .flat()
      .filter(ex => ex.muscleGroups.includes(target.group) && !usedExerciseNames.has(ex.name) && ex.muscleGroups[0] === target.group);

    // If not enough primary exercises, get any exercise that includes the target group
    if (modelExercisesForGroup.length < target.count) {
        const additionalExercises = Object.values(modelExerciseData)
            .flat()
            .filter(ex => ex.muscleGroups.includes(target.group) && !usedExerciseNames.has(ex.name) && !modelExercisesForGroup.some(me => me.name === ex.name));
        modelExercisesForGroup = [...modelExercisesForGroup, ...additionalExercises.filter(addEx => !modelExercisesForGroup.find(me => me.name === addEx.name))]; // Ensure no duplicates if already added
    }
    
    const shuffled = modelExercisesForGroup.sort(() => 0.5 - Math.random());
    const selectedExercises = shuffled.slice(0, target.count);

    if (selectedExercises.length < target.count) {
        console.warn(`Não foram encontrados exercícios suficientes para o grupo ${target.group} no modelo ${templateKey}. Encontrados: ${selectedExercises.length}, Pedidos: ${target.count}`);
    }

    selectedExercises.forEach(modelEx => {
      let exerciseSpecificWarmup = false;
      // Determine if this exercise type should have a warmup
      if (determineModelExerciseWarmup(modelEx)) {
        // For Mini templates (count: 1) or the first eligible exercise in a normal template for that group
        if (target.count === 1 || !assignedWarmupForGroup.has(target.group)) {
          exerciseSpecificWarmup = true;
          assignedWarmupForGroup.add(target.group); // Mark that this group has received a warmup exercise
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
        hasWarmup: exerciseSpecificWarmup,
      });
      usedExerciseNames.add(modelEx.name);
    });
  });

  if (exercises.length === 0) {
      console.warn(`Nenhum exercício gerado para o modelo: ${templateKey}`);
      // Return a workout with an empty exercise list instead of null if the template itself exists
      // This might be better for UI handling if a template is valid but finds no exercises
      return {
        name: template.name,
        description: template.description,
        exercises: [],
        hasGlobalWarmup: template.hasGlobalWarmup !== undefined ? template.hasGlobalWarmup : true,
      };
  }

  return {
    name: template.name,
    description: template.description,
    exercises,
    hasGlobalWarmup: template.hasGlobalWarmup !== undefined ? template.hasGlobalWarmup : true,
  };
}
