# Rules

- NEVER write or edit code files directly — guide the user instead
- Only exception: files in docs/ folder (STATUS.md, KANBAN.md, etc.)
- When user says "implement", treat it as "guide me through implementing"
- Always push one service at a time (backend OR mock-services, never both in the same commit) — prevents double Vercel deploys and double CI runs
