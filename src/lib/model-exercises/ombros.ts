
import type { ModelExercise } from '../types';

export const ombrosExercises: ModelExercise[] = [
  {
    name: "Desenvolvimento Militar (Barra ou Halteres)",
    muscleGroups: ["Ombros", "Tríceps"],
    description: "Em pé ou sentado, segure a barra na altura dos ombros (pegada pronada) ou halteres ao lado da cabeça. Empurre para cima até os braços quase esticarem. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Desenvolvimento Arnold (Halteres)",
    muscleGroups: ["Ombros", "Tríceps"],
    description: "Sentado ou em pé, segure halteres à frente dos ombros com as palmas voltadas para você. Ao elevar os halteres, rotacione os punhos de forma que as palmas fiquem para frente no topo do movimento. Inverta a rotação ao descer.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Desenvolvimento Máquina",
    muscleGroups: ["Ombros", "Tríceps"],
    description: "Sente-se na máquina de desenvolvimento para ombros, segurando os pegadores na altura dos ombros. Empurre para cima até os braços quase esticarem. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Elevação Lateral (Halteres)",
    muscleGroups: ["Ombros"],
    description: "Em pé, segure um halter em cada mão ao lado do corpo. Eleve os braços lateralmente até a altura dos ombros, mantendo os cotovelos levemente flexionados. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Elevação Frontal (Halteres ou Anilha)",
    muscleGroups: ["Ombros"],
    description: "Em pé, segure halteres ou uma anilha à frente do corpo. Eleve os braços à frente até a altura dos ombros. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Remada Alta (Barra ou Halteres)",
    muscleGroups: ["Ombros", "Trapézio"],
    description: "Em pé, segure a barra (ou halteres) com pegada pronada próxima. Puxe a barra verticalmente até a altura do peito, elevando os cotovelos acima dos ombros. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Crucifixo Invertido (Halteres ou Máquina)",
    muscleGroups: ["Ombros", "Costas"], // Foco no deltoide posterior e romboides/trapézio médio
    description: "Inclinado para frente (com halteres) ou sentado na máquina específica (voador invertido). Mantenha os cotovelos levemente flexionados. Abra os braços para os lados e para trás, contraindo a parte posterior dos ombros e as escápulas. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Encolhimento de Ombros (Halteres ou Barra)",
    muscleGroups: ["Trapézio"],
    description: "Em pé, segure halteres ao lado do corpo ou uma barra à frente. Eleve os ombros em direção às orelhas, sem flexionar os cotovelos. Contraia o trapézio no topo e desça controladamente.",
    defaultWeight: "Ajustável"
  }
];
