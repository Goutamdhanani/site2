# ODDWEBS — MASTER WEBSITE BUILD PROMPT
> Paste this entire file into Claude Sonnet 4.5. It will generate a complete `index.html` file.

---

## YOUR MISSION

You are a principal engineer and creative director at a world-class digital studio. Build a **single, complete, self-contained `index.html` file** for **oddwebs** — a premium digital agency that builds websites, mobile apps, AI systems, and automation solutions. This site must win Awwwards Site of the Day. Every visitor must feel "I have never seen anything like this" within 3 seconds. Spare nothing. This is your magnum opus.

---

## BRAND IDENTITY

| Property | Value |
|---|---|
| **Name** | oddwebs |
| **Website** | www.oddwebs.com |
| **Instagram** | @oddwebs |
| **Tagline** | "We build digital powerhouses." |
| **Personality** | Bold, innovative, technical, human, results-obsessed |

### Color Palette

```css
:root {
  --bg-primary:    #0C0A1E;   /* deep space navy */
  --bg-surface:    #12102A;   /* card sections */
  --bg-card:       #1A1735;   /* elevated cards */
  --purple:        #7B3FE4;   /* main accent */
  --purple-mid:    #6B21A8;   /* secondary */
  --purple-light:  #A78BFA;   /* glow highlights */
  --cyan:          #06EFC5;   /* electric mint */
  --gold:          #FFD166;   /* metric numbers */
  --coral:         #FF5F57;   /* urgency/error */
  --text-primary:  #F0EEFF;
  --text-secondary:#9B8EC4;
  --text-muted:    #5A5280;
  --border:        rgba(123,63,228,0.2);
}
```

### Fonts (Google Fonts CDN)

```
Syne 700/800        → All headlines, display text
Inter 300/400/600   → Body, UI, subtitles  
JetBrains Mono 400  → Labels, tags, code
```

### Logo (Build as inline SVG — no image file needed)

- **Mark:** "OW" letterform — O as bold circle, W overlapping with sharp geometric cut, gradient fill `#1a1469 → #7B3FE4`
- **Wordmark:** "**odd**webs" — "odd" in Syne 800 `#F0EEFF`, "webs" in Syne 400 `#7B3FE4`
- **Used in:** Navbar (horizontal, 32px mark), Footer (48px mark), Preloader (80px mark centered)

---

## CDN DEPENDENCIES — PASTE ALL INTO `<head>`

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

<!-- Three.js r128 — 3D ENGINE -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- GSAP + all plugins -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js"></script>

<!-- Lenis smooth scroll -->
<script src="https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js"></script>

<!-- VanillaTilt — 3D card hover -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.1/vanilla-tilt.min.js"></script>
```

---

## PSYCHOLOGICAL ARCHITECTURE — FOLLOW THIS FRAMEWORK

Every section must be engineered using the following psychological principles:

### 1. The 50ms Wow Trigger
The brain forms aesthetic judgments before conscious thought. Use **unexpected contrast**: enormous type next to tiny labels, glowing 3D against pitch darkness, absolute stillness broken by sudden motion. The first frame the user sees must be unlike anything they've seen on an agency site.

### 2. Progressive Disclosure (Cognitive Load Theory)
Never show everything at once. Each scroll depth reveals exactly ONE new idea. Information appears only when the eye is ready for it. This is enforced by ScrollTrigger — nothing is visible until it's earned by scrolling.

### 3. Dopamine Loop via Variable Rewards
Each section must have an unexpected micro-reward: a geometry that morphs, a number that counts up, a card that tilts in 3D, a hover that feels magnetic. Unpredictable rewards create stronger engagement than predictable ones (B.F. Skinner variable reward schedule).

### 4. Social Mirror Effect (Cialdini Social Proof)
Real metrics, real logos, real testimonials. The visitor must see that people like them — business founders, startups — have already trusted and succeeded. This removes risk perception.

### 5. Loss Aversion + Urgency (Kahneman)
The cost of NOT acting must feel greater than the cost of acting. Slot counters, response timers, and limited-offer ribbons exploit loss aversion. Place these at every CTA.

### 6. Eye Flow Engineering (F-Pattern + Z-Pattern)
Headlines: top-left. CTAs: top-right and center-bottom. Social proof: mid-left after headline reads. Never put a conversion button where the eye hasn't traveled yet.

---

## SECTION-BY-SECTION BUILD SPECIFICATION

---

### SECTION 0 — PRELOADER (Full Screen, z-index: 9999)

**Duration:** 3.2 seconds total. Runs every page load.

**Visual mechanics:**
- Full screen background `#0C0A1E`
- Center stage: the OW logo SVG mark starts at `scale(0.2) opacity(0)`

**Three.js preloader scene:**
Build a mini Three.js scene ONLY for the preloader:
- Create `THREE.TorusKnotGeometry(1, 0.3, 200, 20)` 
- Material: `THREE.MeshBasicMaterial({ color: 0x7B3FE4, wireframe: true })`
- Render it spinning slowly behind the logo (position: absolute, z-index -1 within preloader)
- Particle ring: 300 particles arranged in a circle, radius 2, slowly rotating

**GSAP Timeline:**
```
t=0.0  → torusKnot: scale 0→1, opacity 0→0.3 (1.0s, power2.out)
t=0.3  → OW mark: scale 0.2→1.0, opacity 0→1 (1.0s, elastic.out(1,0.6))
t=1.0  → "oddwebs" wordmark: y:20→0, opacity 0→1 (0.5s)
t=1.4  → Thin line sweeps left→right in #7B3FE4 across full width (0.6s)
t=1.8  → Counter text: "Crafting your experience..." fades in (0.4s)
t=2.4  → Entire preloader: y:0 → -100vh (0.8s, power4.in)
t=2.8  → Main site: opacity 0→1, y:30→0 (0.6s)
```

**Details:**
- Pulsing glow ring (CSS keyframe) behind logo: scale 1→1.4, opacity 0.5→0, 2s infinite
- Bottom-right: small 4×4 dot grid, opacity 0.12

---

### SECTION 1 — NAVIGATION BAR (Fixed, 72px)

**Container:**
- `position: fixed; top: 0; width: 100%; z-index: 1000`
- Background: `rgba(12,10,30,0.7)` + `backdrop-filter: blur(24px) saturate(200%)`
- Border-bottom: `1px solid rgba(123,63,228,0.15)`
- Transition: background 0.4s on scroll

**Scroll progress bar:**
- `position: absolute; top: 0; left: 0; height: 2px`
- Fill: `linear-gradient(90deg, #7B3FE4, #06EFC5, #FFD166)`
- JS: `width = (scrollY / maxScroll) * 100 + '%'`

**Left:** OW mark (28px) + "oddwebs" wordmark, gap 10px, hover: slight glow

**Center links:** Services · Work · Process · About · Insights · Contact
- Inter 500, 13px, `#9B8EC4`
- Hover: color → `#F0EEFF`, underline that grows `scaleX(0→1)` from left (CSS `::after` transform)
- Active: `#7B3FE4` + 4px dot underneath

**Right:** "Start Your Project →"
- Background: `linear-gradient(135deg, #7B3FE4 0%, #6B21A8 100%)`
- Border: `1px solid rgba(167,139,250,0.4)`
- Border-radius: 8px, padding: 10px 20px
- Hover: `box-shadow: 0 0 30px rgba(123,63,228,0.5)`, scale: 1.04
- Add GSAP magnetic effect (translates toward cursor within 100px)

**On scroll > 80px:**
- Background → `rgba(12,10,30,0.95)`, box-shadow appears

**Right-edge section dots:**
- 7 dots, `position: fixed; right: 20px; top: 50%; transform: translateY(-50%)`
- Each: 7px circle, border `1px solid rgba(123,63,228,0.4)`
- Active: 10px, filled `#7B3FE4`, glow `0 0 10px rgba(123,63,228,0.6)`
- IntersectionObserver updates active dot as sections scroll into view
- Hover: tooltip appears left of dot with section name

---

### SECTION 2 — HERO (100vh)

**This is the most important section. Spend 40% of your code budget here.**

#### Hero Background — Three.js Scene (FULL SCREEN CANVAS)

Build a rich Three.js scene as the hero background:

**Scene setup:**
```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

**3D Objects to build in the hero background:**

**Object A — Central floating icosahedron (wireframe):**
```javascript
const icoGeo = new THREE.IcosahedronGeometry(1.5, 1);
const icoMat = new THREE.MeshBasicMaterial({ 
  color: 0x7B3FE4, 
  wireframe: true,
  transparent: true,
  opacity: 0.15
});
const ico = new THREE.Mesh(icoGeo, icoMat);
// Position: right side, x: 3, y: 0, z: -1
// Rotation: animate x += 0.003, y += 0.005 per frame
```

**Object B — Outer particle sphere:**
```javascript
// 3000 particles arranged in a sphere formation
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(3000 * 3);
for(let i = 0; i < 3000; i++) {
  // Use spherical coordinates with some randomness
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = 2.5 + Math.random() * 0.5;
  positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
  positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i*3+2] = r * Math.cos(phi);
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ 
  color: 0xA78BFA, size: 0.02, transparent: true, opacity: 0.6 
});
const particleSphere = new THREE.Points(particleGeo, particleMat);
// Slowly rotate: y += 0.001 per frame
// Position same center as icosahedron
```

**Object C — Floating torus ring:**
```javascript
const torusGeo = new THREE.TorusGeometry(2.2, 0.015, 8, 100);
const torusMat = new THREE.MeshBasicMaterial({ 
  color: 0x06EFC5, transparent: true, opacity: 0.3 
});
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.rotation.x = Math.PI / 3;
// Animate: rotation.z += 0.002 per frame
```

**Object D — Background star field:**
```javascript
// 5000 tiny stars scattered across scene
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(5000 * 3);
for(let i = 0; i < 5000 * 3; i++) {
  starPos[i] = (Math.random() - 0.5) * 40;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.4 });
const stars = new THREE.Points(starGeo, starMat);
```

**Object E — Mouse-reactive floating particles (foreground):**
```javascript
// 800 particles drifting freely
// On mouse move: particles within 1.5 units of cursor position repel outward
// Strength: (1 - distance/1.5) * 0.05 repel force
// Each particle has randomized drift velocity (sinusoidal)
```

**Mouse parallax:**
```javascript
document.addEventListener('mousemove', (e) => {
  const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  // Camera subtly shifts: camera.position.x → mouseX * 0.3 (lerp, factor 0.05)
  // Icosahedron group rotates: y → mouseX * 0.2, x → mouseY * 0.1 (lerp)
});
```

#### Hero Layout (CSS Grid, two columns, above Three.js canvas)

**Left column (content, 55% width, z-index 10, position relative):**

**1. Eyebrow tag (first to animate in, t=3.0s after preloader):**
```
◆  WEB · MOBILE · AI · AUTOMATION
```
- JetBrains Mono, 11px, letter-spacing: 3px, `#06EFC5`
- Container: border `1px solid rgba(6,239,197,0.3)`, border-radius: 100px, padding: 6px 16px
- Background: `rgba(6,239,197,0.05)`
- GSAP: opacity 0→1, y: -10→0, (0.6s, power2.out)

**2. Main headline (GSAP character-by-character animation):**
```
We build digital
powerhouses.
```
- "We build digital" — Syne 800, 76px (desktop), `#F0EEFF`, line-height: 1.05
- "powerhouses." — Syne 800, 76px, `#7B3FE4`, text-shadow: `0 0 60px rgba(123,63,228,0.4)`
- Split into individual `<span>` characters via JS
- Each char: GSAP y:80→0, opacity:0→1, stagger: 0.018s, ease: power4.out
- Mobile: 42px

**3. Kinetic subtitle (GSAP TextPlugin typewriter):**
```
We design, develop and scale [CYCLING WORD]
```
Cycling words: "Websites." → "Mobile Apps." → "AI Systems." → "Automations." → "Growth Engines."
- Inter 400, 18px, `#9B8EC4`
- Cycling word renders in `#06EFC5` with `|` cursor that blinks
- Each word: types in 0.8s, pauses 1.5s, types out 0.5s, next word

**4. CTA buttons (slide up, stagger 0.1s):**

PRIMARY — "Book a Free Call →"
- Background: `linear-gradient(135deg, #7B3FE4, #6B21A8)`
- Padding: 16px 32px, border-radius: 10px, Inter 600, 16px, white
- Hover: scale 1.04, `box-shadow: 0 0 40px rgba(123,63,228,0.6)`
- GSAP magnetic: translates up to 12px toward cursor

SECONDARY — "View Our Work ▶"
- Border: `1px solid rgba(255,255,255,0.2)`, background: transparent
- Same size, white text
- Hover: border-color `#7B3FE4`, bg `rgba(123,63,228,0.08)`

**5. Social proof micro-strip:**
- 5 avatar circles (CSS-drawn, 32px each, overlap -8px, gradient initials)
- Text: "50+ startups trust oddwebs"
- Stars: ★★★★★ `#FFD166`
- "4.9/5 from 127 reviews"
- Fade in last, Inter 13px

**Right column (3D floating cluster, 45% width, z-index 10):**

Build entirely with HTML/CSS (sits above Three.js canvas):

**Central hub card:**
- 200px × 200px, glassmorphism: `background: rgba(26,23,53,0.7)`, `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(123,63,228,0.4)`, border-radius: 20px
- Box-shadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(123,63,228,0.15)`
- Inside: OW logo mark (60px) + pulsing glow ring behind it
- OW logo glow: `box-shadow: 0 0 40px rgba(123,63,228,0.5)`, scale pulses 1→1.05 CSS keyframe

**5 orbiting service cards (CSS absolute positioned around hub):**
Each card: 140px wide, glassmorphism pill, icon + label
```
Top-left     (x:-140px, y:-80px):  "Websites"  🌐  #06EFC5 icon
Top-right    (x: 140px, y:-90px):  "Mobile Apps" 📱  #A78BFA icon  
Middle-left  (x:-180px, y: 30px):  "AI Systems" ⚡  #FFD166 icon
Bottom-right (x: 150px, y:120px):  "Automations" ⚙️  #7B3FE4 icon
Bottom       (x: -20px, y:190px):  "Dashboards" 📊  #06EFC5 icon
```
- Each card independently floats: CSS `@keyframes float-N { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-14px) } }` with durations: 3.1s, 3.8s, 4.3s, 2.9s, 3.5s
- Cards appear at t=3.5s with GSAP scale 0→1 stagger from center outward
- Mouse move over right column: `perspective: 800px` parent, whole cluster rotates up to ±8deg on both axes (GSAP)

**Hero bottom metrics strip (full width, below both columns):**
```
[📦  120+  Projects Delivered]  |  [😊  98%  Client Satisfaction]  |  [⏱  3+  Years Experience]  |  [🌍  21  Countries Served]
```
- Background: `rgba(18,16,42,0.95)`, border-top: `1px solid rgba(123,63,228,0.2)`
- Numbers: Syne 800, 36px, `#FFD166`
- Labels: Inter 400, 13px, `#9B8EC4`
- GSAP CountTo animation on scroll enter: 0 → final value over 2 seconds

---

### SECTION 3 — CLIENT LOGO MARQUEE

**Height:** 80px, background: `#12102A`
Border: top + bottom `1px solid rgba(123,63,228,0.12)`

**Left label:** `[ TRUSTED BY ]` — JetBrains Mono 10px, `#5A5280`, uppercase

**Infinite marquee (CSS animation):**
8 brand name text-logos, styled differently:
```
Lunacart    Inter 600 weight
DataFlow    Syne 700 weight  
mintpay     Inter 300 lowercase
VOYAGE      JetBrains Mono letter-spaced caps
northbeam   Inter 400 thin
simple.     Syne 400 with period
Reachly     Syne 600
Apex IO     JetBrains Mono
```
- All: `rgba(255,255,255,0.35)`, hover → `rgba(255,255,255,0.85)`, transition 0.3s
- `animation: marquee 22s linear infinite`
- Full set duplicated for seamless loop
- Hover on container: `animation-play-state: paused`

---

### SECTION 4 — PAIN → SOLUTION

**Background:** `#0C0A1E`, padding: 120px 0
**Left accent bar:** `position: absolute; left: 0; height: 100%; width: 3px; background: linear-gradient(#FF5F57, #06EFC5)`

Two columns with center SVG divider line:

**Left — THE PROBLEM (38% width):**
- Label: `[ THE PROBLEM ]` — JetBrains Mono, `#FF5F57`
- Headline: "Tired of agencies that **ghost** you?" — Syne 700, 32px
- Sub: "You've been here before."
- Pain list with animated ✗ icons (SVG, draws in on scroll):
  - ✗ 3-month delays on a 2-week project
  - ✗ Zero communication after invoice paid
  - ✗ Cookie-cutter Elementor called "custom"
  - ✗ Hidden costs at final delivery
  - ✗ Pretty pixels, zero business results

The words "ghost", "overpromise", "disappear" in the headline get a CSS `text-decoration: line-through` that animates in with `clip-path: inset(0 100% 0 0) → inset(0 0% 0 0)` on ScrollTrigger.

**Center divider:** SVG vertical line, gradient stroke `#FF5F57 → #06EFC5`, draws itself via `stroke-dashoffset` animation on ScrollTrigger.

**Right — THE ODDWEBS WAY (38% width):**
- Label: `[ THE ODDWEBS WAY ]` — JetBrains Mono, `#06EFC5`
- Headline: "We are your digital **growth partner.**" — Syne 700, 32px
- Solution list (staggered, each slides in 0.1s after previous):
  - ✓ Live project dashboard from day one
  - ✓ Weekly Loom video updates, always
  - ✓ 100% custom — no templates, ever
  - ✓ Fixed price. Fixed timeline. No surprises.
  - ✓ ROI-obsessed: we track what we build

- GSAP: left column slides from x:-60, right from x:+60, both opacity 0→1, ScrollTrigger `top: 70%`

---

### SECTION 5 — SERVICES

**Background:** `#12102A`, padding: 130px 0

**Section header:**
- Label pill: `[ WHAT WE DO ]` — `#06EFC5`, JetBrains Mono
- Headline: "End-to-end digital solutions that **scale.**" — Syne 800, 52px, "scale." → `#7B3FE4`
- Sub: "From idea to launch and beyond — we are your digital growth partner." — Inter 400, 18px, `#9B8EC4`

**Services 2×3 card grid:**

Every card has:
- Background: `#1A1735`, border: `1px solid rgba(123,63,228,0.18)`, border-radius: 20px, padding: 36px
- VanillaTilt: `{ max: 10, perspective: 1200, glare: true, "max-glare": 0.12, speed: 400 }`
- Top-left: icon in colored circle (40px circle, 20px icon)
- Top-right: large number watermark (Syne 800, 72px, opacity: 0.05)
- Title: Syne 700, 22px, `#F0EEFF`
- Description: Inter 400, 15px, `#9B8EC4`, line-height: 1.7
- Tags: `[tag]` pills in `rgba(123,63,228,0.15)`, JetBrains Mono 11px, `#A78BFA`
- Bottom: "Learn More →" link, `#7B3FE4`, arrow rotates 45deg on hover
- Top accent bar: `height: 3px`, gradient, `scaleX(0→1)` on hover (0.3s)
- Hover: border-color → `#7B3FE4`, `box-shadow: 0 24px 80px rgba(123,63,228,0.18)`, translateY(-4px)

**Card 01 — Web Development**
- Icon: `</>` symbol, circle bg `rgba(6,239,197,0.12)`, icon color `#06EFC5`
- "Lightning-fast websites built for performance and conversion."
- Tags: [Next.js] [React] [Webflow] [SEO-Ready]

**Card 02 — Mobile Development**
- Icon: smartphone SVG, circle bg `rgba(123,63,228,0.12)`, icon `#A78BFA`
- "Beautiful native apps. Seamless cross-platform experiences."
- Tags: [iOS] [Android] [React Native] [Flutter]

**Card 03 — AI & Automation**
- Icon: lightning bolt, circle bg `rgba(255,209,102,0.12)`, icon `#FFD166`
- "Smarter workflows powered by AI. Higher productivity, lower cost."
- Tags: [GPT-4o] [LangChain] [n8n] [Make]

**Card 04 — UI/UX Design**
- Icon: diamond/sparkle, circle bg `rgba(255,95,87,0.12)`, icon `#FF5F57`
- "Interfaces that engage emotionally and convert commercially."
- Tags: [Figma] [Prototyping] [Design Systems] [Branding]

**Card 05 — Dashboards & Analytics**
- Icon: bar chart SVG, circle bg `rgba(6,239,197,0.12)`, icon `#06EFC5`
- "Real-time data intelligence. Decisions driven by truth."
- Tags: [Custom BI] [Data Viz] [Reporting] [APIs]

**Card 06 — Growth & SEO**
- Icon: trending up arrow, circle bg `rgba(255,209,102,0.12)`, icon `#FFD166`
- "Rank higher. Convert better. Grow faster."
- Tags: [Technical SEO] [CRO] [Analytics] [A/B Tests]

**GSAP:** All cards `y:70→0, opacity:0→1`, stagger `0.08s`, ease `power3.out`, ScrollTrigger `top: 85%`.

---

### SECTION 6 — 3D ROTATING SERVICES SHOWCASE

**This is a WOW section unique to this site. No other agency has this.**

**Background:** `#0C0A1E`, height: `100vh`, overflow: hidden

**Concept:** A large Three.js scene occupies the right 60% of this section. The left 40% has a vertical list of 4 services. As the user clicks/hovers each service, the 3D model on the right morphs to represent it.

**Three.js scene — 4 morphing 3D objects:**

```javascript
// Build 4 geometries:
const geometries = [
  new THREE.IcosahedronGeometry(1.8, 2),           // Web: smooth sphere-ish
  new THREE.CylinderGeometry(0, 1.5, 3, 8, 1),     // Mobile: device-like prism
  new THREE.TorusKnotGeometry(1.2, 0.4, 128, 16),  // AI: complex knot
  new THREE.OctahedronGeometry(1.8, 0)              // Automation: mechanical diamond
];

// Material: wireframe with electric purple
const mat = new THREE.MeshBasicMaterial({
  color: 0x7B3FE4,
  wireframe: true,
  transparent: true,
  opacity: 0.5
});

// On service hover → morph between geometries using GSAP:
// gsap.to(mesh.geometry, { ... }) — use morphTargets OR swap geometry with scale 0→1
// Add a point light that orbits the mesh: 
//   pointLight.position.x = Math.sin(t) * 3
//   pointLight.position.y = Math.cos(t) * 3
```

**Surrounding each 3D model:**
- 200 particles orbit at radius 2.5, rotate in same direction as model
- Torus ring (thin) rotates on opposite axis at half speed
- On mouse move: model tilts toward mouse (camera parallax)
- Line connecting central mesh to each orbiting particle (THREE.Line, low opacity)

**Left side service tabs:**
```
01  Web Development     → activates Icosahedron
02  Mobile Apps         → activates Prism
03  AI & Automation     → activates TorusKnot
04  Growth Systems      → activates Octahedron
```
- On hover/click: GSAP morphs 3D model (scale 0→1 on new, 1→0 on old)
- Active tab: left border 3px `#7B3FE4`, headline color `#F0EEFF`
- Background of active: `rgba(123,63,228,0.06)`

---

### SECTION 7 — SOCIAL PROOF & METRICS

**Background:** `#12102A`, padding: 120px 0

**Three.js subtle background for this section:**
- 1500 particles drifting upward slowly (velocity y: +0.001/frame)
- When they reach top, reset to bottom
- Color: mix of purple and cyan, opacity 0.3
- This makes the section feel "alive" without distracting

**Animated metric counters (4 cards, 2×2 grid or row):**

Each counter card:
- Background: `#1A1735`, left border: `3px solid #7B3FE4`, border-radius: 12px, padding: 28px 32px
- Number: Syne 800, 56px, `#FFD166` — animates from 0 to value on ScrollTrigger enter
- Label: Inter 400, 14px, `#9B8EC4`

```
₹4.2Cr+    Revenue Generated for Clients
47+        Projects Delivered
4.9 ★      Average Client Rating
18         Industries Served
```

**Featured case study highlight card (center, wider):**
- Dark gradient: `linear-gradient(135deg, #12102A, #1A1735)`
- Border: `1px solid rgba(6,239,197,0.3)`, border-radius: 16px
- Label: `[ FEATURED IMPACT ]` — cyan
- Project: DataFlow — SaaS Analytics Platform
- Big metric: "45%" in Syne 800, 96px, `#06EFC5`
- Caption: "Churn rate reduced in 90 days"
- Animated bar: CSS width `0%→45%` with `2s ease-out` on ScrollTrigger
- VanillaTilt on this card

**Review badges (right side):**
- Google: ★★★★★ 4.9/5 — yellow stars, rounded badge
- Clutch badge: "Top Agency India 2024"
- 3 mini testimonial pills stacked, each with avatar + 1-line quote

---

### SECTION 8 — CASE STUDIES (GSAP Horizontal Scroll)

**Heading:**
- Label: `[ FEATURED CASE STUDIES ]`
- Headline: "Real results. Real **impact.**" — "impact." in `#7B3FE4`

**GSAP Pin + Horizontal Scroll:**
```javascript
gsap.to(".case-track", {
  x: () => -(document.querySelector('.case-track').scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".case-section",
    start: "top top",
    end: () => "+=" + document.querySelector('.case-track').scrollWidth,
    scrub: 1,
    pin: true,
    anticipatePin: 1
  }
});
```

**4 case study cards (each 400px × 540px):**

**Card 1 — LunaCart**
- Category pill: `[E-COMMERCE]` — coral background
- Background: `linear-gradient(145deg, #1A0A0A, #2A0A14)` with subtle red tint
- Metric: "320%" — Syne 800, 96px, `#FFD166`
- Sub: "Revenue Growth in 6 months"
- Description: "We rebuilt their entire e-commerce platform on Next.js with custom checkout flows and abandoned cart AI."
- Mock visual: CSS-drawn browser window with purple UI wireframe inside
- → "View Case Study" link

**Card 2 — DataFlow**
- Category pill: `[SAAS PLATFORM]`
- Background: `linear-gradient(145deg, #0A0A2A, #0A1A2A)` blue tint
- Metric: "45%" — Syne 800, 96px, `#06EFC5`
- Sub: "Churn Rate Reduced"
- Mock visual: CSS bar chart (animated bars grow on scroll) inside a card

**Card 3 — Payze**
- Category pill: `[FINTECH APP]`
- Background: `linear-gradient(145deg, #1A0A2A, #0A0A1E)` purple tint
- Metric: "$2.4M" — Syne 800, 96px, `#A78BFA`
- Sub: "Funding Secured Post-Launch"
- Mock visual: CSS phone frame with transaction UI inside

**Card 4 — VoyageAI**
- Category pill: `[AI AUTOMATION]`
- Background: `linear-gradient(145deg, #0A1A0A, #0A2A1A)` green tint
- Metric: "80%" — Syne 800, 96px, `#06EFC5`
- Sub: "Manual Work Eliminated"
- Mock visual: CSS flow diagram (nodes connected by lines)

**All cards:**
- Border-radius: 24px, border: `1px solid rgba(255,255,255,0.07)`
- VanillaTilt: `{ max: 8, glare: true, "max-glare": 0.08 }`
- Hover: card lifts `translateY(-8px)`, border glows in card's accent color

**Horizontal progress bar** below cards showing scroll position through case studies.

---

### SECTION 9 — HOW WE WORK (PROCESS)

**Background:** `#12102A`, padding: 130px 0

**Section header:**
- Headline: "From idea to launch — **in 4 steps.**"

**Process as horizontal timeline with SVG draw animation:**

SVG `<line>` connects all 4 step circles (full width minus margins).
GSAP draws it: `stroke-dashoffset: totalLength → 0` as ScrollTrigger scrubs.

**4 steps (each triggers sequentially as SVG line reaches it):**

```
STEP 1 → DISCOVER
Week 1
Icon: magnifying glass SVG in #7B3FE4 circle (56px)
"Deep-dive into your goals, users, and market position."
"We ask the questions other agencies skip."

STEP 2 → DESIGN
Week 2
Icon: diamond/sparkle SVG in #06EFC5 circle
"High-fidelity Figma prototypes. You approve every pixel."
"Unlimited revisions until it's exactly right."

STEP 3 → BUILD
Weeks 3–5
Icon: code bracket SVG in #FFD166 circle
"Production-grade code. Daily GitHub commits."
"Staging environment so you see progress in real time."

STEP 4 → LAUNCH
Week 6+
Icon: rocket SVG in #A78BFA circle
"Deploy, monitor, iterate. We don't disappear post-launch."
"Growth support and analytics built in from day one."
```

**When SVG line reaches each step circle:**
- Circle: scale 0.5→1, opacity 0→1 (GSAP)
- Outer glow ring pulses: `box-shadow: 0 0 0px → 0 0 20px rgba(col,0.6)`, CSS keyframe
- Card below slides up: `y:30→0, opacity:0→1`

**Bottom proof bar:**
```
[ ⚡ Avg. 6-week delivery ] [ 💰 Fixed price always ] [ ✓ 100% satisfaction guarantee ]
```

---

### SECTION 10 — TESTIMONIALS

**Background:** `#0C0A1E`, padding: 100px 0

**Header:**
- Headline: "Don't take our word for it."
- Sub: "Here's what founders say after working with us."

**Three.js background for this section:**
- 800 particles in slow gentle drift, colours in purple only
- Very low opacity (0.15) — purely atmospheric

**3-column testimonial grid, VanillaTilt on each:**

**Card 1:**
```
Avatar: "RK" initials, 52px circle, gradient bg #7B3FE4→#A78BFA
Name: Rahul Kumar — Founder, LunaCart
Stars: ★★★★★
Quote: "oddwebs didn't just build our website — they rebuilt our 
        entire revenue engine. 320% growth in 6 months speaks 
        for itself. I recommend them to every founder I meet."
```

**Card 2 (featured — slightly larger, stronger glow):**
```
Avatar: "AM" initials, 52px circle, gradient bg #06EFC5→#A78BFA
Name: Ananya Mehta — CEO, DataFlow
Stars: ★★★★★
Quote: "I've worked with 4 agencies before oddwebs. The difference? 
        They actually care about your business outcomes, not just 
        delivering files. Our churn dropped 45% and our revenue grew."
```

**Card 3:**
```
Avatar: "VP" initials, 52px circle, gradient bg #FFD166→#FF5F57
Name: Vikram Patel — Co-Founder, Payze
Stars: ★★★★★
Quote: "They built our fintech MVP in 5 weeks flat. It directly 
        helped us close our $2.4M seed round. The ROI of hiring 
        oddwebs was immeasurable."
```

**All cards:**
- Background: `#1A1735`, border: `1px solid rgba(123,63,228,0.2)`, border-radius: 20px, padding: 36px
- Large decorative " mark: Syne 800, 140px, `rgba(123,63,228,0.07)`, `position: absolute; top: 20px; right: 20px`
- Hover: border → `#7B3FE4`, quote text → `#F0EEFF`, translateY(-4px)
- GSAP: `opacity:0, y:50 → visible`, stagger 0.12s

---

### SECTION 11 — FINAL CTA (Full Screen Close)

**Height:** `100vh`
**Background:** `#0C0A1E`

**Three.js scene for CTA — most dramatic on page:**

```javascript
// Large rotating wireframe sphere (slow, majestic)
const sphereGeo = new THREE.SphereGeometry(4, 32, 32);
const sphereMat = new THREE.MeshBasicMaterial({ 
  color: 0x7B3FE4, wireframe: true, transparent: true, opacity: 0.08 
});
const bigSphere = new THREE.Mesh(sphereGeo, sphereMat);
// Center of scene, rotation: y += 0.002, x += 0.001

// Inner glowing core (small dense icosahedron)
const coreGeo = new THREE.IcosahedronGeometry(0.8, 3);
const coreMat = new THREE.MeshBasicMaterial({ color: 0x06EFC5, wireframe: true, transparent: true, opacity: 0.6 });
const core = new THREE.Mesh(coreGeo, coreMat);
// rotation faster: y += 0.01, x += 0.007

// 2000 particles orbiting in elliptical path
// Animated using: sin(t + offset) * rx, cos(t + offset) * ry pattern

// Two large torus rings at 90deg to each other, slowly rotating opposite directions
const ring1 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.02, 8, 100), mat);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5, 0.02, 8, 100), mat2);
ring2.rotation.x = Math.PI / 2;
```

**Content (centered, z-index: 10, position: relative):**

- Label: `[ LET'S BUILD SOMETHING AMAZING ]` — JetBrains Mono, `#06EFC5`, letter-spacing 3px
- Headline: "Ready to launch your next **big idea?**" — Syne 800, 64px, "big idea?" → purple gradient
- Sub: "Book a free 30-minute call with our experts. No pitch decks. No fluff. Just honest advice." — Inter 18px, `#9B8EC4`

**CTA PRIMARY — "Schedule Free Call →"**
- Large pill button, padding: 20px 48px, Syne 700, 18px
- Background: `linear-gradient(135deg, #7B3FE4, #06EFC5)`
- Box-shadow: `0 0 60px rgba(123,63,228,0.4)`
- On hover: shadow intensifies, scale 1.05, inner glow
- GSAP magnetic: up to 18px translation toward cursor

**CTA SECONDARY — "Or Chat on WhatsApp 💬"**
- Text link, `#06EFC5`, Inter 500, 16px
- Underline grows on hover
- href: `https://wa.me/+91XXXXXXXXXX?text=Hi!%20I%20want%20to%20discuss%20a%20project%20with%20oddwebs.`

**Below CTAs:**
- Urgency badge: `⚡ Only 3 client slots left this month` — `#FF5F57` pill, `rgba(255,95,87,0.12)` bg
- Response time: "Typically replies within 2 hours" — `#5A5280`, Inter 13px

**Contact strip (absolute bottom of CTA section):**
```
📧 hello@oddwebs.com   |   📱 WhatsApp Us   |   🌐 www.oddwebs.com   |   📸 @oddwebs
```

---

### SECTION 12 — FOOTER

**Background:** `#080614` (darkest on page)
**Border-top:** `1px solid rgba(123,63,228,0.2)`
**Padding:** 80px 0 40px

**4-column layout:**

**Col 1 — Brand:**
- OW logo mark (44px) + "oddwebs" wordmark, stacked
- "Building digital powerhouses for founders and brands worldwide."
- Inter 400, 14px, `#5A5280`
- Links: [IG @oddwebs] [www.oddwebs.com]
- Copyright: "© 2025 oddwebs. All rights reserved."

**Col 2 — Services:**
Web Development · Mobile Development · AI & Automation · UI/UX Design · Dashboards · Growth & SEO

**Col 3 — Company:**
About · Our Work · Process · Insights · Careers · Contact

**Col 4 — Get In Touch:**
- "hello@oddwebs.com" (clickable mailto)
- "Book a Free Call →" — pill button (smaller, outline style)
- "Reply within 2 hours"
- Social icons: Instagram, LinkedIn, Twitter/X (SVG icons inline)

**All footer links:**
- Hover: color → `#7B3FE4`, `transform: translateX(4px)`, transition 0.2s

**Footer bottom strip:**
- "Made with ❤️ by oddwebs — the odd ones who build powerhouses."
- Right: Privacy Policy · Terms

---

## GLOBAL INTERACTIONS (Apply to entire page)

### Custom Cursor (Desktop only)
```javascript
// Two-part cursor:
// 1. Follower (outer): 36px circle, border: 1.5px solid rgba(123,63,228,0.7), lag: 0.15s
// 2. Dot (inner): 6px circle, background: #7B3FE4, instant

// States:
// default     → outer ring normal, inner dot
// link hover  → outer expands to 52px, fills rgba(123,63,228,0.1)
// CTA hover   → outer becomes rectangle with "OPEN" text, rotates, #06EFC5
// dragging    → inner dot stretches scaleX(1.8) to ellipse
// hide on mobile (touch)
```

### GSAP Magnetic Buttons
```javascript
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: relX * 0.35, y: relY * 0.35, duration: 0.6, ease: 'power4.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
  });
});
```

### Lenis Smooth Scroll
```javascript
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: false
});
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// All anchor scrolls via: lenis.scrollTo('#section', { offset: -72, duration: 1.4 })
```

### FOMO Toast Notifications
```javascript
const toasts = [
  { text: "🔥 Priya from Mumbai just booked a consultation", time: "2 mins ago" },
  { text: "⚡ Rohan from Delhi started a project", time: "47 mins ago" },
  { text: "🎉 DataFlow renewed for year 3 with oddwebs", time: "Today" },
  { text: "📱 A founder from Bangalore is viewing Mobile Apps", time: "Now" },
  { text: "🚀 2 consultation slots remaining this month", time: "Urgent" }
];

// Rotate every 8 seconds:
// Build toast element → gsap.fromTo(toast, {y:100,opacity:0}, {y:0,opacity:1,duration:0.5})
// After 4 seconds: gsap.to(toast, {y:100,opacity:0,duration:0.5})
// Position: fixed, bottom: 24px, left: 24px, z-index: 500
```

### All Section Reveal Animations
```javascript
// Every section heading (h2):
gsap.fromTo(el, { y: 50, opacity: 0 }, {
  y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
  scrollTrigger: { trigger: el, start: 'top 80%' }
});

// Every card:
gsap.fromTo(cards, { y: 70, opacity: 0 }, {
  y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
  stagger: 0.08, scrollTrigger: { trigger: cards[0], start: 'top 85%' }
});
```

---

## MOBILE RESPONSIVENESS

**Breakpoints:**
- `1200px+` — full desktop layout
- `768px–1199px` — tablet: hero single column, 2-col services
- `< 768px` — mobile

**Mobile changes:**
- Headline: 40px (from 76px)
- Hero: single column, right 3D cluster moves below
- Services: 1 column
- Process: vertical timeline (not horizontal)
- Case studies: `overflow-x: scroll; scroll-snap-type: x mandatory`
- Custom cursor: hidden
- Three.js: particle count halved, mobile check `if('ontouchstart' in window)`
- VanillaTilt: `{ "mobile": false }` to disable on touch
- Navigation: hamburger menu
- `prefers-reduced-motion: reduce` → disable all animations, show static

---

## PERFORMANCE & QUALITY REQUIREMENTS

- All Three.js scenes use `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — never more
- Three.js `dispose()` geometries and materials when not in view (use IntersectionObserver)
- Images: none needed — all visuals are CSS or Three.js
- `will-change: transform` only on actively animating elements
- `requestAnimationFrame` loop only when canvas is in viewport
- Smooth 60fps target throughout
- WebGL fallback: if `!renderer.capabilities.isWebGL2`, show gradient background instead

---

## OUTPUT REQUIREMENT

Generate a **single complete `index.html` file**. Zero external files. Zero build step. Open in any browser and it works. All CSS inside one `<style>` block in `<head>`. All JavaScript inside one `<script>` block before `</body>`. Use only the CDN links specified above.

This is a $80,000 website. Build it like one.
