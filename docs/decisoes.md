# Decisões de projeto

As escolhas que não são óbvias, com o motivo de cada uma.

## SQLite e nenhum servidor

É um app pessoal, de um usuário só. O SQLite dispensa instalar e manter um banco, o arquivo é fácil de copiar como backup e o Prisma deixa a troca por outro banco a um `provider` de distância (veja [instalação](instalacao.md#produção)).

## Server Actions em vez de uma API REST

O app só tem um cliente (ele mesmo). Com Server Actions, o formulário chama uma função tipada do servidor, sem rotas, sem `fetch` e sem serialização à mão. Route Handlers ficam só para o que não cabe em formulário: upload de arquivo, download de backup e a ponte com uma API externa.

## O mesmo schema no formulário e no servidor

Os schemas zod de `src/lib/schemas.ts` são a **fonte única** de validação. O formulário (react-hook-form) valida com eles para dar resposta imediata, e a Server Action valida de novo antes de tocar no banco, porque a validação do cliente pode ser contornada. Escrever as regras uma vez evita que as duas versões se afastem. Os campos numéricos aceitam vírgula decimal, que é como se digita no Brasil.

## Registro com cópia dos valores

Veja [modelo de dados](modelo-de-dados.md#por-que-o-esquema-é-assim) e [regras de negócio](regras-de-negocio.md#o-histórico-não-muda). Em resumo: um histórico que muda quando a receita muda não é um histórico. Custa alguns campos repetidos em cada registro e garante que o passado não se altere.

## Quantidade da receita inteira, não por porção

A receita guarda as quantidades do rendimento completo. Mudar o número de porções não exige reescrever cada ingrediente, e consumir meia porção ou uma porção e meia é só uma multiplicação.

## Excluir ingrediente tira ele das receitas

Quem usa a despensa como inventário real acaba com ingredientes que as receitas citam e que a pessoa não tem. A despensa deve refletir o que está na casa, e não o que as receitas pedem. Por isso a exclusão é livre (`onDelete: Cascade`), e o app mostra, antes de confirmar, **quais receitas serão afetadas**.

## Estoque mínimo 0 significa "não monitorado"

Sal, óleo e água do filtro não precisam de alerta. Em vez de um campo booleano a mais, o mínimo 0 já diz que o item não entra na conta, e o alerta só dispara para quem o usuário escolheu acompanhar.

## Alerta dentro do app

O aviso de estoque baixo aparece no topo do dia, no item da despensa e na hora de registrar. Não há notificação push: para um app de uso pessoal, o lugar certo para ser lembrado da compra é onde você já está olhando para o que comeu.

## Armazenamento de imagens atrás de três funções

Só `src/lib/storage.ts` usa o sistema de arquivos. Nenhum outro arquivo importa `fs`. Se o app for para uma hospedagem sem disco persistente, a troca para um armazenamento de objetos é reimplementar `salvarImagem`, `removerImagem` e `removerImagemEThumb`.

## Upload convertido para WebP com miniatura

As fotos de celular chegam com vários megabytes. O servidor gira a imagem pelo EXIF e gera duas versões, uma grande e uma miniatura de 640 × 480 recortada pelo ponto de maior interesse. As listas usam a miniatura e o detalhe usa a versão grande (até 1600 px), o que deixa a navegação mais leve.

## Gráfico em SVG próprio

O gráfico dos 7 dias é um componente SVG próprio (`WeekChart`), com as calorias de cada dia contra a meta e a água ao lado. O caso é simples o bastante para dispensar uma biblioteca de gráficos, e desenhar à mão deixa o visual igual ao do restante do app, sem ter que sobrescrever estilos de terceiros.

## Open Food Facts opcional, com a busca nova

A busca de alimentos preenche o cadastro, mas o app **não depende** dela: se a API estiver fora, o formulário segue manual. A busca por texto usa o `search.openfoodfacts.org` porque o endpoint antigo (`/cgi/search.pl`) passou a responder 503. O campo de marcas vem como lista num endpoint e como texto no outro, e o conversor trata os dois.

## Builds em pastas separadas

O `next dev` grava em `.next` e o `next build` grava em `.next-prod`, definido condicionalmente no `next.config.mjs`. Quando as duas usavam a mesma pasta, rodar o build com o servidor de desenvolvimento aberto deixava os manifestos apontando para arquivos que não existiam mais, e o app ficava sem CSS (404 em `/_next/static/css/…`). Separar as pastas resolve sem nenhum custo.

## Fontes fora do repositório, com verificação

Fraunces e General Sans têm licenças próprias de distribuição, então os arquivos não vão junto com o código. Em troca, `scripts/verificar-fontes.mjs` roda antes do `dev` e do `build` e diz exatamente o que falta e de onde baixar, em vez de deixar o Next falhar com um erro de arquivo não encontrado.

## Seed que se recusa a apagar dados

O seed recria tudo do zero, o que é útil num banco novo e perigoso num banco com uso. Por isso ele confere se já há ingredientes e só segue com `SEED_FORCE=1`.

## Sem contas de usuário

Não há login. O app roda na sua máquina ou no seu servidor, com um único conjunto de dados e uma linha de metas (`UserGoal` com `id = 1`). Se um dia for compartilhado entre pessoas, os modelos precisariam de um dono e as Server Actions, de autenticação. O desenho atual deixa esse caminho aberto, mas não o percorre.
