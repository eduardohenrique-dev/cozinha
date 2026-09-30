# Design

O visual é de cozinha aconchegante: papel quente, tons pastel e serifa com personalidade. O app é usado com a mão suja e o celular apoiado, então as telas de registro são pensadas primeiro para o dedo (mobile-first).

## Paleta

Uma paleta **fechada**: o `tailwind.config.ts` define só os tokens do projeto e nenhuma cor padrão do Tailwind, então não dá para usar uma cor fora do sistema sem querer. Os valores vivem como variáveis CSS em `globals.css`, em canais RGB para aceitar opacidade.

| Token | Valor | Uso |
| --- | --- | --- |
| `bg` | `#FAF6F0` | fundo, um creme de papel |
| `surface` | `#FFFFFF` | cartões |
| `primary` | `#9CAF88` | verde-sálvia: ações principais, água |
| `accent` | `#E8A87C` | pêssego: calorias, destaques |
| `warn` | `#E8B84B` | avisos |
| `danger` | `#D98670` | terracota: estoque zerado, exclusão |
| `text` | `#3D3833` | texto, um marrom quente (sem cinza neutro) |

De cada um derivam tons `soft` (fundos leves), `deep`/`strong` (texto e bordas) e, para o texto, `muted` e `faint`.

## Tipografia

- **Fraunces**, serifa variável, nos títulos (`font-display`) e nos números grandes. Os números usam a classe `.num-display`: itálico leve, algarismos tabulares e espaçamento apertado.
- **General Sans**, sem serifa variável, no corpo e na interface.

As duas são carregadas com `next/font/local` e entram por variáveis CSS (`--font-fraunces`, `--font-general`). Os arquivos não estão no repositório. Veja [instalação](instalacao.md#fontes).

## Forma e superfície

- **Cantos assimétricos**: os cartões usam `rounded-card` (24 px, 8 px, 24 px, 8 px) e `rounded-card-alt`, o inverso. Em grades, os dois alternam.
- **Sombras suaves** (`shadow-soft` e `shadow-lift`), sem vidro fosco e sem brilho.
- **Textura de papel**: um ruído SVG discreto atrás do conteúdo, em `body::before`.
- **Ilustrações próprias** nos estados vazios (despensa vazia, nenhum registro, receita sem foto) e nas receitas de exemplo, em vez de ícones genéricos.
- **Anéis de progresso em SVG**, animados por `stroke-dashoffset`, e um gráfico semanal também em SVG, sem biblioteca de gráficos.

## Acessibilidade

- **Contraste validado**: a paleta foi conferida por script contra o padrão WCAG AA. Texto com pelo menos 4,5:1 sobre `bg` e `surface`, e bordas de controles com pelo menos 3:1.
- **Cores claras só preenchem.** `accent`, `warn` e `danger` são claros demais para texto. Para texto existem `text-accent-strong`, `text-danger-strong` e `warn-strong`, e para bordas de controles, `border-line-strong`.
- **Movimento reduzido**: quem pede `prefers-reduced-motion` não recebe as animações de entrada, e o brilho de carregamento é desligado.
- **Foco visível** em tudo que é interativo, com contorno verde.
- **Modais** fecham com Esc, têm `aria-modal` e nome acessível.
- Botões só com ícone têm `aria-label`.

## Animações

Feitas com **GSAP** (e ScrollTrigger), sem outra biblioteca de animação.

| Onde | O quê |
| --- | --- |
| Entrada das seções e dos cartões | aparecem ao entrar na tela, em lote, com atraso escalonado e ease `power3.out` (`useReveal`, `Appear`, `RevealGroup`) |
| Anéis de calorias e de água | o traço e o número animam até o valor do dia |
| Copo de água | enche ao registrar |
| Cartões de receita | inclinam de leve e crescem sob o cursor (`gsap.quickTo`) |
| Selo de estoque baixo e ícone do aviso | pulsam e balançam devagar |
| Modais e avisos | entram com transição própria |

## Carregamento

Cada rota tem um `loading.tsx` com **esqueletos** no formato do conteúdo e um brilho suave passando (`.shimmer`), nunca um spinner.

## Evitado de propósito

Gradiente roxo ou azul, glassmorphism, fundo em cinza neutro, dark mode com brilho e o layout de barra de navegação com herói e três cartões.
