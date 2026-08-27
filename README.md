# AI WorkFlow

A modern, responsive AI-powered workplace productivity platform built with [TanStack Start](https://tanstack.com/start), [React 19](https://react.dev), and [Tailwind CSS v4](https://tailwindcss.com).

AI WorkFlow brings five everyday workplace tasks into one clean dashboard: drafting email, summarising meetings, planning tasks, researching decisions, and chatting with an AI workplace assistant.

![AI WorkFlow preview](https://workflow-ace-65.lovable.app/og-image.png)

## Features

| Tool | What it does |
| --- | --- |
| **Smart Email Generator** | Turn a purpose, key points and tone into a polished email with a ready-to-use subject line. |
| **Meeting Notes Summarizer** | Convert raw meeting notes into an executive summary, decisions, owned action items and follow-up questions. |
| **AI Task Planner** | Prioritise your day or week with a ranked schedule, reasoning for each slot and workload warnings. |
| **AI Research Assistant** | Produce a structured briefing with insights, benefits, risks, recommendations and further questions. |
| **AI Workplace Assistant** | Chat in a single conversation thread that persists locally and can hand off into any tool. |

## Tech stack

- **Framework:** TanStack Start v1 (full-stack React, SSR/SSG, server functions)
- **Build tool:** Vite 7
- **UI:** React 19, Radix UI primitives, Tailwind CSS v4, shadcn/ui components
- **AI layer:** Lovable AI Gateway + `ai` SDK with structured object output
- **State:** Browser-local storage via custom hooks (`localStorage`)
- **Language:** TypeScript

## Project structure

```text
src/
├── assets/               # Brand logo and favicon
├── components/           # Shared UI components and AI Elements chat UI
├── lib/
│   ├── ai-gateway.server.ts   # Secure server-side AI gateway helper
│   ├── ai-run.server.ts       # AI SDK execution helpers
│   ├── ai.functions.ts        # TanStack Start server functions
│   ├── prompts.server.ts      # Structured prompts for each AI tool
│   └── workspace-store.ts     # Local browser state (tasks, activity, settings)
├── routes/               # TanStack Start file-based routes
│   ├── index.tsx         # Dashboard
│   ├── email.tsx         # Smart Email Generator
│   ├── meetings.tsx      # Meeting Notes Summarizer
│   ├── tasks.tsx         # AI Task Planner
│   ├── research.tsx      # AI Research Assistant
│   ├── assistant.tsx     # AI Workplace Assistant
│   ├── settings.tsx      # User preferences
│   └── api/chat.ts       # Streaming chat endpoint
├── styles.css            # Design tokens, colours, typography
└── router.tsx            # TanStack Router setup
```

## Getting started

You need [Node.js](https://nodejs.org/) (v20 or later) and a package manager such as npm or bun.

```bash
# 1. Clone the repository
git clone <repository-url>
cd ai-workflow

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The dev server runs at `http://localhost:8080`.

## Environment variables

AI calls are routed through the Lovable AI Gateway. The only required secret is:

| Variable | Purpose |
| --- | --- |
| `LOVABLE_API_KEY` | Authenticates server-side AI requests via the Lovable AI Gateway |

No third-party AI provider keys are required. Create a `.env` file at the project root:

```bash
LOVABLE_API_KEY=your-lovable-api-key
```

> **Note:** `LOVABLE_API_KEY` is server-only and is never exposed to the browser.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Design principles

- **One surface, five tools.** Every feature lives inside the same dashboard and shares context and history.
- **Anti-fabrication prompts.** Each AI prompt instructs the model to use only the supplied input, flag missing information, and avoid invented facts.
- **Browser-first privacy.** Tasks, settings and chat history are stored in `localStorage` by default; no account is required.
- **Semantic tokens.** Colours, spacing and shadows are defined as CSS custom properties in `src/styles.css`, keeping the UI consistent and themeable.

## Roadmap / possible next steps

- Add user accounts and cloud persistence with Lovable Cloud.
- Export generated emails and meeting summaries to PDF or Markdown.
- Calendar integration for task deadlines.
- Team workspaces with shared meeting notes and task assignments.

## License

This project is owned by its creator. Built and shipped with [Lovable](https://lovable.dev).
