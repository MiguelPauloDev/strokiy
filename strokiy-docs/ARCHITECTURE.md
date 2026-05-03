# Strokiy — Arquitectura Técnica

---

## Stack Completo

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14 (App Router) + TypeScript + Tailwind    │
│  Deploy: Vercel (CDN global, CI/CD automático)      │
└──────────────────────┬──────────────────────────────┘
                       │ fetch / supabase-js
┌──────────────────────▼──────────────────────────────┐
│                   BACKEND / BaaS                     │
│  Supabase                                            │
│  ├── PostgreSQL (metadados das ilustrações)          │
│  ├── Storage (SVG files, futuramente)                │
│  └── Auth (Fase 3)                                   │
└─────────────────────────────────────────────────────┘
```

---

## Decisões Arquitecturais

### Next.js App Router (não Pages Router)
- Server Components: a galeria é renderizada no servidor → SEO perfeito
- Route Handlers: API interna em `/app/api/`
- Streaming: carregamento progressivo dos cards
- Image Optimization: automático para thumbnails

### Supabase em vez de Firebase/PlanetScale
- PostgreSQL: queries complexas para filtros (category, style, tags, colors)
- Row Level Security: preparado para auth na Fase 3
- Storage: para quando os SVGs ficarem grandes demais para a DB
- SDK cliente directo: sem backend extra necessário no MVP

### SVG Inline em vez de ficheiros externos
No MVP, os SVGs são guardados como texto na coluna `svg_inline` da DB. Vantagens:
- Copy para clipboard trivial (`navigator.clipboard.writeText(svg_inline)`)
- Download trivial (`Blob` + `URL.createObjectURL`)
- Sem requests extra para carregar a preview
- Sem problemas de CORS

Desvantagem: a DB fica maior. Quando o catálogo crescer, migrar para Supabase Storage.

---

## Estrutura de Ficheiros Detalhada

```
strokiy/
│
├── app/                          ← Next.js App Router
│   ├── layout.tsx                ← Root layout: fontes, metadata, providers
│   ├── page.tsx                  ← / (galeria principal)
│   ├── globals.css               ← Import do Tailwind + CSS tokens
│   │
│   ├── illustration/
│   │   └── [slug]/
│   │       ├── page.tsx          ← /illustration/sprinter
│   │       └── loading.tsx       ← Skeleton enquanto carrega
│   │
│   ├── editor/
│   │   └── page.tsx              ← /editor (Fase 2)
│   │
│   └── api/
│       └── illustrations/
│           ├── route.ts          ← GET /api/illustrations?category=&style=
│           └── [slug]/
│               └── route.ts      ← GET /api/illustrations/sprinter
│
├── components/
│   │
│   ├── ui/                       ← Componentes base reutilizáveis
│   │   ├── Button.tsx            ← Variantes: primary, secondary, ghost
│   │   ├── Badge.tsx             ← Para tags e categorias
│   │   ├── Input.tsx             ← Input de pesquisa
│   │   ├── Toast.tsx             ← Notificação de "SVG copiado!"
│   │   └── Skeleton.tsx          ← Loading placeholder
│   │
│   ├── gallery/
│   │   ├── IllustrationCard.tsx  ← Card individual da galeria
│   │   ├── IllustrationGrid.tsx  ← Grid de cards com layout
│   │   └── FilterBar.tsx         ← Sidebar de filtros
│   │
│   ├── illustration/
│   │   ├── SVGViewer.tsx         ← Preview grande com checkered bg
│   │   ├── CopyButton.tsx        ← Botão copy com feedback
│   │   └── DownloadButton.tsx    ← Botão download
│   │
│   ├── editor/                   ← Fase 2
│   │   ├── EditorCanvas.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── ShapeControls.tsx
│   │   └── ColorPicker.tsx
│   │
│   └── layout/
│       ├── Navbar.tsx            ← Barra de navegação topo
│       └── Sidebar.tsx           ← Sidebar direita (filtros + logo)
│
├── lib/
│   ├── supabase.ts               ← createClient (browser + server)
│   ├── illustrations.ts          ← getIllustrations(), getBySlug(), etc.
│   ├── svg-generator.ts          ← Motor de geração (Fase 2)
│   └── utils.ts                  ← cn(), formatSlug(), etc.
│
├── types/
│   └── index.ts                  ← Illustration, Shape, GeneratorParams, etc.
│
├── hooks/
│   ├── useIllustrations.ts       ← Filtros client-side
│   └── useCopyToClipboard.ts     ← Hook para copy SVG
│
├── public/
│   └── assets/
│       ├── icons/svg/
│       │   ├── logo-strokiy.svg
│       │   ├── icon-wave.svg
│       │   ├── icon-search.svg
│       │   └── flag-angola.svg
│       └── design-reference.png  ← Referência visual Figma
│
├── styles/
│   └── tokens.css                ← CSS custom properties do design system
│
├── .env.local                    ← Variáveis de ambiente (não commitar)
├── .env.example                  ← Template das variáveis (commitar)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                     ← Instruções para Claude Code
```

---

## Tipos TypeScript

```typescript
// types/index.ts

export type IllustrationStyle = 'bold' | 'light' | 'outline';
export type IllustrationCategory = 'athletics' | 'abstract' | 'nature' | 'tech' | 'people';
export type ShapeType = 'ellipse' | 'circle' | 'rect' | 'line' | 'path';

export interface Illustration {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: IllustrationCategory;
  style: IllustrationStyle;
  colors: string[];        // hex colors: ['#FF3155', '#212123']
  tags: string[];
  svg_url: string | null;
  svg_inline: string;      // código SVG completo
  downloads: number;
  created_at: string;
}

export interface IllustrationShape {
  id: string;
  illustration_id: string;
  shape_type: ShapeType;
  order_index: number;
  params: ShapeParams;
}

export interface ShapeParams {
  // Ellipse / Circle
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  r?: number;
  // Rect
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Estilos
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  transform?: string;
}

// Para o Editor (Fase 2)
export interface GeneratorParams {
  shapeCount: number;
  shapeTypes: ShapeType[];
  sizeRange: [number, number];
  colors: string[];
  opacity: number;
  distribution: 'random' | 'grid' | 'radial' | 'clustered';
  style: IllustrationStyle;
  canvasSize: number;
  seed?: number;
}

export interface FilterState {
  category: IllustrationCategory | 'all';
  style: IllustrationStyle | 'all';
  color: string | null;
  search: string;
}
```

---

## API Routes

### `GET /api/illustrations`
```
Query params:
  category  → 'athletics' | 'abstract' | 'nature' | 'tech' | 'all'
  style     → 'bold' | 'light' | 'outline' | 'all'
  search    → string (nome ou tag)
  limit     → number (default: 20)
  offset    → number (default: 0)

Response: { illustrations: Illustration[], total: number }
```

### `GET /api/illustrations/[slug]`
```
Response: { illustration: Illustration } | { error: 'Not found' }
```

---

## Funções Principais (`lib/illustrations.ts`)

```typescript
// Todas as funções que o Claude Code deve implementar

// Buscar lista com filtros
getIllustrations(filters: Partial<FilterState>): Promise<Illustration[]>

// Buscar uma por slug
getIllustrationBySlug(slug: string): Promise<Illustration | null>

// Buscar relacionadas (mesma categoria, excluindo a actual)
getRelatedIllustrations(category: string, excludeSlug: string, limit?: number): Promise<Illustration[]>

// Incrementar contador de downloads
incrementDownloads(id: string): Promise<void>
```

---

## Motor de Geração SVG (`lib/svg-generator.ts`)

### Conceito
O gerador recebe `GeneratorParams` e devolve um SVG como string. Usa um seed para reprodutibilidade — o mesmo seed + mesmos params = mesmo SVG sempre.

```typescript
// Função principal
generateSVG(params: GeneratorParams): string

// Gerar posições das formas
generateShapePositions(params: GeneratorParams, seed: number): ShapeParams[]

// Serializar formas para SVG string
shapesToSVG(shapes: ShapeParams[], canvasSize: number): string

// Utilitário: seeded random (para reprodutibilidade)
seededRandom(seed: number): () => number
```

### Algoritmo Base
```
1. Criar gerador aleatório com o seed
2. Para cada forma (0 até shapeCount):
   a. Escolher tipo de forma da lista shapeTypes (aleatório)
   b. Gerar posição baseada em distribution:
      - 'random': posição completamente aleatória dentro do canvas
      - 'grid': distribuição em grelha com variação ±20%
      - 'radial': distribuição em círculo à volta do centro
      - 'clustered': grupos de 3-5 formas próximas
   c. Gerar tamanho dentro de sizeRange
   d. Escolher cor da paleta colors
   e. Aplicar opacity
   f. Se style === 'outline': fill='none', stroke=cor, strokeWidth=2
   g. Se style === 'light': opacity reduzida para 0.3-0.6
3. Ordenar formas por tamanho (maiores atrás)
4. Serializar para SVG
```

---

## Setup Inicial — Passos para o Claude Code

Quando iniciares o projecto com o Claude Code, dar estas instruções por ordem:

### Sessão 1 — Setup Base
```
"Cria o projecto Next.js com o seguinte comando e configura tudo:
npx create-next-app@latest strokiy --typescript --tailwind --app --no-src-dir --import-alias '@/*'

Depois:
1. Instala @fontsource/geist-mono @fontsource/geist @supabase/supabase-js
2. Cria o ficheiro styles/tokens.css com os CSS custom properties do CLAUDE.md
3. Configura o layout.tsx com as fontes e metadata
4. Copia os ficheiros da pasta strokiy-assets/icons/svg/ para public/assets/icons/svg/
5. Cria os tipos em types/index.ts conforme a arquitectura técnica"
```

### Sessão 2 — Design System
```
"Implementa os componentes base em components/ui/:
- Button.tsx (variantes: primary, secondary, ghost, icon)
- Badge.tsx (para tags e categorias)
- Input.tsx (com ícone de search)
- Toast.tsx (notificação de copy)
- Skeleton.tsx (loading state do card)"
```

### Sessão 3 — Galeria
```
"Implementa a galeria principal:
1. IllustrationCard.tsx — usa o design do Figma (204×200px, radius 16px)
2. IllustrationGrid.tsx — CSS grid com gap 8px
3. FilterBar.tsx — sidebar com filtros (categoria, estilo, cor, search)
4. page.tsx (/) — junta tudo

Usa os dados de seed em lib/illustrations.ts com 5 ilustrações hardcoded para 
visualizar antes de ligar ao Supabase."
```

### Sessão 4 — Supabase
```
"Liga o projecto ao Supabase:
1. Cria lib/supabase.ts com o cliente
2. Corre o SQL de criação de tabelas (está no ficheiro DATABASE.sql)
3. Popula com as ilustrações seed
4. Actualiza lib/illustrations.ts para usar Supabase em vez de dados hardcoded"
```

---

*Arquitectura Técnica v1.0 — Strokiy*
