# Auditoria Strokiy — 2026-05-03
> Actualizado em 2026-05-03 — itens 1–11 do plano de acção resolvidos.

---

## 🔴 Crítico (impede uso)

- ✅ **[RESOLVIDO] Dark mode + mobile sem filtros** — `app/page.tsx` — DarkSidebar agora renderiza como drawer em mobile; FAB de filtros adicionado (`position:fixed, bottom:24, right:24`).

- ✅ **[RESOLVIDO] `document.execCommand('copy')` deprecated + sem feedback de erro** — `lib/clipboard.ts` criado; `IllustrationCard` e `IllustrationGrid` importam da lib; Toast de erro (`variant='error'`, fundo `#FF3155`) mostrado quando a cópia falha.

- ✅ **[RESOLVIDO] `prepareSvg` corrompe SVGs com `width` em atributos de filhos** — Substituído por `DOMParser` + `XMLSerializer`; modifica apenas o elemento raiz `<svg>`, sem afectar elementos filho.

- ✅ **[RESOLVIDO] Memory leak potencial em `useSoundSystem`** — `hooks/useSoundSystem.ts` — `playNext` agora remove o listener da faixa anterior antes de criar a nova; cleanup do `useEffect` faz `removeEventListener`, `pause()` e `lofiRef.current = null`.

---

## 🟠 Importante (degrada experiência)

- ✅ **[RESOLVIDO] Botão "Get resources" sem funcionalidade** — Ambas as sidebars têm `onClick={() => window.open('mailto:hello@strokiy.com?subject=Strokiy Production Core', '_blank')}`.

- ✅ **[RESOLVIDO] Sem estado de erro no clipboard** — `IllustrationCard` verifica o `boolean` retornado por `copyToClipboard` e chama `onCopyError?.()` em caso de falha; `IllustrationGrid` mostra Toast de erro.

- **[ux] Action bar e Toast colidem visualmente** — `components/gallery/IllustrationGrid.tsx` (z-index 200) vs `components/ui/Toast.tsx` (z-index 300). Ambos em `bottom: 24` sobrepõem-se. *Pendente.*

- ✅ **[RESOLVIDO] Volume slider sem suporte a teclado** — `app/page.tsx` — Track container tem `role="slider"`, `aria-label`, `aria-valuenow/min/max`, `tabIndex={0}` e `onKeyDown` (ArrowLeft/Right/Up/Down/Home/End).

- ✅ **[RESOLVIDO] Seleccionar card exige hover / Cards não clicáveis** — `components/gallery/IllustrationCard.tsx` — `<article>` tem `onClick={isSelected ? handleDeselect : handleSelect}` e `cursor: 'pointer'` sempre.

- ✅ **[RESOLVIDO] Sem toast/feedback no download** — `IllustrationGrid` mostra "SVG descarregado!" (1 ficheiro) ou "ZIP com N ilustrações descarregado!" (múltiplos), e Toast de erro em caso de falha.

- ✅ **[RESOLVIDO] `useBreakpoint` causa layout shift em mobile** — Estado inicial mudado para `null`; `HomePage` retorna um `<div>` vazio até o breakpoint estar resolvido, eliminando o CLS em mobile.

- ✅ **[RESOLVIDO] Hint "double click to explore" sem cleanup correcto** — `components/gallery/FilterBar.tsx` — Todos os timeouts (`t1`, `t2`, `t3`, `t4`) agora declarados no scope do `useEffect` e cancelados no return do cleanup.

- ✅ **[RESOLVIDO] Filtro de cor usa hex hardcoded que não bate com os SVGs** — `#888888` adicionado aos swatches; lista agora cobre todas as 8 cores únicas presentes nas ilustrações.

---

## 🟡 Melhoria (nice to have)

- ✅ **[RESOLVIDO] `app/page.tsx` com ~730 linhas** — `TimeBadge`, `DarkTimeBadge`, `WaveButton`, `DarkSoundButtons` (com todos os ícones) extraídos para `components/layout/`. Ficheiro reduzido para ~238 linhas.

- **[code] `components/gallery/FilterBar.tsx` com 810+ linhas** — *Pendente.*

- **[code] `components/gallery/DarkSidebar.tsx` com 750+ linhas** — *Pendente.*

- ✅ **[RESOLVIDO] `copyToClipboard` duplicado** — Extraído para `lib/clipboard.ts`; removido de `IllustrationCard` e `IllustrationGrid`.

- **[code] Hardcoded hex em vez de CSS vars** — `app/page.tsx`, `DarkSidebar.tsx`. *Pendente.*

- ✅ **[RESOLVIDO] `FilterBar.tsx` — `set` sem `useCallback`** — `const set = useCallback((patch) => onChange(...), [filters, onChange])`.

- ✅ **[RESOLVIDO] `TZ_TO_COUNTRY` inline em `page.tsx`** — Movido para `lib/timezone.ts` com `getCountryFromTimezone()`.

- **[code] Controles de Animation na sidebar sem ligação a filtros** — *Pendente (UI decorativa).*

- **[code] `PixelTransition` não responde a resize** — *Pendente.*

- **[code] `fadeIn`/`fadeOut` recriados em cada render** — *Pendente (impacto mínimo).*

- **[code] `BackgroundGradient` com `filter: blur(114.2px)` em múltiplos elementos** — *Pendente.*

- ✅ **[RESOLVIDO] `@keyframes barIn` inline** — Movido para `app/globals.css`; `<style>` removido de `IllustrationGrid.tsx`.

- **[code] Substituir `prepareSvg` por parser SVG robusto** — *Pendente.*

---

## 📋 Plano de acção — estado actual

| # | Item | Estado |
|---|------|--------|
| 1 | `lib/clipboard.ts` + Toast erro + IllustrationCard/Grid | ✅ Resolvido |
| 2 | Dark mode + mobile: FAB de filtros + DarkSidebar como drawer | ✅ Resolvido |
| 3 | Memory leak lofi: corrigir listener `ended` | ✅ Resolvido |
| 4 | Botão "Get resources" com `onClick` | ✅ Resolvido |
| 5 | Toast feedback no download | ✅ Resolvido |
| 6 | Hint "double click" cleanup do `useEffect` | ✅ Resolvido |
| 7 | Cards clicáveis para selecção (`onClick` no `<article>`) | ✅ Resolvido |
| 8 | Volume slider `role="slider"` + arrow keys | ✅ Resolvido |
| 9 | `TZ_TO_COUNTRY` → `lib/timezone.ts` | ✅ Resolvido |
| 10 | `@keyframes barIn` → `globals.css` | ✅ Resolvido |
| 11 | `useCallback` no `set` do `FilterBar.tsx` | ✅ Resolvido |
| 12 | Dividir `page.tsx` em componentes `components/layout/` | ✅ Resolvido |
| 13 | Resolver CLS do `useBreakpoint` | ✅ Resolvido |
| 14 | Substituir `prepareSvg` por parser robusto (DOMParser) | ✅ Resolvido |
| 15 | Corrigir filtro de cor (hex mismatch) | ✅ Resolvido |
