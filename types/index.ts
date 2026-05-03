export type IllustrationStyle = 'bold' | 'light' | 'outline';

export type IllustrationCategory =
  | 'athletics'
  | 'abstract'
  | 'nature'
  | 'tech'
  | 'people';

export interface Illustration {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: IllustrationCategory;
  style: IllustrationStyle;
  colors: string[];
  tags: string[];
  svg: string;
  downloads: number;
  createdAt: string;
}

export interface FilterState {
  category: IllustrationCategory | null;
  style: IllustrationStyle | null;
  color: string | null;
  search: string;
}
