# Modelo de dados

O banco é um arquivo SQLite, gerenciado pelo Prisma. A definição está em [`prisma/schema.prisma`](../prisma/schema.prisma).

## Esquema

```
Ingredient ◄──── RecipeIngredient ────► Recipe
    ▲                                      ▲
    │ (opcional)                (opcional) │
    └────────────── ConsumptionLog ────────┘

WaterLog       (independente)
UserGoal       (uma linha só, id = 1)
```

## Tabelas

### `Ingredient`: a despensa

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | texto (`cuid`) | chave primária |
| `nome` | texto | |
| `unidade` | texto | `g`, `ml` ou `un` |
| `caloriasPor100g` | decimal | calorias por 100 g ou 100 ml |
| `proteina`, `carboidrato`, `gordura` | decimal | gramas por 100 g ou 100 ml |
| `estoqueAtual` | decimal | na unidade do ingrediente |
| `estoqueMinimo` | decimal | na unidade do ingrediente; **0 = item não monitorado** |
| `categoria` | texto | agrupa a lista da despensa |
| `pesoUnidadeG` | decimal, opcional | só para `un`: gramas por unidade |
| `createdAt`, `updatedAt` | data | |

### `Recipe`

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | texto | chave primária |
| `titulo` | texto | |
| `fotoUrl` | texto, opcional | caminho em `/uploads/…` ou em `/seed/…` |
| `modoPreparo` | texto | um passo por linha |
| `porcoes` | inteiro | rendimento da receita inteira (padrão 1) |
| `tags` | texto | lista em JSON (`'["almoço","rápido"]'`) |
| `createdAt`, `updatedAt` | data | |

### `RecipeIngredient`: a ligação

Chave primária composta (`recipeId`, `ingredientId`), então um ingrediente aparece uma vez por receita.

| Campo | Descrição |
| --- | --- |
| `quantidade` | na unidade do ingrediente, **para a receita inteira** (todas as porções) |

Apagar a receita apaga as ligações. Apagar um ingrediente também as apaga (`onDelete: Cascade`), e a receita continua existindo sem aquele item.

### `ConsumptionLog`: o que foi comido

Uma linha por refeição registrada. É a tabela do histórico.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | texto | chave primária |
| `data` | data | quando foi comido (padrão: agora) |
| `nome` | texto | **cópia** do nome da receita ou do item |
| `caloriasTotais` | decimal | calorias do registro inteiro |
| `proteina`, `carboidrato`, `gordura` | decimal | gramas do registro inteiro |
| `unidade` | texto, opcional | `g`, `ml` ou `un` para item avulso da despensa; vazio para receita |
| `fotoUrl` | texto, opcional | cópia da foto |
| `porcoesConsumidas` | decimal | porções (receita) ou quantidade na unidade do item (despensa) |
| `recipeId` | texto, opcional | aponta para a receita, enquanto ela existir |
| `ingredientId` | texto, opcional | aponta para o ingrediente, enquanto ele existir |

Há um índice em `data`. Os dois vínculos usam `onDelete: SetNull`: se a receita ou o ingrediente forem apagados, o registro fica e só perde o vínculo.

Um registro sem `recipeId` e sem `ingredientId` é um **alimento avulso**, só com nome e calorias.

### `WaterLog`

| Campo | Descrição |
| --- | --- |
| `id` | chave primária |
| `data` | quando foi bebido |
| `quantidadeMl` | inteiro, em mililitros |

Há um índice em `data`.

### `UserGoal`

Uma única linha, com `id = 1`: `metaCalorica` (padrão 2000) e `metaAguaMl` (padrão 2000). É criada na primeira leitura, com `upsert`.

## Por que o esquema é assim

- **`ConsumptionLog` guarda uma cópia do que foi comido.** Se o registro apontasse só para a receita, editar uma receita mudaria as calorias de todos os dias passados, e apagá-la deixaria buracos no histórico. Com a cópia, o passado fica como foi. Os vínculos existem só para navegar até a receita e para devolver o estoque ao apagar. Mais em [regras de negócio](regras-de-negocio.md#o-histórico-não-muda).
- **`quantidade` é da receita inteira.** Uma receita que rende 4 porções guarda as quantidades do panelão. Calcular uma porção é dividir; consumir 1,5 porção é multiplicar. Isso evita guardar um número "por porção" que perderia sentido ao mudar o rendimento.
- **`tags` como texto JSON.** O SQLite não tem listas nativas. As funções `parseTags` e `serializeTags` (`src/lib/tags.ts`) fazem a conversão, e `serializeTags` também normaliza (minúsculas, sem espaços, sem vazios).
- **`pesoUnidadeG` só para `un`.** Nutrientes são guardados por 100 g. Para um ingrediente contado em unidades (ovo, por exemplo), o peso de uma unidade é o que converte a quantidade em gramas. O schema zod exige o campo quando a unidade é `un` e o zera nas outras.
- **Estoque mínimo 0 como "não monitorado".** Em vez de um campo booleano a mais, o valor 0 já diz que o item não gera alerta.
