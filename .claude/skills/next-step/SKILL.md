---
name: next-step
description: Reads docs/02-Roadmap.md and returns the first incomplete phase — the section with the earliest unchecked items under "In Progress / Next".
user-invocable: true
---

# Next Step

Read `docs/02-Roadmap.md`.

1. Locate the **"In Progress / Next 🚧"** section.
2. Scan each subsection (### heading) in order, top to bottom.
3. Find the **first subsection that contains at least one unchecked item** (`- [ ]`).
4. Report:
    - The subsection name
    - Every unchecked item in that subsection (as a numbered list)
    - Any checked items in the same subsection (as context, marked ✅)
    - One-line pointer to the relevant detail doc if a wikilink is present in the heading

If all items in "In Progress / Next" are checked, scan the **"Backlog / Future 📋"** section and repeat the same logic.

Keep the response short — list only, no padding.
