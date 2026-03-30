# Frontend Redesign — Martins Pro Serv Dashboard

**Date:** 2026-03-27
**Status:** Approved
**Goal:** Elevar o visual do dashboard para nível enterprise (TOTVS/OMIE/Power BI), com render máxima, cards animados e interativos, pronto para apresentação.

---

## 1. Design System — Tokens de Cor

Substituir o tema neon-blue atual por âmbar/gold como cor primária.

| Token | Valor | Uso |
|---|---|---|
| `--color-accent-primary` | `#f59e0b` | Destaque principal, borders ativas, badges |
| `--color-accent-secondary` | `#8b5cf6` | Despesas, série secundária de gráficos |
| `--color-accent-green` | `#10b981` | Lucro, indicadores positivos |
| `--color-accent-red` | `#ef4444` | Alertas, variação negativa |
| `--color-accent-blue` | `#3b82f6` | Margem, série terciária |
| `--color-accent-cyan` | `#06b6d4` | Indicadores neutros, obras |
| `--color-bg-primary` | `#0d1117` | Fundo geral |
| `--color-bg-card` | `#161b22` | Fundo dos cards |
| `--color-bg-surface` | `#1f2937` | Superfícies internas, inputs |
| `--color-border` | `#30363d` | Bordas sutis |
| `--color-text-primary` | `#f0f6fc` | Texto principal |
| `--color-text-muted` | `#8b949e` | Labels, subtextos |

Remover todas as referências a `neon-blue`, `neon-glow`, `neon-dim`.

---

## 2. Estados Globais — Loading, Erro e Vazio

### Loading
- Skeleton loaders (pulse animation âmbar 10%) no Hero Card, nos 3 cards secundários e nas áreas de gráfico
- Implementar com Tailwind `animate-pulse` + divs de placeholder do mesmo tamanho do conteúdo real
- Spinner centralizado não é usado — skeletons evitam layout shift

### Erro de API
- Se o fetch falhar: toast de erro no canto inferior direito com mensagem "Erro ao carregar dados. Tente novamente."
- Dados anteriores permanecem visíveis se disponíveis; caso contrário, placeholder com ícone de alerta

### Estado Vazio
- **Sem despesas no período:** Donut chart exibe placeholder circular cinza + texto "Sem despesas em [mês]"
- **Sem meta configurada:** Seção Metas exibe card com CTA "Definir metas →" (comportamento já existente — manter)
- **Sem obras/pagamentos:** Tabelas exibem linha única "Nenhum registro encontrado" centralizada

---

## 3. Header — Seletor de Mês

O header do dashboard contém:
- **Título:** "Dashboard Financeiro" (h1, text-primary)
- **Subtítulo:** "Martins Pro Serv · Esquadrias & Vidraçaria" (text-muted)
- **Seletor de mês:** `<select>` estilizado com opções geradas dinamicamente para os 12 meses do ano corrente. Valor padrão: mês atual. Ao mudar, dispara novo `fetch` para `/api/dashboard?mes=X&ano=Y` (lógica já existente — manter, apenas atualizar estilo visual)
- **Botão Export:** mantido como está

---

## 4. Sidebar — Compacta com Expansão ao Hover

**Comportamento:**
- Largura colapsada: `52px` — apenas ícones (Lucide React)
- Ao hover: expande para `220px` com transição `width 220ms ease-out`
- Labels aparecem com `opacity: 0 → 1` e `translateX(-8px → 0)` durante expansão

**Estrutura:**
```
┌──────┐
│  M   │  ← Logo âmbar (52×52, border-radius 8px)
├──────┤
│  📊  │  ← Dashboard (ativo: bg âmbar 15% + border-left 3px âmbar)
│  👥  │  ← Clientes
│  💸  │  ← Despesas
│  📋  │  ← A Receber
│  📈  │  ← DRE
│  🎯  │  ← Metas
└──────┘
```

**Item ativo:** `background: rgba(245,158,11,0.12)`, `border-left: 3px solid #f59e0b`, ícone âmbar.
**Item hover:** `background: rgba(255,255,255,0.05)`.

Substituir ícones emoji por Lucide React: `LayoutDashboard`, `Users`, `Receipt`, `CreditCard`, `TrendingUp`, `Target`.

**Responsividade:**
- `>= 768px (md)`: sidebar visível colapsada (52px), expande ao hover para 220px
- `< 768px (mobile)`: sidebar oculta (`display: none`); botão hamburger (`Menu` icon Lucide) aparece no header; ao clicar, abre drawer overlay (`position: fixed, z-50`) com a sidebar expandida (220px) sobre o conteúdo; fechar ao clicar fora ou no X
- Breakpoint de transição gerenciado por state `isMobileMenuOpen` em `ShellLayout.tsx`

---

## 5. Dashboard — Layout de Tela

**Desktop (`>= 1024px, lg`):**
```
┌─────────────────────────────────────────────────┐
│  Header: título + breadcrumb + seletor mês      │
├─────────────────────────────────────────────────┤
│  HERO CARD — Faturamento (largura total)        │
├───────────────┬──────────────┬──────────────────┤
│  Card Despesas│  Card Lucro  │  Card Margem     │
├───────────────┴──────────────┴──────────────────┤
│  Area Chart (2/3 largura) │ Donut Chart (1/3)  │
├───────────────────────────┴─────────────────────┤
│  Contas a Receber (1/2)   │ Metas + Gauges     │
└───────────────────────────┴─────────────────────┘
```

**Tablet (`768px – 1023px, md`):**
- Hero Card: largura total
- 3 KPI Cards: `grid-cols-3` (mantém linha horizontal)
- Area Chart: largura total (`col-span-full`)
- Donut Chart: largura total abaixo do Area Chart
- Contas a Receber + Metas: `grid-cols-2`

**Mobile (`< 768px, sm`):**
- Todos os elementos: `grid-cols-1` (stacked)
- Hero Card → 3 KPI Cards → Area Chart → Donut Chart → Contas a Receber → Metas
- Sidebar: oculta (drawer overlay conforme Seção 4)

---

## 6. KPI Hero Card

- Largura: 100% da área de conteúdo
- `border-left: 4px solid #f59e0b`
- Número principal: `font-size: clamp(2rem, 4vw, 3.5rem)`, `font-weight: 900`
- Linha de progresso de meta: barra horizontal fina com % numérico
- Badge variação: verde/vermelho com ícone de seta
- **Animação de entrada:** contador de 0 → valor real em 600ms `ease-out` com `framer-motion` `useMotionValue` + `useTransform`
- **Loading state:** skeleton retângulo de mesma altura com `animate-pulse`

Componente: `HeroKpiCard.tsx` (novo)

---

## 7. KPI Cards Secundários (3 cards em linha)

- Grid `grid-cols-1 sm:grid-cols-3`, gap `1rem` (mobile: stacked; tablet+: 3 colunas)
- `border-top: 2px solid <cor-por-métrica>`
  - Despesas: `var(--color-accent-secondary)` (#8b5cf6)
  - Lucro: `var(--color-accent-green)` (#10b981)
  - Margem: `var(--color-accent-blue)` (#3b82f6)
- Número: `font-size: 1.5rem`, `font-weight: 800`
- Variação percentual com ícone `TrendingUp`/`TrendingDown`
- **Animação:** `staggerChildren` com delay 80ms entre cada card (`framer-motion` `variants`)
- **Loading state:** skeleton de mesma dimensão com `animate-pulse`

Componente: `KpiCard.tsx` (atualizar o existente)

---

## 8. Area Chart — Histórico 6 Meses

**Biblioteca:** Recharts `AreaChart` (já instalada)

**Séries:**
- Faturamento: stroke `#f59e0b`, fill gradient âmbar (opacity 0.4 → 0.02)
- Despesas: stroke `#8b5cf6`, strokeDasharray `"4 2"`, fill gradient roxo (opacity 0.2 → 0.02)

**Features:**
- `CustomTooltip` com card dark, valores formatados em R$
- Dots visíveis apenas no último ponto de cada série
- `animationDuration: 1200`
- Eixos com tick color `#8b949e`, sem bordas desnecessárias
- **Empty state:** se `data.historico` vazio, placeholder cinza com texto "Sem dados históricos"

Componente: `RevenueChart.tsx` (atualizar o existente)

---

## 9. Donut Chart — Despesas por Categoria

**Biblioteca:** Recharts `PieChart` com `innerRadius={55}` e `outerRadius={80}`

**Features:**
- Centro mostra total formatado em R$ (via `label` customizado)
- Hover: `outerRadius` aumenta +8px com `activeIndex` state
- Legenda lateral com cor + nome + valor + percentual
- Paleta: `#f59e0b`, `#8b5cf6`, `#10b981`, `#3b82f6`, `#ef4444`, `#06b6d4`
- `animationBegin: 0`, `animationDuration: 800`
- **Empty state:** placeholder circular cinza + texto "Sem despesas em [mês]"

Componente: `ExpensePieChart.tsx` (atualizar o existente)

---

## 10. Seção Contas a Receber

- Manter layout atual (barras de prazo por %)
- Atualizar cores para o novo design system (remover neon-blue)
- Adicionar valor total em destaque com fonte maior
- Badges de prazo: estilo pill com cor por prazo (AVISTA=green, 30D=yellow, 60D=orange, 90D=red)

---

## 11. Seção Metas — Gauge Semicircular

**Implementação:** SVG inline (não Recharts) — mais controle sobre animação e tamanho.

**Especificações do gauge:**
- Arco semicircular: 180° (sweep da esquerda para direita)
- `viewBox="0 0 120 70"` — cada gauge ocupa este espaço
- Trilha (fundo): `stroke="#30363d"`, `strokeWidth=10`, `strokeLinecap="round"`
- Barra de progresso: `strokeWidth=10`, `strokeLinecap="round"`, animação via `stroke-dashoffset` de 100% → valor%
- Raio do arco: `r=50`, centro `cx=60 cy=60`
- Texto central: valor percentual em `font-size: 16px, font-weight: 800`
- Subtexto: valor atual + "/" + meta em `font-size: 9px, fill: text-muted`

**Cor por atingimento:**
- `< 50%`: `#ef4444` (vermelho)
- `50–80%`: `#f59e0b` (âmbar)
- `> 80%`: `#10b981` (verde)

**Animação:** `framer-motion` anima `strokeDashoffset` do valor de arco vazio até o valor calculado, com `duration: 0.8`, `ease: "easeOut"`, `delay: 0.3`.

**Empty state:** Se `meta === null`, exibe arco cinza + texto "Sem meta" + link "Definir →".

Componente: `MiniGauge.tsx` (novo), usado em `app/metas/page.tsx` e no card de Metas em `app/page.tsx`.

---

## 12. Páginas Secundárias — Padrão de Tabelas

Aplicar a todas as páginas (Clientes, Despesas, DRE, A Receber, Metas):

- Cabeçalho de tabela sticky com `position: sticky; top: 0`
- Hover row: `background: rgba(245,158,11,0.05)`
- Badges de status com pill colorido (ex: PAGO=verde, PENDENTE=âmbar, VENCIDO=vermelho)
- Botões de ação com ícones Lucide React (`Edit2`, `Trash2`)
- Inputs com `border-color` âmbar no focus

---

## 13. Micro-animações

| Elemento | Animação |
|---|---|
| Cards no load | `staggerChildren` 80ms, `y: 20 → 0`, `opacity: 0 → 1` |
| Números KPI | Contador 0 → valor, 600ms ease-out |
| Gauge semicircular | `strokeDashoffset` 0.8s ease-out, delay 300ms |
| Sidebar hover | `width` 220ms ease-out, labels fade-in |
| Card hover | `translateY(-2px)` em `150ms ease-out`, `box-shadow` intensifica via CSS `transition: transform 150ms ease-out, box-shadow 150ms ease-out` (CSS puro, não framer-motion) |
| Gráficos | Recharts animation nativo (800–1200ms) |

**Hover `translateY(-2px)` aplicado em:**
- `HeroKpiCard` (card de faturamento)
- Os 3 `KpiCard` secundários (Despesas, Lucro, Margem)
- Card de Contas a Receber no dashboard
- Card de Metas no dashboard
- Linhas de tabela nas páginas secundárias **não** recebem translateY — apenas mudança de background

---

## 14. Arquivos a Criar / Modificar

| Arquivo | Ação |
|---|---|
| `app/globals.css` | Atualizar tokens de cor, remover neon |
| `components/ui/Sidebar.tsx` | Refatorar para sidebar compacta com hover expand + mobile drawer |
| `components/ui/ShellLayout.tsx` | Ajustar para nova sidebar, adicionar mobile menu state |
| `components/ui/KpiCard.tsx` | Atualizar estilo + animações + skeleton |
| `components/ui/HeroKpiCard.tsx` | **NOVO** — card hero de faturamento |
| `components/ui/MiniGauge.tsx` | **NOVO** — gauge semicircular SVG animado |
| `components/ui/ProgressBar.tsx` | Remover — auditado via grep: único consumidor é `app/page.tsx` e `app/metas/page.tsx`, ambos serão atualizados para `MiniGauge`. Nenhum outro arquivo importa este componente. |
| `components/charts/RevenueChart.tsx` | Atualizar para area chart com gradiente + empty state |
| `components/charts/ExpensePieChart.tsx` | Atualizar para donut com hover + empty state |
| `app/page.tsx` | Usar HeroKpiCard, novo layout, skeletons |
| `app/clientes/page.tsx` | Aplicar padrão de tabelas enterprise |
| `app/despesas/page.tsx` | Aplicar padrão de tabelas enterprise |
| `app/receber/page.tsx` | Aplicar padrão de tabelas enterprise |
| `app/dre/page.tsx` | Aplicar padrão de tabelas enterprise |
| `app/metas/page.tsx` | Aplicar MiniGauge + novo layout |

---

## 15. O Que NÃO Muda

- Schema do banco (Prisma) — sem alterações
- Rotas de API (`/api/**`) — sem alterações
- Lógica de negócio e cálculos financeiros — sem alterações
- Biblioteca de gráficos (Recharts) — já instalada, apenas atualizar componentes
- framer-motion — já instalada
- Formulários de criação/edição (ClienteForm, DespesaForm, PagamentoForm) — sem alterações de lógica
