# rn-video-card-krugalan

![CI](https://github.com/krugalan/rn-video-card-krugalan/actions/workflows/ci.yml/badge.svg?branch=feature/video-player-card)

A Mini Video Player Card component for React Native, built with Expo SDK 54, TypeScript strict mode, and react-native-reanimated.

---

## How to Run

### Prerequisites

- Node.js 20+
- npm or yarn
- iOS Simulator (Xcode) or Android Emulator, or Expo Go on a physical device

### Setup

```bash
git clone https://github.com/krugalan/rn-video-card-krugalan.git
cd rn-video-card-krugalan
git checkout feature/video-player-card
npm install
```

### Run

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code)
npm start
```

### Verify Code Quality

```bash
npm run type-check   # TypeScript — zero errors
npm run lint         # ESLint — zero errors
npm test             # Jest — 6/6 tests passing
```

---

## Approach

### Architecture

The project follows a **separation of concerns** pattern:

- **`src/types/`** — TypeScript interfaces (`VideoPlayerCardProps`, `ChannelItem`, hook I/O types)
- **`src/hooks/usePlaybackProgress.ts`** — Pure function that calculates `progressPercent` and `timeRemainingLabel`. No UI, no React hooks internally — fully testable with plain Jest.
- **`src/components/VideoPlayerCard/`** — Co-located component, styles, and re-export. Handles only rendering and animations.
- **`src/data/channels.json`** — Mock data source, typed as `ChannelItem[]`, ready to be swapped for an API response.
- **`App.tsx`** — FlatList with production-level optimizations feeding data to `VideoPlayerCard`.

### Component Behavior

- **Collapsed state**: channel name + program title + progress bar only
- **Expanded state**: adds channel logo placeholder, time remaining, and program description (2-line ellipsis)
- **Tap** toggles between states with a 300ms animated transition
- **Progress bar** animates from 0% to the current position on mount (800ms)

### FlatList Optimizations

The feed uses the same optimization strategy as a production streaming app:

| Optimization | Value | Why |
|---|---|---|
| `keyExtractor` (useCallback) | `item.id` | Stable identity for cell recycling |
| `renderItem` (useCallback) | — | Stable reference prevents FlatList from re-rendering all visible items |
| `React.memo` on VideoPlayerCard | — | Skips re-render if props haven't changed |
| `windowSize` | 5 | 2 screens above + viewport + 2 below |
| `maxToRenderPerBatch` | 4 | Balance between scroll fluidity and buffer fill speed |
| `initialNumToRender` | 8 | Fast TTI — fills visible screen + 1 buffer item |
| `removeClippedSubviews` | true | Releases native views outside viewport |

`getItemLayout` is intentionally **not used** because card height is dynamic (expand/collapse animation changes it). This is a conscious tradeoff — see below.

---

## Tradeoffs and Decisions

| Decision | Alternative | Reasoning |
|---|---|---|
| **react-native-reanimated** for animations | Built-in `Animated` API | Reanimated runs animations on the UI thread via worklets. The built-in `Animated` API with `useNativeDriver: false` (required for width/height) runs on the JS thread, which can cause dropped frames during scroll + animation. The exercise requires smooth animations — Reanimated guarantees 60fps. |
| **No `getItemLayout`** on FlatList | Fixed-height cards | Cards change height on expand/collapse. `getItemLayout` assumes fixed height — using it would cause overlapping items when a card expands. We accept slightly slower `scrollToIndex` in exchange for correct animated layout. |
| **`usePlaybackProgress` as pure function** (not a React hook internally) | Using `useMemo` inside | A pure function is simpler to test (plain Jest, no `renderHook`), has zero overhead, and the "hook" naming convention signals it belongs to the hooks layer. If memoization is needed later, `useMemo` can wrap the call at the component level. |
| **Expo managed workflow** | Bare RN / RN CLI | No native modules needed. Expo gives TypeScript, Metro, Jest pre-configured. Zero Xcode/Android Studio setup. |
| **Pressable** over TouchableOpacity | TouchableOpacity | `Pressable` is the official replacement since RN 0.63, with better customization via `style={({ pressed }) => ...}`. |
| **ESLint 8** with `.eslintrc.js` | ESLint 9 flat config | ESLint 9 dropped support for `.eslintrc.*`. The `eslint-plugin-react-native` ecosystem hasn't fully migrated to flat config yet, so v8 provides the most stable setup. |
| **Pre-commit: lint only, no type-check** | lint + tsc in pre-commit | `tsc --noEmit` on the full project takes several seconds. Slow pre-commits discourage frequent commits. Type-check runs in CI where the delay is acceptable. |

---

## How I Used AI

I used **Claude Code** (Claude Opus) as a pair programming partner throughout this project.

### What I prompted

- Initial project scaffolding following an implementation guide I wrote
- Switching animations from built-in `Animated` to `react-native-reanimated` (my decision — the guide recommended against it, but I wanted UI-thread animations)
- Adjusting the props interface to match the exact exercise specification
- Implementing the FlatList with optimizations from another project I built (`streamapp`)
- Debugging dependency issues (`react-native-worklets` missing, ESLint v9 incompatibility, tsconfig `moduleResolution` conflict)

### What AI got right

- Clean separation of types, hook, component, and styles
- JSDoc comments with `@example` blocks
- All 6 unit tests passing on first try
- FlatList optimization pattern adapted correctly from my reference project
- CI/CD workflow and Husky pre-commit setup

### What I had to fix / direct

- **Props interface**: AI initially used `channelLogoUri` and `description` instead of the exercise's `channelInitials`, `channelColor`, and `programDescription`. I caught this and directed the correction.
- **Reanimated**: AI initially followed the guide's recommendation to use built-in `Animated`. I overrode this because I know from experience that `useNativeDriver: false` (required for width/height animations) causes jank on scroll.
- **`react-native-worklets`**: Reanimated v4 requires this as a peer dependency. AI installed Reanimated but missed `worklets` — the bundler error surfaced it and we installed it.
- **ESLint version**: AI installed ESLint 9 which broke `.eslintrc.js` support. I had it downgrade to v8.
- **Container structure**: AI initially used `SafeAreaProvider` with `edges` prop (which doesn't exist on Provider). I corrected the SafeAreaView/Provider hierarchy.
- **Collapsed/expanded state**: AI initially showed time remaining and logo in the collapsed state. The exercise spec says collapsed = "channel name + program title + progress bar only". I directed the restructure.

### My takeaway

AI is excellent at generating boilerplate, applying known patterns, and handling the mechanical parts of setup (CI, lint config, test scaffolding). But it requires **active direction** on architectural decisions, spec compliance, and dependency compatibility. The value is in knowing what to ask for and catching what it gets wrong.

---

## Project Structure

```
src/
├── components/
│   └── VideoPlayerCard/
│       ├── index.tsx              # Public re-export
│       ├── VideoPlayerCard.tsx    # Component with Reanimated animations
│       └── styles.ts             # StyleSheet.create (isolated)
├── data/
│   └── channels.json             # Mock data (future: API response)
├── hooks/
│   ├── usePlaybackProgress.ts    # Playback logic (pure function)
│   └── __tests__/
│       └── usePlaybackProgress.test.ts  # 6 unit tests
└── types/
    └── index.ts                  # ChannelItem, VideoPlayerCardProps, hook I/O
```

---

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android Emulator |
| `npm test` | Run Jest unit tests |
| `npm run lint` | Run ESLint (0 errors required) |
| `npm run type-check` | TypeScript strict check (`tsc --noEmit`) |
