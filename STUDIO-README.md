# Oddwebs studio redesign

Built from the actual `Goutamdhanani/site2` Git clone at commit `87a8592`, on branch `codex/oddwebs-redesign`.

## Run

Requires Node 22.12+ (or Node 24) and npm.

```sh
npm ci
npm run build
npm run check
npm run preview
```

Open http://localhost:4173/. `npm run dev` rebuilds the public pages and starts the same preview. Rerun `npm run build:studio` and reload after editing. `npm run dev:legacy` starts the original Vite application.

## What changed

- Sixteen complete HTML pages: home, products, three product details, work, services, research, three research articles, studio, contact, privacy, terms, and accessibility.
- Greymac-referenced layout: rounded black viewport frame, expanding centre navigation, blue atmospheric canvas hero, scroll-revealed editorial text, expanding image reel, full-screen project panels, horizontal work gallery, and a compact black footer. Self-hosted Inter and Hedvig Letters Serif, responsive layouts, and reduced-motion support.
- Five existing demo links with optimized WebP previews. A confidential paid inventory project is described without client identity, source location, or operational data.
- Visible founder identity, business contact, honest product stages, and an explicit distinction between current implementation and planned direct Claude API use.
- Crawlable HTML, canonical URLs, Open Graph, Organization/WebSite/WebPage JSON-LD, robots.txt, sitemap, `/llms.txt`, and versioned `/site-data.json` for agent retrieval.
- The public JSON feed is generated from the same product, work, service, and page data as the site. It explicitly carries product stages and demo/research limitations; private client records and account-only data are excluded.
- Public pages use static HTML and a small native JavaScript enhancement layer. A self-hosted Lenis module enhances fine-pointer scrolling when reduced motion is off. There is no public-page React runtime, GSAP, animation-sequence preload, analytics script, or third-party font request. The original React/admin application is preserved under `/legacy/`; existing root hash links such as `/#admin` redirect there.

## Edit

- `studio/content.mjs`: product, portfolio, company, and service information.
- `studio/build.mjs`: static HTML layouts and page content.
- `studio/reference.mjs`: reference-based homepage, portfolio, navigation, and footer.
- `studio/style.css`: responsive visual system; `studio/details.css`: shared detail-page layout primitives.
- `studio/site.js`: navigation, scroll animation, canvas motion, horizontal gallery, contact behavior, and old-link redirects.
- `assets/`: optimized project artwork and previews, self-hosted fonts, the scroll module, and licences.
- `api/contact.js`: server-side form validation, shared per-IP rate limiting, and email delivery.

The build first compiles the original app into `dist/legacy`, then writes the public pages into `dist`. Original public assets remain available for legacy references; they are not requested by the new homepage. The local `/__review` frame is development-only and is never emitted into the deployment.

## Vercel release

Use this repository root, `npm run build`, and output directory `dist`, as specified in `vercel.json`. Keep the existing API/auth/Supabase environment configuration for the original admin application.

For the new contact endpoint, set server-only variables in the hosting environment:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Email provider credential |
| `RESEND_FROM_EMAIL` | Sender address on a verified Resend domain |
| `ODD_CONTACT_EMAIL` | Optional destination; defaults to the founder-provided Gmail address |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for shared rate-limit state |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only Upstash Redis token; also HMACs IP identifiers before storage |
| `SUPABASE_URL` | Optional existing leads database |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional server-only key for archiving enquiries in the existing leads table |

The contact endpoint allows five submissions per IP per ten-minute sliding window. It uses Vercel's `x-forwarded-for` client IP header, stores only an HMAC identifier in Upstash, and returns `429` with `Retry-After` when the limit is exceeded. It fails closed if Upstash is missing or unavailable, so configure both Upstash variables in Vercel before enabling form delivery. Without email configuration, the form reports an unavailable delivery and retains the message. The direct email link and email-draft fallback remain available. Success is returned only when Resend accepts the message and returns an ID; this is not an inbox-delivery guarantee. Optional lead archival follows email acceptance and does not turn a successful send into a retry request. No tracking fields or invented budget/lead-score values are collected by the new form.

Public agent discovery is available at `https://oddwebs.com/llms.txt` and `https://oddwebs.com/site-data.json`. The JSON feed uses the `oddwebs.public-site-data/v1` schema; every generated HTML page links to both sources, and `robots.txt` permits crawling while excluding `/api/` and `/legacy/`.

No production deployment or live email/database write was performed during this redesign. Authentication and provider delivery still need a configured deployment smoke test. The existing admin implementation is retained, not re-audited as part of this visual redesign.

## Content and asset provenance

Content was checked against oddwebs.com, oddform.io, all five linked demos, the user-supplied project information, and the locally available Odd Ecosys, Oddbroadcast, and Verdict project documentation/code. Product stages are intentionally distinct: Odd Form is published, Odd Ecosys is a local working prototype, Oddbroadcast is not yet released, and Verdict is experimental research.

Portfolio previews were optimized from this repository's existing project images. OddShoe's product artwork and Storybook's landscape come from the user's published demos; the Qitchen photo is the existing demo's Unsplash image (photo-1579871494447-9811cf80d66c). Demo content and displayed metrics are illustrative, not client outcomes. Font licence files are included beside the self-hosted font subsets. The hero atmosphere and cursor light are code-native effects. The original Oddwebs logo is retained in the navigation, footer, and favicon. OddDoctor and OddSpace use original code-native SVG illustrations instead of enlarged UI screenshots. The expanding menu uses a solid body with fixed-width curved shoulders to keep labels contained. Greymac was used as a layout and motion reference; its client artwork, identity, video, and proprietary font are not included. `social.jpg` is a screenshot of the implemented homepage.

No startup-program acceptance, Anthropic partnership, invented testimonials, benchmark advantage, client count, funding, or incorporation details are claimed. A stronger website supports a credible application; it cannot guarantee program approval.

## Validation

- Production build and Node contract tests pass.
- Every public page's internal links, hash targets, asset paths, title structure, and metadata are checked.
- Contact tests cover validation, method handling, missing/failing/blocked rate limits, provider errors, and acceptance using mocked transport; no test emails are sent.
- Agent-feed tests verify product stages, public demo count, crawler access, and exclusion of confidential project records.
- Browser reviewed desktop (1280 px), phone (390 px), and responsive frames (320 and 768 px). Layouts were checked for horizontal overflow; the compact footer and project typography adapt to narrow screens.
- Browser tested mobile menu and Escape dismissal, horizontal gallery controls, preselected enquiry topics, and the retained-message failure state.
- Live URLs were reviewed before implementation; authenticated product workflows and production email delivery were not exercised.
