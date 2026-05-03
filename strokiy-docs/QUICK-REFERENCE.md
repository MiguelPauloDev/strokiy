# QUICK REFERENCE — Strokiy para Claude Code

> Cola este ficheiro inteiro no início de cada sessão com o Claude Code.

---

## Projecto
**Strokiy** — Galeria de ilustrações SVG geométricas + Editor generativo

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Storage)
- Deploy: Vercel

## Design
- Fundo página: `#F5F5F9`
- Texto: `#212123`
- Surface/inputs: `#F1F1F1`
- Branco (cards, sidebar): `#FFFFFF`
- Font: Geist Mono (labels) + Geist (botões)
- Card: 204×200px, radius 16px
- Sidebar: 320px, branca
- Navbar: 72px
- Grid gap: 8px

## Pastas chave
```
components/gallery/    ← IllustrationCard, Grid, FilterBar
components/editor/     ← Canvas, ControlPanel
lib/illustrations.ts   ← queries Supabase
lib/svg-generator.ts   ← motor de geração SVG
types/index.ts         ← Illustration, GeneratorParams, etc.
public/assets/icons/   ← SVGs: logo, icon-wave, icon-search, flag-angola
CLAUDE.md              ← instruções completas (LER SEMPRE)
```

## Regras sempre activas
1. TypeScript strict — sem `any`
2. Server Components por defeito — `'use client'` só quando necessário
3. Cores via CSS custom properties — nunca hex hardcoded no JSX
4. SVGs sempre inline (não `<img src=".svg">`)
5. Mobile-first

## Base de dados (Supabase)
```sql
-- Tabelas: illustrations, illustration_shapes
-- Colunas principais: id, slug, name, category, style, colors[], tags[], svg_inline, downloads
-- Ver DATABASE.sql para schema completo
```

## Prompt para iniciar sessão
```
Lê o ficheiro CLAUDE.md na raiz do projecto antes de começar.
O projecto é o Strokiy — [descreve o que queres fazer nesta sessão].
```
