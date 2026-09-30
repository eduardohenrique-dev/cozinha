import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// [nome, unidade, kcal/100g, proteína, carboidrato, gordura, estoqueAtual, estoqueMinimo, categoria, pesoUnidadeG?]
// Valores nutricionais por 100 g/ml (tabelas TACO/USDA, aproximados). Itens novos entram com estoque 0
// e mínimo 0 (= não monitorado) até você ajustar na despensa.
type Row = readonly [
  nome: string,
  unidade: "g" | "ml" | "un",
  kcal: number,
  proteina: number,
  carboidrato: number,
  gordura: number,
  estoqueAtual: number,
  estoqueMinimo: number,
  categoria: string,
  pesoUnidadeG?: number,
];

const ingredientes = {
  // despensa básica
  arroz: ["Arroz branco (cru)", "g", 360, 7.2, 79, 0.6, 2500, 1000, "Grãos & massas"],
  arrozJapones: ["Arroz japonês (cru)", "g", 355, 6.5, 78, 0.6, 2000, 1000, "Grãos & massas"],
  macarrao: ["Macarrão (cru)", "g", 360, 12.5, 73, 1.5, 1000, 500, "Grãos & massas"],
  feijao: ["Feijão carioca", "g", 330, 20, 61, 1.3, 1500, 1000, "Grãos & massas"],
  aveia: ["Aveia em flocos", "g", 380, 14, 67, 7, 400, 300, "Grãos & massas"],
  granola: ["Granola", "g", 471, 10, 64, 20, 200, 250, "Grãos & massas"],
  amido: ["Amido de milho", "g", 350, 0.3, 86, 0.1, 400, 150, "Grãos & massas"],

  // proteínas
  frango: ["Peito de frango", "g", 110, 23, 0, 1.5, 900, 500, "Proteínas"],
  sobrecoxa: ["Sobrecoxa de frango sem pele e sem osso", "g", 120, 18.5, 0, 5, 0, 0, "Proteínas"],
  sobrecoxaOsso: ["Sobrecoxa de frango com osso, sem pele", "g", 75, 13, 0, 2.2, 0, 0, "Proteínas"],
  flanco: ["Bife de flanco (fraldinha)", "g", 150, 20.5, 0, 7.5, 0, 0, "Proteínas"],
  acem: ["Acém magro em tiras", "g", 140, 20, 0, 6.5, 0, 0, "Proteínas"],
  mignonSuino: ["Filé mignon suíno", "g", 120, 21, 0, 3.5, 0, 0, "Proteínas"],
  patinho: ["Patinho moído", "g", 135, 21, 0, 5, 0, 0, "Proteínas"],
  ovo: ["Ovo", "un", 143, 13, 1, 10, 8, 6, "Laticínios & ovos", 50],
  clara: ["Clara de ovo", "g", 52, 11, 0.7, 0.2, 0, 0, "Laticínios & ovos"],

  // laticínios
  leite: ["Leite integral", "ml", 61, 3.2, 4.8, 3.3, 800, 1000, "Laticínios & ovos"],
  leiteDesnatado: ["Leite desnatado", "ml", 35, 3.4, 5, 0.1, 0, 0, "Laticínios & ovos"],
  iogurte: ["Iogurte natural integral", "g", 61, 3.5, 4.7, 3.3, 340, 170, "Laticínios & ovos"],
  iogurteGrego: ["Iogurte grego desnatado", "g", 59, 10, 3.6, 0.4, 0, 0, "Laticínios & ovos"],
  queijo: ["Queijo minas frescal", "g", 264, 17.4, 3.2, 20, 250, 150, "Laticínios & ovos"],
  parmesao: ["Parmesão ralado", "g", 420, 38, 4, 29, 0, 0, "Laticínios & ovos"],
  requeijaoLight: ["Requeijão light", "g", 185, 11, 3, 14, 0, 0, "Laticínios & ovos"],
  requeijao: ["Requeijão cremoso", "g", 260, 10, 3, 24, 0, 0, "Laticínios & ovos"],
  maioneseLight: ["Maionese light", "g", 230, 0.5, 8, 22, 0, 0, "Molhos & condimentos"],

  // hortifruti
  batataDoce: ["Batata-doce", "g", 86, 1.6, 20, 0.1, 1200, 500, "Hortifruti"],
  tomate: ["Tomate", "un", 18, 0.9, 3.9, 0.2, 5, 3, "Hortifruti", 120],
  cebola: ["Cebola", "un", 40, 1.1, 9.3, 0.1, 3, 2, "Hortifruti", 150],
  cebolaRoxa: ["Cebola roxa", "un", 40, 1.1, 9.3, 0.1, 0, 0, "Hortifruti", 120],
  alho: ["Alho (dente)", "un", 149, 6.4, 33, 0.5, 15, 6, "Hortifruti", 5],
  pimentaoVermelho: ["Pimentão vermelho", "un", 31, 1, 6, 0.3, 0, 0, "Hortifruti", 150],
  pimentaoAmarelo: ["Pimentão amarelo", "un", 27, 1, 6.3, 0.2, 0, 0, "Hortifruti", 150],
  dedoMoca: ["Pimenta dedo-de-moça", "un", 40, 2, 9, 0.2, 0, 0, "Hortifruti", 8],
  limao: ["Limão", "un", 29, 1.1, 9, 0.3, 0, 0, "Hortifruti", 100],
  coentro: ["Coentro fresco", "g", 23, 2.1, 3.7, 0.5, 0, 0, "Hortifruti"],
  cebolinha: ["Cebolinha", "g", 32, 1.8, 7.3, 0.7, 0, 0, "Hortifruti"],
  gengibre: ["Gengibre", "g", 80, 1.8, 18, 0.8, 0, 0, "Hortifruti"],
  espinafre: ["Espinafre", "g", 23, 2.9, 3.6, 0.4, 150, 100, "Hortifruti"],
  alface: ["Alface", "g", 15, 1.4, 2.9, 0.2, 200, 100, "Hortifruti"],
  banana: ["Banana", "un", 89, 1.1, 23, 0.3, 4, 3, "Frutas", 100],
  morango: ["Morango", "g", 32, 0.7, 7.7, 0.3, 0, 150, "Frutas"],
  pera: ["Pera", "un", 57, 0.4, 15, 0.1, 0, 0, "Frutas", 150],

  // molhos & condimentos
  shoyu: ["Shoyu", "ml", 53, 8, 5, 0, 500, 200, "Molhos & condimentos"],
  vinagreArroz: ["Vinagre de arroz", "ml", 18, 0, 0.5, 0, 300, 100, "Molhos & condimentos"],
  vinagreBranco: ["Vinagre branco", "ml", 18, 0, 0, 0, 500, 150, "Molhos & condimentos"],
  sriracha: ["Molho de pimenta (sriracha)", "g", 95, 1.9, 19, 0.9, 200, 60, "Molhos & condimentos"],
  mostarda: ["Mostarda amarela", "g", 66, 4, 6, 3.6, 180, 50, "Molhos & condimentos"],
  gochujang: ["Gochujang", "g", 180, 4, 38, 1.5, 200, 60, "Molhos & condimentos"],
  molhoBbq: ["Molho barbecue", "g", 170, 0.8, 40, 0.6, 300, 100, "Molhos & condimentos"],
  passata: ["Passata de tomate", "g", 30, 1.5, 6, 0.2, 680, 300, "Molhos & condimentos"],
  mel: ["Mel", "g", 304, 0.3, 82, 0, 250, 100, "Molhos & condimentos"],
  melado: ["Melado", "g", 290, 0, 75, 0, 300, 100, "Molhos & condimentos"],

  // óleos
  azeite: ["Azeite de oliva", "ml", 884, 0, 0, 100, 400, 250, "Óleos"],
  oleoGergelim: ["Óleo de gergelim", "ml", 884, 0, 0, 100, 150, 50, "Óleos"],
  oleoCanola: ["Óleo de canola", "ml", 884, 0, 0, 100, 900, 300, "Óleos"],
  oleoSpray: ["Óleo em spray", "g", 884, 0, 0, 100, 200, 60, "Óleos"],

  // temperos secos
  sal: ["Sal", "g", 0, 0, 0, 0, 500, 100, "Temperos"],
  canela: ["Canela em pó", "g", 247, 4, 81, 1.2, 30, 10, "Temperos"],
  paprica: ["Páprica", "g", 280, 14, 54, 13, 60, 20, "Temperos"],
  cominho: ["Cominho em pó", "g", 375, 18, 44, 22, 50, 15, "Temperos"],
  coentroPo: ["Coentro em pó", "g", 300, 12, 55, 18, 40, 12, "Temperos"],
  curcuma: ["Cúrcuma em pó", "g", 310, 10, 67, 3, 40, 12, "Temperos"],
  curry: ["Curry em pó", "g", 325, 14, 56, 14, 50, 15, "Temperos"],
  pimentaReino: ["Pimenta-do-reino moída", "g", 250, 10, 64, 3.3, 60, 20, "Temperos"],
  nozMoscada: ["Noz-moscada", "g", 525, 6, 49, 36, 30, 10, "Temperos"],
  alhoPo: ["Alho em pó", "g", 330, 17, 73, 0.7, 60, 20, "Temperos"],
  cebolaPo: ["Cebola em pó", "g", 340, 10, 79, 1, 60, 20, "Temperos"],
  louro: ["Folha de louro", "un", 313, 8, 75, 8, 20, 6, "Temperos", 1],
  gergelim: ["Gergelim torrado", "g", 570, 17, 26, 50, 120, 40, "Temperos"],
  bicarbonato: ["Bicarbonato de sódio", "g", 0, 0, 0, 0, 200, 60, "Temperos"],
  manteiga: ["Manteiga", "g", 717, 0.9, 0.1, 81, 0, 0, "Laticínios & ovos"],
  tomateSeco: ["Tomate seco", "g", 258, 14, 55.8, 3, 0, 0, "Hortifruti"],
  salsa: ["Salsa fresca", "g", 36, 3, 6.3, 0.8, 0, 0, "Hortifruti"],
  batataInglesa: ["Batata inglesa", "un", 70, 1.9, 15.5, 0.1, 0, 0, "Hortifruti", 225],
} satisfies Record<string, Row>;

type Key = keyof typeof ingredientes;

type Receita = {
  titulo: string;
  fotoUrl: string;
  porcoes: number;
  tags: string[];
  modoPreparo: string[];
  itens: [Key, number][];
  /** macros da fonte, para a receita inteira (conferência) */
  fonte?: { kcal: number; proteina: number; carboidrato: number; gordura: number };
};

const receitas: Receita[] = [
  {
    titulo: "Frango com especiarias e pimentões",
    fotoUrl: "/seed/frango-especiarias.svg",
    porcoes: 4,
    tags: ["almoço", "marmita", "proteico", "especiarias"],
    modoPreparo: [
      "Aqueça uma frigideira grande com o azeite e doure o frango em fogo médio-alto.",
      "Quando pegar cor, adicione o sal, os temperos, a cebola e os pimentões com uma pitada de sal para eles. Refogue até os vegetais começarem a amolecer e dourar.",
      "Reduza o fogo, tampe e cozinhe por 10 a 15 minutos, mexendo às vezes e pingando água se o fundo começar a grudar.",
      "Com o frango cozido e os vegetais macios, junte o alho, o suco de limão e a pimenta. Refogue por mais 1 a 2 minutos.",
      "Prepare o arroz na panela de arroz.",
      "Desligue o fogo, finalize com o coentro, ajuste sal e limão e sirva sobre o arroz.",
    ],
    itens: [
      ["azeite", 10], ["sobrecoxa", 600], ["paprica", 1], ["cominho", 3], ["coentroPo", 1], ["curcuma", 0.5],
      ["pimentaReino", 0.5], ["canela", 0.5], ["sal", 9], ["pimentaoVermelho", 1], ["pimentaoAmarelo", 1],
      ["cebolaRoxa", 1], ["alho", 4], ["dedoMoca", 1], ["limao", 0.25], ["coentro", 15], ["arroz", 280],
    ],
    fonte: { kcal: 1985, proteina: 145.3, carboidrato: 258, gordura: 37.1 },
  },
  {
    titulo: "Frango adobo",
    fotoUrl: "/seed/adobo.svg",
    porcoes: 4,
    tags: ["almoço", "marmita", "asiático", "frango"],
    modoPreparo: [
      "Cozinhe o frango com o louro, a pimenta, o shoyu, o vinagre, o mel e meia xícara de água até ficar macio.",
      "Retire o frango, desfie e engrosse o molho com o amido dissolvido em água. Ferva rapidamente e devolva o frango desfiado.",
      "Misture a maionese com o molho de pimenta e a mostarda. Sirva o frango com arroz branco, a maionese picante, cebolinha picada e gergelim (rende cerca de 720 g de frango com molho).",
    ],
    itens: [
      ["sobrecoxaOsso", 900], ["alho", 8], ["dedoMoca", 1], ["louro", 3], ["shoyu", 60], ["vinagreArroz", 60],
      ["mel", 30], ["amido", 10], ["maioneseLight", 50], ["sriracha", 15], ["mostarda", 5], ["arroz", 200],
    ],
    fonte: { kcal: 1772, proteina: 153.7, carboidrato: 195.6, gordura: 37.4 },
  },
  {
    titulo: "Churrasco coreano",
    fotoUrl: "/seed/coreano.svg",
    porcoes: 5,
    tags: ["jantar", "coreano", "proteico", "marmita"],
    modoPreparo: [
      "Marinada: bata o alho, a pera, um talo de cebolinha, o mel, 2 colheres de chá de vinagre de arroz, a pimenta-do-reino, o shoyu e o azeite. Junte meia cebola fatiada fina.",
      "Misture a carne em tiras com a marinada e deixe pegar gosto por pelo menos 2 horas na geladeira.",
      "Grelhe a carne em frigideira bem quente, em levas, junto com a outra meia cebola em pedaços, até caramelizar.",
      "Junte o restante da marinada com meia xícara de água e o amido dissolvido; ferva até engrossar e envolver a carne. Finalize com o óleo de gergelim.",
      "Molho cremoso: misture o iogurte grego, o gochujang, o leite, o vinagre restante e sal a gosto.",
      "Cozinhe o arroz com o sal marinho. Sirva a carne sobre o arroz com o molho, a cebolinha em rodelas e o gergelim.",
    ],
    itens: [
      ["alho", 3], ["pera", 0.5], ["cebolinha", 39], ["mel", 25], ["vinagreArroz", 15], ["pimentaReino", 1], ["shoyu", 80],
      ["cebola", 1], ["azeite", 2], ["flanco", 700], ["amido", 3], ["oleoGergelim", 4], ["iogurteGrego", 100],
      ["gochujang", 10], ["leiteDesnatado", 15], ["sal", 4], ["arrozJapones", 300], ["gergelim", 3],
    ],
    fonte: { kcal: 2534, proteina: 194, carboidrato: 304, gordura: 54.9 },
  },
  {
    titulo: "Carne agridoce",
    fotoUrl: "/seed/agridoce.svg",
    porcoes: 3,
    tags: ["almoço", "asiático", "rápido"],
    modoPreparo: [
      "Marinar: misture a carne fatiada fina com meia colher de sopa de shoyu, o bicarbonato, a pimenta-do-reino e metade do amido. Deixe 30 minutos e seque com papel-toalha antes de selar.",
      "Molho: em uma tigela pequena misture o restante do shoyu, o vinagre de arroz, um quarto de xícara de água, o melado, o mel e o resto do amido. Reserve.",
      "Grelhar: em frigideira bem quente com metade do óleo, grelhe metade da carne rápido e forte, só até dourar (cerca de 1 minuto). Retire e repita com a outra metade.",
      "Finalizar: devolva toda a carne à frigideira com o gengibre, o alho e a pimenta; refogue até perfumar (2 minutos). Junte o molho e ferva só até engrossar e cobrir a carne.",
      "Sirva com a cebolinha e o arroz branco. Rende 3 porções de cerca de 180 g de carne e 166 g de arroz.",
    ],
    itens: [
      ["acem", 500], ["bicarbonato", 2.5], ["pimentaReino", 1], ["amido", 6], ["shoyu", 52], ["vinagreArroz", 7],
      ["melado", 5], ["mel", 7], ["oleoCanola", 4.5], ["alho", 2], ["gengibre", 5], ["dedoMoca", 1], ["cebolinha", 12],
      ["arroz", 167],
    ],
    fonte: { kcal: 1491, proteina: 122.8, carboidrato: 162.4, gordura: 34.5 },
  },
  {
    titulo: "Nuggets teriyaki com mel",
    fotoUrl: "/seed/nuggets.svg",
    porcoes: 8,
    tags: ["almoço", "marmita", "airfryer", "frango"],
    modoPreparo: [
      "Arroz: lave o arroz japonês (opcional) e cozinhe com 2 xícaras e um quarto de água, ou prepare arroz branco do seu jeito.",
      "Frango: tempere os cubos com alho em pó, cebola em pó e sal. Vá leve no sal, o glaze tem shoyu. Misture a clara. Em outro pote com tampa, junte o amido e o frango, tampe e sacuda para empanar.",
      "Leve à airfryer com óleo em spray por cima a 200 °C por 8 a 12 minutos. No forno, asse a 220 °C por 16 minutos, até dourar e cozinhar por completo.",
      "Glaze: misture o mel, o shoyu, o vinagre, o alho ralado e o amido dissolvido em dois terços de xícara de água em uma frigideira. Aqueça em fogo baixo mexendo até ficar homogêneo e brilhante.",
      "Envolva o frango empanado no glaze ainda quente. Finalize com cebolinha e gergelim torrado e sirva com o arroz.",
    ],
    itens: [
      ["frango", 1200], ["sal", 4], ["alhoPo", 2], ["cebolaPo", 2], ["clara", 40], ["amido", 85], ["oleoSpray", 4],
      ["alho", 2], ["mel", 60], ["shoyu", 120], ["vinagreBranco", 15], ["cebolinha", 12], ["gergelim", 2],
      ["arrozJapones", 520],
    ],
    fonte: { kcal: 4014, proteina: 318.8, carboidrato: 566.4, gordura: 38.5 },
  },
  {
    titulo: "Carne chinesa",
    fotoUrl: "/seed/chinesa.svg",
    porcoes: 5,
    tags: ["jantar", "asiático", "marmita"],
    modoPreparo: [
      "Cozinhe o arroz.",
      "Molho: misture o alho, o mel, o molho de pimenta, o vinagre de arroz, a pimenta-do-reino, o shoyu, meia xícara de água, o amido e o óleo de gergelim.",
      "Misture a carne com o bicarbonato e reserve por pelo menos 40 minutos.",
      "Aqueça uma frigideira grossa em fogo alto até ficar bem quente. Espalhe metade do azeite e grelhe a carne em uma camada até caramelizar bem. Retire.",
      "Na mesma frigideira, com o restante do azeite, refogue a cebola e o pimentão até amolecerem. Junte o molho e ferva até engrossar. Volte com a carne e misture.",
      "Divida em 5 porções e sirva com o arroz, a cebolinha e o gergelim, com uma salada generosa de folhas temperada com limão e sal.",
    ],
    itens: [
      ["alho", 3], ["mel", 25], ["sriracha", 15], ["vinagreArroz", 10], ["pimentaReino", 1], ["shoyu", 95], ["amido", 6],
      ["oleoGergelim", 4], ["flanco", 700], ["bicarbonato", 3], ["azeite", 2], ["cebola", 1], ["pimentaoVermelho", 1],
      ["arrozJapones", 300], ["sal", 3], ["cebolinha", 24], ["gergelim", 3],
    ],
    fonte: { kcal: 2479.4, proteina: 184.8, carboidrato: 300.3, gordura: 54.5 },
  },
  {
    titulo: "Macarrão com queijo e carne",
    fotoUrl: "/seed/macarrao.svg",
    porcoes: 8,
    tags: ["almoço", "marmita", "massa"],
    modoPreparo: [
      "Massa: cozinhe o macarrão em água com sal, apenas o suficiente para cobrir, pelo tempo da embalagem menos 3 minutos.",
      "No macarrão quente, junte o leite com o amido dissolvido, o requeijão, o alho ralado, a noz-moscada, sal e pimenta. Ferva em fogo baixo mexendo sempre por 2 minutos.",
      "Fora do fogo, misture o parmesão. Ajuste sal e pimenta e reserve. Para requentar, pingue água ou leite para soltar o molho.",
      "Proteína: tempere a carne com sal, pimenta e páprica. Grelhe em frigideira untada com o azeite até dourar. Junte o mel, o molho barbecue e o molho de pimenta e misture.",
      "Divida em 8 porções iguais com o macarrão. Deixe esfriar por completo antes de congelar, ou sirva na hora com uma salada de folhas temperada com limão e sal.",
    ],
    itens: [
      ["mignonSuino", 1200], ["pimentaReino", 2], ["paprica", 8], ["sal", 16], ["azeite", 4], ["mel", 30], ["molhoBbq", 120],
      ["sriracha", 15], ["macarrao", 500], ["leiteDesnatado", 240], ["amido", 12], ["alho", 1], ["nozMoscada", 0.5],
      ["requeijaoLight", 120], ["parmesao", 50],
    ],
    fonte: { kcal: 4060, proteina: 362.8, carboidrato: 484.5, gordura: 66.1 },
  },
  {
    // A fonte trazia só a lista de ingredientes (sem quantidades de alguns itens, porções ou modo de preparo):
    // quantidades marcadas com ~ e porções foram estimadas.
    titulo: "Escondidinho de batata-doce",
    fotoUrl: "/seed/escondidinho.svg",
    porcoes: 8,
    tags: ["jantar", "forno", "marmita"],
    modoPreparo: [
      "Purê: cozinhe a batata-doce descascada em água com sal até ficar bem macia. Escorra, amasse ainda quente e misture o requeijão, a noz-moscada, o sal e o azeite.",
      "Carne: refogue a cebola e o alho picados em um fio de azeite, junte o patinho moído e deixe dourar bem, soltando os grumos.",
      "Tempere com pimenta-do-reino, páprica defumada, curry e sal. Acrescente a passata, o tomate e o pimentão picados e cozinhe até o molho encorpar.",
      "Monte em um refratário: carne no fundo, purê por cima. Leve ao forno a 200 °C por 20 a 25 minutos, até dourar a superfície.",
      "Divida em 8 porções. Congela bem em potes individuais.",
    ],
    itens: [
      ["batataDoce", 1500], ["requeijao", 200], ["nozMoscada", 1], ["sal", 10], ["azeite", 20], ["patinho", 1000],
      ["cebola", 1], ["alho", 5], ["pimentaReino", 1], ["paprica", 4], ["curry", 4], ["passata", 300], ["tomate", 1],
      ["pimentaoVermelho", 1],
    ],
  },
  {
    titulo: "Frango cremoso com cebola caramelizada",
    fotoUrl: "/seed/frango-cremoso.svg",
    porcoes: 4,
    tags: ["almoço", "marmita", "cremoso", "frango"],
    modoPreparo: [
      "Tempere a sobrecoxa com sal, páprica e alho em pó e asse na airfryer a 200 °C por 20 a 25 minutos, até dourar e ficar macia. No forno, 220 °C por 22 a 26 minutos.",
      "Refogue a cebola roxa com metade da manteiga em fogo baixo até caramelizar.",
      "Junte o tomate seco, um pouco de água, o amido dissolvido em dois terços do leite, o requeijão e o frango assado. Aqueça até virar molho.",
      "Cozinhe as batatas e amasse. Misture com o restante do leite quente e o restante da manteiga, ajustando o sal.",
      "Sirva o frango sobre o purê e finalize com a salsa picada.",
    ],
    itens: [
      ["sobrecoxa", 650], ["sal", 9], ["paprica", 7], ["alhoPo", 2], ["manteiga", 15],
      ["cebolaRoxa", 340 / 120], ["tomateSeco", 20], ["leiteDesnatado", 600], ["amido", 9],
      ["requeijaoLight", 90], ["salsa", 6], ["batataInglesa", 4],
    ],
  },
];

function kcalDe(row: Row, quantidade: number) {
  const gramas = row[1] === "un" ? quantidade * (row[9] ?? 0) : quantidade;
  const f = gramas / 100;
  return { kcal: row[2] * f, proteina: row[3] * f, carboidrato: row[4] * f, gordura: row[5] * f };
}

async function main() {
  // O seed recria tudo do zero. Com dados no banco, só segue se for pedido de forma explícita.
  const existentes = await prisma.ingredient.count();
  if (existentes > 0 && process.env.SEED_FORCE !== "1") {
    console.error(
      `O banco já tem ${existentes} ingredientes. O seed apaga receitas, ingredientes e registros antes de recriar.\n` +
        "Para continuar mesmo assim, rode com SEED_FORCE=1 (no PowerShell: $env:SEED_FORCE=1; npm run db:seed).",
    );
    process.exit(1);
  }

  await prisma.consumptionLog.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.waterLog.deleteMany();

  const ids: Record<string, string> = {};
  for (const [key, row] of Object.entries(ingredientes) as [Key, Row][]) {
    const [nome, unidade, kcal, p, c, g, atual, minimo, categoria, peso] = row;
    const created = await prisma.ingredient.create({
      data: {
        nome,
        unidade,
        caloriasPor100g: kcal,
        proteina: p,
        carboidrato: c,
        gordura: g,
        estoqueAtual: atual,
        estoqueMinimo: minimo,
        categoria,
        pesoUnidadeG: peso ?? null,
      },
    });
    ids[key] = created.id;
  }

  for (const r of receitas) {
    await prisma.recipe.create({
      data: {
        titulo: r.titulo,
        fotoUrl: r.fotoUrl,
        porcoes: r.porcoes,
        modoPreparo: r.modoPreparo.join("\n"),
        tags: JSON.stringify(r.tags),
        ingredientes: {
          create: r.itens.map(([key, quantidade]) => ({ ingredientId: ids[key], quantidade })),
        },
      },
    });

    const total = r.itens.reduce(
      (acc, [key, q]) => {
        const m = kcalDe(ingredientes[key], q);
        return { kcal: acc.kcal + m.kcal, proteina: acc.proteina + m.proteina, carboidrato: acc.carboidrato + m.carboidrato, gordura: acc.gordura + m.gordura };
      },
      { kcal: 0, proteina: 0, carboidrato: 0, gordura: 0 },
    );
    const app = `${Math.round(total.kcal / r.porcoes)} kcal/porção (P ${total.proteina.toFixed(0)} C ${total.carboidrato.toFixed(0)} G ${total.gordura.toFixed(0)})`;
    const fonte = r.fonte
      ? `fonte ${Math.round(r.fonte.kcal / r.porcoes)} kcal/porção (P ${r.fonte.proteina.toFixed(0)} C ${r.fonte.carboidrato.toFixed(0)} G ${r.fonte.gordura.toFixed(0)})`
      : "fonte sem macros";
    console.log(`- ${r.titulo}: app ${app} | ${fonte}`);
  }

  await prisma.userGoal.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, metaCalorica: 2000, metaAguaMl: 2000 },
  });

  console.log(`seed ok: ${Object.keys(ingredientes).length} ingredientes, ${receitas.length} receitas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
