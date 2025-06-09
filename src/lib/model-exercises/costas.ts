
import type { ModelExercise } from '../types';

export const costasExercises: ModelExercise[] = [
  {
    name: "Barra Fixa (Pegada Pronada)",
    muscleGroups: ["Costas", "Bíceps", "Antebraço"],
    description: "Segure a barra com as mãos em pronação (palmas para frente), um pouco mais largas que os ombros. Puxe o corpo para cima até o queixo ultrapassar a barra. Desça controladamente.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Barra Fixa Braço Aberto (Pegada Pronada Ampla)",
    muscleGroups: ["Costas", "Bíceps"],
    description: "Segure a barra com pegada pronada (palmas para frente) bem mais larga que os ombros. Puxe o corpo para cima, focando em levar o peito à barra. Desça controladamente. Enfatiza a largura das costas.",
    defaultWeight: "Peso Corporal"
  },
  {
    name: "Remada Curvada (Barra)",
    muscleGroups: ["Costas", "Bíceps", "Lombar"],
    description: "Incline o tronco para frente mantendo a coluna reta, joelhos levemente flexionados. Segure a barra com pegada pronada. Puxe a barra em direção ao abdômen, contraindo as escápulas. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Remada Cavalinho (Barra T ou Adaptador)",
    muscleGroups: ["Costas", "Bíceps", "Lombar"],
    description: "Com uma barra presa a um canto (ou máquina específica), posicione-se sobre ela. Use uma pegada neutra ou pronada no pegador. Mantenha o tronco inclinado e a coluna reta. Puxe o peso em direção ao peito/abdômen, contraindo as escápulas. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Puxada Alta (Pulley Frontal)",
    muscleGroups: ["Costas", "Bíceps"],
    description: "Sente-se no aparelho com os joelhos presos sob o suporte. Segure a barra com pegada aberta (pronada). Puxe a barra em direção à parte superior do peito, inclinando levemente o tronco para trás e mantendo a coluna reta. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Remada Máquina Sentado (Apoio no Peito)",
    muscleGroups: ["Costas", "Bíceps"],
    description: "Sente-se na máquina com o peito apoiado. Segure os pegadores com a pegada desejada (neutra, pronada). Puxe os pegadores em direção ao corpo, contraindo as escápulas. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Serrote (Remada Unilateral com Halter)",
    muscleGroups: ["Costas", "Bíceps", "Lombar"],
    description: "Apoie um joelho e a mão do mesmo lado em um banco. Segure um halter com a outra mão, braço estendido. Mantenha a coluna reta. Puxe o halter em direção ao quadril, mantendo o cotovelo próximo ao corpo. Desça controladamente. Repita para o outro lado.",
    defaultWeight: "Ajustável"
  }
];
