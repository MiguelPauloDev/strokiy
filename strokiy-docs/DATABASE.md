# Strokiy — Estratégia de Dados

## MVP: Ficheiros JSON (sem base de dados)

As ilustrações vivem em `public/data/illustrations.json`.
Sem servidor, sem pausas, sem custos, deploy em segundos.

### Estrutura do ficheiro

```json
[
  {
    "id": "sprinter",
    "slug": "sprinter",
    "name": "Sprinter",
    "description": "Figura geométrica de um atleta em corrida.",
    "category": "athletics",
    "style": "bold",
    "colors": ["#212123", "#FF3155"],
    "tags": ["running", "athlete", "sport", "dynamic"],
    "downloads": 0,
    "createdAt": "2026-04-20",
    "svg": "<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>"
  }
]
```

### Como adicionar ilustrações
1. Abre `public/data/illustrations.json`
2. Adiciona um novo objecto ao array
3. Faz commit e push — o Vercel faz deploy automaticamente

### Como os filtros funcionam
```typescript
// lib/illustrations.ts — tudo no cliente, sem API
import data from '@/public/data/illustrations.json';

export function getIllustrations(filters: FilterState) {
  return data.filter(i => {
    if (filters.category !== 'all' && i.category !== filters.category) return false;
    if (filters.style !== 'all' && i.style !== filters.style) return false;
    if (filters.search && !i.name.toLowerCase().includes(filters.search)) return false;
    return true;
  });
}
```

---

## Fase 2: Migrar para Turso (quando precisar)

Quando tiveres +200 ilustrações ou precisares de filtros mais complexos:

- **Turso**: SQLite serverless, grátis até 9GB, nunca pausa
- **Migração**: exportar o JSON para SQL, instalar `@libsql/client`
- **Tempo estimado**: 2-3 horas com Claude Code

### Porquê Turso e não Supabase
| | Turso | Supabase free |
|---|---|---|
| Pausa | Nunca | Após 1 semana inactivo |
| Custo | $0 (9GB) | $0 (500MB) |
| Projectos | Ilimitados | 2 projectos |
| Integração Next.js | Nativa | SDK próprio |

