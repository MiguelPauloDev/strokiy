# CLAUDE.md — Strokiy Project Instructions

> Este ficheiro é lido automaticamente pelo Claude Code no início de cada sessão.
> Segue estas instruções à risca em TODAS as interacções com este projecto.

---

## O que é o Strokiy

**Strokiy** é um website onde utilizadores descobrem, personalizam e fazem download de ilustrações vectoriais SVG formadas por formas geométricas. Cada ilustração é construída pela junção de formas simples (círculos, rectângulos, linhas, elipses) que em conjunto criam uma figura expressiva.

O produto tem duas partes:
1. **Galeria pública** — encontrar e fazer download/copy de ilustrações
2. **Editor de ilustrações** — ferramenta generativa onde o utilizador controla parâmetros (forma, cor, tamanho, estilo) e a ilustração é gerada/ajustada em tempo real

---

## Stack Tecnológico (OBRIGATÓRIO — não alterar sem instrução explícita)

```
Frontend:     Next.js 14 (App Router)
Styling:      Tailwind CSS + CSS custom properties
Linguagem:    TypeScript
Ilustrações:  SVG inline + geração programática
Dados MVP:    Ficheiros JSON no repositório (sem base de dados)
Dados Fase 2: Turso (SQLite serverless — quando crescer)
Auth:         Não existe no MVP
Deploy:       Vercel
Package mgr:  npm
```

### Porquê este stack
- Next.js App Router: SEO nativo, Server Components, ideal para galeria de SVGs
- JSON no repo: zero custo, zero manutenção, nunca pausa, deploy instantâneo — perfeito para MVP
- Sem Supabase no MVP: o plano free pausa após 1 semana de inactividade — fatal para um site público
- Turso na Fase 2: SQLite serverless, grátis até 9GB, nunca pausa, migração simples do JSON
- Vercel: deploy automático a cada push no GitHub, CDN global, domínio gratuito inicial

---

## Estrutura de Pastas do Projecto

```
strokiy/
├── app/
│   ├── layout.tsx              ← Layout raiz (fonte, metadata global)
│   ├── page.tsx                ← Homepage / Galeria principal
│   ├── illustration/
│   │   └── [slug]/
│   │       └── page.tsx        ← Página de detalhe de ilustração
│   ├── editor/
│   │   └── page.tsx            ← Editor/gerador de ilustrações
│   └── api/
│       └── illustrations/
│           └── route.ts        ← API route para listar/filtrar ilustrações
├── components/
│   ├── ui/                     ← Componentes base (Button, Badge, Input...)
│   ├── gallery/
│   │   ├── IllustrationCard.tsx
│   │   ├── IllustrationGrid.tsx
│   │   └── FilterBar.tsx
│   ├── illustration/
│   │   ├── SVGViewer.tsx       ← Viewer com zoom e copy/download
│   │   └── IllustrationDetail.tsx
│   ├── editor/
│   │   ├── EditorCanvas.tsx    ← Canvas SVG em tempo real
│   │   ├── ControlPanel.tsx    ← Painel de controlos do lado direito
│   │   └── ShapeControls.tsx   ← Sliders e pickers por forma
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── supabase.ts             ← Cliente Supabase
│   ├── illustrations.ts        ← Funções de fetch e filtro
│   └── svg-generator.ts        ← Motor de geração de SVGs
├── types/
│   └── index.ts                ← Tipos TypeScript globais
├── public/
│   └── assets/
│       ├── icons/svg/          ← Ícones do UI (da pasta strokiy-assets)
│       └── illustrations/      ← SVGs estáticos iniciais
├── styles/
│   └── globals.css             ← CSS custom properties (tokens de design)
└── CLAUDE.md                   ← Este ficheiro
```

---

## Design System (SEGUIR SEMPRE)

### Cores
```css
--color-bg:            #F5F5F9;   /* fundo da página */
--color-white:         #FFFFFF;   /* cards, sidebar, badges */
--color-surface:       #F1F1F1;   /* inputs, toggles, botões secundários */
--color-text-primary:  #212123;   /* texto principal */
--color-text-muted:    #888888;   /* texto secundário */
--color-border:        #E8E8EE;   /* bordas subtis */

/* Gradient blobs sidebar */
--color-blob-blue:     #00AAFF;
--color-blob-red:      #FF3155;
--color-blob-orange:   #FF7733;
--color-blob-yellow:   #FFD819;
--color-blob-lavender: #EFEFFF;
```

### Tipografia
```
Font principal: Geist Mono (monospace) — todos os labels, badges, texto UI
Font secundária: Geist (sans) — botões de acção, texto corrido
Instalar: npm install @fontsource/geist-mono @fontsource/geist
```

| Elemento | Font | Tamanho | Peso |
|---|---|---|---|
| Time badge / destaque | Geist Mono | 16px | 700 |
| Labels (filtros, campos) | Geist Mono | 12px | 600 |
| Nome da ilustração | Geist Mono | 12px | 500 |
| Botão Copy/Download | Geist | 12px | 600 |
| Logo wordmark | SVG (`logo-strokiy.svg`) | — | — |

### Dimensões e Espaçamentos
```
Layout width:      1440px (desktop) / 100% (mobile)
Sidebar width:     320px (fixo)
Navbar height:     72px
Card:              204 × 200px, radius 16px
Card grid gap:     8px
Input height:      40px, radius 12px
Button pill:       radius 100px
Padding sidebar:   16px
```

### Ícones disponíveis em `/public/assets/icons/svg/`
- `logo-strokiy.svg` — wordmark do produto
- `icon-wave.svg` — ícone de áudio/wave (20×20)
- `icon-search.svg` — ícone do painel (20×20)
- `flag-angola.svg` — bandeira Angola (20×20)

---

## Sistema de Som

Sons DESLIGADOS por defeito. Activados pelo botão wave.

Hierarquia (do mais ao menos frequente):
1. **Lofi music** — ambiente, controlado pelo utilizador
2. **Copy SVG** — musical-tap aleatório (tap-1/2/3.wav), confirmação subtil
3. **Download** — musical-tap-1.wav marcante, hero sound
4. **Easter egg** — som do Mario, momento único e especial

Sons removidos intencionalmente:
- **Hover**: demasiado frequente, cria fadiga sonora
- **Select**: o visual (card escuro) já dá feedback suficiente
- **Sidebar open/close**: acção de navegação, não de conclusão
- **Spark pluck**: ruído que interfere com sons principais

Referências de sound design seguidas:
- Apple: um som por momento, nunca sobreposição
- Slack: sons subtis em contexto de trabalho
- Linear: sons só em momentos de conclusão

`SoundKey = 'copy' | 'download'` — os únicos sons do sistema.

---

## Base de Dados — Schema Supabase

### Tabela `illustrations`
```sql
CREATE TABLE illustrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,        -- 'athletics', 'abstract', 'nature', etc.
  style       TEXT NOT NULL,        -- 'bold', 'light', 'outline'
  colors      TEXT[] NOT NULL,      -- array de hex colors usadas
  tags        TEXT[],
  svg_url     TEXT,                 -- URL no Supabase Storage (opcional)
  svg_inline  TEXT,                 -- SVG inline como string (MVP)
  downloads   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para filtros rápidos
CREATE INDEX idx_illustrations_category ON illustrations(category);
CREATE INDEX idx_illustrations_style    ON illustrations(style);
CREATE INDEX idx_illustrations_tags     ON illustrations USING gin(tags);
```

### Tabela `illustration_shapes` (para o editor)
```sql
CREATE TABLE illustration_shapes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illustration_id   UUID REFERENCES illustrations(id) ON DELETE CASCADE,
  shape_type        TEXT NOT NULL,   -- 'ellipse', 'rect', 'circle', 'line', 'path'
  order_index       INTEGER NOT NULL,
  params            JSONB NOT NULL,  -- {cx, cy, rx, ry, fill, stroke, opacity, ...}
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Funcionalidades MVP — Especificação Detalhada

### 1. Galeria Principal (`/`)

**Layout:** Igual ao design Figma — navbar + grid de cards + sidebar de filtros

**Filtros disponíveis:**
- Categoria (dropdown): Athletics, Abstract, Nature, Tech, People
- Estilo (toggle): Bold, Light, Outline
- Cor (swatches): selecção por cor predominante
- Pesquisa (input): por nome ou tag

**Card de ilustração:**
- Fundo branco, radius 16px, sombra subtil
- SVG preview centrado (124×124px)
- Nome da ilustração (Geist Mono 12px 500)
- Estilo/categoria (Geist Mono 12px 500, muted)
- Botão "Copy" — copia o SVG para clipboard
- Hover state: ligeiro scale(1.02) + shadow mais pronunciada

**Comportamento:**
- Carregamento inicial: 20 ilustrações
- Infinite scroll ou paginação simples
- Filtros actualizam a galeria sem reload (client-side filtering no MVP)

### 2. Página de Detalhe (`/illustration/[slug]`)

**Layout:**
- SVG grande centrado (400×400px) com fundo checkered (transparência)
- Nome + descrição + tags
- Botões: "Copy SVG" e "Download SVG"
- Metadados: categoria, estilo, cores usadas (swatches)
- Secção "Ilustrações relacionadas" (mesma categoria)

**Copy SVG:** copia o código SVG limpo para clipboard → toast de confirmação
**Download SVG:** faz download do ficheiro `.svg` com o nome da ilustração

### 3. Editor de Ilustrações (`/editor`)

**Conceito:** canvas SVG à esquerda + painel de controlos à direita

**Controlos disponíveis:**
- Número de formas (slider 2–20)
- Tipo de formas: Ellipse / Circle / Rectangle / Mixed
- Tamanho das formas (slider min/max)
- Paleta de cores (swatches ou color picker)
- Opacidade geral (slider)
- Espaçamento/distribuição (slider)
- Estilo: Bold / Light / Outline
- Botão "Gerar novo" — randomiza mantendo os parâmetros
- Botão "Exportar SVG" — download do resultado

**Motor de geração (`lib/svg-generator.ts`):**
```typescript
// Lógica base do gerador
interface GeneratorParams {
  shapeCount: number;        // 2-20
  shapeTypes: ShapeType[];   // ['ellipse', 'circle', 'rect']
  sizeRange: [number, number]; // [min, max] em px
  colors: string[];           // paleta de cores
  opacity: number;            // 0.1-1.0
  distribution: 'random' | 'grid' | 'radial' | 'clustered';
  style: 'bold' | 'light' | 'outline';
  canvasSize: number;         // 400 (fixo no MVP)
}
```

As formas são geradas com posições semi-aleatórias mas com seed controlável para reprodutibilidade. Cada "Gerar novo" muda o seed mas mantém os parâmetros.

---

## Regras de Desenvolvimento (SEGUIR SEMPRE)

1. **TypeScript strict** — sem `any`, definir sempre os tipos
2. **Server Components por defeito** — só usar `'use client'` quando necessário (interactividade, hooks)
3. **CSS custom properties** para todas as cores — nunca hardcode hex no JSX/TSX
4. **SVGs sempre inline** no MVP — não usar `<img src="...svg">` para as ilustrações (perde a capacidade de copy)
5. **Acessibilidade** — todos os SVGs com `aria-label`, botões com `title`
6. **Mobile-first** — o design Figma é desktop mas o código deve funcionar em mobile (sidebar vira drawer)
7. **Sem dependências desnecessárias** — preferir código próprio a instalar pacotes grandes
8. **Variáveis de ambiente** em `.env.local` — nunca commitar keys

---

## Variáveis de Ambiente Necessárias

```bash
# .env.local — MVP não precisa de variáveis de ambiente
# Adicionar quando migrar para Turso (Fase 2):
# TURSO_DATABASE_URL=libsql://xxxxx.turso.io
# TURSO_AUTH_TOKEN=eyJhbGc...
```

---

## Referência Visual

O design completo está em `public/assets/design-reference.png`.
O design Figma original tem o frame **"Strokiy"** (1440×848px) com:
- Fundo `#F5F5F9`
- Sidebar branca 320px à direita
- Grid de cards brancos com gap 8px
- Navbar 72px no topo da área de conteúdo

---

## Comandos Úteis

```bash
# Instalar e arrancar
npm install
npm run dev          # http://localhost:3000

# Build e verificação
npm run build
npm run lint
npm run type-check   # tsc --noEmit

# Base de dados
# Correr as migrations SQL no Supabase Dashboard → SQL Editor
```

---

## Estado Actual do Projecto (Maio 2026)

### Funcionalidades implementadas e funcionais

**Galeria pública**
- ✅ Grid responsivo de ilustrações SVG (mobile 2 cols, tablet 3 cols, desktop auto-fill)
- ✅ Filtros: categoria, estilo, cor, pesquisa por texto — todos client-side
- ✅ Copy SVG para clipboard com toast de sucesso/erro
- ✅ Selecção múltipla de cards (click no card)
- ✅ Action bar flutuante: "Copy all" / "Download SVG" / "Download ZIP (N)"
- ✅ Download inteligente: 1 ficheiro → `.svg` directo; 2+ → `.zip` via JSZip
- ✅ Toast de feedback em todas as acções (copy, download, erro)

**Dark mode / Som**
- ✅ Dark sidebar com design próprio (gradientes, PP Mondwest)
- ✅ Dark mode em mobile como drawer (DarkSidebar com `isDrawer`)
- ✅ FAB de filtros em mobile dark mode
- ✅ Sistema de som lofi com play/pause, volume slider, faixa seguinte
- ✅ Volume slider acessível (teclado: ArrowLeft/Right/Up/Down/Home/End)
- ✅ Memory leak do lofi corrigido (cleanup do `useEffect` + `removeEventListener`)

**UX / Qualidade**
- ✅ Easter egg (Konami code)
- ✅ Pixel transition na entrada
- ✅ Click spark (partículas no click)
- ✅ Time badge com timezone detection e bandeira do país
- ✅ Hint "double click to explore" com cleanup correcto
- ✅ Botão "Get resources" → mailto com subject

**Código / Infra**
- ✅ `lib/clipboard.ts` — unified clipboard com boolean return
- ✅ `lib/download.ts` — download inteligente SVG/ZIP
- ✅ `lib/timezone.ts` — `TZ_TO_COUNTRY` extraído de `page.tsx`
- ✅ `@keyframes barIn` movido para `globals.css`
- ✅ `useCallback` no `set` do FilterBar

---

### Bugs pendentes (do AUDIT.md)

| # | Bug | Ficheiro | Severidade |
|---|-----|----------|------------|
| 13 | CLS do `useBreakpoint` — estado inicial `'desktop'` causa layout shift em mobile | `hooks/useBreakpoint.ts:18` | 🟠 |
| 14 | `prepareSvg` corrompe SVGs com `width` em atributos de filhos | `components/gallery/IllustrationCard.tsx:14-19` | 🔴 |
| 15 | Filtro de cor usa hex hardcoded que não bate com os SVGs reais | `components/gallery/FilterBar.tsx` | 🟠 |
| 12 | `app/page.tsx` ainda com ~700 linhas — dividir em componentes | `app/page.tsx` | 🟡 |

---

### Ficheiros chave

| Ficheiro | Responsabilidade |
|----------|-----------------|
| `app/page.tsx` | Homepage — layout, dark mode, som, easter egg |
| `components/gallery/IllustrationGrid.tsx` | Grid + selecção múltipla + action bar |
| `components/gallery/IllustrationCard.tsx` | Card individual + copy + select |
| `components/gallery/FilterBar.tsx` | Sidebar de filtros (light mode) |
| `components/gallery/DarkSidebar.tsx` | Sidebar dark mode |
| `hooks/useSoundSystem.ts` | Lofi player com cleanup |
| `hooks/useBreakpoint.ts` | Breakpoint detector (tem CLS pendente) |
| `lib/clipboard.ts` | Copy SVG unificado |
| `lib/download.ts` | Download SVG / ZIP |
| `lib/timezone.ts` | Timezone → país |
| `app/globals.css` | Tokens, keyframes globais |
| `AUDIT.md` | Auditoria completa — estado dos bugs |

---

### Próximas sessões — o que fazer

1. **Resolver CLS do `useBreakpoint`** — mudar estado inicial para `null` e não renderizar o grid até ao breakpoint estar determinado (ou usar CSS media queries)
2. **Substituir `prepareSvg`** por parser SVG robusto — usar `DOMParser` para ler e reescrever apenas os atributos necessários
3. **Corrigir filtro de cor** — mapear as cores reais dos SVGs para os swatches do FilterBar
4. **Dividir `app/page.tsx`** — extrair `TimeBadge`, `DarkTimeBadge`, `DarkSoundButtons`, `WaveButton` para componentes próprios em `components/layout/`

---

*Documento actualizado em Maio 2026. Actualizar este ficheiro quando houver mudanças arquitecturais.*
