
// Frequências de descanso sugeridas em dias para cada grupo muscular.
// Estes são valores de referência e podem variar com base na intensidade do treino,
// volume, dieta, sono e individualidade.
export const muscleGroupSuggestedFrequencies: Record<string, number> = {
  'Peito': 3,
  'Costas': 3,
  'Pernas (Quadríceps)': 4,
  'Pernas (Posteriores)': 4,
  'Glúteos': 4, // Assumindo que Glúteos seguem a lógica de Pernas
  'Ombros': 3,
  'Bíceps': 3,
  'Tríceps': 3,
  'Lombar': 4,
  'Trapézio': 3,
  'Panturrilhas': 3,
  'Abdômen': 2,
  'Antebraço': 2,
  // 'Cardio' não tem um impacto direto na frequência de descanso muscular para esta lógica.
};
