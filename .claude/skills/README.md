# Skills

Two vendored collections, flattened into this directory so Claude Code picks them
up as project skills (`.claude/skills/<name>/SKILL.md`).

| Collection | Count | Source |
| --- | --- | --- |
| PPT design styles (`*-ppt-skill`) | 6 | [software-ai-life/Awesome-PPT-Design-Skills](https://github.com/software-ai-life/Awesome-PPT-Design-Skills) @ `75273f0` |
| Corporate role skills | 156 | [w95/awesome-claude-corporate-skills](https://github.com/w95/awesome-claude-corporate-skills) @ `78dbc7c` (MIT, see `LICENSE.corporate-skills`) |

- `INDEX.corporate.md` — the 156 corporate skills by role, with one-line descriptions.
- `install-report.corporate.json` — exactly what was installed, skipped, repaired, renamed.
- `install-corporate-skills.sh` — copy everything here into `~/.claude/skills` (user level, all projects).

## Making them available everywhere

The repo doubles as a **Claude Code plugin marketplace** (`.claude-plugin/marketplace.json`).
Installing the plugin once makes all 162 skills available in **every project on that machine**,
in every future session — no per-project copying:

```sh
claude plugin marketplace add bvmadnani-boop/smoe-saas
claude plugin install business-skills@bvmadnani-skills
```

The plugin's source is the repo root and its `skills` field points at this very directory, so
there is no second copy of the skills — the plugin and the project-level install read the same files.
Skills arrive namespaced as `business-skills:<name>` (e.g. `business-skills:dcf-model`).

Until this branch is merged, pin it: `claude plugin marketplace add bvmadnani-boop/smoe-saas@claude/ppt-design-skills-setup-wlkifz`.

Update everything later with `claude plugin marketplace update bvmadnani-skills`.

### The other two scopes

| Scope | Covers | How |
| --- | --- | --- |
| Plugin (above) | Every project, every session, one machine | `claude plugin install` — **recommended** |
| Project — `.claude/skills/` | This repo only, zero config | Already committed; works with no install |
| User — `~/.claude/skills/` | Every project, one machine | `bash .claude/skills/install-corporate-skills.sh` |

For claude.ai itself — web chats, Projects, Cowork, mobile — skills must be uploaded under
**claude.ai → Settings → Capabilities → Skills**. Those sync down to `~/.claude/skills/synced/`
in every session and on every surface. That upload can only be done from the claude.ai UI,
not from inside a session.

## PPT design styles

| Skill | Look | Best for |
| --- | --- | --- |
| `japanese-style-ppt-skill` | Washi paper + soft glow, or stark white / burnt orange lifestyle editorial | Brand stories, business proposals, product narratives |
| `soft-3d-clay-ppt-skill` | Claymorphism, beige / sage / morandi pink, soft matte shapes | Friendly product explainers, lively strategy decks |
| `futuristic-tech-editorial-ppt-skill` | White, electric blue, graphite, thin grids, flat and sharp | AI, platform, engineering, data-forward decks |
| `minimalist-luxury-branding-ppt-skill` | Warm beige, soft brown, serif + sans pairing, large margins | Premium brand proposals, company profiles, founder decks |
| `modern-illustration-editorial-ppt-skill` | Soft beige, muted blue, dusty orange, refined vector illustration | Product stories, workflows, concept-led explainers |
| `japanese-hand-drawn-editorial-ppt-skill` | Warm paper, ink line art, pale watercolor fills | Human-centred brands, lifestyle narratives, creative process |

Each ships `SKILL.md`, `references/` (style system, slide patterns, ppt-master pipeline,
QA checklist), `assets/` (HTML template, example cover SVGs) and `agents/openai.yaml`
(manifest for non-Claude agents, unused here).

## Corporate skills — what was changed on the way in

The upstream collection needed repairs before Claude Code would load it. `normalize`
steps applied, all recorded in `install-report.corporate.json`:

- **29 skills had unusable frontmatter.** 28 had none at all (the `description:` sat loose in the
  body under a `# Title`) and `check-model` had a `name:` but no description — Claude Code skips
  those entirely. Frontmatter was rebuilt from the folder name plus that loose description line.
  This is most of `02-finance-accounting` (`ic-memo`, `teaser`, `dd-checklist`, `deal-tracker`, …).
- **Block-scalar descriptions** (`description: |` / `description: >`, used by `comps-analysis`,
  `strip-profile`, `brand-voice-enforcement`, `discover-brand`, `guideline-generation`,
  `data-context-extractor`) are parsed as YAML and flattened to a single line.
- **Invalid names** — `kaizen:kaizen` and `ddd:software-architecture` contain a colon, which is
  not a legal skill name. The folder name is now the skill name everywhere, so identity always
  matches the directory.
- **Colliding names** — upstream, four sales skills declared only two names between them
  (`prospect` twice, `call-prep` twice, `account-research` twice). Folder names disambiguate:
  `prospect-apollo` / `prospect-common-room`, `call-prep` / `call-prep-common-room`,
  `account-research` / `account-research-common-room`.
- **One duplicate folder** — `vendor-management` shipped identically under `07-operations` and
  `12-procurement-supply-chain`; installed once.
- **9 skipped** — `skill-creator`, `canvas-design`, `code-review`, `mcp-builder`, `doc-coauthoring`,
  `docx`, `pdf`, `pptx`, `xlsx` are already available in Claude Code. Installing copies would
  shadow the originals (and `code-review` would shadow the `/code-review` command) with nothing gained.

## Updating

Never copy upstream in raw — it ships frontmatter Claude Code cannot load. Re-run the
normalizer, which applies every fix listed above and rewrites `install-report.corporate.json`:

```sh
git clone --depth 1 https://github.com/w95/awesome-claude-corporate-skills.git /tmp/acs
python3 .claude/skills/.tools/normalize-corporate-skills.py /tmp/acs /tmp/acs-normalized
```

Then sync `/tmp/acs-normalized` into `.claude/skills/` and update the pinned commits in the
table at the top.
