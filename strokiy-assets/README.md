# Strokiy — Assets Folder

Pasta de assets gerada automaticamente a partir do Figma via Claude + Desktop Bridge.
**Figma File:** `s2H6SoZwtpTC0zkEatgn0b` | **Frame:** `Strokiy` (ID: `22:3638`)

---

## 📁 Estrutura

```
strokiy-assets/
├── icons/
│   └── svg/
│       ├── logo-strokiy.svg     ← Wordmark "STROKiy" (158×30px, fill #212123)
│       ├── icon-wave.svg        ← Ícone de áudio/wave (20×20px)
│       ├── icon-search.svg      ← Ícone de sidebar/painel (20×20px)
│       └── flag-angola.svg      ← Bandeira Angola (20×20px)
├── tokens/
│   ├── colors.css               ← CSS custom properties (cores, espaçamentos, tipografia)
│   └── tokens.json              ← Design tokens em JSON (para Style Dictionary, etc.)
├── images/
│   └── (vazio — adicionar exports de imagens aqui)
├── fonts/
│   └── (ver instruções abaixo)
└── public/
    └── design-reference.png     ← Screenshot do design completo @2x (adicionar manualmente)
```

---

## 🎨 Tokens

### Como usar o `colors.css`

```html
<!-- No index.html -->
<link rel="stylesheet" href="./tokens/colors.css">
```

```css
/* No teu CSS */
.navbar { background: var(--color-white); height: var(--navbar-height); }
.card   { border-radius: var(--radius-lg); background: var(--color-white); }
.badge  { border-radius: var(--radius-full); font-family: var(--font-mono); }
```

### Como usar o `tokens.json`

```js
// Com Style Dictionary ou qualquer build tool
import tokens from './tokens/tokens.json';

const cardBg    = tokens.color.white.value;         // "#FFFFFF"
const cardRadius = tokens.borderRadius.lg.value;    // "16px"
const badgeFont  = tokens.components.timeBadge.fontFamily.value; // "Geist Mono"
```

---

## 🔤 Fontes

O design usa **duas fontes**. Instalar via npm:

```bash
npm install @fontsource/geist-mono @fontsource/geist
```

Ou importar via CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500;600;700&display=swap');
/* Geist sans não está no Google Fonts — usar @fontsource ou CDN oficial */
```

Uso no CSS:

```css
.time-badge  { font-family: 'Geist Mono', monospace; font-weight: 700; }
.card-label  { font-family: 'Geist Mono', monospace; font-weight: 500; }
.copy-button { font-family: 'Geist', sans-serif;    font-weight: 600; }
```

---

## 🖼️ Ícones SVG

Todos os ícones estão em `icons/svg/` e podem ser usados inline ou como `<img>`:

```jsx
// React — inline SVG (recomendado para poder mudar cor via CSS)
import { ReactComponent as LogoIcon } from './assets/icons/svg/logo-strokiy.svg';
import { ReactComponent as WaveIcon  } from './assets/icons/svg/icon-wave.svg';

// HTML
<img src="./assets/icons/svg/icon-wave.svg" width="20" height="20" />
```

### Detalhes de cada ícone

| Ficheiro | Dimensões | Descrição | Cor actual |
|---|---|---|---|
| `logo-strokiy.svg` | 158 × 30 px | Wordmark do produto | `#212123` |
| `icon-wave.svg` | 20 × 20 px | Botão de áudio (navbar) | `#212123` stroke |
| `icon-search.svg` | 20 × 20 px | Ícone de painel lateral | `#212123` stroke |
| `flag-angola.svg` | 20 × 20 px | Bandeira Angola (badge) | SVG nativo |

> **Dica:** Para mudar a cor do `icon-wave.svg` e `icon-search.svg` via CSS, usa `currentColor` em vez de `#212123` no stroke, ou usa `filter: invert(1)` para inverter.

---

## 🧩 Como o Claude Code deve usar esta pasta

Ao chamar o Claude Code, menciona o caminho:

```
"A pasta de assets está em ./strokiy-assets — usa os tokens de ./tokens/colors.css,
os SVGs de ./icons/svg/ e a referência visual em ./public/design-reference.png"
```

O Claude Code deve:
1. Importar `colors.css` no CSS global (ou converter para Tailwind config)
2. Usar os SVGs directamente como componentes
3. Seguir os valores de `tokens.json` para todos os tamanhos, cores e radius
4. Usar `design-reference.png` como referência visual pixel-perfect

---

## 📌 Assets em falta (exportar manualmente do Figma)

Os seguintes assets precisam de ser exportados manualmente do Figma e colocados nas pastas indicadas:

| Asset | Node ID Figma | Destino | Notas |
|---|---|---|---|
| Screenshot completo @2x | `22:3638` | `public/design-reference.png` | Export → PNG @2x |
| Cards illustration set | vários | `images/illustrations/` | Exportar cada card SVG individualmente |
| Gradient blobs | sidebar | `images/blobs/` | Export → PNG com transparência |

---

*Gerado em Abril 2026 via Claude + Figma Desktop Bridge Plugin*
