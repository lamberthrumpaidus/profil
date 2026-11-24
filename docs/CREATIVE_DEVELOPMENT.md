# Creative Development Architecture — Lamberth Rumpaidus

> Engineering reference for the existing portfolio. This file documents architecture and implementation; the public `README.md` remains a concise portfolio introduction.

## Goal and approach

Create a premium creative portfolio without sacrificing readability, mobile performance, accessibility, or the existing Netlify deployment. This repository remains a **progressively enhanced static HTML + JavaScript application**. React Three Fiber would require a new React/Vite application and a heavier migration; it is not a prerequisite for high-quality creative WebGL.

## Application layout

```text
index.html
assets/
  css/
    style.css                 existing content and design
    immersive.css             original 3D environment
    experience.css            projects/documentation
    final-clean.css           minimal navigation/layout
    creative.css              new creative enhancement layer
  js/
    data.js                   portfolio data
    app.js                    navigation, terminal, cards, music
    scene.js                  persistent hero Three.js world
    vault-final.js            key/lock storytelling Three.js
    experience.js             progressive documentation case study
    assistant.js              Lam AI: local or configured Netlify function
    creative.js               GSAP, Lenis, transitions, SFX, analyser
    shader-cards.js           lazy WebGL hover shader, one shared context
    lib/three.module.js       existing vendored Three.js runtime
netlify/functions/chat.mjs    server-side AI endpoint, no exposed API key
docs/CREATIVE_DEVELOPMENT.md  this reference
```

## Dependency strategy

**Live website:** The current Netlify site serves static files. GSAP and ScrollTrigger load from version-pinned CDN scripts; Lenis loads from a version-pinned CDN; and the existing vendored Three.js module is reused. There is no hard dependency on `npm run build`; a CDN outage falls back to native scrolling and basic CSS interactions.

Suggested dependencies **only if migrating to Vite**:

```bash
npm install three gsap@3.15.1 lenis@1.3.27
npm install -D vite typescript
```

Minimal `package.json` for an **optional future migration** (not required by the current Netlify build):

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.181.0",
    "gsap": "3.15.1",
    "lenis": "1.3.27"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "typescript": "^5.0.0"
  }
}
```

Do **not** simply add this `package.json` to the current production root: migrating bundling requires checking source imports, Netlify's publish directory, and dependencies before deployment.

## 1. Immersive Three.js and shader pipeline

- The hero garden uses Three.js and links pointer position to camera movement and lighting.
- The key/lock is its own Three.js canvas with mechanical staged unlocking, light response, and a secondary portal halo.
- Expensive WebGL loops pause when not intersecting the viewport or when the document is hidden.
- The project shader loads **only on hover on desktop fine-pointer devices**, reuses one renderer, and gracefully falls back to the native `img`. It maps thumbnail aspect ratios without distorting screenshots.
- Adaptive pixel ratios on smaller screens are a practical form of level-of-detail reduction. The key portal includes a `THREE.LOD` mesh for close/far complexity.

Example of the project fragment shader core (the complete working shader lives in `assets/js/shader-cards.js`):

```glsl
vec2 d = uv - mouse;
float ripple = sin(length(d) * 29.0 - time * 5.7)
             * exp(-length(d) * 12.0) * 0.017 * strength;
vec2 normal = normalize(d + vec2(0.00001));
float r = texture2D(image, uv + normal * (ripple + 0.005 * strength)).r;
float g = texture2D(image, uv + normal * ripple).g;
float b = texture2D(image, uv + normal * (ripple - 0.005 * strength)).b;
gl_FragColor = vec4(r, g, b, 1.0);
```

## 2. GSAP ScrollTrigger + Lenis

```js
gsap.registerPlugin(ScrollTrigger);
const lenis = new Lenis({ duration: 1.12, autoRaf: false, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(time => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
gsap.fromTo('.section-title', { y: 30, autoAlpha: .35 }, {
  y: 0, autoAlpha: 1, stagger: .1,
  scrollTrigger: { trigger: '.section-title', start: 'top 88%' }
});
```

The current integration intentionally keeps **native momentum scrolling on touch devices** to avoid breaking iOS scroll, native accessibility, browser navigation, and gesture handling. The desktop enhancement is only enabled for fine pointers and users who have not selected reduced motion.

## 3. Same-document page transitions

The current project/detail system already uses native HTML dialogs without reloading. `assets/js/creative.js` upgrades opening a case study using `document.startViewTransition`. It matches the project thumbnail to the dialog hero via `view-transition-name: case-study-preview` and uses a dark curtain/opacity transition when appropriate.

Supported browsers use the View Transitions API; others open the original dialog with no hard navigation and no blank page. Avoid applying two matching `view-transition-name` values at the same time.

## 4. Interactive shell + Lam AI

The Terminal accepts real existing commands. Optional SFX is **off by default** and only activated by a specific user click. The typing sound is short, synthesized locally through Web Audio API (no sound file or autoplay). Output is progressively revealed if motion is allowed.

Lam AI retains safe text-only local answers and an optional server function. The avatar's halo animates only while a question is being processed. Its server secret (`GEMINI_API_KEY`) must stay in Netlify environment variables, never committed to client JavaScript.

## 5. Audio, accessibility, and performance

- Audio only starts after a user gesture. A single Web Audio `AnalyserNode` reads the existing `<audio>` element and drives eleven frequency bars in the footer.
- The music widget belongs to the footer rather than covering the hero or other content on mobile.
- Every effect has `prefers-reduced-motion` / CSS / plain-DOM fallbacks.
- Shader rendering is hover-only; the Three.js worlds are visibility-limited; the site remains keyboard navigable.
- Keep real project screenshots and alt text. Avoid fake AI generation indicators or misleading deploy progress.
- Preserve the form labels, keyboard focus, link semantics, and non-animated readability.

### Lighthouse verification: goal, not guarantee

Measure production builds separately on mobile and desktop with **Lighthouse Performance, Accessibility, Best Practices, and SEO**. A score over 95 is a target and cannot be asserted from source inspection. Suggested budgets: limit total blocking time under ~200 ms, avoid layout shifts (CLS under .1), and prioritize LCP with a visible fast fallback. Check WebGL failures, 2G throttling, reduced-motion mode, hardware acceleration disabled, and iOS Safari.

## Deployment

This is a static Netlify site. Changes to `main` trigger deployment **only if** Netlify continuous deployment is connected to this repository and branch. No GitHub commit alone proves a successful Netlify publish. Observe the Netlify deploy log and run Lighthouse against the published domain before claiming a score or award readiness.
