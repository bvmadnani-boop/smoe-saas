#!/usr/bin/env python3
"""Flatten + normalize awesome-claude-corporate-skills into a Claude Code skills dir."""
import os, re, shutil, sys, json, yaml

SRC = sys.argv[1]
DST = sys.argv[2]

# Skills already shipped with Claude Code / synced from the account — installing a
# second copy would only shadow the originals.
SKIP = {
    "skill-creator", "canvas-design", "doc-coauthoring", "mcp-builder",
    "docx", "pdf", "pptx", "xlsx", "code-review",
}

NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

os.makedirs(DST, exist_ok=True)
report = {"installed": [], "skipped": [], "repaired_frontmatter": [], "renamed": [], "deduped": []}
seen = {}

skills = sorted(
    (os.path.dirname(os.path.join(r, f)), cat)
    for cat in sorted(os.listdir(SRC)) if re.match(r"^\d\d-", cat)
    for r, _, fs in os.walk(os.path.join(SRC, cat)) for f in fs if f == "SKILL.md"
)

for path, cat in skills:
    folder = os.path.basename(path)
    if folder in SKIP:
        report["skipped"].append({"skill": folder, "category": cat, "reason": "already available in Claude Code"})
        continue
    if folder in seen:
        report["deduped"].append({"skill": folder, "category": cat, "kept_from": seen[folder]})
        continue
    seen[folder] = cat

    src_md = os.path.join(path, "SKILL.md")
    text = open(src_md, encoding="utf-8").read()

    def loose_description(s):
        """Upstream sometimes drops the description into the body as a bare line."""
        m = re.search(r"^description:[ \t]*(.+)$", s, re.M)
        return (m.group(1).strip(), s[:m.start()] + s[m.end():]) if m else ("", s)

    if text.startswith("---"):
        end = text.index("\n---", 3)
        fm_raw, body = text[3:end], text[end + 4:]
        fm = yaml.safe_load(fm_raw) or {}          # handles |, > block scalars
        desc = str(fm.get("description") or "").strip()
        old_name = str(fm.get("name") or "").strip()
        if not desc:                                # frontmatter without a description
            desc, body = loose_description(body)
            report["repaired_frontmatter"].append({"skill": folder, "category": cat})
    else:
        # Broken upstream skill: no frontmatter at all.
        desc, body = loose_description(text)
        old_name = ""
        report["repaired_frontmatter"].append({"skill": folder, "category": cat})

    desc = desc.strip().strip('"').strip("'").replace("\n", " ")
    desc = re.sub(r"\s+", " ", desc)
    if not desc:
        desc = f"{folder.replace('-', ' ').capitalize()} workflow."

    # Folder name is the identity: it is unique and always a valid skill name.
    if old_name and old_name != folder:
        report["renamed"].append({"skill": folder, "category": cat, "upstream_name": old_name,
                                  "valid": bool(NAME_RE.match(old_name))})
    assert NAME_RE.match(folder), f"invalid folder name: {folder}"

    out = os.path.join(DST, folder)
    shutil.copytree(path, out)
    with open(os.path.join(out, "SKILL.md"), "w", encoding="utf-8") as f:
        f.write(f"---\nname: {folder}\ndescription: {json.dumps(desc)}\n---\n\n{body.lstrip()}")
    report["installed"].append({"skill": folder, "category": cat})

print(json.dumps({k: (len(v) if k == "installed" else v) for k, v in report.items()}, indent=2)[:4000])
json.dump(report, open(os.path.join(os.path.dirname(DST.rstrip('/')), "install-report.json"), "w"), indent=2)
