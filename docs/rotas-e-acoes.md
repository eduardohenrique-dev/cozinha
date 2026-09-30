# Rotas e ações

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Hoje: anéis, água, avisos de estoque e a lista do dia |
| `/receitas` | caderno de receitas, com busca e filtros |
| `/receitas/nova` | formulário de nova receita |
| `/receitas/[id]` | detalhe da receita |
| `/receitas/[id]/editar` | edição |
| `/despensa` | estoque por categoria. Aceita `?falta=1`, que já abre filtrada em "Só em falta" |
| `/registrar` | registro de refeição e água. Aceita `?receita=<id>` (receita já escolhida) e `?aba=agua` |
| `/historico` | gráfico, calendário e detalhe. Aceita `?dia=AAAA-MM-DD` e `?mes=AAAA-MM` |
| `/manifest.webmanifest` | manifesto do PWA |

## Server Actions

Todas recebem a entrada como `unknown`, validam com zod e devolvem `ResultadoAcao<T>`:

```ts
type ResultadoAcao<T> = { ok: true; data: T } | { ok: false; erro: string };
```

### Receitas (`src/app/receitas/actions.ts`)

| Ação | Entrada | Saída | O que faz |
| --- | --- | --- | --- |
| `salvarReceita` | `receitaSchema` (com `id` para editar) | `{ id }` | cria ou atualiza. Na edição, troca os itens numa transação e apaga a foto antiga se ela mudou |
| `excluirReceita` | `id` | redireciona para `/receitas` | apaga a receita e as imagens dela. Os registros de consumo ficam (vínculo vira `null`) |

### Despensa (`src/app/despensa/actions.ts`)

| Ação | Entrada | Saída | O que faz |
| --- | --- | --- | --- |
| `salvarIngrediente` | `ingredienteSchema` (com `id` para editar) | `{ id }` | cria ou atualiza |
| `excluirIngrediente` | `id` | `{ receitas: string[] }` | apaga o item e devolve os títulos das receitas de onde ele saiu |
| `ajustarEstoque` | `id`, `delta` | `{ estoqueAtual, abaixo }` | soma ou subtrai do estoque, sem passar de zero; `abaixo` diz se ficou no mínimo |

### Registrar (`src/app/registrar/actions.ts`)

| Ação | Entrada | Saída | O que faz |
| --- | --- | --- | --- |
| `registrarConsumoReceita` | `{ recipeId, porcoes, data? }` | `{ kcal, alertas }` | grava o registro com cópia dos valores e desconta o estoque, numa transação |
| `registrarConsumoAvulso` | `{ ingredientId?, quantidade, nome, kcal, data? }` | `{ kcal, alertas }` | com `ingredientId`, calcula pelo item e desconta; sem ele, grava só nome e calorias |
| `editarConsumo` | `{ id, quantidade, kcal? }` | `{ kcal, alertas }` | acerta o estoque pela diferença e reescala os valores gravados. `kcal` só vale para item avulso |
| `excluirConsumo` | `id` | `{ kcal, devolvido }` | apaga o registro e devolve o estoque, quando há vínculo |
| `registrarAgua` | `ml` | `{ id, totalMl }` | grava um copo |
| `excluirAgua` | `id` | `{ ml, totalMl }` | apaga um copo |
| `zerarAguaDoDia` | nenhuma | `{ apagados, ml }` | apaga a água de hoje |
| `salvarMetas` | `{ metaCalorica, metaAguaMl }` | nenhuma | atualiza as metas |

Em `alertas`, cada item traz `id`, `nome`, `unidade`, `estoqueAtual` e `estoqueMinimo` dos ingredientes que ficaram no mínimo ou abaixo.

## Route Handlers

### `POST /api/upload`

Recebe `multipart/form-data` com o campo `file`.

| Resposta | Quando |
| --- | --- |
| `200` `{ url, thumbUrl }` | imagem processada e salva |
| `400` `{ erro }` | nenhum arquivo enviado |
| `415` `{ erro }` | o arquivo não é uma imagem |
| `413` `{ erro }` | acima de 12 MB |
| `422` `{ erro }` | o `sharp` não conseguiu ler a imagem |

### `GET /api/export`

Devolve o backup completo em JSON, como download (`cozinha-backup-AAAA-MM-DD.json`), sempre lido do banco no momento da chamada (`force-dynamic`, `Cache-Control: no-store`).

```jsonc
{
  "app": "cozinha",
  "versao": 1,
  "exportadoEm": "2026-09-30T12:00:00.000Z",
  "metas": { "metaCalorica": 2000, "metaAguaMl": 2000 },
  "ingredientes": [ /* todos os campos, sem createdAt e updatedAt */ ],
  "receitas": [ { "id": "…", "titulo": "…", "porcoes": 4, "tags": [], "ingredientes": [ { "nome": "…", "quantidade": 300, "unidade": "g" } ] } ],
  "consumos": [ /* os registros, com a cópia dos valores */ ],
  "agua": [ /* os copos */ ]
}
```

### `GET /api/alimentos`

Ponte com o [Open Food Facts](https://world.openfoodfacts.org), usada no cadastro de ingrediente.

| Parâmetro | Descrição |
| --- | --- |
| `q` | busca por texto (usa `search.openfoodfacts.org`) |
| `codigo` | código de barras (usa a API v2 de produto) |

Responde `{ resultados: Sugestao[] }`, com até 6 itens:

```ts
type Sugestao = {
  nome: string;
  marca: string | null;
  caloriasPor100g: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  codigo: string | null;
};
```

Produtos sem nome ou sem calorias são descartados. Se a energia vier só em quilojoules, ela é convertida para kcal (dividindo por 4,184). A chamada tem tempo limite de 8 segundos e as respostas ficam em cache por uma hora. Quando a API falha, a rota devolve `{ resultados: [], erro }` com uma mensagem, e o formulário segue manual.
