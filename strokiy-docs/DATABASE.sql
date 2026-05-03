-- ============================================================
-- STROKIY — Database Setup
-- Correr no Supabase Dashboard → SQL Editor
-- ============================================================

-- ── TABELA PRINCIPAL: ilustrações ──────────────────────────

CREATE TABLE IF NOT EXISTS illustrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK (category IN ('athletics','abstract','nature','tech','people')),
  style       TEXT NOT NULL CHECK (style IN ('bold','light','outline')),
  colors      TEXT[] NOT NULL DEFAULT '{}',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  svg_url     TEXT,
  svg_inline  TEXT NOT NULL DEFAULT '',
  downloads   INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para filtros rápidos
CREATE INDEX IF NOT EXISTS idx_illustrations_category  ON illustrations(category);
CREATE INDEX IF NOT EXISTS idx_illustrations_style     ON illustrations(style);
CREATE INDEX IF NOT EXISTS idx_illustrations_slug      ON illustrations(slug);
CREATE INDEX IF NOT EXISTS idx_illustrations_tags      ON illustrations USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_illustrations_created   ON illustrations(created_at DESC);


-- ── TABELA DE FORMAS (para o editor — Fase 2) ──────────────

CREATE TABLE IF NOT EXISTS illustration_shapes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  illustration_id   UUID NOT NULL REFERENCES illustrations(id) ON DELETE CASCADE,
  shape_type        TEXT NOT NULL CHECK (shape_type IN ('ellipse','circle','rect','line','path')),
  order_index       INTEGER NOT NULL,
  params            JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shapes_illustration ON illustration_shapes(illustration_id);
CREATE INDEX IF NOT EXISTS idx_shapes_order        ON illustration_shapes(illustration_id, order_index);


-- ── ROW LEVEL SECURITY ─────────────────────────────────────
-- MVP: leitura pública, escrita só pelo service role

ALTER TABLE illustrations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE illustration_shapes ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode LER ilustrações
CREATE POLICY "illustrations_public_read"
  ON illustrations FOR SELECT
  USING (true);

-- Qualquer pessoa pode LER formas
CREATE POLICY "shapes_public_read"
  ON illustration_shapes FOR SELECT
  USING (true);

-- Só o service role pode ESCREVER (via API server-side)
-- (service role bypassa RLS por defeito no Supabase)


-- ── FUNÇÃO: incrementar downloads ─────────────────────────

CREATE OR REPLACE FUNCTION increment_downloads(illustration_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE illustrations
  SET downloads = downloads + 1
  WHERE slug = illustration_slug;
END;
$$;


-- ── SEED DATA: ilustrações iniciais ────────────────────────
-- 10 ilustrações de exemplo para arrancar a galeria

INSERT INTO illustrations (slug, name, description, category, style, colors, tags, svg_inline) VALUES

-- ATHLETICS

('sprinter',
 'Sprinter',
 'Figura geométrica de um atleta em corrida, formada por elipses sobrepostas.',
 'athletics', 'bold',
 ARRAY['#212123', '#FF3155', '#F5F5F9'],
 ARRAY['running', 'speed', 'athlete', 'sport', 'dynamic'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <ellipse cx="100" cy="40" rx="18" ry="18" fill="#212123"/>
   <ellipse cx="100" cy="90" rx="22" ry="35" fill="#212123"/>
   <ellipse cx="75" cy="95" rx="10" ry="28" fill="#FF3155" transform="rotate(-30 75 95)"/>
   <ellipse cx="125" cy="85" rx="10" ry="28" fill="#212123" transform="rotate(20 125 85)"/>
   <ellipse cx="85" cy="148" rx="9" ry="30" fill="#212123" transform="rotate(15 85 148)"/>
   <ellipse cx="115" cy="155" rx="9" ry="28" fill="#FF3155" transform="rotate(-10 115 155)"/>
 </svg>'),

('jumper',
 'Jumper',
 'Atleta em salto, formas circulares e alongadas capturando o movimento.',
 'athletics', 'bold',
 ARRAY['#212123', '#00AAFF'],
 ARRAY['jump', 'athletics', 'air', 'sport', 'leap'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <ellipse cx="105" cy="35" rx="18" ry="18" fill="#212123"/>
   <ellipse cx="100" cy="80" rx="20" ry="30" fill="#212123" transform="rotate(-15 100 80)"/>
   <ellipse cx="65" cy="110" rx="10" ry="35" fill="#00AAFF" transform="rotate(-45 65 110)"/>
   <ellipse cx="138" cy="105" rx="10" ry="32" fill="#00AAFF" transform="rotate(40 138 105)"/>
   <ellipse cx="80" cy="155" rx="9" ry="28" fill="#212123" transform="rotate(-20 80 155)"/>
   <ellipse cx="125" cy="160" rx="9" ry="25" fill="#212123" transform="rotate(10 125 160)"/>
 </svg>'),

('cyclist',
 'Cyclist',
 'Ciclista em posição aerodinâmica, elipses criando corpo e bicicleta.',
 'athletics', 'light',
 ARRAY['#212123', '#FFD819'],
 ARRAY['cycling', 'bike', 'sport', 'speed', 'wheel'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <circle cx="65" cy="140" r="35" fill="none" stroke="#212123" stroke-width="6"/>
   <circle cx="145" cy="140" r="35" fill="none" stroke="#212123" stroke-width="6"/>
   <ellipse cx="105" cy="115" rx="40" ry="12" fill="#212123" transform="rotate(-10 105 115)"/>
   <ellipse cx="120" cy="85" rx="15" ry="25" fill="#212123" transform="rotate(-20 120 85)"/>
   <ellipse cx="118" cy="55" rx="14" ry="14" fill="#FFD819"/>
 </svg>'),

-- ABSTRACT

('orbital',
 'Orbital',
 'Elipses em órbita criando sensação de movimento circular.',
 'abstract', 'bold',
 ARRAY['#FF3155', '#00AAFF', '#FFD819', '#212123'],
 ARRAY['circle', 'orbit', 'space', 'rotation', 'abstract'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="#212123" stroke-width="2" transform="rotate(30 100 100)"/>
   <ellipse cx="100" cy="100" rx="80" ry="25" fill="none" stroke="#212123" stroke-width="2" transform="rotate(-30 100 100)"/>
   <circle cx="100" cy="100" r="20" fill="#FF3155"/>
   <circle cx="155" cy="72" r="10" fill="#00AAFF"/>
   <circle cx="45" cy="128" r="8" fill="#FFD819"/>
 </svg>'),

('cluster',
 'Cluster',
 'Agrupamento de formas de diferentes tamanhos criando densidade visual.',
 'abstract', 'light',
 ARRAY['#CCCCFF', '#FF7733', '#212123'],
 ARRAY['cluster', 'group', 'abstract', 'density', 'shapes'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <circle cx="100" cy="100" r="45" fill="#CCCCFF" opacity="0.6"/>
   <circle cx="130" cy="85" r="30" fill="#FF7733" opacity="0.7"/>
   <circle cx="75" cy="120" r="35" fill="#212123" opacity="0.15"/>
   <circle cx="120" cy="120" r="20" fill="#FF7733" opacity="0.5"/>
   <circle cx="85" cy="80" r="22" fill="#CCCCFF" opacity="0.8"/>
 </svg>'),

('strata',
 'Strata',
 'Camadas rectangulares sobrepostas criando profundidade e ritmo.',
 'abstract', 'outline',
 ARRAY['#212123'],
 ARRAY['layers', 'geometric', 'minimal', 'lines', 'abstract'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <rect x="20" y="60" width="160" height="12" fill="none" stroke="#212123" stroke-width="2" rx="2"/>
   <rect x="35" y="82" width="130" height="12" fill="none" stroke="#212123" stroke-width="2" rx="2"/>
   <rect x="20" y="104" width="160" height="12" fill="none" stroke="#212123" stroke-width="2" rx="2"/>
   <rect x="50" y="126" width="100" height="12" fill="none" stroke="#212123" stroke-width="2" rx="2"/>
   <rect x="35" y="148" width="130" height="8" fill="none" stroke="#212123" stroke-width="1.5" rx="2"/>
 </svg>'),

-- NATURE

('bloom',
 'Bloom',
 'Flor geométrica construída por elipses em rotação simétrica.',
 'nature', 'bold',
 ARRAY['#FF3155', '#FFD819', '#212123'],
 ARRAY['flower', 'bloom', 'nature', 'petal', 'plant'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FF3155" opacity="0.9"/>
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FF3155" opacity="0.9" transform="rotate(60 100 100)"/>
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FF3155" opacity="0.9" transform="rotate(120 100 100)"/>
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FFD819" opacity="0.7" transform="rotate(30 100 100)"/>
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FFD819" opacity="0.7" transform="rotate(90 100 100)"/>
   <ellipse cx="100" cy="65" rx="18" ry="40" fill="#FFD819" opacity="0.7" transform="rotate(150 100 100)"/>
   <circle cx="100" cy="100" r="20" fill="#212123"/>
 </svg>'),

('grove',
 'Grove',
 'Árvore minimalista formada por triângulos e rectângulo.',
 'nature', 'bold',
 ARRAY['#212123', '#00AAFF'],
 ARRAY['tree', 'nature', 'forest', 'minimal', 'plant'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <rect x="88" y="140" width="24" height="45" fill="#212123" rx="2"/>
   <ellipse cx="100" cy="110" rx="40" ry="38" fill="#212123"/>
   <ellipse cx="100" cy="78"  rx="30" ry="30" fill="#00AAFF" opacity="0.9"/>
   <ellipse cx="100" cy="52"  rx="20" ry="22" fill="#212123"/>
 </svg>'),

-- TECH

('node',
 'Node',
 'Nós e ligações representando uma rede ou grafo de dados.',
 'tech', 'outline',
 ARRAY['#212123', '#00AAFF'],
 ARRAY['network', 'data', 'tech', 'nodes', 'graph'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <line x1="100" y1="100" x2="45"  y2="55"  stroke="#212123" stroke-width="1.5"/>
   <line x1="100" y1="100" x2="155" y2="55"  stroke="#212123" stroke-width="1.5"/>
   <line x1="100" y1="100" x2="45"  y2="155" stroke="#212123" stroke-width="1.5"/>
   <line x1="100" y1="100" x2="155" y2="145" stroke="#212123" stroke-width="1.5"/>
   <line x1="100" y1="100" x2="100" y2="35"  stroke="#212123" stroke-width="1.5"/>
   <circle cx="100" cy="100" r="12" fill="#00AAFF"/>
   <circle cx="45"  cy="55"  r="7"  fill="none" stroke="#212123" stroke-width="2"/>
   <circle cx="155" cy="55"  r="7"  fill="none" stroke="#212123" stroke-width="2"/>
   <circle cx="45"  cy="155" r="7"  fill="none" stroke="#212123" stroke-width="2"/>
   <circle cx="155" cy="145" r="7"  fill="none" stroke="#212123" stroke-width="2"/>
   <circle cx="100" cy="35"  r="9"  fill="#212123"/>
 </svg>'),

('grid-data',
 'Grid Data',
 'Grelha de dados com células de diferentes opacidades.',
 'tech', 'light',
 ARRAY['#212123', '#CCCCFF'],
 ARRAY['data', 'grid', 'tech', 'matrix', 'digital'],
 '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   <rect x="30"  y="30"  width="30" height="30" rx="4" fill="#212123" opacity="0.9"/>
   <rect x="70"  y="30"  width="30" height="30" rx="4" fill="#CCCCFF" opacity="0.8"/>
   <rect x="110" y="30"  width="30" height="30" rx="4" fill="#212123" opacity="0.4"/>
   <rect x="150" y="30"  width="30" height="30" rx="4" fill="#212123" opacity="0.7"/>
   <rect x="30"  y="70"  width="30" height="30" rx="4" fill="#CCCCFF" opacity="0.5"/>
   <rect x="70"  y="70"  width="30" height="30" rx="4" fill="#212123" opacity="0.9"/>
   <rect x="110" y="70"  width="30" height="30" rx="4" fill="#CCCCFF" opacity="0.9"/>
   <rect x="150" y="70"  width="30" height="30" rx="4" fill="#212123" opacity="0.3"/>
   <rect x="30"  y="110" width="30" height="30" rx="4" fill="#212123" opacity="0.6"/>
   <rect x="70"  y="110" width="30" height="30" rx="4" fill="#212123" opacity="0.2"/>
   <rect x="110" y="110" width="30" height="30" rx="4" fill="#212123" opacity="0.8"/>
   <rect x="150" y="110" width="30" height="30" rx="4" fill="#CCCCFF" opacity="0.7"/>
   <rect x="30"  y="150" width="30" height="30" rx="4" fill="#CCCCFF" opacity="0.4"/>
   <rect x="70"  y="150" width="30" height="30" rx="4" fill="#212123" opacity="0.7"/>
   <rect x="110" y="150" width="30" height="30" rx="4" fill="#212123" opacity="0.5"/>
   <rect x="150" y="150" width="30" height="30" rx="4" fill="#212123" opacity="0.9"/>
 </svg>');


-- ── VERIFICAÇÃO ────────────────────────────────────────────
-- Correr após o INSERT para confirmar:
-- SELECT id, name, category, style FROM illustrations ORDER BY created_at;
