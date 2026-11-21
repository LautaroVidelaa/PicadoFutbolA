// Ilustración de cancha de noche con reflectores, para el banner de Inicio
export default function NightPitch() {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id="np-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#75AADB" stopOpacity=".55" />
          <stop offset="100%" stopColor="#75AADB" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="np-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1128" />
          <stop offset="100%" stopColor="#1B3A78" />
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#np-sky)" />
      <ellipse cx="140" cy="0" rx="260" ry="220" fill="url(#np-glow)" />
      <ellipse cx="680" cy="0" rx="260" ry="220" fill="url(#np-glow)" />
      {/* Reflectores */}
      {[110, 170, 630, 690].map((x) => (
        <circle key={x} cx={x} cy="26" r="6" fill="#fff" opacity=".9" />
      ))}
      {/* Césped en perspectiva */}
      <path d="M0 270 L800 270 L800 400 L0 400 Z" fill="#13275A" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${i * 160 - 40} 270 L${i * 160 + 60} 270 L${i * 200 - 120} 400 L${i * 200 - 220} 400 Z`} fill="#fff" opacity=".04" />
      ))}
      {/* Arco */}
      <g fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="5" strokeLinejoin="round">
        <path d="M560 270 V170 H720 V270" />
      </g>
      <g stroke="#fff" strokeOpacity=".22" strokeWidth="1.5">
        {[580, 600, 620, 640, 660, 680, 700].map((x) => (
          <line key={x} x1={x} y1="172" x2={x} y2="268" />
        ))}
        {[190, 210, 230, 250].map((y) => (
          <line key={y} x1="562" y1={y} x2="718" y2={y} />
        ))}
      </g>
      <g fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3">
        <path d="M470 400 L520 270 L760 270 L810 400" />
      </g>
      {/* Pelota */}
      <circle cx="610" cy="345" r="12" fill="#FFCE1F" />
    </svg>
  );
}
