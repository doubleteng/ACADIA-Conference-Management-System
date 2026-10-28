# ACADIA Conference Toolkit

A reusable home for five ACADIA conference management systems, from accepted submissions through post-conference recognition. Each committee operates its own Google Apps Script projects, Sheets, Drive files and Calendar. An offline setup interface generates the edition-specific code and website embeds.

**Start here:** download this repository using **Code → Download ZIP**, extract it, and open **`configure.html`** in your browser. No Node.js, server or command line is needed to configure an installation. GitHub's file preview does not run the interface; open the downloaded file.

[中文快速开始](README.zh-CN.md) · [Deployment guide](docs/DEPLOYMENT.md) · [Google templates](templates/README.md) · [Website integration](docs/WEBSITE-INTEGRATION.md) · [Annual handoff](docs/HANDOFF.md)

## Included systems

| Phase | Module | What it handles |
|---|---|---|
| Before | Author Portal | Accepted-submission administration, author tasks and files, publication materials, proofs, presentation uploads and related author workflows |
| During | Conference Program | Live schedule, submissions and authors, images/PDFs, optional conference guide |
| During | Presentation reminders | Scheduled Gmail reminders based on sessions and author/chair records |
| During | Calendar sync | Dedicated conference calendar refreshed from the detailed schedule |
| After | Recognition Portal | Reviewer, workshop, instructor, presenter, chair, volunteer and award recognition |

The Author Portal manages the post-acceptance submission workflow represented in the source. It is not a replacement for the original EasyChair submission and peer-review process.

## From download to a new edition

1. **Enter conference settings.** Fill year, dates, time zone, venues, deadlines, contacts and policies in `configure.html`. Example dates are illustrative, not an announced ACADIA schedule.
2. **Create your templates.** Download the template builder and run it in a new Apps Script project. It creates **seven native Google Sheets with 52 tabs**, **eight editable Google Docs templates**, and the folder structure in your account. Import its configuration JSON back into the interface.
3. **Fill edition data.** Enter accepted submissions, schedule and recognition rosters in the new Sheets. Provide your publication packages, artwork and approved letter/certificate content.
4. **Generate and deploy.** Export the deployment ZIP. Each of the five projects includes a combined `Code.gs`, required HTML files and a manifest. Follow the included `START-HERE.md` to authorize and deploy in new Apps Script projects.
5. **Embed in the website.** Enter the three web-app `/exec` URLs in the interface. Download HTML blocks for the authors, program and recognition pages of `2027.acadia.org` or a later site.

The interface works offline and makes no network requests. It includes plain-language fields, per-day presentation rules, attendance FAQ, admin-runner inputs and a searchable catalog of 195 edition-specific text entries. Generated settings contain your Google resource IDs; keep them private. API keys belong only in the relevant project's Script Properties.

## What this release establishes

Version **0.1.0** is a configurable source migration from the five 2026 editor projects, with source-derived schemas and local compatibility tests. Existing online projects and data were not modified. Embedded participant data, live file/deployment identifiers and cached edition assets are excluded from the public copy.

Local tests cover generated source syntax, configuration escaping, template-reader contracts and shared schedule parsing. A fresh Google-account deployment has **not** been verified end to end. Run the [acceptance rehearsal](docs/ACCEPTANCE.md) before opening your edition. Mail quotas, account permissions and PDF/certificate rendering need verification in your Google environment. [Migration details](docs/MIGRATION.md) distinguish retained behavior from portability changes.

## Repository map

| Path | Purpose |
|---|---|
| `configure.html` | Self-contained setup interface; open locally |
| `modules/` | Five parameterized Apps Script source projects |
| `shared/Edition.gs` | Shared edition configuration and initialization |
| `configuration.example.json` | Generic configuration without live IDs |
| `configuration-catalog.json` | Editable text/resource inventory and source checksums |
| `templates/` | Native Google template builder, schemas and CSV headers |
| `docs/` | Deployment, website integration, rehearsal and annual handoff |
| `tools/` | Configuration compiler and reproducible HTML build |
| `tests/` | Local compatibility tests |

Do not paste the raw files under `modules/` directly into Apps Script: their configuration tokens must first be compiled by the interface.

## Maintain the toolkit

With Node.js 22 or later:

```sh
npm test
npm run build
```

No npm dependencies are needed. After source/schema/interface edits, rebuild `configure.html` and `sources.json`, run the tests, and commit those generated files together. Changes in `shared/Edition.gs` must also be copied into each module's `Edition.gs`. CI checks tests and reproducible generated artifacts. Keep committee data in private Google files, and contribute reusable improvements through pull requests.

## License

Toolkit code is released under the [MIT License](LICENSE). The embedded Roboto font retains its SIL Open Font License; see [NOTICE](NOTICE). The license does not grant rights to conference marks, participant content, signatures, publication PDFs or artwork. This repository is a community-maintained toolkit; operational ownership and annual acceptance remain with the organizing committee.
