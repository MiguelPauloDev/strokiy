# Auditoria Strokiy — 2026-05-03

---

## 🔴 Crítico (impede uso)

- **[bug] Dark mode + mobile sem filtros** — `app/page.tsx:648` — Em modo dark, o bloco `{!isMobile && (...)}` esconde a DarkSidebar. No light mode existe `<FilterButton onClick={() => router.push('/filters')} />` para mobile, mas em dark mode não há botão de filtros acessível ao utilizador.

- **[bug] `document.execCommand('copy')` deprecated** — `components/gallery/IllustrationCard.tsx:26`, `components/gallery/IllustrationGrid.tsx:43` — O fallback usa `execCommand('copy')`, removido de alguns browsers (Firefox 63+, Chrome progressivo). Falha silenciosamente sem nenhum feedback de erro ao utilizador.

- **[bug] `prepareSvg` corrompe SVGs com `width` em atributos de filhos** — `components/gallery/IllustrationCard.tsx:14-19` — A regex `/<svg[^>]*?>\s+width="[^"]*"/g` é greedy e pode não capturar o width correcto se o SVG tiver namespaces ou atributos fora de ordem. Pior: a linha 18 faz `replace('<svg ', '<svg width="124" height="124" ')` sem regex — se o SVG tiver dois elementos com `<svg ` (SVGs aninhados), corrompe o segundo.

- **[bug] Memory leak potencial em `useSoundSystem`** — `hooks/useSoundSystem.ts:87-95` — `playNext` usa `useCallback` com deps `[]`, mas cria `new Audio()` e adiciona `addEventListener('ended', playNext)` sem nunca remover o listener da faixa anterior. Quando a faixa muda, o elemento anterior tem o listener pendente até ser GC.

---

## 🟠 Importante (degrada experiência)

- **[ux] Botão "Get resources" sem funcionalidade** — `components/gallery/DarkSidebar.tsx:697`, `components/gallery/FilterBar.tsx:775` — O botão existe em ambas as sidebars mas não tem `onClick` nem `href`. Clique não faz nada.

- **[ux] Sem estado de erro no clipboard** — `components/gallery/IllustrationCard.tsx:46-51` — Se `copyToClipboard` lançar excepção (contexto inseguro, permissão negada), o `play('copy')` e `onCopy()` são chamados na mesma, dando feedback de sucesso quando a cópia falhou.

- **[ux] Action bar e Toast colidem visualmente** — `components/gallery/IllustrationGrid.tsx:147` (z-index 200) vs `components/ui/Toast.tsx:38` (z-index 300). O Toast aparece sobre a action bar. Quando o utilizador copia e depois a action bar está visível, o Toast sobrepõe os botões de acção. O Toast devia ficar acima da action bar mas o bottom: 24 de ambos faz com que se sobreponham no mesmo sítio vertical.

- **[ux] Volume slider sem suporte a teclado** — `app/page.tsx:429-570` — O slider custom de volume do lofi não tem `role="slider"`, `aria-valuenow`, nem responde a arrow keys. Utilizadores de teclado ou screen readers não conseguem usar o controlo.

- **[ux] Seleccionar card exige hover — sem alternativa touch/keyboard** — `components/gallery/IllustrationCard.tsx:114-133` — O círculo de selecção só aparece em hover (`opacity: showHover ? 0.05 : 0`, `pointerEvents: showHover ? 'auto' : 'none'`). Em touch/mobile e navegação por teclado é impossível seleccionar cards.

- **[ux] Clicar no card deseleccionado não o selecciona** — `components/gallery/IllustrationCard.tsx:67-83` — O `<article>` não tem `onClick`. Só o botão círculo (invisível fora do hover) selecciona. Em desktop com hover rápido é frustrante; em touch é impossível.

- **[ux] Sem toast/feedback no download** — `components/gallery/IllustrationGrid.tsx:107-110` — O copy mostra um Toast, mas o download não dá nenhum feedback visual. O utilizador não sabe se o download começou.

- **[ux] `useBreakpoint` causa layout shift em mobile** — `hooks/useBreakpoint.ts:18` — O estado inicial é `'desktop'` (SSR-safe), mas em mobile o layout renderiza primeiro como desktop e depois salta para mobile após hidratação. Causa CLS (Cumulative Layout Shift).

- **[ux] Hint "double click to explore" sem cleanup correcto** — `components/gallery/FilterBar.tsx:259-276` — O cleanup interno (`return () => { clearTimeout(t2); clearTimeout(t3); }`) está dentro do callback do `setTimeout` externo, não como return do `useEffect`. O React nunca o chama — se o componente desmonta durante os 2 segundos de espera, `t2` e `t3` ficam activos e tentam fazer setState em componente desmontado.

- **[ux] Filtro de cor usa hex hardcoded que não bate com os SVGs** — `components/gallery/FilterBar.tsx:54-62` — Os swatches de cor da light sidebar (`#212123`, `#EFEFFF`, etc.) e da dark sidebar (`#FF3155`, `#00E499`, etc.) são conjuntos diferentes. O filtro de cor faz `ill.colors.includes(filters.color)` mas os SVGs do JSON podem não ter essas cores exactas — qualquer diferença de 1 caracter no hex retorna 0 resultados sem aviso.

---

## 🟡 Melhoria (nice to have)

- **[code] `app/page.tsx` com 767 linhas** — Contém `TimeBadge`, `DarkTimeBadge`, `DarkSoundButtons`, `WaveButton`, `IconDarkWave`, `IconSpeakerHigh`, `IconSpeakerSlash`, `SpeakerPaths`, constante `TZ_TO_COUNTRY` (55+ entradas), e a página. Devia ser dividido em `components/layout/DarkHeader.tsx`, `lib/timezone.ts`, e a página.

- **[code] `components/gallery/FilterBar.tsx` com 808 linhas** — Contém `ToggleBar`, `LogoStrokiy`, todos os ícones, blobs e o componente principal. Difícil de navegar e manter.

- **[code] `components/gallery/DarkSidebar.tsx` com 751 linhas** — Mesmo problema. `DarkToggleBar`, ícones e lógica de filtros todos no mesmo ficheiro.

- **[code] `copyToClipboard` duplicado** — `components/gallery/IllustrationCard.tsx:21-30` e `components/gallery/IllustrationGrid.tsx:36-46` — Código idêntico em dois ficheiros. Devia estar em `lib/clipboard.ts`.

- **[code] Hardcoded hex em vez de CSS vars** — `app/page.tsx:447-456` (`#1C1C1C`, `#EFEFFF`, `#111111`), `components/gallery/DarkSidebar.tsx` (múltiplos) — Viola a regra do CLAUDE.md "CSS custom properties para todas as cores — nunca hardcode hex no JSX/TSX".

- **[code] `FilterBar.tsx:282` — `set` sem `useCallback`** — `const set = (patch) => onChange(...)` é recriado em cada render. Devia ser `useCallback` com `[filters, onChange]` nas deps, tal como no `DarkSidebar.tsx:219`.

- **[code] `TZ_TO_COUNTRY` inline em `page.tsx:17-54`** — Mapa com 55+ entradas ocupa 38 linhas no ficheiro principal. Devia estar em `lib/timezone.ts`.

- **[code] Controles de Animation na sidebar sem ligação a filtros** — `DarkSidebar.tsx:59-61` e `FilterBar.tsx:51-52` — `ANIM_DIRECTION` e `ANIM_MOTION` têm estado local (`animDirection`, `animMotion`) mas não estão no `FilterState` nem afectam a galeria. São UI decorativa sem funcionalidade.

- **[code] `PixelTransition` não responde a resize** — `components/ui/PixelTransition.tsx:53-55` — O grid de pixels é calculado com `window.innerWidth/Height` no mount. Se o utilizador fizer resize durante a transição, os pixels não cobrem o ecrã.

- **[code] `fadeIn`/`fadeOut` recriados em cada render** — `hooks/useSoundSystem.ts:63-84` — As funções helper não estão em `useCallback` nem fora do hook. Recriam em cada render, mas como só são chamadas dentro de `useEffect`, o impacto é mínimo (não é crítico).

- **[code] `useSoundSystem` lê localStorage 3x no mesmo `useEffect`** — `hooks/useSoundSystem.ts:48-60` — Três `localStorage.getItem` em sequência. Podia ser condensado mas não é problema de performance real.

- **[code] `BackgroundGradient` com `filter: blur(114.2px)` em múltiplos elementos** — `components/gallery/FilterBar.tsx:700` — 5 elementos com blur pesado em simultâneo. Em dispositivos mobile de baixa gama pode causar jank. Considerar `will-change: filter` ou substituir por gradiente simples em mobile.

- **[code] `@keyframes barIn` inline** — `components/gallery/IllustrationGrid.tsx:255-260` — `<style>` com keyframe injetado no DOM em cada render do componente. Devia estar no CSS global.

- **[code] Sem `@types/jszip`** — Após instalação do `jszip`, o TypeScript usa os tipos do próprio pacote (tem `index.d.ts`). OK por agora, mas verificar compatibilidade com `moduleResolution`.

---

## 📋 Plano de acção recomendado

Ordenado por impacto/esforço (alto impacto primeiro, menor esforço de implementação):

1. **[crítico / fácil]** Corrigir `copyToClipboard` — extrair para `lib/clipboard.ts` e tratar o erro com feedback visual (Toast de erro).

2. **[crítico / médio]** Adicionar botão de filtros em dark mode + mobile (`app/page.tsx`).

3. **[crítico / médio]** Corrigir memory leak do lofi — guardar ref do listener e removê-lo em cleanup.

4. **[importante / fácil]** Adicionar `onClick` ao botão "Get resources" (ambas as sidebars).

5. **[importante / fácil]** Toast de feedback no download ("Downloading..." ou "ZIP ready").

6. **[importante / fácil]** Corrigir cleanup do hint "double click" — mover `clearTimeout(t2/t3)` para o return do `useEffect`.

7. **[importante / médio]** Tornar cards clicáveis para selecção (adicionar `onClick` ao `<article>`).

8. **[importante / médio]** Adicionar `role="slider"` + arrow keys ao volume slider.

9. **[melhoria / fácil]** Mover `copyToClipboard` para `lib/clipboard.ts` (eliminar duplicação).

10. **[melhoria / fácil]** Mover `TZ_TO_COUNTRY` para `lib/timezone.ts`.

11. **[melhoria / fácil]** Adicionar `useCallback` ao `set` em `FilterBar.tsx`.

12. **[melhoria / médio]** Dividir `app/page.tsx` em `components/layout/DarkHeader.tsx` + `components/layout/LightHeader.tsx`.

13. **[melhoria / médio]** Mover `@keyframes barIn` de inline para `globals.css`.

14. **[melhoria / difícil]** Resolver CLS do `useBreakpoint` — usar CSS media queries ou `__NEXT_DATA__` para SSR correcto.

15. **[melhoria / difícil]** Substituir `prepareSvg` por um parser SVG robusto (ou pelo menos DOMParser em client-side).
