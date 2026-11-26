# NBF Admin Portal – Project Rules

Internal admin & back-office portal for National Bank of Fujairah. Modules built incrementally: AD login, RBAC (IT, Marketing, Product, BackOffice), audit trail, application tracking, user/account block-unblock.

- Stack (do not change): React 18 + Vite + TS, Tailwind, react-router-dom, lucide-react, @fontsource/inter. No UI kits, no backend — typed mock services in `src/services/` behind interfaces.
- Brand palette (CSS vars in `src/index.css` + tailwind config; never hardcode hex in components): blue #009FE3 (CTAs, focus rings, links, active states, blue ribbons); charcoal #373736 (text, labels, icons, charcoal ribbons); dark #003A50 (accent only: headline, button hover, step indicator, small highlights — no large dark surfaces); white #FFFFFF (all page/card backgrounds). Neutrals are tints of charcoal only (borders charcoal/12, muted text charcoal/60–70).
- Logo: `src/assets/nbf-logo-color.png` on white backgrounds; clear space ≥ 0.25 × height; never recolor/stretch. Brand motif: "Sails" ribbons (`src/components/brand/`).
- Design: minimal corporate banking, 8px grid, radius 12 (cards) / 8 (controls), soft shadows, Inter, flowing ribbon motif.
- Engineering: responsive 360→1920, logical CSS props (ms/me/ps/pe) for RTL, WCAG AA, visible focus, labelled inputs, respect prefers-reduced-motion. Reusable pieces in `src/components/ui/`, pages in `src/pages/`.
- Verify with `npm run build`. Final reply: short summary of files + how to run.
