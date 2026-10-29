# Source migration record — 0.1.0

The input was the current editor content of five user-supplied ACADIA 2026 Apps Script projects: Author Hub, Peer Reviewer Portal, Program, Gmail Reminders and Calendar. Thirty-four source/manifest files were copied through the editors without changing or running the projects. File-level SHA-256 checksums are retained in `configuration-catalog.json`. The original archive is private and is not part of this repository.

This is an **editor-source snapshot**. Deployed version history was not exported and the editor source has not been proven identical to every deployed `/exec` version. Connected Sheet contents, Drive assets, credentials, Script Properties and trigger definitions were not cloned. The Calendar manifest was hidden in its editor; this release supplies a new V8 manifest with explicit Calendar, Sheets and trigger scopes. Other visible manifests were copied and their time zones parameterized. The manifests include `userinfo.email` for the new editor-only initialization guard.

## Public-copy changes

- Replaced production Google resource IDs, public deployment URLs, contacts, conference branding, deadlines and edition-specific text with configuration tokens.
- Added the offline compiler, setup interface, safe string/HTML escaping, source-derived template schemas, native template builder and annual operating documentation.
- Added shared edition initialization. New installation setup refuses pre-existing unrelated Script Properties. It does not send mail or install triggers.
- Removed embedded participant/schedule seeds, old PDF/image cache mappings and old guide-source records. These are edition data; new installations read their own Sheets and supply their own approved assets.
- Replaced fixed October/2026 date parsing with configured-year ISO or named-month parsing. Added configurable per-day presentation rules, attendance FAQ, admin-runner fields, volunteer shifts, excluded IDs/image names and schedule completeness thresholds.
- Generalized old venue shortcuts and calendar year ranges. The calendar accepts a variable number of days, explicit end-of-day rows and multiple workshop blocks per venue; block keys include start time to avoid collisions. Source-size checks permit short complete schedules.
- Retained historical function names where trigger handlers depend on them, including `syncACADIA2026`, and added neutral calendar setup/preview/stop aliases. A legacy identifier in a function name is not a live 2026 dependency.

## Retained behavior needing an edition rehearsal

Application workflow, author lookup/session behavior, certificate eligibility logic, public corresponding-author visibility, optional name-only recognition channels, late-upload handling, schedule layout conventions, mail retry/duplicate suppression and managed-event deletion behavior remain substantially inherited. This migration is not a security audit or a redesign of those rules.

Review all 198 editable text entries. Some policy text is intentionally available as an advanced override rather than interpreted as a universal conference rule. The optional AI guide needs committee-provided approved public sources, a current model and a private API key. Standard website iframes are supplied; the specialized external floating-guide parent bridge is outside this release.

No modification, deployment, trigger execution, message sending or data deletion was performed against the original projects during this migration. Tests run against local generated copies and fictional records only. See `ACCEPTANCE.md` for what remains to verify in an independent Google installation.

## Version 0.2.0

Renamed the project to Acadia Conference Management System (ACMS), removed the Chinese onboarding, added read-only installation diagnostics, and extended tests for template reruns, installation isolation, recognition setup and reminder delivery states. The build now synchronizes shared files across modules. The existing `ACADIA_TOOLKIT_INSTALLATION` Script Property key is retained for compatibility with 0.1.0 copies; it is an internal marker, not the product name.

ACMS 0.2.0 also includes fixed developer attribution to Teng Teng in generated portals, website embeds, reminder messages, calendar descriptions and newly generated document templates. This credit is independent of edition configuration.

## Version 0.3.0

A separate authenticated Visual Editor adds draft/save/review/publish/history for selected public entry-page text, banners and colors. New edition portal adapters read published display content without writing to the content store. Original management actions, schedule readers and eligibility rules are retained. The template builder adds two private content resources while preserving all workbook schemas and existing records. Recognition banner theme and committee names now use edition configuration instead of residual source-edition display text. See [VISUAL-EDITOR.md](VISUAL-EDITOR.md).
