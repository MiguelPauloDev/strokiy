# Guia Passo-a-Passo — Como Usar o Claude Code para Construir o Strokiy

> **Para quem:** Utilizadores sem experiência de programação
> **Tempo estimado:** 4-6 sessões de trabalho com o Claude Code

---

## Antes de Começar — O que Precisas Instalar

Instala estas ferramentas no teu computador (uma vez só):

### 1. Node.js
- Vai a https://nodejs.org
- Faz download da versão **LTS** (Long Term Support)
- Instala normalmente (Next, Next, Finish)
- Verifica: abre o Terminal e escreve `node --version` — deve aparecer um número

### 2. Git
- Vai a https://git-scm.com/downloads
- Faz download e instala
- Verifica: `git --version` no Terminal

### 3. VS Code (editor de código)
- Vai a https://code.visualstudio.com
- Faz download e instala

### 4. Claude Code
- Abre o Terminal
- Escreve: `npm install -g @anthropic-ai/claude-code`
- Aguarda a instalação

### 5. Conta Supabase (gratuita)
- Vai a https://supabase.com
- Cria conta com o teu email
- Cria um novo projecto chamado "strokiy"
- Guarda o URL e as chaves (vais precisar mais tarde)

### 6. Conta Vercel (gratuita)
- Vai a https://vercel.com
- Cria conta (podes usar o GitHub para entrar)

### 7. Conta GitHub (gratuita)
- Vai a https://github.com
- Cria conta

---

## Preparação — Copiar os Ficheiros de Documentação

1. Faz download do ficheiro `strokiy-docs.zip` (que tens nesta conversa)
2. Descomprime numa pasta no teu computador (ex: `Desktop/strokiy-docs`)
3. Guarda bem esta pasta — vais usá-la em todas as sessões

---

## SESSÃO 1 — Criar o Projecto Base

### Passo 1: Abre o Terminal na pasta certa
```
macOS: abre o Terminal, escreve: cd Desktop
Windows: abre o PowerShell, escreve: cd Desktop
```

### Passo 2: Inicia o Claude Code
```
claude
```

### Passo 3: Cola este prompt no Claude Code

```
Olá! Vou construir um projecto chamado Strokiy. 

Primeiro, cria o projecto Next.js com este comando exacto:
npx create-next-app@latest strokiy --typescript --tailwind --app --no-src-dir --import-alias "@/*"

Quando perguntar opções, escolhe sempre o default (carrega Enter).

Depois de criar, entra na pasta:
cd strokiy

Em seguida instala estas dependências:
npm install @fontsource/geist-mono @fontsource/geist @supabase/supabase-js

Depois cria o ficheiro .env.example com este conteúdo:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

E cria o ficheiro .env.local com os valores reais (vou dar-te a seguir).

Por fim, copia o ficheiro CLAUDE.md que está em [CAMINHO PARA strokiy-docs/CLAUDE.md] para a raiz do projecto.
```

> **Nota:** substitui `[CAMINHO PARA strokiy-docs/CLAUDE.md]` pelo caminho real no teu computador

### Passo 4: Dá as credenciais do Supabase
Quando o Claude Code pedir, vai ao teu painel Supabase:
- Settings → API → copia o "Project URL" e "anon public key"

---

## SESSÃO 2 — Design System e Componentes Base

Abre o Terminal na pasta `strokiy` e inicia o Claude Code:
```
cd Desktop/strokiy
claude
```

Cola este prompt:
```
Lê o ficheiro CLAUDE.md que está na raiz do projecto. 

Depois implementa o design system completo:

1. Cria styles/tokens.css com todos os CSS custom properties descritos no CLAUDE.md (cores, espaçamentos, tipografia, radius)

2. Actualiza app/globals.css para importar o tokens.css e configurar as fontes Geist Mono e Geist

3. Actualiza app/layout.tsx com:
   - Import das fontes @fontsource/geist-mono e @fontsource/geist
   - Metadata: title "Strokiy — Geometric Illustrations", description adequada
   - Fundo da página com var(--color-bg)

4. Cria os tipos em types/index.ts conforme descrito no ARCHITECTURE.md (ficheiro em [CAMINHO]/ARCHITECTURE.md)

5. Cria os componentes em components/ui/:
   - Button.tsx (primary, secondary, ghost, icon)
   - Badge.tsx
   - Input.tsx com ícone de pesquisa
   - Toast.tsx para notificação "SVG copiado!"
   - Skeleton.tsx para loading dos cards
```

---

## SESSÃO 3 — Galeria com Dados de Exemplo

```
Lê o CLAUDE.md.

Implementa a galeria principal com dados hardcoded (sem Supabase por agora):

1. Cria lib/illustrations.ts com um array de 5 ilustrações de exemplo usando os tipos do types/index.ts. Usa SVGs simples com formas geométricas.

2. Cria components/gallery/IllustrationCard.tsx:
   - Tamanho: 204×200px, border-radius 16px, fundo branco
   - SVG preview centrado (124×124px área)
   - Nome da ilustração (Geist Mono 12px 500)
   - Categoria (Geist Mono 12px 500, cor muted)
   - Botão "Copy" que copia o SVG para clipboard e mostra um toast
   - Hover: scale(1.02) e sombra mais forte

3. Cria components/gallery/IllustrationGrid.tsx:
   - CSS grid com auto-fill, minmax(204px, 1fr), gap 8px

4. Cria components/gallery/FilterBar.tsx:
   - Sidebar 320px
   - Input de pesquisa
   - Dropdown de categoria
   - Toggle de estilo (Bold/Light/Outline)
   - Swatches de cor

5. Actualiza app/page.tsx para mostrar a galeria completa com o layout do Figma:
   - Navbar 72px no topo
   - FilterBar 320px à direita  
   - IllustrationGrid no centro-esquerda
   - Fundo #F5F5F9

Usa o design-reference.png em public/assets/ como referência visual.
```

---

## SESSÃO 4 — Página de Detalhe + Supabase

```
Lê o CLAUDE.md.

1. Cria a página de detalhe em app/illustration/[slug]/page.tsx:
   - SVG grande 400×400px com fundo checkered (transparência)
   - Botão "Copy SVG" com toast de confirmação
   - Botão "Download SVG" que faz download do ficheiro .svg
   - Metadados: categoria, estilo, cores (swatches), tags
   - Secção "Mais ilustrações" (4 cards da mesma categoria)

2. Liga ao Supabase:
   - Cria lib/supabase.ts com createClient para browser e server
   - Actualiza lib/illustrations.ts para buscar do Supabase
   - Implementa as funções: getIllustrations, getIllustrationBySlug, getRelatedIllustrations, incrementDownloads

3. Corre o SQL do ficheiro DATABASE.sql no Supabase Dashboard para criar as tabelas e popular com as ilustrações seed

4. Testa que tudo funciona: npm run dev
```

---

## SESSÃO 5 — Editor Generativo

```
Lê o CLAUDE.md.

Implementa o editor generativo em app/editor/page.tsx:

1. Cria lib/svg-generator.ts com:
   - Função generateSVG(params: GeneratorParams): string
   - Suporte para shapeTypes: ellipse, circle, rect
   - Suporte para distributions: random, grid, radial
   - Seeded random para reprodutibilidade
   - Estilos: bold (fill), light (opacidade reduzida), outline (só stroke)

2. Cria components/editor/EditorCanvas.tsx:
   - Canvas SVG 400×400px
   - Actualiza em tempo real quando os params mudam
   - Fundo checkered para transparência

3. Cria components/editor/ControlPanel.tsx com os controlos:
   - Slider: número de formas (2-20)
   - Toggles: tipos de forma (Ellipse, Circle, Rect, Mixed)
   - Slider duplo: tamanho mín/máx
   - Paleta de cores (6 swatches + color picker)
   - Slider: opacidade
   - Toggle: distribuição (Random, Grid, Radial)
   - Toggle: estilo (Bold, Light, Outline)
   - Botão "Gerar novo" (novo seed, mesmos params)
   - Botão "Exportar SVG"

4. Layout: canvas à esquerda (flex 1), painel de controlos à direita (320px)
   Mesmo visual da sidebar do design Figma.
```

---

## SESSÃO 6 — Deploy na Vercel

```
Prepara o projecto para produção:

1. Verifica que não há erros: npm run build

2. Corrige qualquer erro de TypeScript ou build

3. Cria o ficheiro .gitignore adequado (se não existir)

4. Inicializa o repositório Git e faz o primeiro commit:
   git init
   git add .
   git commit -m "Initial commit — Strokiy MVP"

5. Diz-me quando estiver pronto — o passo seguinte faço eu manualmente no GitHub e Vercel.
```

Depois deste passo, tu (não o Claude Code):
1. Cria um repositório no GitHub.com chamado "strokiy"
2. Faz push do código: `git remote add origin [url-do-repo] && git push -u origin main`
3. Vai a vercel.com → New Project → importa o repositório do GitHub
4. Adiciona as variáveis de ambiente (as mesmas do .env.local)
5. Clica Deploy — em 2 minutos o site está no ar!

---

## Dicas Importantes

### Se algo correr mal
- Diz ao Claude Code: *"Tiveste um erro: [copia o erro aqui]. Por favor corrige."*
- O Claude Code consegue corrigir erros — não precisas de perceber o código

### Para ver o resultado
- Com `npm run dev` o site abre em http://localhost:3000
- Precisas de ter o Terminal aberto enquanto develops

### Para parar o servidor
- Carrega `Ctrl + C` no Terminal

### Guardar o trabalho
- No fim de cada sessão: `git add . && git commit -m "Descrição do que fiz"`

---

## Checklist Final MVP

- [ ] Galeria com grid de cards funcionando
- [ ] Filtros (categoria, estilo) a funcionar
- [ ] Copy SVG para clipboard com toast
- [ ] Página de detalhe de cada ilustração
- [ ] Download SVG funcionando
- [ ] 10+ ilustrações na base de dados
- [ ] Editor com geração em tempo real
- [ ] Export SVG do editor
- [ ] Deploy na Vercel funcionando
- [ ] URL pública partilhável

---

*Guia v1.0 — Strokiy*
