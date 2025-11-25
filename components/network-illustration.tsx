export function NetworkIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-2xl mx-auto"
    >
      <defs>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Connection Lines */}
      <g className="connections" stroke="url(#lineGradient)" strokeWidth="2" opacity="0.6">
        <line x1="400" y1="300" x2="200" y2="150" />
        <line x1="400" y1="300" x2="600" y2="150" />
        <line x1="400" y1="300" x2="200" y2="450" />
        <line x1="400" y1="300" x2="600" y2="450" />
        <line x1="200" y1="150" x2="600" y2="150" />
        <line x1="200" y1="450" x2="600" y2="450" />
        <line x1="200" y1="150" x2="200" y2="450" />
        <line x1="600" y1="150" x2="600" y2="450" />
      </g>

      {/* Nodes */}
      <g className="nodes">
        <circle cx="400" cy="300" r="30" fill="url(#nodeGradient)" />
        <circle cx="200" cy="150" r="20" fill="url(#nodeGradient)" />
        <circle cx="600" cy="150" r="20" fill="url(#nodeGradient)" />
        <circle cx="200" cy="450" r="20" fill="url(#nodeGradient)" />
        <circle cx="600" cy="450" r="20" fill="url(#nodeGradient)" />
      </g>

      {/* Pulse Animation */}
      <circle cx="400" cy="300" r="40" fill="none" stroke="url(#nodeGradient)" strokeWidth="2" opacity="0.5">
        <animate attributeName="r" from="40" to="80" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}
