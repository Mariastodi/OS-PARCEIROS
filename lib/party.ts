export type PartyGame = "likely" | "challenge" | "heads" | "mime" | "five";
export const partyGames: Record<
  PartyGame,
  {
    title: string;
    description: string;
    instruction: string;
    duration: number;
  }
> = {
  likely: {
    title: "Quem é mais provável?",
    description: "Votem em quem mais combina com cada situação.",
    instruction:
      "Leiam a pergunta, apontem juntos e registrem quem recebeu mais votos. Em empate, escolham “Empate / ninguém”. O placar conta indicações, não vitórias.",
    duration: 0,
  },
  challenge: {
    title: "Desafio Relâmpago",
    description: "Uma missão, poucos segundos e a turma de testemunha.",
    instruction:
      "A pessoa da vez cumpre a missão antes do tempo acabar. A turma confirma se valeu. Acertou: 1 ponto. Podem passar qualquer desafio.",
    duration: 20,
  },
  heads: {
    title: "Quem sou eu?",
    description:
      "Celular na testa, pistas da turma e uma corrida contra o tempo.",
    instruction:
      "Segure o celular na testa com a tela para os amigos. Eles dão pistas sem falar a resposta. Incline a tela para o céu para acertar e para o chão para passar; volte à posição vertical entre palavras. Não solte o aparelho.",
    duration: 60,
  },
  mime: {
    title: "Mímica",
    description:
      "Sem falar: faça sua equipe descobrir o maior número de palavras.",
    instruction:
      "A pessoa da vez vê a palavra e faz a mímica sem falar. A turma tenta adivinhar. Marque Acertou ou Passar e continue até o tempo acabar.",
    duration: 60,
  },
  five: {
    title: "5 Segundos",
    description: "Diga três respostas antes do relógio zerar.",
    instruction:
      "Diga três exemplos do tema em apenas 5 segundos. A turma confirma a resposta ao final. Três respostas válidas e diferentes valem 1 ponto.",
    duration: 5,
  },
};
export const likelyPrompts = [
  "se perder mesmo seguindo o GPS?",
  "rir no momento mais sério?",
  "virar amigo de alguém na fila?",
  "esquecer onde colocou o celular?",
  "chegar com comida para todo mundo?",
  "ganhar um reality show?",
  "dormir durante um filme?",
  "organizar uma viagem de última hora?",
  "decorar a letra de qualquer música?",
  "adotar todos os animais da rua?",
  "ficar famoso por um meme?",
  "levar uma mala enorme para dois dias?",
  "inventar uma receita que dá certo?",
  "esquecer o próprio aniversário?",
  "ser o detetive do grupo?",
  "criar um negócio improvável?",
  "maratonar uma série em um dia?",
  "fazer amizade com um extraterrestre?",
  "rir da própria piada antes de contar?",
  "trazer um jogo para a festa?",
  "virar guia turístico sem conhecer a cidade?",
  "ganhar no karaokê?",
  "falar com as plantas?",
  "sobreviver melhor numa ilha?",
  "mandar áudio de cinco minutos?",
  "aparecer com um hobby novo amanhã?",
  "montar o melhor look improvisado?",
  "pedir sobremesa antes do prato principal?",
  "esquecer que estava contando uma história?",
  "ser escolhido para apresentar um programa?",
  "inventar apelidos para todo mundo?",
  "tirar cinquenta fotos iguais?",
  "saber uma curiosidade sobre tudo?",
  "chorar com uma propaganda?",
  "vencer um campeonato de dança?",
  "perder o ônibus por estar conversando?",
  "planejar a festa surpresa perfeita?",
  "virar chef de cozinha?",
  "encontrar dinheiro num casaco antigo?",
  "fazer amizade com o vizinho em cinco minutos?",
];
export const challengePrompts = [
  "Imite três animais diferentes. A turma precisa reconhecer os três.",
  "Conte de 20 até 1 sem errar.",
  "Diga cinco frutas sem repetir.",
  "Faça uma propaganda de uma colher.",
  "Cante uma música usando só “lá”. A turma precisa reconhecer.",
  "Fale seu nome como um narrador de futebol.",
  "Diga cinco coisas que cabem numa mochila.",
  "Imite um robô preparando café.",
  "Diga quatro palavras que rimam com pão.",
  "Descreva um filme sem falar seu título. A turma precisa reconhecer.",
  "Diga os dias da semana de trás para frente.",
  "Invente um super-herói e explique seu poder.",
  "Diga cinco objetos que existem na cozinha.",
  "Conte uma história com as palavras gato, lua e pipoca.",
  "Faça três expressões e a turma adivinha as emoções.",
  "Fale “três pratos de trigo para três tigres tristes” duas vezes.",
  "Diga cinco cores sem olhar ao redor.",
  "Imite alguém tentando pegar um ônibus imaginário.",
  "Crie um slogan para uma meia perdida.",
  "Diga quatro esportes praticados com bola.",
  "Explique como escovar os dentes como se fosse um alienígena.",
  "Diga cinco coisas que fazem barulho.",
  "Invente um nome e um grito para a equipe.",
  "Diga cinco profissões.",
  "Diga três maneiras de usar uma caixa vazia.",
  "Imite uma previsão do tempo muito dramática.",
  "Diga cinco coisas redondas.",
  "Descreva uma pizza sem usar a palavra queijo.",
  "Faça uma entrevista com uma almofada imaginária.",
  "Diga o nome de cinco animais que vivem na água.",
];
export const fivePrompts = [
  "frutas",
  "animais de fazenda",
  "coisas amarelas",
  "objetos de cozinha",
  "esportes com bola",
  "sabores de sorvete",
  "profissões",
  "meios de transporte",
  "coisas que voam",
  "países",
  "cidades brasileiras",
  "instrumentos musicais",
  "peças de roupa",
  "coisas que ficam na geladeira",
  "animais que vivem na água",
  "coisas redondas",
  "comidas de festa",
  "lugares para passear",
  "objetos de banheiro",
  "coisas que fazem barulho",
  "brinquedos",
  "sobremesas",
  "coisas que cabem no bolso",
  "personagens de desenho",
  "itens de material escolar",
  "coisas verdes",
  "coisas de praia",
  "bebidas sem álcool",
  "animais com quatro patas",
  "objetos de madeira",
  "coisas que têm rodas",
  "comidas que levam queijo",
  "coisas que usamos no frio",
  "coisas que acendem",
  "jogos de tabuleiro",
  "flores",
  "tipos de calçado",
  "coisas que usamos na chuva",
  "comidas do café da manhã",
  "coisas que têm botão",
];
export type Answer = { word: string; correct: boolean; timedOut?: boolean };
export function roundScore(answers: Answer[]): number {
  return answers.filter((answer) => answer.correct).length;
}
export function remainingSeconds(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
