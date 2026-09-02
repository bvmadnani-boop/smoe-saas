# smoe-saas

Next.js (App Router) + TypeScript + Tailwind SaaS app.

## Presentations

When asked for a presentation, slide deck, PPT/PPTX, or pitch deck, use one of the
PPT design skills in `.claude/skills/` as the visual style layer:

- `japanese-style-ppt-skill` — Japanese editorial; washi/soft-glow or stark-white lifestyle
- `soft-3d-clay-ppt-skill` — soft 3D claymorphism, pastel beige/sage/pink
- `futuristic-tech-editorial-ppt-skill` — white + electric blue tech magazine
- `minimalist-luxury-branding-ppt-skill` — beige/brown minimalist luxury branding
- `modern-illustration-editorial-ppt-skill` — illustrated modern editorial
- `japanese-hand-drawn-editorial-ppt-skill` — hand-drawn ink and watercolour editorial

If the request names a style, use that skill. Otherwise pick the one that fits the
audience and content and say which you chose before building the deck. Follow the
skill's `references/ppt-master-integration.md` pipeline (slide plan → design spec →
spec lock → SVG pages → visual QA → export) and run `references/qa-checklist.md`
before delivering. See `.claude/skills/README.md` for the full style table.
