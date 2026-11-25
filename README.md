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
