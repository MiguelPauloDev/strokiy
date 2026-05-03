/* ── BackgroundGradient — Figma 22:3681 ────────────────────────────────────
   FRAME 320×248 · fill #FFFFFF · clipsContent:true

   GradientBlobs group (22:3682)
     blendMode: PASS_THROUGH · opacity: 0.4

   Each blob (Ellipse 32–37):
     ELLIPSE · borderRadius:50% · filter:blur(114.2px) · opacity:0.3

   Blob colours (from design tokens):
     Lavender  #EFEFFF  —  --color-blob-lavender
     Blue      #00AAFF  —  --color-blob-blue
     Red       #FF3155  —  --color-blob-red
     Orange    #FF7733  —  --color-blob-orange
     Yellow    #FFD819  —  --color-blob-yellow

   Positions relative to this frame's origin (absolute x:7407, y:3376):
     Ellipse 32 #EFEFFF  left:129  top: -28   93×92
     Ellipse 34 #00AAFF  left:198  top: -92   93×95
     Ellipse 35 #FF3155  left: 35  top:-101   93×95
     Ellipse 36 #FF7733  left: 13  top:  17   93×94
     Ellipse 37 #FFD819  left:113  top:  74   93×95               */

interface BlobSpec {
  color: string;
  left:  number;
  top:   number;
  w:     number;
  h:     number;
}

/* Default: top-gradient blob layout (22:3682) */
const DEFAULT_BLOBS: BlobSpec[] = [
  { color: '#EFEFFF', left: 129, top:  -28, w: 93, h: 92 },
  { color: '#00AAFF', left: 198, top:  -92, w: 93, h: 95 },
  { color: '#FF3155', left:  35, top: -101, w: 93, h: 95 },
  { color: '#FF7733', left:  13, top:   17, w: 93, h: 94 },
  { color: '#FFD819', left: 113, top:   74, w: 93, h: 95 },
];

interface BackgroundGradientProps {
  /** Custom blob layout — defaults to the top-gradient arrangement (22:3682) */
  blobs?: BlobSpec[];
  /** Override frame width (default: 320) */
  width?: number;
  /** Override frame height (default: 248) */
  height?: number;
  style?: React.CSSProperties;
  /** Optional children rendered above the blob layer (e.g. card content in bottom gradient) */
  children?: React.ReactNode;
}

export default function BackgroundGradient({
  blobs    = DEFAULT_BLOBS,
  width    = 320,
  height   = 248,
  style,
  children,
}: BackgroundGradientProps) {
  return (
    /* Outer frame — fill:#FFFFFF, clipsContent:true */
    <div
      style={{
        position:   'relative',
        width,
        height,
        background: 'var(--sidebar-bg)',
        overflow:   'hidden',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* GradientBlobs group — blendMode:PASS_THROUGH, opacity:0.4 */}
      <div
        style={{
          position: 'absolute',
          inset:    0,
          opacity:  0.4,
        }}
      >
        {blobs.map(({ color, left, top, w, h }) => (
          <div
            key={`${color}-${left}-${top}`}
            style={{
              position:     'absolute',
              left,
              top,
              width:        w,
              height:       h,
              borderRadius: '50%',
              background:   color,
              filter:       'blur(114.2px)',
              opacity:      0.3,
            }}
          />
        ))}
      </div>

      {/* Children rendered above the blob layer (z-index: auto) */}
      {children}
    </div>
  );
}

export type { BlobSpec };
