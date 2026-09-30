# Instalação

## Requisitos

- Node.js 20 ou mais novo, com npm.
- Nenhum servidor de banco: os dados ficam num arquivo SQLite local.

## Passo a passo

```bash
git clone https://github.com/eduardohenrique-dev/cozinha.git
cd cozinha
npm install
```

O `npm install` também roda `prisma generate`, que gera o cliente do banco.

Crie o arquivo de variáveis a partir do exemplo:

```bash
cp .env.example .env          # no Prompt de Comando do Windows: copy .env.example .env
```

Crie o banco e carregue os dados de exemplo:

```bash
npm run db:push
npm run db:seed
```

Coloque as [fontes](#fontes) em `src/app/fonts/` e suba o servidor:

```bash
npm run dev
```

O app abre em <http://localhost:3000>.

## Fontes

O app usa duas famílias, carregadas pelo `next/font/local`. Elas **não estão no repositório**, porque cada uma tem a sua própria licença de distribuição. Baixe-as e coloque os quatro arquivos abaixo em `src/app/fonts/`:

| Arquivo | De onde vem |
| --- | --- |
| `Fraunces-Variable.ttf` | [Fraunces](https://fonts.google.com/specimen/Fraunces), no Google Fonts (a variável, normal) |
| `Fraunces-VariableItalic.ttf` | o mesmo pacote (a variável, itálico) |
| `GeneralSans-Variable.woff2` | [General Sans](https://www.fontshare.com/fonts/general-sans), na Fontshare (a variável, normal) |
| `GeneralSans-VariableItalic.woff2` | o mesmo pacote (a variável, itálico) |

Os nomes precisam ser exatamente esses. Se você baixar os arquivos com outro nome, renomeie-os ou ajuste os caminhos em [`src/app/fonts.ts`](../src/app/fonts.ts).

Os scripts `dev` e `build` rodam antes o `scripts/verificar-fontes.mjs`, que confere se os quatro arquivos existem. Se faltar algum, ele lista quais e encerra com erro, em vez de deixar o Next falhar com uma mensagem menos clara. A pasta `src/app/fonts/` está no `.gitignore`.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | caminho do SQLite. Relativo à pasta `prisma/`, então o arquivo fica em `prisma/dev.db` |

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento (antes, confere as fontes) |
| `npm run build` | build de produção (antes, confere as fontes) |
| `npm start` | serve o build de produção |
| `npm run lint` | ESLint do Next |
| `npm run db:push` | cria ou atualiza as tabelas a partir do `schema.prisma` |
| `npm run db:seed` | grava ingredientes e receitas de exemplo |
| `npm run db:studio` | abre o Prisma Studio para olhar o banco |

### Sobre o seed

O `db:seed` cria 74 ingredientes e 9 receitas, cada uma com uma ilustração em `public/seed/`, e define as metas padrão (2.000 kcal e 2.000 ml de água). Os valores nutricionais dos ingredientes são aproximados, por 100 g ou 100 ml, e servem de ponto de partida. Ajuste-os na tela da despensa conforme as embalagens que você usa.

**Atenção:** o seed recria tudo do zero. Ele apaga receitas, ingredientes e registros de consumo e de água antes de gravar os dados de exemplo. Por isso, se o banco já tiver ingredientes, ele se recusa a rodar e explica o motivo. Para recriar mesmo assim:

```bash
SEED_FORCE=1 npm run db:seed          # no PowerShell: $env:SEED_FORCE=1; npm run db:seed
```

As metas (`UserGoal`) não são apagadas.

### Sobre as pastas de build

O `next dev` grava em `.next` e o `next build` grava em `.next-prod` (veja o [`next.config.mjs`](../next.config.mjs)). As duas pastas são separadas de propósito: sem isso, rodar o build com o servidor de desenvolvimento aberto deixa o app sem CSS. Veja as [decisões de projeto](decisoes.md#builds-em-pastas-separadas).

## Produção

```bash
npm run build
npm start
```

O app grava o banco e as fotos enviadas no disco local (`prisma/dev.db` e `public/uploads/`). Isso funciona bem numa máquina sua, num servidor próprio ou num container com volume. Numa hospedagem com sistema de arquivos efêmero (como funções serverless), esses dados se perderiam. Nesse caso, troque o SQLite por um banco hospedado, alterando o `provider` e a `DATABASE_URL` no `schema.prisma`, e reimplemente as três funções de [`src/lib/storage.ts`](../src/lib/storage.ts) para um armazenamento de objetos.

## Backup

Na tela **Histórico**, o botão de exportar baixa um JSON com ingredientes, receitas, consumos, água e metas. Para uma cópia completa, copie também `prisma/dev.db` e a pasta `public/uploads/`.

## Problemas comuns

**`Faltam fontes em src/app/fonts/`**: os arquivos de fonte não estão na pasta. Siga a seção [Fontes](#fontes).

**`Environment variable not found: DATABASE_URL`**: falta o arquivo `.env`. Copie o `.env.example`.

**As tabelas não existem / `no such table`**: rode `npm run db:push`.

**O app abre sem CSS depois de um build**: você provavelmente apagou a pasta `.next` com o servidor rodando. Pare o servidor, apague `.next` e suba de novo.

**O upload de foto falha**: o limite é de 12 MB, e o arquivo precisa ser uma imagem que o `sharp` consiga ler (JPEG, PNG, WebP, entre outros). Fotos de celular com rotação EXIF são aceitas e giradas corretamente.
