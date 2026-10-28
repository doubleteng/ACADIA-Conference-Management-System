# Deploy a new ACADIA edition

This package is a configurable copy of the five 2026 systems. Use **new Apps Script projects and new Google files** for every edition. The toolkit does not update the 2026 installations.

## 1. Create the edition's data and templates

1. Download the repository ZIP, extract it, and open `configure.html` in Chrome, Edge, Firefox or Safari. No server or installation is required.
2. Complete **Conference**. Use the actual conference year, IANA time zone, dates, contact email and reminder-sending Google account. For 2027, enter `https://2027.acadia.org/` as the website.
3. In **Templates & data**, download the template builder. Leave fictional examples off for the real installation; turn them on only for a disposable rehearsal.
4. Create a **new standalone Apps Script project**. Paste `CreateTemplates.gs` into its `Code.gs`, save, select `createConferenceTemplates`, and authorize the requested Drive, Docs and Sheets access.
5. The execution log links seven new native Google Sheets and a configuration JSON in your Drive. Download the JSON; import it into `configure.html`. The IDs fill automatically. A rerun resumes the same kit and preserves populated sheets.
6. Fill the organizer-input sheets using `templates/README.md`. Keep generated logs empty. Style the new certificate/letter templates without deleting their `{{PLACEHOLDERS}}`. The included document layouts are functional starting points, not approved conference stationery.
7. Add edition-owned publication packages, consent PDF, presentation template, banner and other required assets in **Templates & data**. The toolkit contains application code and schemas; it does not include the 2026 papers, signatures, artwork or publication packages.

## 2. Generate the five projects

Complete **Presentation rules** and review **Advanced content**, including policies inherited from the original systems. Set the optional public conference-guide sources and model ID only if using the guide. API keys belong in the Program project's Script Properties, never in the configurator or GitHub.

In **Export projects**, choose modules, validate, and download the deployment ZIP. Each module has a combined `Code.gs`, any required HTML files, and `appsscript.json`.

For each module:

1. Create a new Apps Script project under the new committee's operating account.
2. Replace the new project's sample `Code.gs` with the generated `Code.gs`.
3. Add each `.html` file under its exact name without changing include names.
4. In Project Settings, show `appsscript.json`; replace the new project's manifest with the generated one. The configured time zone is included. Add/authorize the advanced services listed in the manifest: Calendar for Author Portal, Sheets for Conference Program.
5. Run `RUN_CONFIGURE_NEW_INSTALLATION` from the editor. It refuses a project with unrelated existing Script Properties. It installs configuration only; it sends no email, creates no calendar and installs no trigger. The Recognition module also initializes its own Settings rows and logs.
6. Run `RUN_CHECK_INSTALLATION`. It reads connected Sheet headers and reports missing tabs, incorrect column order and inaccessible files, without changing data, sending messages or installing triggers. Empty data tables are expected before import; an OK result checks structure and access, not complete conference content. Fix any reported problems, then follow the module-specific steps below. Google account policies may restrict anonymous web-app deployment. Verify the actual audience with an incognito browser before publishing links.

The generated ZIP contains `configuration.private.json`. Keep that file and your populated spreadsheets private. Commit generic toolkit source, not edition data or credentials.

## 3. Author Portal

1. Run `RUN_SETUP` to initialize the **new** Author Hub Master, system folders and proof-comment form.
2. Fill the accepted-submission source tabs; use globally unique submission IDs and the accepted titles. Run `RUN_PREVIEW_NEW_ACCEPTED_SUBMISSIONS`, review the report, then `RUN_ADD_NEW_ACCEPTED_SUBMISSIONS_SAFE` and `RUN_PROVISION_NEW_ACCEPTED_FOLDERS_SAFE`. Use `RUN_SYSTEM_CHECK` and the dashboard to verify results. The historical bulk import helpers remain available, but the preview/add workflow is the normal route.
3. For Book Forum and PhD tracks, run their `RUN_PREVIEW_*` helpers before the corresponding `RUN_IMPORT_*_SAFE` helpers. Run the PhD support/monitoring helpers only if using that track.
4. The template kit supplies Presentation Administration and its private root. Fill the detailed schedule and enable its synchronization with `RUN_ENABLE_PRESENTATION_SYNC`; verify Sessions and Assignments, then reconcile presentation folders. The default completeness guard expects at least four presentation sessions and rejects a sudden loss of more than 25% of assignments. For smaller conferences, set the minimum session count in Presentation rules and rehearse the schedule before enabling synchronization. The missing-assignment tolerance is also configurable; preserve a conservative value.
5. Fill SessionContacts and the per-day presentation requirements before opening presentation uploads. Set optional letter/template IDs in the configurator and regenerate before deployment.
6. Deploy as **Web app → Execute as Me → intended attendee audience**. For public author access, the original design uses Anyone; authentication within the application remains as implemented in the copied source. Copy the `/exec` URL into the configurator's Website integration step, then regenerate any modules that link to Author Portal.

The standalone reminder service below is the default reminder owner. Do not also enable Author Portal's embedded session-reminder scheduler for the same data. Author-requested personal calendar invitations and the public conference calendar are separate functions.

## 4. Conference Program

Connect Author Hub Master and Detailed Schedule, both owned by this edition. Populate author/publication data in the Master and the schedule tabs. Supply the approved publication PDF folder for PDF previews. Deploy as a web app with the intended public audience; verify live schedule, author detail, image and PDF flows.

The old embedded participant/schedule snapshot and old optimized image/PDF caches are absent. Data comes from your Sheets. Optional optimized derivatives can be entered under Advanced content. The public program exposes the corresponding-author contact as in the source behavior; populate those fields according to the committee's publication policy.

The optional AI conference guide remains off after configuration. To enable it, set `GEMINI_API_KEY` and `GUIDE_ENABLED=true` in this project's Script Properties, configure a currently available model ID and approved public sources, and test the guide. Never include the key in exported configuration.

## 5. Presentation reminders

Use a separate project owned by the exact Google account entered as the sender. Connect Author Hub Master, Presentation Administration and Detailed Schedule. Run `RUN_VALIDATE_GMAIL_REMINDERS` and review ReminderReadiness, recipient addresses, chair contacts, session dates and time zone. Validation may update readiness/status sheets in your new installation, but does not send a message.

Only when the real schedule and recipients are approved, run `RUN_ENABLE_GMAIL_REMINDERS`. This installs the recurring task; future executions send session reminders. `RUN_DISABLE_GMAIL_REMINDERS` stops it. The inherited service handles duplicate suppression and retry state. Google trigger timing and mail quotas still apply.

## 6. Public conference calendar

Run `previewConferenceCalendar` first; it reads the new schedule and logs the proposed events without changing Calendar. After checking dates, times, venues and counts, run `setupConferenceCalendar` to create/reuse this installation's dedicated calendar and install its synchronization triggers.

This does not make the calendar public. Choose viewing/subscription permissions in Google Calendar and copy the resulting public link into the website. `stopConferenceCalendar` stops future sync while keeping events. Normal synchronization can remove events previously created by this module after confirmed source deletion; it does not delete source spreadsheet records or unrelated manual calendar events.

## 7. Recognition Portal

The template kit creates the roster tabs, certificate logs, confirmation table and Google Docs templates. `RUN_CONFIGURE_NEW_INSTALLATION` connects them and leaves optional channels disabled.

- Peer reviewers: supply this edition's EasyChair completed-review HTML export as `easychairHtmlId`; run `RUN_SETUP_REVIEWER_PORTAL` / `RUN_REFRESH_EASYCHAIR_DATA` only after checking that source. These actions rebuild this new portal's reviewer tables. Alternatively populate the exact reviewer-summary/completed-review schema yourself without calling the HTML importer.
- Workshop attendees/instructors: fill Workshop_Catalog and the matching registration tables. Preserve column order. Set Enabled only for eligible rows.
- Presenters: use Author Hub Master and Presentation Administration; record verified presentation decisions in Presentation_Confirmations when needed. `PRESENTED` / `NOT_PRESENTED` override upload evidence.
- Session chairs: fill the separate Session Chair Coordination workbook. Its `Sessions` tab is different from Presentation Administration's `Sessions` tab.
- Volunteers and awards: fill their roster tabs. Name-only access for volunteers and instructors is inherited behavior; evaluate that policy before enabling those channels.

Run each module's `RUN_VERIFY_*` template check, test with fictional records, then set the relevant `*_ENABLED` values in Recognition Settings to TRUE. Deploy the Recognition web app and add its `/exec` URL to the website.

## 8. Website and handoff

Use **Website integration → Generate embed snippets** and `docs/WEBSITE-INTEGRATION.md`. Keep all three public deployment URLs, operating accounts, template links, trigger owners and release version in a private committee handoff record. Use `docs/HANDOFF.md` for annual turnover.

## Validation boundary

Local tests cover configuration generation, JavaScript syntax, schema compatibility, date parsing and representative schedule transformations. They do not prove Google authorization, quota behavior, PDF rendering, real email delivery or a complete deployment in a new Google account. Complete the rehearsal in `docs/ACCEPTANCE.md` before the committee opens the portals.
