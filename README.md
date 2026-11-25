# Столиця & Сервіс

Україномовний сайт будівельних матеріалів і послуг постачання. [Публічний сайт](https://ilyakudrenko.github.io/Stoltsya-service/).

## Development

Requires Node.js 20+. There are no application dependencies or runtime configuration.

```sh
node scripts/build.mjs
node scripts/preview.mjs
```

Open http://127.0.0.1:8766/Stoltsya-service/. Run the build again after editing templates or content and refresh the browser.

- `src/content.mjs`: company contact information, canonical URL, catalog copy, product attributes and photo references.
- `scripts/build.mjs`: page templates, navigation, metadata, sitemap and robots.
- `style.css` and `catalog.js`: shared layouts, navigation, catalog filters and inquiry flow.
- `assets/`: supplied photographs and font files with licenses.
- Generated HTML, sitemap and robots files are committed because GitHub Pages serves the root directly.

## Deployment and checks

Run the commands below from the repository root. Review the generated files, then commit and push to `main`. Repository **Settings → Pages** publishes from `main`, folder `/(root)`. For a different host or base path, update `company.url` before regenerating the pages.

```sh
node scripts/build.mjs
node --check scripts/build.mjs
node --check scripts/preview.mjs
node --check src/content.mjs
node --check catalog.js
git diff --check
```

## Inquiry delivery

The form validates and composes a message in the visitor’s browser. Visitors send it themselves through their SMS app or copy the text and call. The form has no server-side submission, tracking, or storage. No environment variables are required.

Before adding direct submission or callback booking, confirm a destination inbox or CRM and the company’s retention policy. Configure a server-side endpoint on a separate service because GitHub Pages serves static files. Store provider credentials on that service, add server validation and rate limiting, restrict cross-origin requests to the site, and return success only after accepting the request. Update the privacy notice before launch of server-side submissions.

## Company information to supply

- Confirm the legal name, official logo, email, legal and pickup addresses, hours, delivery area, and accepted payment terms.
- Confirm the available construction services, work scope, and commercial terms. Current service profiles cover delivery and pickup from the supplied company materials.
- Confirm which photographed equipment is available for hire, its specifications, rental terms, and approved usage photos. The current equipment pages accept questions about availability.
- Supply approved completed-project photos, published project names, locations, dates, scope and permissions. The portfolio currently contains a labeled photo report of material preparation.
- Confirm current vacancies and application contacts, approved partner logos, and any company metrics or credentials for publication.
- Confirm dimensions, product data sheets, live prices or availability where publishable, plus a dedicated product photo for expanded clay.
- Approve the privacy notice and confirm any business-level data practices for phone and SMS inquiries.

## Reference and design

[ABU](https://abu.kiev.ua/) organizes product sales, construction services and equipment rental into separate hierarchies, with case studies providing project context and contacts/callbacks converting inquiries. Its main navigation exposes categories by business line and links to company and careers pages. This site keeps those independent destinations and uses compact category disclosure menus, a dedicated mobile menu and one verified sales number. Company copy, business details and imagery come from the supplied materials. Industrial yellow is drawn from the company advertisement. Manrope and IBM Plex Sans are locally hosted with Ukrainian Cyrillic coverage.

## Verification

- Chromium checked all 21 pages at 375, 390, 768, 1024, 1440 and 1920 px. Checks covered horizontal overflow, page headings, internal links, mobile menu and keyboard dismissal, catalog filtering, inquiry validation and draft creation, and the custom 404.
- Automated axe checks ran at 375 and 1440 px. The local homepage’s mobile Lighthouse run scored 97 performance, 100 accessibility, 100 best practices, and 100 SEO. These are lab measurements.
- The SMS link and copy controls were exercised in Chromium. SMS sending depends on the visitor’s device and messaging app.
- JavaScript syntax, JavaScript and CSS lint, TypeScript's JavaScript checker, and Git whitespace checks passed.

## Motion direction

The photographed hopper, bagged aggregate, and truck-mounted manipulator informed three directions:

| Direction | Fit and trade-offs | Decision |
| --- | --- | --- |
| Hopper discharge gate | Downward travel connects the navigation to the packing process. A straight mask reads on narrow screens and costs one native snapshot pair. It requires little maintenance. | Signature page transition and photographic aperture. |
| Conveyor handoff | A horizontal sequence fits sorting and logistics. Moving entire pages sideways competes with mobile history gestures and displaces the reader’s reference point. A short directional mask is easier to maintain. | Local mask for catalog category changes. |
| Big Bag filling | Falling and settling material would make a distinctive literal simulation. A convincing particle fill requires additional rendering and tuning on phones, while a startup version implies progress the site does not track. | Keep the process visible through supplied photographs. |

The homepage pairs an existing packing overview with three optional photo stages: hopper feed, bagging, and dispatch. Below-the-fold photo reveals play once. Core copy, imagery, and actions render immediately. The native page transition opens along a diagonal aperture in 420 ms on desktop or 260 ms on mobile while the departing page remains visible underneath. No custom router, dependency, preloader, animation loop, or scroll pinning is required. Reduced motion receives immediate state changes and standard navigation. Unsupported browsers retain ordinary links; with JavaScript off the photo-stage links open their images directly.

References consulted:

- [Chrome cross-document View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) for native navigation and history behavior.
- [Codrops Image Reveal Hover](https://github.com/codrops/ImageRevealHover/) for separating clipping from image movement. The demo host returned a challenge in Chromium, while the project and demo index were readable.
- [Motion image reveal slider](https://motion.dev/examples/vue-image-reveal-slider) for a defined mask edge and keyboard-operable controls. The full interactive example requires Motion+.
- [GSAP Showcase](https://gsap.com/showcase/) and [Hoverstat.es](https://www.hoverstat.es/) for timing and visual restraint. The GSAP showcase opened in Chromium; the text fetch was challenged. Land-book and several Codrops indexes denied the text fetch.

### Cinematic iteration

Three mechanical actions guide the second iteration: steel plates retract across the first-arrival truck photograph, a diagonal aperture opens between documents, and one production photograph takes over the previous photograph along a directional cut. The catalog uses FLIP geometry for cards that remain visible and a short aperture for newly visible cards. Filtering changes state immediately. A real packing-stage indicator reflects the selected photograph.

The previous one-direction shutter was the baseline. A full-width sheet would hide the truck, so the entrance uses three alternating bands that leave part of the actual photograph visible from the first frame. The process viewer compares the former single-photo mask with a two-photo handoff. Retaining the previous photograph underneath keeps the section visually continuous. A granular Canvas fill was considered for the main impression, but it would put simulated material ahead of real machinery and add per-frame work. No new dependencies or media downloads were introduced.

| Reference | Design takeaway |
| --- | --- |
| [Chrome Stack Navigator](https://view-transitions.chrome.dev/stack-navigator/mpa/) | Native back and forward navigation with independently directed transitions. |
| [Chrome cross-document transition guide](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) | Layer outgoing and incoming captures without a custom router. |
| [GSAP Flip](https://gsap.com/docs/v3/Plugins/Flip/) | Measure pre-filter and post-filter positions, then animate only retained items. |
| [Codrops Image Reveal Hover](https://github.com/codrops/ImageRevealHover/) | Treat the photograph and its aperture as separate layers. |
| [Motion Image Reveal Slider](https://motion.dev/examples/vue-image-reveal-slider) | Use a defined edge and retain a keyboard route. The full demo is gated by Motion+. |
| [React Bits Split Text](https://reactbits.dev/text-animations/split-text) | Stagger groups. Apply it to plates and keep the headline immediately readable. |
| [React Bits Animated Content](https://reactbits.dev/animations/animated-content) | Clip one local area at a time. Keep entrances selective. |
| [Aceternity Animated Tabs](https://ui.aceternity.com/components/tabs) | Coordinate a persistent selected state with changes in content. |
| [Aceternity Container Scroll Animation](https://ui.aceternity.com/components/container-scroll-animation) | Use a large photograph as the motion surface and preserve normal scrolling. |
| [Magic UI Animated List](https://magicui.design/docs/components/animated-list) | Give arrivals a short stagger while preserving response to user input. |
| [Animshelf Click Spark and Dot Field](https://www.animshelf.dev/) | Distinguish a short event-driven effect from a persistent render loop. |
| [Soft Labor via Hoverstat.es](https://www.hoverstat.es/) | Reserve the strongest effect for imagery or content that justifies it. |

The broader review revisited Awwwards, GSAP, Hoverstat.es, Recent, Land-book, Savee Design, Regards, React Bits, Codrops, Motion, Magic UI, Aceternity, Animista, Animshelf, Uiverse, and CodePen. Land-book, Codrops demo and index pages, Uiverse, and CodePen returned 403 in Chromium. The Buddvir and Domovoy retail references also returned 403 in Chromium. Design takeaways were implemented independently in CSS and JavaScript.
