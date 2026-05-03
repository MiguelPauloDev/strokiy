import type { Illustration, FilterState } from '@/types';
import data from '../public/data/illustrations.json';

const illustrations = data as Illustration[];

export function getIllustrations(filters?: Partial<FilterState>): Illustration[] {
  if (!filters) return illustrations;

  return illustrations.filter((ill) => {
    if (filters.category && ill.category !== filters.category) return false;
    if (filters.style && ill.style !== filters.style) return false;
    if (filters.color && !ill.colors.includes(filters.color)) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        ill.name.toLowerCase().includes(q) ||
        ill.tags.some((t) => t.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });
}

export function getIllustrationBySlug(slug: string): Illustration | undefined {
  return illustrations.find((ill) => ill.slug === slug);
}

export function getRelatedIllustrations(
  category: string,
  excludeSlug: string
): Illustration[] {
  return illustrations.filter(
    (ill) => ill.category === category && ill.slug !== excludeSlug
  );
}
