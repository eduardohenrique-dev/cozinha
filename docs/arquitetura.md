# Arquitetura

O Cozinha é um app Next.js 14 com App Router. Não há uma API separada: as páginas são componentes de servidor que leem o banco direto, e as escritas passam por **Server Actions**.

```
   navegador                         servidor Next.js                      disco
 ─────────────         ───────────────────────────────────────         ──────────────
  componente de   ──►   Server Action        ──►   src/lib/*   ──►   SQLite (Prisma)
  cliente (form)        (revalida com zod)         regras puras        public/uploads
        ▲                      │
        └── estado leve (Zustand) ◄── resumo do dia, hidratado pelo servidor
```

## Estrutura

```
cozinha/
├─ prisma/
│  ├─ schema.prisma          modelos
│  └─ seed.ts                dados de exemplo
├─ public/
│  ├─ seed/                  ilustrações das receitas de exemplo (SVG)
│  ├─ uploads/               fotos enviadas (ignorado pelo git)
│  └─ icone*.png, icone.svg  ícones do PWA
├─ scripts/verificar-fontes.mjs
└─ src/
   ├─ app/
   │  ├─ page.tsx                     Hoje
   │  ├─ receitas/                    lista, detalhe, nova, editar, actions.ts
   │  ├─ despensa/                    lista e actions.ts
   │  ├─ registrar/                   registro de refeição e água, actions.ts
   │  ├─ historico/                   gráfico, calendário e detalhe do dia
   │  ├─ api/{alimentos,export,upload}/
   │  ├─ fonts.ts, layout.tsx, manifest.ts, globals.css
   ├─ components/                     organizados por módulo
   │  ├─ ui/                          Button, Card, Input, Modal, Stepper, Tag, Skeleton…
   │  ├─ dashboard/ log/ pantry/ recipes/ history/
   │  └─ gsap/                        Appear, RevealGroup, useReveal
   ├─ lib/                            regras e acesso aos dados
   └─ store/                          Zustand: dia e avisos (toast)
```

## Camadas

### Páginas (`src/app/**/page.tsx`)

Componentes de servidor. Cada página busca o que precisa com o Prisma (ou por uma função de `src/lib/`) e passa dados simples para os componentes. As que dependem do momento atual (`/historico`, `/receitas/[id]`) usam `force-dynamic`. Cada rota tem um `loading.tsx` com esqueletos no estilo do app.

### Server Actions (`src/app/<rota>/actions.ts`)

Uma por módulo. É a **única porta de escrita** no banco. Toda action:

1. recebe `unknown` e valida com o schema zod correspondente (`safeParse`);
2. devolve `{ ok: false, erro }` com a primeira mensagem de erro, ou `{ ok: true, data }`;
3. roda as gravações relacionadas dentro de uma transação quando elas precisam ser atômicas (registrar consumo, editar e apagar registro);
4. chama `revalidatePath` nas páginas afetadas.

O tipo de retorno `ResultadoAcao<T>` fica em `src/lib/types.ts`. Como o erro volta como dado, e não como exceção, o formulário mostra a mensagem sem tratamento especial.

### Regras (`src/lib/`)

Funções que não conhecem a interface:

| Arquivo | Responsabilidade |
| --- | --- |
| `nutrition.ts` | converter quantidade em gramas, calcular macros, somar e dividir por porção, `estaBaixo` |
| `stock.ts` | `debitarEstoque`, `creditarEstoque`, `listarBaixos` |
| `recipes.ts` | consulta de receitas com ingredientes, macros da receita, porções possíveis, itens faltando |
| `day.ts` | resumo do dia e séries por dia, sempre a partir dos registros gravados |
| `historico.ts`, `date.ts` | calendário, chaves de dia e mês, períodos do dia (date-fns em pt-BR) |
| `schemas.ts` | schemas zod, compartilhados entre formulário e actions |
| `storage.ts`, `images.ts` | gravação de imagens em disco e a convenção de miniaturas |
| `format.ts`, `tags.ts`, `cx.ts` | formatação de números e quantidades, tags, classes |

### Route Handlers (`src/app/api/`)

Para o que não é formulário: o upload de imagem (`multipart`), o backup em JSON e a ponte com o Open Food Facts. Estão descritos em [rotas e ações](rotas-e-acoes.md).

### Estado no cliente (`src/store/`)

O Zustand guarda só o **resumo do dia** (calorias, água e metas), para que o dashboard e a tela de registro mostrem o valor novo na hora, sem esperar a ida ao servidor. O `DayHydrator` copia os valores reais do servidor para o store a cada carregamento, então a fonte da verdade continua sendo o banco. O outro store (`toast`) guarda os avisos na tela.

## Fluxo de uma refeição

O caminho do botão **Registrar** de uma receita, em `registrarConsumoReceita` (`src/app/registrar/actions.ts`):

```
ConsumoForm ──► registrarConsumoReceita({ recipeId, porcoes })
                  │  zod: receita escolhida, 0 < porções ≤ 50
                  ▼
        transação Prisma
          1. carrega a receita com os ingredientes
          2. macros da receita inteira ÷ porções da receita = macros de 1 porção
          3. grava ConsumptionLog com o snapshot (nome, foto, calorias e macros × porções comidas)
          4. debitarEstoque: para cada ingrediente, quantidade × (porções comidas ÷ porções da receita)
                  │  devolve os itens que ficaram no mínimo ou abaixo
                  ▼
        revalidatePath: /, /registrar, /despensa, /receitas, /historico
                  │
                  ▼
        { ok: true, data: { kcal, alertas } } ──► aviso na tela + atualização otimista no Zustand
```

As regras que esse caminho aplica estão em [regras de negócio](regras-de-negocio.md).

## Imagens

O upload passa por `sharp`: a imagem é girada conforme o EXIF e gerada em duas versões WebP, a grande (no máximo 1600 × 1600, qualidade 82) e a miniatura (640 × 480, recorte pelo ponto de maior interesse, qualidade 78). Os nomes seguem a convenção `<uuid>.webp` e `<uuid>-thumb.webp`, e `thumbDe()` deriva o caminho da miniatura a partir do da imagem.

Só `src/lib/storage.ts` usa o sistema de arquivos. São três funções (`salvarImagem`, `removerImagem`, `removerImagemEThumb`), então trocar o disco por um armazenamento de objetos é reimplementar só esse arquivo.
