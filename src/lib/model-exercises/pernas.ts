
import type { ModelExercise } from '../types';

export const pernasExercises: ModelExercise[] = [
  {
    name: "Agachamento Livre (Barra)",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)", "Lombar", "Abdômen", "Core"],
    description: "Posicione a barra sobre os trapézios. Mantenha os pés na largura dos ombros. Agache como se fosse sentar em uma cadeira, mantendo a coluna reta e o abdômen contraído, até as coxas ficarem paralelas ao chão ou mais baixo. Suba de volta.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Leg Press 45°",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)"],
    description: "Sente-se no aparelho, pés na plataforma na largura dos ombros. Destrave e desça a plataforma controladamente flexionando os joelhos. Empurre de volta à posição inicial sem travar os joelhos completamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Leg Press 90º (Horizontal ou Vertical)",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)"],
    description: "Posicione-se no aparelho de leg press vertical ou horizontal (conforme disponibilidade). Empurre a plataforma, mantendo o controle. Desça flexionando os joelhos a aproximadamente 90 graus ou conforme a amplitude da máquina. Evite que a lombar perca o contato com o apoio.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Cadeira Extensora",
    muscleGroups: ["Pernas (Quadríceps)"],
    description: "Sente-se na cadeira com os tornozelos sob o rolo. Estenda as pernas completamente, contraindo o quadríceps. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Cadeira Extensora Unilateral",
    muscleGroups: ["Pernas (Quadríceps)"],
    description: "Sente-se na cadeira extensora, ajustando para trabalhar uma perna de cada vez. Posicione o tornozelo sob o rolo. Estenda a perna completamente, contraindo o quadríceps. Retorne controladamente e depois troque a perna.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Mesa Flexora",
    muscleGroups: ["Pernas (Posteriores)", "Glúteos"],
    description: "Deite-se de bruços na mesa com os tornozelos sob o rolo. Flexione os joelhos, trazendo os calcanhares em direção aos glúteos. Retorne controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Flexora em Pé (Máquina)",
    muscleGroups: ["Pernas (Posteriores)"],
    description: "Apoie-se na máquina, com uma perna sob o rolo. Flexione o joelho, trazendo o calcanhar em direção ao glúteo. Retorne controladamente. Troque a perna.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Afundo (Passada)",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)"],
    description: "Dê um passo à frente e flexione ambos os joelhos a 90 graus, mantendo o tronco ereto. O joelho da frente não deve ultrapassar o tornozelo. Empurre de volta à posição inicial e alterne as pernas ou faça todas as repetições de um lado antes de trocar.",
    defaultWeight: "Peso Corporal / Halteres"
  },
  {
    name: "Agachamento Hack (Máquina)",
    muscleGroups: ["Pernas (Quadríceps)", "Glúteos"],
    description: "Posicione-se na máquina de hack squat com os ombros sob as almofadas e os pés na plataforma. Agache flexionando os joelhos até a profundidade desejada, mantendo a coluna apoiada. Empurre de volta à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Stiff (Barra ou Halteres)",
    muscleGroups: ["Pernas (Posteriores)", "Glúteos", "Lombar"],
    description: "Em pé, segure a barra (ou halteres) à frente do corpo. Com os joelhos levemente flexionados (quase retos), incline o tronco para frente a partir do quadril, mantendo a coluna reta e o peso próximo às pernas. Sinta o alongamento nos posteriores e retorne à posição ereta.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Cadeira Adutora",
    muscleGroups: ["Pernas (Interno da Coxa)"],
    description: "Sente-se na máquina com a parte interna das coxas contra as almofadas. Junte as pernas, apertando as almofadas. Controle o retorno à posição inicial.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Panturrilha Leg Press",
    muscleGroups: ["Panturrilhas"],
    description: "No aparelho de leg press, posicione as pontas dos pés na parte inferior da plataforma com os calcanhares para fora. Empurre a plataforma usando apenas a flexão plantar (movimento dos tornozelos), elevando os calcanhares. Desça controladamente.",
    defaultWeight: "Ajustável"
  },
  {
    name: "Panturrilha em Pé (Gêmeos)",
    muscleGroups: ["Panturrilhas"],
    description: "Em pé, com ou sem peso adicional (máquina, barra, halteres). Eleve os calcanhares o máximo possível, contraindo as panturrilhas. Desça controladamente.",
    defaultWeight: "Ajustável / Peso Corporal"
  },
  {
    name: "Panturrilha Sentado (Sóleo)",
    muscleGroups: ["Panturrilhas"], // Foco no músculo sóleo
    description: "Sente-se na máquina específica com os joelhos flexionados a 90 graus e a almofada sobre as coxas, próxima aos joelhos. Apoie as pontas dos pés na plataforma e eleve os calcanhares, contraindo as panturrilhas. Desça controladamente.",
    defaultWeight: "Ajustável"
  }
];
