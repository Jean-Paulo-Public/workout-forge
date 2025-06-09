
import type { ModelExerciseCategories } from '../types';
import { peitoralExercises } from './peitoral';
import { costasExercises } from './costas';
import { pernasExercises } from './pernas';
import { gluteosExercises } from './gluteos';
import { ombrosExercises } from './ombros';
import { bracosExercises } from './bracos';
import { cardioExercises } from './cardio';
import { outrosExercises } from './outros';

export const modelExerciseData: ModelExerciseCategories = {
  "Peitoral": peitoralExercises,
  "Costas": costasExercises,
  "Pernas": pernasExercises,
  "Glúteos": gluteosExercises,
  "Ombros": ombrosExercises,
  "Braços": bracosExercises,
  "Cardio": cardioExercises,
  "Outros": outrosExercises,
};
