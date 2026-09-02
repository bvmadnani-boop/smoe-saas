# PPT design skills

Vendored from [Awesome-PPT-Design-Skills](https://github.com/software-ai-life/Awesome-PPT-Design-Skills)
(upstream commit `75273f06172d1b174ee4a19cec6a875377924559`).

Each `*-ppt-skill/` directory is a self-contained Claude Code skill:

| Skill | Look | Best for |
| --- | --- | --- |
| `japanese-style-ppt-skill` | Washi paper + soft glow, or stark white / burnt orange lifestyle editorial | Brand stories, business proposals, product narratives |
| `soft-3d-clay-ppt-skill` | Claymorphism, beige / sage / morandi pink, soft matte shapes | Friendly product explainers, lively strategy decks |
| `futuristic-tech-editorial-ppt-skill` | White, electric blue, graphite, thin grids, flat and sharp | AI, platform, engineering, data-forward decks |
| `minimalist-luxury-branding-ppt-skill` | Warm beige, soft brown, serif + sans pairing, large margins | Premium brand proposals, company profiles, founder decks |
| `modern-illustration-editorial-ppt-skill` | Soft beige, muted blue, dusty orange, refined vector illustration | Product stories, workflows, concept-led explainers |
| `japanese-hand-drawn-editorial-ppt-skill` | Warm paper, ink line art, pale watercolor fills | Human-centred brands, lifestyle narratives, creative process |

Each skill contains:

- `SKILL.md` — trigger conditions and core style instructions
- `references/style-system.md` — colour, typography, layout, chart and image rules
- `references/slide-patterns.md` — reusable slide patterns
- `references/ppt-master-integration.md` — [`ppt-master`](https://github.com/hugohe3/ppt-master) generation pipeline
- `references/qa-checklist.md` — pre-export QA checklist
- `assets/` — HTML slide template and example cover SVGs
- `agents/openai.yaml` — manifest for non-Claude agents (unused by Claude Code)

## Updating

```sh
git clone --depth 1 https://github.com/software-ai-life/Awesome-PPT-Design-Skills.git /tmp/appds
rm -rf .claude/skills/*-ppt-skill
cp -r /tmp/appds/*-ppt-skill .claude/skills/
```

Then update the commit hash recorded above.
