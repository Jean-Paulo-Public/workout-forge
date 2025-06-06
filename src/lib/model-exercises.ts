
import type { ModelExerciseCategories } from './types';

export const modelExerciseData: ModelExerciseCategories = {
  "Peitoral": [
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
      name: "Crucifixo Reto (Halteres)",
      muscleGroups: ["Peito"],
      description: "Deite-se em um banco reto, segure um halter em cada mão acima do peito, com as palmas voltadas uma para a outra e cotovelos levemente flexionados. Abra os braços lateralmente em um arco amplo até sentir o alongamento do peitoral, e retorne à posição inicial.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Flexão de Braço",
      muscleGroups: ["Peito", "Ombros", "Tríceps", "Abdômen"],
      description: "Mãos no chão alinhadas com os ombros, corpo reto. Desça o corpo dobrando os cotovelos até o peito quase tocar o chão e empurre de volta. Mantenha o core ativado.",
      defaultWeight: "Peso Corporal"
    }
  ],
  "Costas": [
    {
      name: "Barra Fixa (Puxada)",
      muscleGroups: ["Costas", "Bíceps", "Antebraço"],
      description: "Segure a barra com as mãos em pronação (palmas para frente) ou supinação (palmas para você), um pouco mais largas que os ombros. Puxe o corpo para cima até o queixo ultrapassar a barra. Desça controladamente.",
      defaultWeight: "Peso Corporal"
    },
    {
      name: "Remada Curvada (Barra)",
      muscleGroups: ["Costas", "Bíceps", "Lombar"],
      description: "Incline o tronco para frente mantendo a coluna reta, joelhos levemente flexionados. Segure a barra com pegada pronada. Puxe a barra em direção ao abdômen, contraindo as escápulas. Desça controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Puxada Alta (Pulley)",
      muscleGroups: ["Costas", "Bíceps"],
      description: "Sente-se no aparelho com os joelhos presos sob o suporte. Segure a barra com pegada aberta. Puxe a barra em direção ao peito, inclinando levemente o tronco para trás. Retorne controladamente.",
      defaultWeight: "Ajustável"
    }
  ],
  "Pernas": [
    {
      name: "Agachamento Livre (Barra)",
      muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)", "Lombar"],
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
      name: "Cadeira Extensora",
      muscleGroups: ["Pernas (Quadríceps)"],
      description: "Sente-se na cadeira com os tornozelos sob o rolo. Estenda as pernas completamente, contraindo o quadríceps. Retorne controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Mesa Flexora",
      muscleGroups: ["Pernas (Posteriores)", "Glúteos"],
      description: "Deite-se de bruços na mesa com os tornozelos sob o rolo. Flexione os joelhos, trazendo os calcanhares em direção aos glúteos. Retorne controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Afundo (Passada)",
      muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)"],
      description: "Dê um passo à frente e flexione ambos os joelhos a 90 graus, mantendo o tronco ereto. O joelho da frente não deve ultrapassar o tornozelo. Empurre de volta à posição inicial e alterne as pernas ou faça todas as repetições de um lado antes de trocar.",
      defaultWeight: "Peso Corporal / Halteres"
    }
  ],
  "Glúteos": [
    {
      name: "Elevação Pélvica (Hip Thrust)",
      muscleGroups: ["Glúteos", "Pernas (Posteriores)"],
      description: "Apoie as costas em um banco e os pés no chão. Coloque uma barra sobre o quadril. Empurre o quadril para cima, contraindo os glúteos, até o corpo formar uma linha reta dos ombros aos joelhos. Desça controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Coice de Mula (Cabo/Polia)",
      muscleGroups: ["Glúteos"],
      description: "Em quatro apoios ou em pé, prenda a tornozeleira do cabo no tornozelo. Mantenha o abdômen contraído e a coluna neutra. Estenda a perna para trás e para cima, contraindo o glúteo. Retorne controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Agachamento Sumô (Halter)",
      muscleGroups: ["Glúteos", "Pernas (Interno da Coxa)", "Pernas (Quadríceps)"],
      description: "Fique em pé com os pés mais afastados que a largura dos ombros e pontas dos pés voltadas para fora. Segure um halter verticalmente à frente do corpo. Agache, mantendo a coluna reta e empurrando os joelhos para fora. Volte à posição inicial.",
      defaultWeight: "Ajustável"
    }
  ],
  "Ombros": [
    {
      name: "Desenvolvimento Militar (Barra ou Halteres)",
      muscleGroups: ["Ombros", "Tríceps"],
      description: "Em pé ou sentado, segure a barra na altura dos ombros (pegada pronada) ou halteres ao lado da cabeça. Empurre para cima até os braços quase esticarem. Desça controladamente.",
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
    }
  ],
  "Braços": [
    {
      name: "Rosca Direta (Barra ou Halteres)",
      muscleGroups: ["Bíceps", "Antebraço"],
      description: "Em pé, segure a barra ou halteres com pegada supinada (palmas para cima). Flexione os cotovelos, trazendo o peso em direção aos ombros. Desça controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Tríceps Testa (Barra EZ ou Halteres)",
      muscleGroups: ["Tríceps"],
      description: "Deitado em um banco reto, segure a barra EZ ou halteres acima da testa com os cotovelos apontando para o teto. Desça o peso em direção à testa flexionando os cotovelos. Estenda os braços de volta.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Rosca Alternada (Halteres)",
      muscleGroups: ["Bíceps", "Antebraço"],
      description: "Em pé ou sentado, segure um halter em cada mão ao lado do corpo com pegada neutra ou supinada. Flexione um cotovelo de cada vez, rotacionando o punho (se neutro) para supinação ao subir. Alterne os braços.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Tríceps Pulley (Corda ou Barra)",
      muscleGroups: ["Tríceps"],
      description: "Em pé, de frente para o pulley alto. Segure a corda ou barra com pegada pronada ou neutra. Mantenha os cotovelos próximos ao corpo e estenda os braços para baixo. Retorne controladamente.",
      defaultWeight: "Ajustável"
    }
  ],
  "Cardio": [
    {
      name: "Corrida (Esteira/Rua)",
      muscleGroups: ["Cardio"],
      description: "Corrida em ritmo moderado ou intervalado para melhorar a capacidade cardiovascular.",
    },
    {
      name: "Bicicleta Ergométrica",
      muscleGroups: ["Cardio"],
      description: "Pedalar em ritmo constante ou com variações de intensidade. Ótimo para aquecimento ou treino cardiovascular.",
    },
    {
      name: "Elíptico (Transport)",
      muscleGroups: ["Cardio"],
      description: "Movimento de baixo impacto que simula corrida, subida de escadas e caminhada, trabalhando diversos grupos musculares simultaneamente.",
    },
    {
      name: "Pular Corda",
      muscleGroups: ["Cardio"],
      description: "Exercício cardiovascular completo e de alta intensidade que melhora coordenação e resistência.",
    }
  ],
  "Outros": [
    {
      name: "Prancha Abdominal",
      muscleGroups: ["Abdômen", "Lombar"],
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
      name: "Panturrilha em Pé (Gêmeos)",
      muscleGroups: ["Panturrilhas"],
      description: "Em pé, com ou sem peso adicional (máquina, barra, halteres). Eleve os calcanhares o máximo possível, contraindo as panturrilhas. Desça controladamente.",
      defaultWeight: "Ajustável / Peso Corporal"
    }
  ]
};
