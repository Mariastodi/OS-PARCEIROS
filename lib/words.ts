// Banco editorial próprio: palavras concretas para pistas, sem serviço externo.
export const packs: Record<string, string[]> = Object.fromEntries(Object.entries({
  Comidas: 'Abacaxi,Abacate,Açaí,Arroz,Feijão,Batata frita,Bolo,Brigadeiro,Coxinha,Cuscuz,Tapioca,Pastel,Pizza,Lasanha,Macarrão,Hambúrguer,Sushi,Churrasco,Pipoca,Sorvete,Chocolate,Pudim,Paçoca,Pão de queijo,Queijo,Iogurte,Manteiga,Ovo,Omelete,Panqueca,Waffle,Mel,Geleia,Biscoito,Amendoim,Castanha,Nozes,Coco,Manga,Melancia,Melão,Morango,Uva,Banana,Maçã,Pera,Laranja,Limão,Kiwi,Goiaba,Maracujá,Pêssego,Cereja,Ameixa,Mamão,Framboesa,Cenoura,Tomate,Alface,Pepino,Brócolis,Abóbora,Milho,Ervilha,Beterraba,Cebola,Alho,Pimentão,Berinjela,Mandioca,Camarão,Caranguejo,Peixe,Frango,Linguiça,Bacon,Farofa,Feijoada,Moqueca,Acarajé,Esfiha,Quibe,Empada,Croquete,Risoto,Sopa,Salada,Sanduíche,Cachorro-quente,Crepe,Churros,Donut,Marshmallow,Gelatina,Rapadura,Canjica,Pamonha,Café,Chá,Suco',
  Lugares: 'Praia,Cinema,Escola,Hospital,Aeroporto,Shopping,Parque,Academia,Padaria,Estádio,Biblioteca,Museu,Teatro,Restaurante,Supermercado,Farmácia,Zoológico,Aquário,Circo,Fazenda,Sítio,Floresta,Deserto,Montanha,Ilha,Cachoeira,Rio,Lago,Caverna,Vulcão,Castelo,Palácio,Igreja,Praça,Jardim,Piscina,Clube,Hotel,Pousada,Acampamento,Porto,Rodoviária,Estação de trem,Metrô,Posto de gasolina,Oficina,Salão de beleza,Barbearia,Lavanderia,Banco,Correio,Delegacia,Quartel,Prefeitura,Universidade,Laboratório,Observatório,Planetário,Parque de diversões,Parque aquático,Feira,Mercado,Pet shop,Loja de brinquedos,Floricultura,Sorveteria,Cafeteria,Pizzaria,Churrascaria,Mirante,Trilha,Ponte,Túnel,Farol,Represa,Moinho,Mina,Fábrica,Escritório,Garagem,Cozinha,Quarto,Banheiro,Sala,Varanda,Quintal,Sótão,Porão,Elevador,Escada,Terraço,Calçada,Rua,Avenida,Rotatória,Prisão,Cemitério,Estufa,Quadra,Pista de patinação',
  Objetos: 'Celular,Guarda-chuva,Ventilador,Espelho,Mochila,Relógio,Tesoura,Travesseiro,Violão,Capacete,Cadeira,Mesa,Sofá,Cama,Armário,Estante,Tapete,Cortina,Abajur,Lâmpada,Tomada,Controle remoto,Televisão,Rádio,Câmera,Computador,Teclado,Mouse,Fone de ouvido,Carregador,Impressora,Caderno,Lápis,Caneta,Borracha,Régua,Apontador,Grampeador,Cola,Fita adesiva,Envelope,Livro,Jornal,Revista,Mapa,Globo terrestre,Mala,Carteira,Bolsa,Chave,Cadeado,Óculos,Chapéu,Boné,Sapato,Chinelo,Meia,Camisa,Casaco,Cachecol,Luva,Anel,Colar,Brinco,Escova de dentes,Pente,Secador,Toalha,Sabonete,Perfume,Vassoura,Rodo,Balde,Esponja,Panela,Frigideira,Prato,Copo,Caneca,Talher,Garfo,Colher,Faca,Garrafa,Termômetro,Balança,Martelo,Alicate,Parafuso,Escada de mão,Lanterna,Vela,Fósforo,Isqueiro,Bússola,Binóculo,Lupa,Tesouro,Baú,Apito,Sino',
  Animais: 'Cachorro,Gato,Cavalo,Vaca,Porco,Galinha,Pato,Ganso,Peru,Ovelha,Cabra,Burro,Coelho,Hamster,Porquinho-da-índia,Tartaruga,Jabuti,Lagarto,Iguana,Camaleão,Cobra,Jacaré,Crocodilo,Sapo,Rã,Salamandra,Peixe-palhaço,Tubarão,Golfinho,Baleia,Orca,Foca,Leão-marinho,Morsa,Polvo,Lula,Água-viva,Estrela-do-mar,Cavalo-marinho,Arraia,Caramujo,Lesma,Minhoca,Formiga,Abelha,Vespa,Borboleta,Mariposa,Libélula,Joaninha,Besouro,Grilo,Gafanhoto,Mosquito,Mosca,Barata,Aranha,Escorpião,Centopeia,Leão,Tigre,Onça,Leopardo,Guepardo,Lobo,Raposa,Urso,Panda,Coala,Canguru,Elefante,Girafa,Zebra,Rinoceronte,Hipopótamo,Camelo,Dromedário,Lhama,Alpaca,Macaco,Gorila,Orangotango,Lêmure,Preguiça,Tamanduá,Tatu,Capivara,Anta,Veado,Esquilo,Castor,Lontra,Morcego,Pinguim,Coruja,Águia,Falcão,Papagaio,Tucano,Flamingo',
  'Lazer e esportes': 'Futebol,Vôlei,Basquete,Handebol,Tênis,Surfe,Skate,Patins,Bicicleta,Natação,Corrida,Caminhada,Escalada,Rap el,Trilha de bicicleta,Boxe,Judô,Caratê,Capoeira,Ioga,Pilates,Ginástica,Balé,Dança,Samba,Forró,Funk,Rock,Pagode,Carnaval,Festa junina,Aniversário,Casamento,Piquenique,Acampar,Pescar,Cozinhar,Pintura,Desenho,Fotografia,Jardinagem,Leitura,Xadrez,Dominó,Damas,Baralho,Quebra-cabeça,Bingo,Esconde-esconde,Pega-pega,Amarelinha,Pular corda,Pipa,Bolinha de gude,Peteca,Futebol de botão,Pebolim,Sinuca,Boliche,Golfe,Beisebol,Rúgbi,Esgrima,Arco e flecha,Hipismo,Remo,Canoagem,Vela,Mergulho,Esqui,Snowboard,Patinação no gelo,Hóquei,Automobilismo,Motociclismo,Maratona,Triatlo,Salto em distância,Salto em altura,Salto com vara,Lançamento de dardo,Tênis de mesa,Badminton,Slackline,Parkour,Karaokê,Show,Festival,Orquestra,Coral,Bateria,Piano,Guitarra,Flauta,Saxofone,Violino,Pandeiro,Sanfona,Teatro de fantoches,Mágica'
}).map(([key, words]) => [key, words.replace('Rap el', 'Rapel').split(',')]));
export const categories = ['Misturado', ...Object.keys(packs)];
export function poolFor(category: string): string[] {
  if (!categories.includes(category)) throw new Error('Categoria inválida.');
  return [...new Set(category === 'Misturado' ? Object.values(packs).flat() : packs[category])];
}
export function randomInt(max: number): number {
  const range = 0x100000000;
  let value: number;
  do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= range - range % max);
  return value % max;
}
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function drawWord(category: string, used: string[]) {
  const pool = poolFor(category);
  let available = pool.filter(word => !used.includes(word));
  const exhausted = !available.length;
  if (exhausted) available = pool;
  const word = available[randomInt(available.length)];
  return { word, used: [...(exhausted ? used.filter(word => !pool.includes(word)) : used), word] };
}
