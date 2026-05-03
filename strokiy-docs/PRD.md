# Strokiy — Product Requirements Document (PRD)

**Versão:** 1.0  
**Data:** Abril 2026  
**Status:** MVP em desenvolvimento

---

## 1. Visão do Produto

### O Problema
Designers e developers precisam de ilustrações vectoriais únicas para os seus projectos mas as opções existentes são caras, genéricas (stock), ou requerem conhecimentos avançados de design para criar do zero.

### A Solução
O Strokiy é uma plataforma web que oferece:
- **Galeria gratuita** de ilustrações SVG originais, formadas por formas geométricas
- **Editor generativo** onde qualquer pessoa pode criar e personalizar ilustrações sem saber design
- **Copy/Download imediato** sem fricção — sem login, sem paywall no MVP

### Proposta de Valor Única
As ilustrações do Strokiy são construídas por formas geométricas simples (círculos, elipses, rectângulos, linhas) que em conjunto criam figuras expressivas e minimalistas. O estilo é reconhecível, moderno e versátil.

---

## 2. Utilizadores Alvo

### Persona Principal — "O Developer Criativo"
- Developer ou designer júnior
- Precisa de ilustrações para landing pages, apps, apresentações
- Não quer pagar por stock, não quer perder tempo a criar do zero
- Quer algo único mas consistente em estilo

### Persona Secundária — "O Designer Explorador"
- Designer que quer inspiração ou ponto de partida
- Usa o editor para gerar variações e exportar para continuar no Figma
- Aprecia o controlo sobre as formas e cores

---

## 3. Funcionalidades MVP (Fase 1)

### 3.1 Galeria Principal

| Funcionalidade | Prioridade | Notas |
|---|---|---|
| Grid de cards com SVG preview | P0 | Igual ao design Figma |
| Filtro por categoria | P0 | Dropdown |
| Filtro por estilo | P0 | Toggle: Bold / Light / Outline |
| Filtro por cor | P1 | Swatches de cores |
| Pesquisa por nome/tag | P1 | Input com debounce |
| Copy SVG para clipboard | P0 | Botão no card |
| Hover state nos cards | P1 | scale + shadow |
| Loading skeleton | P1 | Enquanto carrega |

### 3.2 Página de Detalhe

| Funcionalidade | Prioridade | Notas |
|---|---|---|
| SVG grande (400×400px) | P0 | Com fundo checkered |
| Botão Copy SVG | P0 | Com toast de confirmação |
| Botão Download SVG | P0 | Download .svg file |
| Metadados (categoria, tags, cores) | P1 | |
| Ilustrações relacionadas | P2 | Mesma categoria, 4 cards |

### 3.3 Editor Generativo (Fase 2)

| Funcionalidade | Prioridade | Notas |
|---|---|---|
| Canvas SVG ao vivo | P0 | Actualiza em tempo real |
| Controlo: nº de formas | P0 | Slider 2-20 |
| Controlo: tipos de forma | P0 | Toggles: ellipse, circle, rect |
| Controlo: tamanho | P0 | Slider min/max |
| Controlo: cores | P0 | Swatches + color picker |
| Controlo: opacidade | P1 | Slider |
| Controlo: distribuição | P1 | random, grid, radial |
| Botão "Gerar novo" | P0 | Novo seed, mesmos params |
| Export SVG | P0 | Download do resultado |
| Guardar na galeria | P2 | Precisa de auth |

---

## 4. Funcionalidades Fora do Scope MVP

- Sistema de autenticação/login
- Upload de ilustrações por utilizadores
- Plano pago / monetização
- API pública
- Favoritos / colecções
- Animações SVG
- Exportação PNG/PDF

---

## 5. User Flows Principais

### Flow 1: Descobrir e copiar uma ilustração
```
Página inicial
  → Ver galeria de cards
  → (Opcional) Aplicar filtros
  → Clicar no botão "Copy" no card
  → Toast "SVG copiado!" aparece
  → Utilizador cola no seu projecto
```

### Flow 2: Ver detalhe e fazer download
```
Página inicial
  → Clicar num card
  → Página de detalhe abre
  → Ver SVG em grande
  → Clicar "Download SVG"
  → Ficheiro .svg é descarregado
```

### Flow 3: Criar uma ilustração no editor
```
Navbar → "Editor"
  → Canvas vazio com ilustração default gerada
  → Ajustar slider "Número de formas"
  → Seleccionar cores na paleta
  → Escolher estilo "Bold"
  → Clicar "Gerar novo" (várias vezes)
  → Encontrar resultado satisfatório
  → Clicar "Exportar SVG"
  → Ficheiro descarregado
```

---

## 6. Métricas de Sucesso MVP

| Métrica | Objectivo 30 dias |
|---|---|
| Ilustrações na galeria | ≥ 30 |
| Copies/downloads por dia | ≥ 10 |
| Tempo na página (avg) | ≥ 2 minutos |
| Bounce rate | ≤ 60% |

---

## 7. Decisões de Design

### Porque formas geométricas
As ilustrações são SVGs puros construídos programaticamente por formas geométricas. Isto significa:
- Ficheiros muito pequenos (< 5KB por ilustração)
- Escaláveis infinitamente
- Fáceis de personalizar (cor, tamanho)
- Estilo coerente em toda a galeria

### Estilo visual
Referência: frame "Strokiy" no Figma (ID: `22:3638`)
- Fundo: `#F5F5F9` (cinzento muito claro, quase branco)
- Cards brancos com sombra subtil
- Tipografia monospace (Geist Mono) — dá carácter técnico/criativo
- Sem bordas — separação por cor de fundo e sombra

---

## 8. Conteúdo Inicial (Seed Data)

Para o lançamento, popular a base de dados com pelo menos **30 ilustrações** nas categorias:

| Categoria | Nº mínimo | Descrição |
|---|---|---|
| Athletics | 10 | Figuras de atletas, desporto, movimento |
| Abstract | 8 | Formas sem representação figurativa |
| Nature | 6 | Flores, árvores, elementos naturais em formas geométricas |
| Tech | 6 | Ícones tech estilizados, dados, redes |

Cada ilustração precisa de:
- `name`: nome descritivo (ex: "Sprinter", "Orbital", "Bloom")
- `slug`: versão URL do nome (ex: "sprinter", "orbital", "bloom")
- `category`: uma das categorias acima
- `style`: "bold", "light", ou "outline"
- `colors`: array com as 2-4 cores usadas
- `tags`: array de 3-5 tags descritivas
- `svg_inline`: o código SVG completo

---

*PRD v1.0 — Strokiy*
