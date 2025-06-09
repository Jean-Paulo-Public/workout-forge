
import type { ModelExercise } from '../types';

export const gluteosExercises: ModelExercise[] = [
  {
    name: "Elevação Pélvica (Hip Thrust)",
    muscleGroups: ["Glúteos", "Pernas (Posteriores)"],
    description: "Apoie as costas em um banco e os pés no chão. Coloque uma barra sobre o quadril. Empurre o quadril para cima, contraindo os glúteos, até o corpo formar uma linha reta dos ombros aos joelhos. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Coice de Mula (Cabo/Polia ou Máquina)",
    muscleGroups: ["Glúteos"],
    description: "Em quatro apoios ou em pé (na polia ou máquina específica). Mantenha o abdômen contraído e a coluna neutra. Estenda a perna para trás e para cima, contraindo o glúteo. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Agachamento Sumô (Halter ou Barra)",
    muscleGroups: ["Glúteos", "Pernas (Interno da Coxa)", "Pernas (Quadríceps)"],
    description: "Fique em pé com os pés mais afastados que a largura dos ombros e pontas dos pés voltadas para fora. Segure um halter verticalmente à frente do corpo (ou barra nas costas). Agache, mantendo a coluna reta e empurrando os joelhos para fora. Volte à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Cadeira Abdutora",
    muscleGroups: ["Glúteos"], // Foco no glúteo médio e mínimo
    description: "Sente-se na máquina com a parte externa das coxas contra as almofadas. Empurre as pernas para fora, afastando-as. Controle o retorno à posição inicial.",
    defaultWeight: "Ajustável"
  }
];
