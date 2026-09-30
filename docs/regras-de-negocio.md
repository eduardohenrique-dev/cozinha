# Regras de negócio

As regras ficam em `src/lib/` (`nutrition.ts`, `stock.ts`, `recipes.ts`, `day.ts`) e nas Server Actions de `src/app/registrar/`, separadas da interface.

## Calorias e macros

Os nutrientes de um ingrediente são guardados **por 100 g (ou 100 ml)**. Para uma quantidade qualquer:

```
gramas  = quantidade                       (unidade g ou ml)
gramas  = quantidade × pesoUnidadeG        (unidade un)
kcal    = caloriasPor100g × gramas / 100   (o mesmo vale para proteína, carboidrato e gordura)
```

Para uma **receita**:

```
total_da_receita = Σ macros de cada ingrediente na sua quantidade
por_porção       = total_da_receita / porções     (porções nunca é tratada como menos de 1)
```

Ao registrar `n` porções, o registro recebe `por_porção × n`.

Um ingrediente em `un` sem `pesoUnidadeG` contribuiria com 0 g. Por isso o cadastro exige o peso de uma unidade quando a unidade é `un`.

## Baixa de estoque

Registrar consumo desconta do estoque, dentro da mesma transação que grava o registro. Se uma das duas coisas falhar, nenhuma é gravada.

| O que foi registrado | O que é descontado |
| --- | --- |
| Receita, `n` porções | de cada ingrediente, `quantidade × n ÷ porções da receita` |
| Item da despensa, quantidade `q` | `q`, na unidade do item |
| Alimento avulso (só nome e calorias) | nada |

O estoque **nunca fica negativo**: o desconto é limitado a zero. Um ingrediente que sai da receita (porque foi excluído da despensa) deixa de ser descontado.

### Devolução

Apagar um registro devolve ao estoque exatamente o que aquele registro descontaria (a mesma conta, agora somando). Editar a quantidade de um registro acerta o estoque **pela diferença**:

- se a quantidade subiu, desconta a diferença;
- se desceu, devolve a diferença.

Só registros ligados a uma receita ou a um item da despensa mexem no estoque. Se a receita ou o item já foram excluídos, não há o que devolver, e o registro é apagado ou editado sem tocar em nada.

## Estoque baixo

```ts
estaBaixo = estoqueMinimo > 0 && estoqueAtual <= estoqueMinimo
```

- Um item com **mínimo 0 não é monitorado** e nunca dispara alerta.
- O limite é "menor ou igual": chegar exatamente ao mínimo já conta como baixo.
- Um item zerado aparece com o selo **acabou**; acima de zero e no mínimo, **baixo**.

Os alertas aparecem em três lugares: o aviso no topo da tela **Hoje**, o selo em cada item da **despensa** e um aviso na hora, ao registrar ou ao ajustar o estoque para baixo do mínimo. Não há notificação push: o alerta existe dentro do app.

## Quanto dá para fazer

Para uma receita, o app calcula quantas porções o estoque atual permite:

```
fator  = mínimo, entre os ingredientes, de (estoqueAtual ÷ quantidade usada na receita)
porções possíveis = arredonda para baixo, em passos de meia porção, de (fator × porções da receita)
```

E "faltando" conta os ingredientes cujo estoque não cobre nem **uma** porção (`estoqueAtual < quantidade ÷ porções`). O filtro **Dá para fazer** mostra as receitas sem nenhum ingrediente faltando.

## O histórico não muda

Cada `ConsumptionLog` guarda uma **cópia** do que foi comido: nome, foto, calorias, proteína, carboidrato e gordura. O resumo do dia, o gráfico dos 7 dias, o calendário e o detalhe do dia leem só essa cópia, nunca a receita atual.

Na prática:

- editar os ingredientes ou as porções de uma receita não altera os dias passados;
- excluir uma receita ou um ingrediente não quebra o histórico: o vínculo vira `null` e o registro segue exibido com o nome e os valores gravados;
- o tipo do registro (receita, despensa ou livre) é deduzido dos vínculos e da unidade, e vale só para o rótulo na tela.

Ao **editar a quantidade** de um registro, os macros gravados são reescalados na proporção (`nova quantidade ÷ quantidade anterior`). Para um alimento avulso, sem vínculo, as calorias podem ser informadas de novo no formulário.

**Só o dia de hoje pode ser editado ou apagado.** A tela de histórico mostra os dias anteriores em modo de leitura. Essa trava está na interface: as Server Actions aceitam o id de qualquer registro, o que é coerente com um app de uso pessoal, sem contas de usuário.

## Água

- Cada registro precisa ser maior que zero e ter no máximo 5000 ml.
- Os botões rápidos registram 250 ml e 500 ml.
- O total do dia soma todos os registros do dia. Dá para apagar um registro, ou reiniciar o dia (apaga só a água de hoje, nunca refeições).

## Metas

Duas metas, na tabela `UserGoal`: calorias (entre 500 e 8000 kcal) e água (entre 500 e 8000 ml). O padrão de cada uma é 2000.

## Dia e período

Um "dia" vai de 00:00 a 23:59:59 no fuso do servidor (date-fns). A semana do calendário começa no domingo. Na lista do dia, cada refeição cai num período pela hora do registro:

| Hora | Período |
| --- | --- |
| antes das 11h | Café da manhã |
| 11h até antes das 15h | Almoço |
| 15h até antes das 18h | Lanche |
| 18h em diante | Jantar |

## Validação

Toda entrada é validada por um schema zod (`src/lib/schemas.ts`), primeiro no formulário e de novo na Server Action. Os campos numéricos aceitam vírgula decimal (`1,5`). Alguns limites:

| Campo | Regra |
| --- | --- |
| Nome de receita ou ingrediente | obrigatório, até 120 caracteres |
| Porções de uma receita | inteiro de 1 a 100 |
| Ingredientes de uma receita | pelo menos um, sem repetição, cada um com quantidade maior que zero |
| Porções consumidas | maior que zero e no máximo 50 |
| Nutrientes e estoques | não negativos |
| Unidade | `g`, `ml` ou `un` |
