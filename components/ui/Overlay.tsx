interface OverlayProps {
  isOpen:  boolean;
  onClick: () => void;
}

export default function Overlay({ isOpen, onClick }: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      style={{
        position:      'fixed',
        inset:         0,
        background:    'rgba(0,0,0,0.4)',
        zIndex:        99,
        opacity:       isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        transition:    'opacity 300ms ease-out',
      }}
    />
  );
}
