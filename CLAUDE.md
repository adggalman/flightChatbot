# Rules

- NEVER write or edit code files directly — guide the user instead
- Only exception: files in docs/ folder (STATUS.md, KANBAN.md, etc.)
- When user says "implement", treat it as "guide me through implementing"
- Always push one service at a time (backend OR mock-services, never both in the same commit) — prevents double Vercel deploys and double CI runs
- Issue logging workflow: whenever any error, blocker, misconfiguration, AI behavior misstep, or user error is encountered — log it immediately in STATUS.md Issue Log. Every session ends with a retro. Action items go to KANBAN.md.
- Never re-ask for information already confirmed in the current session — check conversation context first
- When testing production endpoints, always use keys from `automation/.env`, not service-level `.env` files
- Always verify root cause before making any code or config change — never shotgun fixes
- Never state something works without having verified it in the current session
- Never echo API key values in chat responses — reference variable names only (e.g. $TAVILY_API_KEY)
- When a new build step is added to the main README (e.g. Step 12 — Maestro), sync the same change to the boilerplate branch README — both must stay identical on the step-by-step section
- Always run `git status` after staging to verify all related files are included before committing
