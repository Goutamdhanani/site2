# Implementation Plan — Premium Glassmorphism Mobile UI Redesign

**Target:** Mobile-only web app (React + TypeScript + Tailwind)
**Agent:** Claude Code
**Source brief:** Premium Glassmorphism UI Redesign PRD (Apple Design Award / Linear / Nothing / Arc Browser tier)

This plan breaks the PRD into an ordered, executable sequence. Each phase has a clear exit condition so the agent can self-check before moving on. Do not skip phases — later phases depend on tokens and primitives built earlier.

---

## Phase 0 — Audit & Setup

1. Inventory the current app: list every screen, every component, every route.
2. Identify mobile viewport target: design for **390×844 (iPhone 14/15 base)**, test down to 360px width, up to 428px. This is a mobile-only rebuild — no desktop breakpoints needed, but keep layout logic width-safe.
3. Confirm stack is present: React, TypeScript, Tailwind, Framer Motion. Install if missing:
   ```
   npm install framer-motion lenis
   ```
   GSAP only if a specific interaction (e.g. scroll-linked liquid transition) can't be done cleanly in Framer Motion.
4. Set up a `design-tokens` folder — this is the single source of truth all components read from. Nothing hardcodes a color, blur, radius, or shadow value outside this file.

**Exit condition:** stack installed, token folder scaffolded, screen inventory written to `/docs/screen-inventory.md`.

---

## Phase 1 — Design Tokens (do this before touching any component)

Create `src/design/tokens.css` (or `tokens.ts` for Tailwind config extension).

### Color tokens
```css
--color-bg-1: #F8F7FF;
--color-bg-2: #ECE8FF;
--color-bg-3: #D8D2FF;
--color-lavender: #C9BFFF;
--color-indigo: #4B3FA8;
--color-ice-blue: #DCEBFF;
--color-frost: #FFFFFF;
--color-mist-purple: #B9AEE8;
--glass-border: rgba(255,255,255,0.18);
--glass-highlight: rgba(255,255,255,0.35);
```

### Elevation / shadow tokens (layered, not single-value)
```css
--shadow-sm: 0 2px 6px rgba(75,63,168,0.06);
--shadow-md: 0 10px 30px rgba(75,63,168,0.10);
--shadow-lg: 0 30px 80px rgba(75,63,168,0.14);
--shadow-card: var(--shadow-sm), var(--shadow-md), var(--shadow-lg);
```

### Radius tokens
```css
--radius-sm: 16px;
--radius-md: 24px;
--radius-lg: 32px; /* primary cards, 28-36px range */
```

### Blur tokens
```css
--blur-sm: 12px;
--blur-md: 24px;
--blur-lg: 40px;
```

### Typography tokens
- Font: `Geist` or `Inter` (SF Pro if licensing allows on iOS webview).
- Weights used: 300, 400, 500, 600, 700 — nothing heavier.
- Type scale (mobile): display 32/38, h1 26/32, h2 20/26, body 16/24, caption 13/18.

### Spacing tokens
- Base unit 4px. Apply **+30% spacing multiplier** vs a typical mobile app scale: 4, 8, 14, 20, 28, 40, 56, 80.

### Motion tokens
```ts
export const springs = {
  soft: { type: "spring", stiffness: 180, damping: 22, mass: 1 },
  snappy: { type: "spring", stiffness: 300, damping: 26 },
  breathing: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};
```
No linear easing anywhere in the app.

**Exit condition:** tokens file compiles, Tailwind config extended with all above as custom values (`bg-lavender`, `rounded-lg`, `shadow-card`, etc.), zero raw hex/px values allowed in component code going forward.

---

## Phase 2 — Core Primitives (build once, reuse everywhere)

Build these as standalone, tested components before any screen work:

1. **`<GlassSurface>`** — the base glass container.
   - `backdrop-filter: blur(var(--blur-md))`
   - `background: linear-gradient(135deg, rgba(255,255,255,.55), rgba(255,255,255,.15))`
   - 1px inner border using `--glass-border`
   - top-edge highlight via inset box-shadow (`inset 0 1px 0 rgba(255,255,255,.4)`)
   - `box-shadow: var(--shadow-card)`
   - optional noise texture overlay (SVG turbulence, ~3% opacity, mix-blend `overlay`)

2. **`<GlassCard>`** — extends `GlassSurface`, adds padding, radius `--radius-lg`, and a hover/press lift (`translateY(-2px)` + shadow increase on `whileTap`/`whileHover` via Framer Motion spring).

3. **`<PrimaryButton>`** — the Von Restorff hero element.
   - Solid gradient fill (indigo → lavender), never glass (it must visually dominate).
   - Min height 56px, full-width on mobile or min 200px — Fitts' Law compliant thumb target.
   - `whileTap={{ scale: 0.97 }}` with `springs.snappy`.
   - Subtle glow (`box-shadow` bloom) that pulses gently when it's the primary CTA on screen.

4. **`<SecondaryButton>`** / **`<GhostButton>`** — glass or borderless, visually quiet, same tap target size (never smaller touch area even if visually lighter).

5. **`<Input>`** — glass surface, floating label, focus state = soft indigo glow ring, no harsh outline.

6. **`<IconOutline>`** wrapper — enforce consistent stroke width (1.5–1.75px), rounded line caps, single icon set (Lucide or Phosphor, outline variant only).

7. **`<BottomNav>`** — fixed, glass, floating (not edge-to-edge — inset with margin so it reads as a floating dock), active item gets the hero treatment (pill background + icon fill), safe-area-inset-bottom padding respected.

8. **`<Modal>`/`<Sheet>`** — bottom sheet on mobile, glass surface, spring-driven slide-up with backdrop blur fade-in, drag-to-dismiss gesture.

9. **`<ProgressRing>`** — breathing animation (scale 1 → 1.02 → 1, 4s loop), used for hero progress state.

10. **`<FloatingShape>`** — decorative ambient blobs for background depth layer (2–3 per screen max, slow parallax drift, `blur-lg`, low opacity, GPU-accelerated `transform` only, never `top/left`).

**Exit condition:** each primitive has a Storybook-style isolated preview screen (or a `/dev/components` route) so visual QA happens before wiring into real screens.

---

## Phase 3 — Depth System

Implement the 7-layer stack on every screen using `z-index` tokens + `transform: translateZ` where parallax is used:

```
z-0   Background gradient (fixed, --color-bg-1 → --color-bg-3)
z-10  Blur/ambient layer (large soft color blobs, blur-lg)
z-20  Floating decorative shapes (parallax on scroll, subtle)
z-30  Glass cards (static content)
z-40  Interactive cards (hover/tap responsive)
z-50  Primary actions (CTA, nav)
z-60  Floating highlights / toasts / active tooltips
```

Build a `<DepthLayer>` layout wrapper that any screen composes with, so this is consistent everywhere instead of ad-hoc per screen.

**Exit condition:** background + ambient layers render behind all screens without being rebuilt per-screen; scrolling a screen shows parallax between layers 10–20.

---

## Phase 4 — Motion & Microinteractions

Wire Lenis for smooth scroll on all scrollable screens.

Apply this motion checklist to **every** interactive element:
- [ ] Buttons: scale + shadow response on press (spring, not linear)
- [ ] Cards: lift on tap-down, settle on release
- [ ] Screen transitions: shared-element style fade + slight scale (never a hard cut, never a slide that feels like default browser nav)
- [ ] Bottom sheet: spring slide, rubber-band drag resistance
- [ ] Icons: subtle rotate/scale on state change (e.g. checkbox tick, like button)
- [ ] Progress indicators: breathing loop, no static bars
- [ ] Background shapes: continuous slow drift (12–20s loop), never distracting
- [ ] Pull-to-refresh (if applicable): liquid/elastic stretch, not a spinner alone

All animation via `transform` and `opacity` only — never animate `width`, `height`, `top`, `left` (layout thrash). Use `will-change: transform` sparingly on actively-animating elements only.

**Exit condition:** record a screen capture of 3 core flows; confirm nothing "jumps" — every state change has a spring-eased in-between.

---

## Phase 5 — Screen-by-Screen Rebuild

Rebuild in this order (highest emotional-impact screens first, per Peak-End Rule):

1. **Onboarding** — first impression. Full-bleed gradient background, floating shapes, single clear CTA, minimal copy, large type.
2. **Dashboard / Home (hero screen)** — apply Von Restorff: one hero card/metric dominates, everything else recedes in glass at lower opacity/scale.
3. **Completion / success states** — this is the memory anchor. Design a dedicated success animation (checkmark morph, confetti-lite via subtle particle burst, or ring completion) — tasteful, not gamified.
4. **Core task screens** (whatever the app's primary loop is — forms, lists, detail views).
5. **Navigation shell** (bottom nav + any drawers).
6. **Settings / secondary screens** — same system, visually quieter, fewer hero moments.
7. **Modals, empty states, error states, notifications/toasts** — apply the same glass + spring language so nothing feels bolted-on.

For each screen, before marking done, run the **Hick's Law check**: count visible interactive choices. If more than ~5-7 primary options are visible at once, group, collapse, or progressively disclose (accordions, sheets, tabs) rather than showing everything flat.

**Exit condition:** every screen in the Phase 0 inventory has been rebuilt using only Phase 1–2 tokens/primitives — no one-off styles.

---

## Phase 6 — Accessibility Pass

- Run contrast checks on all text-over-glass combinations — glass backgrounds must not drop text below WCAG AA (4.5:1 body, 3:1 large text). Adjust glass opacity or add a subtle scrim behind text if needed, rather than lightening text past readability.
- Confirm every tap target ≥ 44×44px (Apple HIG minimum), ideally 48–56px given the Fitts' Law directive.
- Test with `prefers-reduced-motion` — provide a reduced-motion fallback (opacity fades only, no parallax/breathing) that still looks intentional, not broken.
- VoiceOver/TalkBack pass: all icon-only buttons have `aria-label`s.

**Exit condition:** automated a11y scan (axe or Lighthouse a11y) passes with zero critical issues.

---

## Phase 7 — Performance Pass

- Profile `backdrop-filter` usage — this is the most expensive property in this design. Limit stacked blurred layers to what's actually visible in viewport at once (use `content-visibility: auto` or conditional rendering for off-screen glass cards).
- Ensure ambient/floating shapes use `transform` + `opacity` only, and are paused via `IntersectionObserver` when scrolled out of view.
- Lazy-load below-the-fold screens/routes.
- Run Lighthouse mobile audit — target 90+ performance, and specifically check for layout shift (CLS) caused by late-loading blur/gradient assets.
- Confirm 60fps minimum on mid-tier device profile in Chrome DevTools throttling (the PRD says 120fps — treat that as an aspirational ceiling on ProMotion displays, but 60fps consistent is the real bar; don't sacrifice correctness chasing a number most devices can't render anyway).

**Exit condition:** Lighthouse mobile score ≥ 90 across Performance, Accessibility, Best Practices; no visible jank in DevTools frame timeline during scroll + transitions.

---

## Phase 8 — Final Polish Pass

- Add subtle noise/grain texture overlay globally (very low opacity) to prevent flat gradient banding.
- Double-check every corner radius is in the 28–36px range on primary cards, consistent elsewhere.
- Verify color usage — no flat single-color backgrounds anywhere; every background is a layered gradient.
- Verify no component uses a hard 1px solid border anywhere (glass borders only, per token).
- Sanity check against the "would this stop someone scrolling on Awwwards" bar — if a screen looks like a generic SaaS dashboard, revisit it.

**Exit condition:** design review against the PRD's Quality Bar section, screen by screen.

---

## Suggested Agent Working Style

- Work one phase at a time; don't jump to Phase 5 screens before Phase 1–2 tokens/primitives exist — this is what prevents inconsistent one-off styling.
- After each phase, output a short self-review against that phase's exit condition before proceeding.
- Keep a running `CHANGELOG.md` of what was rebuilt, so screens aren't silently skipped.
- If something in the PRD conflicts with real device performance (e.g. too many stacked blurs), flag the tradeoff explicitly rather than silently downgrading the design.

---

## Quick Reference Checklist (paste into Claude Code as a running TODO)

- [ ] Phase 0: Audit + stack setup
- [ ] Phase 1: Design tokens (color, shadow, radius, blur, type, spacing, motion)
- [ ] Phase 2: Core primitives (GlassSurface, GlassCard, buttons, input, nav, sheet, progress ring, floating shapes)
- [ ] Phase 3: 7-layer depth system + DepthLayer wrapper
- [ ] Phase 4: Motion/microinteraction pass on every interactive element
- [ ] Phase 5: Screen rebuilds (onboarding → dashboard → success states → core flows → nav → settings → modals/errors)
- [ ] Phase 6: Accessibility pass (contrast, tap targets, reduced motion, screen reader labels)
- [ ] Phase 7: Performance pass (blur cost, lazy load, Lighthouse ≥ 90)
- [ ] Phase 8: Final polish (noise texture, radius/border/gradient consistency, Awwwards gut-check)