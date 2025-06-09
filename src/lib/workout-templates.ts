
'use client';

import type { ModelExercise, Exercise, Workout, UserSettings } from './types';
import { modelExerciseData } from './model-exercises/index'; // Corrigido para o novo caminho do diretório
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

function determineModelExerciseWarmup(exerciseDetails?: ModelExercise): boolean {
  if (!exerciseDetails) return true;
  const nameLower = exerciseDetails.name.toLowerCase();
  const isCardio = exerciseDetails.muscleGroups.includes('Cardio');
  const isHIIT = nameLower.includes('hiit');

  if (nameLower === 'prancha abdominal' || nameLower === 'alongamento (geral)' || (isCardio && !isHIIT)) {
    return false;
  }
  // For Core/Accessory specific exercises, generally no specific warmup step in the template
  if (['Abdômen', 'Lombar', 'Antebraço'].some(coreGroup => exerciseDetails.muscleGroups.includes(coreGroup)) &&
      !exerciseDetails.muscleGroups.some(majorGroup => ['Peito', 'Costas', 'Pernas (Quadríceps)', 'Pernas (Posteriores)', 'Glúteos', 'Ombros'].includes(majorGroup))
  ) {
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
      { group: 'Antebraço', count: 1 }, // Ajustado para 1 para mais foco, pode ser 2
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
      { group: 'Peito', count: 1 }, // Poderia ser 2 para um mini mais focado
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
      { group: 'Costas', count: 1 }, // Poderia ser 2
    ],
    hasGlobalWarmup: true,
  },
  "CoreEAcessorios": {
    name: "Treino Modelo - Core e Acessórios",
    description: "Exercícios para fortalecer abdômen, lombar e antebraços.",
    targetMuscleGroups: [
      { group: 'Abdômen', count: 2 },
      { group: 'Lombar', count: 1 },
      { group: 'Antebraço', count: 1 },
    ],
    hasGlobalWarmup: false,
  },
  "CoreEAcessorios_Mini": {
    name: "Treino Modelo - Core e Acessórios [ Mini ]",
    description: "Versão compacta para fortalecer abdômen e lombar.",
    targetMuscleGroups: [
      { group: 'Abdômen', count: 1 },
      { group: 'Lombar', count: 1 },
    ],
    hasGlobalWarmup: false,
  }
};

interface GeneratedWorkoutOutput {
  workoutData: Omit<Workout, 'id'>;
  suggestedFrequencyDays?: number;
  suggestedDeadlineISO?: string;
}


// Define specific lists of appropriate exercises for Core & Accessories templates
const coreSpecificAbdominalExercises: ModelExercise[] = modelExerciseData['Outros'].filter(ex =>
  ex.muscleGroups.includes('Abdômen') && !ex.name.includes('Flexão de Braço') && !ex.name.includes('Agachamento')
); // e.g., Prancha, Supra, Infra, Oblíquo

const coreSpecificLombarExercises: ModelExercise[] = modelExerciseData['Outros'].filter(ex =>
  ex.name === 'Cadeira de Lombar (Hiperextensão)'
);

const coreSpecificAntebracoExercises: ModelExercise[] = modelExerciseData['Braços'].filter(ex =>
  ex.muscleGroups.includes('Antebraço') && (ex.name === 'Antebraço Barra (Rosca de Punho)' || ex.name === 'Rosca Zottman')
);


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
  const assignedWarmupForGroup = new Set<string>(); // Track if warmup assigned for a group

  const allExistingExerciseNames = new Set<string>();
  existingWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => allExistingExerciseNames.add(ex.name));
  });

  const isCoreTemplate = templateKey.startsWith("CoreEAcessorios");

  template.targetMuscleGroups.forEach(target => {
    let exercisesForThisGroupTarget: ModelExercise[] = [];
    let candidatePool: ModelExercise[];

    if (isCoreTemplate) {
      if (target.group === 'Abdômen') {
        candidatePool = [...coreSpecificAbdominalExercises];
      } else if (target.group === 'Lombar') {
        candidatePool = [...coreSpecificLombarExercises];
      } else if (target.group === 'Antebraço') {
        candidatePool = [...coreSpecificAntebracoExercises];
      } else {
        candidatePool = []; // Should not happen if template is defined correctly
      }
    } else {
      // Original logic for non-core templates
      candidatePool = Object.values(modelExerciseData).flat().filter(modelEx =>
        modelEx.muscleGroups.includes(target.group)
      );
    }
    
    let candidates = candidatePool.filter(modelEx => !usedExerciseNamesInCurrentWorkout.has(modelEx.name));
    
    // Simple sort to prefer more "specific" exercises (fewer muscle groups listed)
    // This helps but isn't a perfect solution for all cases.
    candidates.sort((a, b) => a.muscleGroups.length - b.muscleGroups.length);

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
      let exerciseSpecificWarmup = determineModelExerciseWarmup(modelEx);

      // For multi-exercise groups, only assign specific warmup to a limited number (e.g., first one)
      if (exerciseSpecificWarmup && target.count > 1) {
        if (assignedWarmupForGroup.has(target.group)) {
          exerciseSpecificWarmup = false; // Warmup already assigned for one exercise in this group
        } else {
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

  // Logic for suggestedFrequencyDays and suggestedDeadlineISO
  let suggestedFrequencyDays: number | undefined = undefined;
  let suggestedDeadlineISO: string | undefined = undefined;
  const today = startOfToday();

  if (templateKey.includes("_Mini")) {
    const majorMuscleGroupsInMini = [
      'Peito', 'Costas', 
      'Pernas (Quadríceps)', 'Pernas (Posteriores)', 'Glúteos', 
      'Lombar' // Consider Lombar as major for this specific calculation
    ];
    const hasMajorMuscle = generatedExercises.some(ex => 
        ex.muscleGroups?.some(group => majorMuscleGroupsInMini.includes(group))
    );
    suggestedFrequencyDays = hasMajorMuscle ? 2 : 1;
  } else if (!isCoreTemplate) { // Normal (non-mini, non-core) templates
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
  } else { // Core templates (non-mini and mini)
      suggestedFrequencyDays = 2; // Default for core workouts, can be adjusted
  }


  if (suggestedFrequencyDays && suggestedFrequencyDays > 0) {
    suggestedDeadlineISO = addDays(today, suggestedFrequencyDays).toISOString();
  }


  const workoutData: Omit<Workout, 'id'> = {
    name: template.name,
    description: template.description,
    exercises: generatedExercises,
    hasGlobalWarmup: template.hasGlobalWarmup !== undefined ? template.hasGlobalWarmup : (isCoreTemplate ? false : true), // Default global warmup false for core
    repeatFrequencyDays: undefined,
    deadline: undefined, 
  };

  return {
    workoutData,
    suggestedFrequencyDays,
    suggestedDeadlineISO,
  };
}
