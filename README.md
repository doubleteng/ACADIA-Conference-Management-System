# ACADIA Conference Management System (ACMS)

**Original developer: [Teng Teng](https://github.com/doubleteng).**

A reusable home for five ACADIA conference management systems, from accepted submissions through post-conference recognition. Each committee operates its own Google Apps Script projects, Sheets, Drive files and Calendar. An offline setup interface generates the edition-specific code and website embeds.

**Start here:** download this repository using **Code → Download ZIP**, extract it, and open **`configure.html`** in your browser. No Node.js, server or command line is needed to configure an installation. GitHub's file preview does not run the interface; open the downloaded file.

[Visual editor](docs/VISUAL-EDITOR.md) · [Deployment guide](docs/DEPLOYMENT.md) · [Google templates](templates/README.md) · [Website integration](docs/WEBSITE-INTEGRATION.md) · [Annual handoff](docs/HANDOFF.md) · [Validation record](docs/VALIDATION.md)

## Included systems

| Phase | Module | What it handles |
|---|---|---|
| Before | Author Portal | Accepted-submission administration, author tasks and files, publication materials, proofs, presentation uploads and related author workflows |
| During | Conference Program | Live schedule, submissions and authors, images/PDFs, optional conference guide |
| During | Presentation reminders | Scheduled Gmail reminders based on sessions and author/chair records |
| During | Calendar sync | Dedicated conference calendar refreshed from the detailed schedule |
| After | Recognition Portal | Reviewer, workshop, instructor, presenter, chair, volunteer and award recognition |

The Author Portal manages the post-acceptance submission workflow represented in the source. It is not a replacement for the original EasyChair submission and peer-review process.

## Visual editing and publication

The new **Visual Editor** gives committee members an visual interface for clicking and editing selected page text, changing banners/colors, previewing desktop/mobile layouts, saving drafts, reviewing changes and publishing. It runs in a separate authenticated Apps Script project; the three public portals read only the published content. Publication history supports restoring an earlier version as a draft. Existing conference management workflows and fixed developer attribution remain in place.

Try `editor-demo.html` from your downloaded repository. Its Save/Publish controls operate only in your browser and do not update a live site. For real publishing, follow [Visual Editor setup](docs/VISUAL-EDITOR.md). The initial release edits public entry-page content; schedules, email templates and authenticated author-task screens keep their existing management interfaces.

## From download to a new edition

1. **Enter conference settings.** Fill year, dates, time zone, venues, deadlines, contacts and policies in `configure.html`. Example dates are illustrative, not an announced ACADIA schedule.
2. **Create your templates.** Download the template builder and run it in a new Apps Script project. It creates **seven native Google Sheets with 52 tabs**, **eight editable Google Docs templates**, the folder structure, and a private website-content store in your account. Import its configuration JSON back into the interface.
3. **Fill edition data.** Enter accepted submissions, schedule and recognition rosters in the new Sheets. Provide your publication packages, artwork and approved letter/certificate content.
4. **Generate and deploy.** Export the deployment ZIP. Each selected project includes a combined `Code.gs`, required HTML files and a manifest. Follow the included `START-HERE.md` to authorize and deploy in new Apps Script projects.
5. **Embed in the website.** Enter the three web-app `/exec` URLs in the interface. Download HTML blocks for the authors, program and recognition pages of `2027.acadia.org` or a later site.

The interface works offline and makes no network requests. It includes plain-language fields, per-day presentation rules, attendance FAQ, admin-runner inputs and a searchable catalog of 198 edition-specific text entries. Generated settings contain your Google resource IDs; keep them private. API keys belong only in the relevant project's Script Properties.

## What this release establishes

Version **0.3.0** is a configurable source migration from the five 2026 editor projects, with source-derived schemas and local compatibility tests. Existing online projects and data were not modified. Embedded participant data, live file/deployment identifiers and cached edition assets are excluded from the public copy.

The 32-test suite covers generated source syntax, configuration escaping, template-reader contracts, shared schedule parsing, safe setup/reruns and reminder delivery state handling. Each generated project includes a read-only `RUN_CHECK_INSTALLATION` diagnostic. A fresh Google-account deployment has **not** been verified end to end. Run the [acceptance rehearsal](docs/ACCEPTANCE.md) before opening your edition. Mail quotas, account permissions and PDF/certificate rendering need verification in your Google environment. [Migration details](docs/MIGRATION.md) distinguish retained behavior from portability changes.

## Repository map

| Path | Purpose |
|---|---|
| `configure.html` | Self-contained setup interface; open locally |
| `modules/` | Five management projects and the private visual editor |
| `editor-demo.html` | Offline visual editor demonstration with local draft/publication state |
| `shared/Edition.gs` | Shared edition configuration and initialization |
| `configuration.example.json` | Generic configuration without live IDs |
| `configuration-catalog.json` | Editable text/resource inventory and source checksums |
| `templates/` | Native Google template builder, schemas and CSV headers |
| `docs/` | Deployment, website integration, rehearsal and annual handoff |
| `tools/` | Configuration compiler and reproducible HTML build |
| `tests/` | Local compatibility tests |

Do not paste the raw files under `modules/` directly into Apps Script: their configuration tokens must first be compiled by the interface.

## Maintain ACMS

With Node.js 22.22.2 or later in the 22.x line (CI uses Node 22):

```sh
npm ci
npm run build
npm test
```

Deployment and offline configuration require no npm installation. Maintainer tests use a pinned jsdom development dependency. After source/schema/interface edits, rebuild `configure.html`, `editor-demo.html`, `sources.json` and the generated module files, run the tests, and commit them together. The build synchronizes shared installation code into all five modules. CI checks tests and reproducible generated artifacts. Keep committee data in private Google files, and contribute reusable improvements through pull requests.


## License

ACMS code is released under the [MIT License](LICENSE). The embedded Roboto font retains its SIL Open Font License; see [NOTICE](NOTICE). The license does not grant rights to conference marks, participant content, signatures, publication PDFs or artwork. This repository is a community-maintained system; operational ownership and annual acceptance remain with the organizing committee.
