
import type { ModelExercise } from '../types';

export const outrosExercises: ModelExercise[] = [
  {
    name: "Prancha Abdominal",
    muscleGroups: ["Abdômen", "Lombar", "Core"],
    description: "Apoie os antebraços e as pontas dos pés no chão. Mantenha o corpo reto da cabeça aos calcanhares, contraindo o abdômen e os glúteos. Segure a posição pelo tempo desejado.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Abdominal Supra (Crunch)",
    muscleGroups: ["Abdômen"],
    description: "Deite-se de costas com os joelhos flexionados e pés no chão. Mãos atrás da cabeça ou cruzadas no peito. Eleve a cabeça e os ombros do chão, contraindo o abdômen. Desça controladamente.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Abdominal Infra (Elevação de Pernas)",
    muscleGroups: ["Abdômen"],
    description: "Deite-se de costas, pernas estendidas ou levemente flexionadas. Mãos ao lado do corpo ou sob os glúteos para apoio. Eleve as pernas em direção ao teto, mantendo a lombar pressionada contra o chão. Desça controladamente.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Abdominal Oblíquo (Bicicleta)",
    muscleGroups: ["Abdômen"],
    description: "Deite-se de costas, mãos atrás da cabeça. Traga um joelho em direção ao peito enquanto o cotovelo oposto se move em direção a ele. Alterne os lados em um movimento de pedalada.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Cadeira de Lombar (Hiperextensão)",
    muscleGroups: ["Lombar", "Glúteos", "Pernas (Posteriores)"],
    description: "Posicione-se na cadeira de hiperextensão com os quadris apoiados e os tornozelos presos. Com a coluna reta, desça o tronco e retorne à posição inicial, contraindo a lombar e os glúteos. Evite hiperextender demais no topo.",
    defaultWeight: "Peso Corporal / Anilha"
  },
  {
    name: "Double Press (Halteres ou Kettlebells)",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Ombros", "Tríceps", "Abdômen", "Costas", "Lombar", "Core"],
    description: "Com um halter ou kettlebell em cada mão, comece com os pesos no chão ou em posição de hang. Faça um clean (puxada) para os ombros e, em seguida, um push press ou jerk para elevar os pesos acima da cabeça. É um movimento composto e explosivo.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Alongamento (Geral)",
    muscleGroups: ["Cardio"], // Para categorização e lógica de não aquecimento
    description: "Realize uma série de alongamentos estáticos ou dinâmicos para os principais grupos musculares. Mantenha cada alongamento por 20-30 segundos. Pode ser feito antes ou depois do treino para melhorar a flexibilidade e auxiliar na recuperação.",
    defaultWeight: "N/A"
  }
];
