
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
  ],
  "Costas": [
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
      name: "Puxada Alta (Pulley)",
      muscleGroups: ["Costas", "Bíceps"],
      description: "Sente-se no aparelho com os joelhos presos sob o suporte. Segure a barra com pegada aberta. Puxe a barra em direção ao peito, inclinando levemente o tronco para trás. Retorne controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Remada Máquina Sentado (Apoio no Peito)",
      muscleGroups: ["Costas", "Bíceps"],
      description: "Sente-se na máquina com o peito apoiado. Segure os pegadores com a pegada desejada (neutra, pronada). Puxe os pegadores em direção ao corpo, contraindo as escápulas. Retorne controladamente.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Remada Alta (Barra ou Halteres)",
      muscleGroups: ["Ombros", "Trapézio"],
      description: "Em pé, segure a barra (ou halteres) com pegada pronada próxima. Puxe a barra verticalmente até a altura do peito, elevando os cotovelos acima dos ombros. Desça controladamente.",
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
      name: "Leg Press 90º",
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
      name: "Afundo (Passada)",
      muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Pernas (Posteriores)"],
      description: "Dê um passo à frente e flexione ambos os joelhos a 90 graus, mantendo o tronco ereto. O joelho da frente não deve ultrapassar o tornozelo. Empurre de volta à posição inicial e alterne as pernas ou faça todas as repetições de um lado antes de trocar.",
      defaultWeight: "Peso Corporal / Halteres"
    },
    {
      name: "Agachamento Hack Em Pé (Máquina)",
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
      name: "Rosca Alternada (Halteres)",
      muscleGroups: ["Bíceps", "Antebraço"],
      description: "Em pé ou sentado, segure um halter em cada mão ao lado do corpo com pegada neutra ou supinada. Flexione um cotovelo de cada vez, rotacionando o punho (se neutro) para supinação ao subir. Alterne os braços.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Rosca Martelo (Halteres)",
      muscleGroups: ["Bíceps", "Antebraço"],
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
    }
  ],
  "Cardio": [
    {
      name: "Corrida (Esteira/Rua)",
      muscleGroups: ["Cardio"],
      description: "Manter um ritmo constante ou variar a intensidade para melhorar a capacidade cardiovascular e queimar calorias. Ajuste a velocidade e inclinação conforme necessário.",
    },
    {
      name: "Corrida HIIT (Esteira/Rua)",
      muscleGroups: ["Cardio"],
      description: "High-Intensity Interval Training: Alternar períodos curtos de corrida em máxima intensidade (ex: 30 segundos de sprint) com períodos de recuperação ativa (ex: 60 segundos de caminhada ou corrida leve). Repetir por 10-20 minutos. Ideal para condicionamento e queima calórica elevada.",
    },
    {
      name: "Bicicleta Ergométrica",
      muscleGroups: ["Cardio"],
      description: "Pedalar em ritmo constante ou com variações de intensidade e resistência. Ótimo para aquecimento, treino cardiovascular de baixo impacto ou recuperação ativa.",
    },
    {
      name: "Bicicleta Ergométrica HIIT",
      muscleGroups: ["Cardio"],
      description: "High-Intensity Interval Training: Alternar períodos curtos de pedalada em máxima intensidade/resistência (ex: 30 segundos) com períodos de recuperação ativa (ex: 60 segundos de pedalada leve). Repetir por 10-20 minutos.",
    },
    {
      name: "Elíptico (Transport)",
      muscleGroups: ["Cardio"],
      description: "Movimento de baixo impacto que simula corrida, subida de escadas e caminhada, trabalhando diversos grupos musculares. Ajuste a resistência e velocidade.",
    },
    {
      name: "Elíptico HIIT (Transport)",
      muscleGroups: ["Cardio"],
      description: "High-Intensity Interval Training: Alternar períodos curtos de movimento em máxima intensidade/resistência (ex: 30 segundos) com períodos de recuperação ativa (ex: 60 segundos de movimento leve). Repetir por 10-20 minutos.",
    },
    {
      name: "Pular Corda",
      muscleGroups: ["Cardio"],
      description: "Exercício cardiovascular completo que melhora coordenação, agilidade e resistência. Varie a velocidade e o estilo dos pulos.",
    },
    {
      name: "Pular Corda HIIT",
      muscleGroups: ["Cardio"],
      description: "High-Intensity Interval Training: Alternar períodos curtos de pulos rápidos e intensos (ex: 30-45 segundos) com períodos de descanso ou pulos lentos (ex: 15-30 segundos). Repetir por 10-15 minutos.",
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
      name: "Cadeira de Lombar (Hiperextensão)",
      muscleGroups: ["Lombar", "Glúteos", "Pernas (Posteriores)"],
      description: "Posicione-se na cadeira de hiperextensão com os quadris apoiados e os tornozelos presos. Com a coluna reta, desça o tronco e retorne à posição inicial, contraindo a lombar e os glúteos. Evite hiperextender demais no topo.",
      defaultWeight: "Peso Corporal / Anilha"
    },
    {
      name: "Double Press (Halteres ou Kettlebells)",
      muscleGroups: ["Pernas (Quadríceps)", "Glúteos", "Ombros", "Tríceps", "Core", "Costas"],
      description: "Com um halter ou kettlebell em cada mão, comece com os pesos no chão ou em posição de hang. Faça um clean (puxada) para os ombros e, em seguida, um push press ou jerk para elevar os pesos acima da cabeça. É um movimento composto e explosivo.",
      defaultWeight: "Ajustável"
    },
    {
      name: "Alongamento (Geral)",
      muscleGroups: ["Cardio"], // Para categorização e lógica de não aquecimento
      description: "Realize uma série de alongamentos estáticos ou dinâmicos para os principais grupos musculares. Mantenha cada alongamento por 20-30 segundos. Pode ser feito antes ou depois do treino para melhorar a flexibilidade e auxiliar na recuperação.",
      defaultWeight: "N/A"
    }
  ]
};

