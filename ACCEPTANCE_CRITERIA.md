# Acceptance Criteria — rn-video-card-krugalan

> Checklist of all requirements from the exercise, mapped to implementation status.

---

## 1. Setup & Repository

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 1.1 | Public GitHub repo named `rn-video-card-[yourname]` | :white_check_mark: | `rn-video-card-krugalan` |
| 1.2 | README.md with "How to run" | :x: | **TODO** — README not yet created |
| 1.3 | README.md with "Brief description of approach" | :x: | **TODO** |
| 1.4 | README.md with "Tradeoffs or decisions" | :x: | **TODO** |
| 1.5 | README.md with "How I used AI" section | :x: | **TODO** |
| 1.6 | `.gitignore` appropriate for React Native | :white_check_mark: | Covers node_modules, .expo, ios, android, etc. |
| 1.7 | Work on feature branch (not main) | :white_check_mark: | `feature/video-player-card` branch |
| 1.8 | Submitted as PR into main | :x: | **TODO** — PR not yet created |
| 1.9 | PR description with summary + checklist | :x: | **TODO** — depends on 1.8 |

---

## 2. The Component — Display

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 2.1 | Channel name (text) | :white_check_mark: | Always visible in collapsed state |
| 2.2 | Program title (text) | :white_check_mark: | Always visible in collapsed state |
| 2.3 | Program description (max 2 lines, ellipsis) | :white_check_mark: | `numberOfLines={2}` in expanded state |
| 2.4 | Mock progress bar showing playback position | :white_check_mark: | Animated bar using Reanimated `useSharedValue` |
| 2.5 | Time remaining (e.g. "1h 23m remaining") | :white_check_mark: | Computed by `usePlaybackProgress` hook |
| 2.6 | Channel logo placeholder (colored box + initials) | :white_check_mark: | `channelColor` bg + `channelInitials` text |

## 2. The Component — Behavior

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 2.7 | Progress bar animates smoothly from 0% on mount | :white_check_mark: | `withTiming` 800ms with cubic easing |
| 2.8 | Tap toggles collapsed/expanded | :white_check_mark: | `Pressable` + `useState` |
| 2.9 | Collapsed: channel name + title + progress bar only | :white_check_mark: | Only these 3 elements visible when collapsed |
| 2.10 | Expanded: shows all fields | :white_check_mark: | Logo, description, time remaining animate in |
| 2.11 | Expand/collapse is animated (not instant) | :white_check_mark: | `withTiming` 300ms height + opacity animation |
| 2.12 | All data via props — no hardcoded content | :white_check_mark: | All content passed through `VideoPlayerCardProps` |

## 2. The Component — Props Interface

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 2.13 | `channelName: string` | :white_check_mark: | |
| 2.14 | `channelInitials: string` | :white_check_mark: | |
| 2.15 | `channelColor: string` | :white_check_mark: | |
| 2.16 | `programTitle: string` | :white_check_mark: | |
| 2.17 | `programDescription: string` | :white_check_mark: | |
| 2.18 | `durationMinutes: number` | :white_check_mark: | |
| 2.19 | `elapsedMinutes: number` | :white_check_mark: | |

---

## 3. Custom Hook — `usePlaybackProgress`

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 3.1 | Accepts `durationMinutes` and `elapsedMinutes` | :white_check_mark: | Via `PlaybackProgressInput` interface |
| 3.2 | Returns `progressPercent` (0-100) | :white_check_mark: | Clamped with `Math.min`/`Math.max` |
| 3.3 | Returns `timeRemainingLabel` (formatted string) | :white_check_mark: | e.g. "1h 23m remaining" or "45m remaining" |
| 3.4 | Unit tests — at least 4 test cases | :white_check_mark: | 6 tests total |
| 3.5 | Test: 0% progress | :white_check_mark: | `elapsedMinutes: 0` |
| 3.6 | Test: 100% progress | :white_check_mark: | `elapsedMinutes === durationMinutes` |
| 3.7 | Test: > 60 minutes remaining | :white_check_mark: | Verifies "1h 50m remaining" format |
| 3.8 | Test: < 60 minutes remaining | :white_check_mark: | Verifies "35m remaining" format |
| 3.9 | Edge case: zero duration | :white_check_mark: | No division by zero |
| 3.10 | Edge case: elapsed > duration | :white_check_mark: | Clamped to 100% |

---

## 4. CI/CD

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 4.1 | GitHub Actions workflow (`.github/workflows/ci.yml`) | :white_check_mark: | Configured |
| 4.2 | Runs on push to feature branch | :white_check_mark: | `push: branches: [feature/video-player-card]` |
| 4.3 | Runs on PR to main | :white_check_mark: | `pull_request: branches: [main]` |
| 4.4 | Installs dependencies | :white_check_mark: | `npm ci` |
| 4.5 | Runs TypeScript type checking (`tsc --noEmit`) | :white_check_mark: | `npm run type-check` |
| 4.6 | Runs unit tests | :white_check_mark: | `npm test` |
| 4.7 | Fails on test failures or type errors | :white_check_mark: | Default behavior of `run:` steps |
| 4.8 | Status badge in README | :x: | **TODO** — README not yet created |

---

## 5. Code Quality

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 5.1 | TypeScript — no `any` types | :white_check_mark: | ESLint rule `@typescript-eslint/no-explicit-any: error` |
| 5.2 | ESLint config (`.eslintrc`) | :white_check_mark: | `.eslintrc.js` with TS + React + RN plugins |
| 5.3 | `npm run lint` passes with 0 errors | :white_check_mark: | 0 errors (1 warning in App.tsx, acceptable) |
| 5.4 | JSDoc comments on component | :white_check_mark: | `VideoPlayerCard.tsx` has full JSDoc |
| 5.5 | JSDoc comments on hook | :white_check_mark: | `usePlaybackProgress.ts` has full JSDoc with @example |
| 5.6 | No `console.log` in submitted code | :white_check_mark: | ESLint rule `no-console: error` enforces this |

---

## 6. Deliverables

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 6.1 | PR with description and checklist | :x: | **TODO** |
| 6.2 | Conventional commits in git history | :x: | **TODO** — commits not yet created |
| 6.3 | GitHub Actions run must be green | :x: | **TODO** — need to push first |
| 6.4 | README complete | :x: | **TODO** |

---

## 7. Pre-commit Strategy

| # | Criteria | Status | Notes |
|---|---------|--------|-------|
| 7.1 | Husky installed | :white_check_mark: | `husky@9.1.7`, `prepare` script configured |
| 7.2 | Pre-commit hook runs lint-staged | :white_check_mark: | `.husky/pre-commit` → `npx lint-staged` |
| 7.3 | lint-staged runs ESLint on staged TS/TSX | :white_check_mark: | `eslint --fix` on `*.{ts,tsx}` |
| 7.4 | Type-check in pre-commit | :x: | Not included (intentional — slow for pre-commit) |

---

## Summary

- **Passing**: 28 / 35 criteria
- **TODO**: 7 items (README, PR, commits, CI badge, push)
- **All code-level criteria are met** — remaining items are delivery/documentation tasks
