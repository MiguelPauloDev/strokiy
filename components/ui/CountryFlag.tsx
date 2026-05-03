/*
  CountryFlag — Figma node 22:3649 "Country" component
  ─────────────────────────────────────────────────────
  20×20px circular flag via flagcdn.com.
  URL pattern: https://flagcdn.com/w{size*2}/{code}.png  (2× for HiDPI)
  Circular clipping via border-radius:50% + object-fit:cover.
*/

interface CountryFlagProps {
  country: string; // ISO 3166-1 alpha-2
  size?: number;
}

export default function CountryFlag({ country, size = 20 }: CountryFlagProps) {
  const code = country.toLowerCase();
  const px   = size * 2; // 2× resolution for HiDPI screens

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w${px}/${code}.png`}
      alt={country}
      width={size}
      height={size}
      style={{
        display:      'block',
        width:        size,   // CSS overrides any browser default stretching
        height:       size,
        minWidth:     size,
        borderRadius: '50%',
        objectFit:    'cover',
        flexShrink:   0,
      }}
    />
  );
}
