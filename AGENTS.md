# AGENTS.md

Guidance for coding agents working on **repofolio** (NEXUS portfolio frontend).

## Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind 4 · R3F / Three.js · GSAP · Lucide · oxlint

## Layout

```
src/
  pages/          page composition (Portfolio)
  components/     UI by section: about, activity, contact, hero, layout,
                  navigation, repository, security-lab, technology, terminal, ui
  three/          R3F scenes (lazy-load these)
  animations/     GSAP helpers; import runtime from @animations/register
  hooks/          data + capability hooks
  context/        PortfolioProvider (filter, hover, selected repo)
  services/       data access — UI must not import @data directly
  data/           mock data (profile, activity, tech). Repositories load from the backend through @services
  types/          shared domain types
  lib/            cx, prng
```

## Imports

Use path aliases. Keep `./` only for files in the **same folder**.

| Alias | Resolves to |
|---|---|
| `@ui` | `src/components/ui` |
| `@layout` | `src/components/layout` |
| `@hero` | `src/components/hero` |
| `@about` | `src/components/about` |
| `@activity` | `src/components/activity` |
| `@contact` | `src/components/contact` |
| `@navigation` | `src/components/navigation` |
| `@repository` | `src/components/repository` |
| `@security-lab` | `src/components/security-lab` |
| `@technology` | `src/components/technology` |
| `@terminal` | `src/components/terminal` |
| `@hooks` | `src/hooks` |
| `@lib` | `src/lib` |
| `@animations` | `src/animations` |
| `@three` | `src/three` |
| `@context` | `src/context` |
| `@services` | `src/services` |
| `@data` | `src/data` |
| `@pages` | `src/pages` |
| `@/` | `src/` — use for types: `@/types/repository` |

```ts
import { Button } from '@ui/Button'
import { useProfile } from '@hooks/useProfile'
import type { Repository } from '@/types/repository'
import { HeroTerminal } from './HeroTerminal' // same folder only
```

Do **not** alias `@types` (clashes with `node_modules/@types`). Do **not** use a bare `@` alias (clashes with packages like `@react-three/fiber`). Keep `vite.config.ts` aliases and `tsconfig.app.json` `paths` in sync. TypeScript 6: no `baseUrl`; path values stay relative (`./src/...`).

Lazy scenes use the same aliases:

```ts
const SecurityScene = lazy(() =>
  import('@three/SecurityScene').then((module) => ({ default: module.SecurityScene })),
)
```

## Data

`components` / `pages` → `@hooks` → `@services` → backend `/portfolio`. Mock files in `data/` are unused leftovers.

## UI / motion

- Functional components, named exports (except `App` default).
- Classes via `cx()` from `@lib/cx`. Theme tokens: `void`, `surface`, `panel`, `raised`, `line`, `muted`, `fog`, `neon`, `cyan`, `warn`, `alert`.
- GSAP only through `@animations/register`. Honor `useReducedMotion()`.
- Heavy R3F graphs: `lazy` + `Suspense` + `SceneCanvas`. Skip 3D on small screens when the section already does.
- Prefer existing `Button`, `Section`, `StatusDot`, `HudCorners`, `AnimatedCounter`.

## Commands

```bash
npm run dev
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

Do not commit `.env` or secrets. HTTP access lives in `@services` (`api.ts`). UI components must not fetch directly.
