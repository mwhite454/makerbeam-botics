# Design Guidelines — Cross-Cutting Constraints

**Source**: `BRAND.md` (canonical), `styling-guide.md`
**Product Name**: MakersEdge

All features in this directory must respect these constraints. These are not optional — they are hard requirements for architectural and dev review.

---

## Visual Identity

- **Dark palette**: Deep grays, muted contrast. Purples, blues — cold and soft.
- **Icons**: Lucide icons only. Minimal, clean, small. See `BRAND.md` Section 5 for the icon reference table.
- **No emojis**: Do not render emojis in the frontend UI. No exceptions.
- **Typography**: System sans-serif for UI, JetBrains Mono (`font-mono`) for all values, expressions, and code.
- **Brand mark**: MX badge — amber `#eab308`, monospace bold, rounded square.

## Interaction Principles

- **Transitions everywhere**: Every interactive element uses `transition-colors` or `transition-all`.
- **Dense but breathable**: Compact spacing (8–12px) with intent.
- **Color is semantic**: Blue = interactive. Amber = formula/expression. Green = code/output. Red = danger/delete. Purple = module/sketch.
- **Toolbar buttons**: Icon + text label (both visible). See `BRAND.md` Section 5.

## Reference

See [BRAND.md](../BRAND.md) for the complete brand system (naming, colors, icons, typography, component patterns, hard rules).
See [styling-guide.md](../styling-guide.md) for detailed CSS patterns and Tailwind class recipes.
