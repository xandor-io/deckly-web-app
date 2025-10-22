export default function DecklyLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Stylized deck/turntable */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="deckly-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* Outer circle - turntable */}
        <circle cx="16" cy="16" r="14" stroke="url(#deckly-gradient)" strokeWidth="2" fill="none" />
        {/* Inner circle - vinyl record */}
        <circle cx="16" cy="16" r="8" fill="url(#deckly-gradient)" opacity="0.2" />
        <circle cx="16" cy="16" r="3" fill="url(#deckly-gradient)" />
        {/* Tonearm indicator */}
        <line x1="16" y1="16" x2="24" y2="8" stroke="url(#deckly-gradient)" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <span
        className="text-2xl font-bold text-white"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em'
        }}
      >
        DECKLY
      </span>
    </div>
  );
}
