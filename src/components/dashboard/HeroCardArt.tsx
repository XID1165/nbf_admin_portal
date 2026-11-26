/** Decorative gradient and arcs behind the overview hero (from the approved dashboard design; viewBox = hero card). */
export function HeroCardArt({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="352 97 856 362" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <linearGradient id="dh-g1" x1="9.90111e-06" y1="76.4996" x2="398.532" y2="620.586" gradientUnits="userSpaceOnUse"><stop stopColor="#003A50"/><stop offset="0.55" stopColor="#004A66"/><stop offset="1" stopColor="#00587A"/></linearGradient>
        <linearGradient id="dh-g2" x1="304.444" y1="-13.2778" x2="449.754" y2="9.46634" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="dh-g3" x1="387.667" y1="-13.2778" x2="764.136" y2="422.016" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="dh-g4" x1="554.111" y1="-13" x2="846.331" y2="370.897" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
        <linearGradient id="dh-g5" x1="280.667" y1="557.389" x2="388.202" y2="235.676" gradientUnits="userSpaceOnUse"><stop stopColor="#009FE3" stopOpacity="0.95"/><stop offset="0.55" stopColor="#0A6E98" stopOpacity="0.7"/><stop offset="1" stopColor="#003A50" stopOpacity="0.15"/></linearGradient>
        <linearGradient id="dh-g6" x1="280.667" y1="474.167" x2="360.44" y2="203.421" gradientUnits="userSpaceOnUse"><stop stopColor="#009FE3" stopOpacity="0.95"/><stop offset="0.55" stopColor="#0A6E98" stopOpacity="0.7"/><stop offset="1" stopColor="#003A50" stopOpacity="0.15"/></linearGradient>
        <linearGradient id="dh-g7" x1="922.667" y1="-13.2778" x2="922.667" y2="414.722" gradientUnits="userSpaceOnUse"><stop stopColor="#003A50" stopOpacity="0.2"/><stop offset="0.5" stopColor="#009FE3" stopOpacity="0.85"/><stop offset="1" stopColor="#003A50" stopOpacity="0.6"/></linearGradient>
        <linearGradient id="dh-g8" x1="1095.06" y1="-13.2778" x2="1374.12" y2="57.9114" gradientUnits="userSpaceOnUse"><stop stopColor="#8A8F94" stopOpacity="0.28"/><stop offset="1" stopColor="#8A8F94" stopOpacity="0.04"/></linearGradient>
      </defs>
      <rect x="352" y="97" width="856" height="362" fill="url(#dh-g1)" />
      <g opacity="0.6">
        <path d="M316.333 -13.2778C403.518 169.019 399.555 327.537 304.444 462.278C359.926 311.685 363.889 153.167 316.333 -13.2778Z" fill="url(#dh-g2)" />
        <path d="M447.111 -13.2778C645.259 58.0556 772.074 184.87 827.555 367.167C748.296 212.611 601.667 85.7963 387.667 -13.2778H447.111Z" fill="url(#dh-g3)" />
        <path opacity="0.7" d="M601.667 -13C791.889 42.4815 908.797 143.537 952.389 290.167C892.945 163.352 760.185 62.2963 554.111 -13H601.667Z" fill="url(#dh-g4)" />
        <path d="M280.667 390.944C494.667 351.315 673 406.796 815.667 557.389H684.889C581.852 462.278 447.111 434.537 280.667 474.167V390.944Z" fill="url(#dh-g5)" />
        <path opacity="0.55" d="M280.667 343.389C478.815 299.796 645.259 343.389 780 474.167C645.259 371.13 478.815 337.444 280.667 373.111V343.389Z" fill="url(#dh-g6)" />
        <path d="M922.667 -13.2778C1029.67 89.7593 1071.28 232.426 1047.5 414.722C1110.91 244.315 1106.94 101.648 1035.61 -13.2778H922.667Z" fill="url(#dh-g7)" />
        <path d="M1095.06 -13.2778C1202.06 129.389 1229.8 323.574 1178.28 569.278H1243.67V-13.2778H1095.06Z" fill="url(#dh-g8)" />
      </g>
    </svg>
  );
}
