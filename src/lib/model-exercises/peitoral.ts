
import type { ModelExercise } from '../types';

export const peitoralExercises: ModelExercise[] = [
  {
    name: "Supino Reto (Barra)",
    muscleGroups: ["Peito", "Ombros", "Tríceps"],
    description: "Deite-se em um banco reto, segure a barra com uma pegada um pouco mais larga que os ombros. Desça a barra controladamente até tocar o peito e empurre de volta à posição inicial. Mantenha os cotovelos levemente flexionados no topo.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Supino Inclinado (Halteres)",
    muscleGroups: ["Peito", "Ombros", "Tríceps"],
    description: "Deite-se em um banco inclinado (30-45 graus). Segure um halter em cada mão na altura do peito, com as palmas voltadas para frente. Empurre os halteres para cima até quase se tocarem, e desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Supino Declinado (Barra ou Halteres)",
    muscleGroups: ["Peito", "Tríceps"],
    description: "Deite-se em um banco declinado. Segure a barra ou halteres com pegada média. Desça o peso em direção à parte inferior do peitoral. Empurre de volta à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Crucifixo Reto (Halteres)",
    muscleGroups: ["Peito"],
    description: "Deite-se em um banco reto, segure um halter em cada mão acima do peito, com as palmas voltadas uma para a outra e cotovelos levemente flexionados. Abra os braços lateralmente em um arco amplo até sentir o alongamento do peitoral, e retorne à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Flexão de Braço",
    muscleGroups: ["Peito", "Ombros", "Tríceps", "Abdômen", "Core"],
    description: "Mãos no chão alinhadas com os ombros, corpo reto. Desça o corpo dobrando os cotovelos até o peito quase tocar o chão e empurre de volta. Mantenha o core ativado.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Pull Over (Halter ou Barra)",
    muscleGroups: ["Peito", "Costas", "Tríceps"],
    description: "Deite-se transversalmente em um banco com apenas os ombros apoiados, ou longitudinalmente. Segure um halter com ambas as mãos (ou barra) acima do peito. Desça o peso para trás da cabeça em um arco, alongando o peitoral e o latíssimo. Retorne à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Voador Máquina (Peck Deck)",
    muscleGroups: ["Peito"],
    description: "Sente-se na máquina com as costas apoiadas. Segure os pegadores ou apoie os antebraços nas almofadas. Junte os braços à frente do corpo, contraindo o peitoral. Retorne controladamente.",
    defaultWeight: "Ajustável"
  }
];
