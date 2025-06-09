
import type { ModelExercise } from '../types';

export const bracosExercises: ModelExercise[] = [
  {
    name: "Rosca Direta (Barra ou Halteres)",
    muscleGroups: ["Bíceps", "Antebraço"],
    description: "Em pé, segure a barra ou halteres com pegada supinada (palmas para cima). Flexione os cotovelos, trazendo o peso em direção aos ombros. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Rosca Concentrada (Halter)",
    muscleGroups: ["Bíceps"],
    description: "Sentado em um banco, incline o tronco à frente e apoie o cotovelo do braço que segura o halter na parte interna da coxa. Deixe o braço estender completamente e flexione o cotovelo, trazendo o halter em direção ao ombro. Mantenha o cotovelo fixo e concentre o movimento no bíceps. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Rosca Martelo (Halteres)",
    muscleGroups: ["Bíceps", "Antebraço"], // Principalmente Braquial e Braquiorradial
    description: "Em pé ou sentado, segure halteres com pegada neutra (palmas voltadas para o corpo). Flexione os cotovelos, elevando os halteres em direção aos ombros, mantendo a pegada neutra. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Tríceps Testa (Barra EZ ou Halteres)",
    muscleGroups: ["Tríceps"],
    description: "Deitado em um banco reto, segure a barra EZ ou halteres acima da testa com os cotovelos apontando para o teto. Desça o peso em direção à testa flexionando os cotovelos. Estenda os braços de volta.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Tríceps Pulley (Corda ou Barra)",
    muscleGroups: ["Tríceps"],
    description: "Em pé, de frente para o pulley alto. Segure a corda ou barra com pegada pronada ou neutra. Mantenha os cotovelos próximos ao corpo e estenda os braços para baixo. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Tríceps Francês (Halter, Barra EZ ou Barra)",
    muscleGroups: ["Tríceps"],
    description: "Deitado, sentado ou em pé. Segure um halter com ambas as mãos (ou barra EZ/barra) acima da cabeça. Flexione os cotovelos, descendo o peso para trás da cabeça. Estenda os braços, contraindo o tríceps. Mantenha os cotovelos relativamente estáveis.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Tríceps Barra de Apoio (Mergulho)",
    muscleGroups: ["Tríceps", "Peito", "Ombros"],
    description: "Use barras paralelas ou um banco. Mantenha o corpo ereto para focar no tríceps, ou incline-se para frente para maior ativação do peito. Desça flexionando os cotovelos e empurre para cima.",
    defaultWeight: "Peso Corporal / Ajustável"
  },
  {
    name: "Tríceps Máquina (Extensão)",
    muscleGroups: ["Tríceps"],
    description: "Sente-se na máquina de extensão de tríceps, segurando os pegadores. Estenda os braços, empurrando para baixo ou para frente, dependendo da máquina. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Antebraço Barra (Rosca de Punho)",
    muscleGroups: ["Antebraço"],
    description: "Sentado, apoie os antebraços nas coxas ou em um banco, com os punhos para fora. Segure uma barra com pegada pronada (para flexores) ou supinada (para extensores). Flexione ou estenda os punhos, movendo apenas as mãos. Controle o movimento.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Rosca Zottman",
    muscleGroups: ["Antebraço", "Bíceps"],
    description: "Em pé, segure halteres com pegada supinada (palmas para cima). Realize uma rosca direta. No topo, rotacione os punhos para uma pegada pronada (palmas para baixo) e desça o peso controladamente. Na base, rotacione de volta para a pegada supinada para a próxima repetição.",
    defaultWeight: "Ajustável"
  }
];
