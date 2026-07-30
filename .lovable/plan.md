# AI Workplace Productivity Assistant

A tropical-Hawaiian-themed SaaS hub with four AI tools, user accounts, saved outputs, and threaded chat.

## Design direction

- Tropical glassmorphism: blue → purple → pink → green gradient washes, frosted cards, generous rounding, soft ocean-depth shadows.
- Semantic design tokens in `src/styles.css` (light + dark), no hardcoded colors.
- Generated marine illustrations (sea turtle, dolphin, tropical fish, wave, palm leaves) used as subtle decorative accents in the sidebar, dashboard hero, and empty states.
- Collapsible sidebar navigation, responsive down to mobile (grid + `min-w-0` + `shrink-0` header pattern).
- Dark/light toggle persisted per browser.

## Pages

- `/` — public landing: hero, feature overview, sign-in CTA, AI disclaimer.
- `/auth` — email/password + Google sign-in.
- `/dashboard` — productivity overview: counts of saved outputs by tool, recent activity, quick-action cards.
- `/email` — Smart Email Generator: recipient, subject/goal, key points, tone (Formal / Friendly / Persuasive), length.
- `/planner` — AI Task Planner: tasks, timeframe (daily/weekly), working hours, priorities → prioritised schedule.
- `/research` — AI Research Assistant: topic or pasted article → summary, key insights, recommendations.
- `/chat/$threadId` — threaded chat assistant with thread list, new-thread action, per-thread persisted messages.
- `/projects` — Saved Projects: filter by tool, open, edit, copy, delete.

Every tool page: structured form → editable output textarea → Copy / Save / Regenerate. Each output view carries the responsible-AI disclaimer; a fuller disclaimer appears in the footer and on the landing page.

## Backend (Lovable Cloud)

Enable Cloud for accounts + persistence.

Tables (RLS scoped to `auth.uid()`, with grants):
- `profiles` — display name, avatar, created via signup trigger.
- `saved_projects` — `user_id`, `tool` (email/planner/research/chat), `title`, `input` (jsonb), `output` (text), timestamps.
- `chat_threads` — `user_id`, `title`, `updated_at`.
- `chat_messages` — `thread_id`, `role`, `parts` (jsonb), `created_at` (DB-generated uuid PK).

All authenticated app pages live under `src/routes/_authenticated/`.

## AI wiring

- Streaming chat: server route `src/routes/api/chat.ts` using AI SDK + Lovable AI Gateway (`google/gemini-3.6-flash`), `useChat` on the client, AI Elements for the transcript/composer, messages persisted per thread in `onFinish`.
- Email / planner / research: `createServerFn` handlers in `src/lib/ai.functions.ts` calling the gateway, returning text the user can edit before saving.
- Errors surfaced in the UI (rate limit 429, credits 402, validation).

## Technical notes

- TanStack Start file routes; `createFileRoute` strings match filenames.
- `LOVABLE_API_KEY` read only inside server handlers.
- Per-route `head()` metadata with unique titles/descriptions.
- AI Elements installed for chat UI (`conversation message prompt-input shimmer`).
- Saved-project reads/writes through authenticated server functions.

## Build order

1. Cloud + auth + schema, design tokens, illustrations.
2. App shell: sidebar, theme toggle, landing, auth, dashboard.
3. Email, Planner, Research tools with editable output + Copy/Save/Regenerate.
4. Threaded chat assistant.
5. Saved Projects, disclaimers, responsive pass.
