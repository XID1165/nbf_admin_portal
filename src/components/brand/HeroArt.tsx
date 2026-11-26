/** Decorative background arcs from the approved login design (viewBox = design canvas 1728 x 926). */
export function HeroArt({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 1728 926" preserveAspectRatio="xMinYMid slice" className={className}>
      <defs>
        <linearGradient id="hero-g0" x1="-96" y1="-125.125" x2="197.335" y2="-79.2116" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="hero-g1" x1="72" y1="-125.125" x2="831.977" y2="753.598" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="hero-g2" x1="408" y1="-125.125" x2="997.902" y2="649.845" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="hero-g3" x1="-144" y1="1026.88" x2="73.0809" y2="377.436" gradientUnits="userSpaceOnUse"><stop stopColor="#009FE3" stopOpacity="0.95"/><stop offset="0.55" stopColor="#0A6E98" stopOpacity="0.7"/><stop offset="1" stopColor="#003A50" stopOpacity="0.15"/></linearGradient>
        <linearGradient id="hero-g4" x1="-144" y1="858.875" x2="17.0375" y2="312.324" gradientUnits="userSpaceOnUse"><stop stopColor="#009FE3" stopOpacity="0.95"/><stop offset="0.55" stopColor="#0A6E98" stopOpacity="0.7"/><stop offset="1" stopColor="#003A50" stopOpacity="0.15"/></linearGradient>
        <linearGradient id="hero-g5" x1="1152" y1="-125.125" x2="1152" y2="738.875" gradientUnits="userSpaceOnUse"><stop stopColor="#003A50" stopOpacity="0.2"/><stop offset="0.5" stopColor="#009FE3" stopOpacity="0.85"/><stop offset="1" stopColor="#003A50" stopOpacity="0.6"/></linearGradient>
        <linearGradient id="hero-g6" x1="1500" y1="-125.125" x2="2063.34" y2="18.5841" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
      </defs>
      <g>
        <path d="M-72 -125.125C104 242.875 96 562.875 -96 834.875C16 530.875 24 210.875 -72 -125.125Z" fill="url(#hero-g0)" />
        <path d="M192 -125.125C592 18.875 848 274.875 960 642.875C800 330.875 504 74.875 72 -125.125H192Z" fill="url(#hero-g1)" />
        <path opacity="0.7" d="M504 -125.125C888 -13.125 1124 190.875 1212 486.875C1092 230.875 824 26.875 408 -125.125H504Z" fill="url(#hero-g2)" />
        <path d="M-144 690.875C288 610.875 648 722.875 936 1026.88H672C464 834.875 192 778.875 -144 858.875V690.875Z" fill="url(#hero-g3)" />
        <path opacity="0.55" d="M-144 594.875C256 506.875 592 594.875 864 858.875C592 650.875 256 582.875 -144 654.875V594.875Z" fill="url(#hero-g4)" />
        <path d="M1152 -125.125C1368 82.875 1452 370.875 1404 738.875C1532 394.875 1524 106.875 1380 -125.125H1152Z" fill="url(#hero-g5)" />
        <path d="M1500 -125.125C1716 162.875 1772 554.875 1668 1050.88H1800V-125.125H1500Z" fill="url(#hero-g6)" />
      </g>
    </svg>
  );
}
