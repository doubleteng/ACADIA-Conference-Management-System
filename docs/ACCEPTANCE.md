# Rehearsal before public launch

Use a new Google account/project set or isolated test resources. Enable fictional examples in the template builder. Replace test recipients with inboxes controlled by the committee before enabling any send function. Record results and the repository commit in the private handoff record.

| Area | Exercise | Expected evidence |
|---|---|---|
| Template creation | Run builder, import JSON, rerun builder | Seven Sheets, 52 tabs, eight Docs; same IDs on rerun and existing cells preserved |
| Configuration | Change year/month/time zone, venues, dates, contacts and FAQ; export all modules | Generated code and templates show the new edition; no unresolved tokens or old deployment links |
| Authorization | Install each project with its manifest and run edition initialization | Correct account/resource access; no unexpected triggers or sent messages |
| Author Portal | Initialize new master, preview/import fictional accepted records, provision folders; log in as test author | Correct track/tasks, uploads, registration, proof and letter behavior; rejected mismatches and expired sessions |
| Presentations | Fill/rehearse schedule, sync Sessions and Assignments, upload a test presentation | IDs align; configured day rules and deadline labels appear; completeness guard rejects accidental missing data |
| Program | Load direct deployment and iframe; open sessions, authors, images and PDFs | Live new-edition data, valid timezone, correct links and acceptable mobile layout |
| Reminders | Validate readiness; then enable only with controlled recipient inboxes and suitable test session times | Expected test email, correct chair/author links, no duplicate sends; disabling removes intended triggers |
| Calendar | Preview, set up dedicated test calendar, edit/add/remove a test source event | Correct times and locations, updates converge, duplicate keys absent, unrelated manual event preserved |
| Recognition | Populate fictional eligibility for every enabled channel; run verification and request test certificates | Correct recipient, date, role and placeholder replacement; ineligible records denied; logs recorded |
| Website | Embed each `/exec` URL on a test page; test incognito and narrow screen | Login/upload/download flows usable; new-tab fallback works; correct public audience |
| Recovery | Disable background jobs, restore a test backup or prior deployment version | Documented stop/recovery process works without deleting source records |

Do not enable both standalone reminders and the Author Portal's embedded session reminder scheduler for the same records. For calendar deletion tests, use only the dedicated test calendar and synthetic events.

## What has already been checked locally

The automated test suite parses all generated server files and embedded JavaScript, checks string/HTML escaping, validates date handling and configuration, compares template headers against source constants, exercises representative schedule/roster readers and checks ZIP structure. Offline DOM smoke tests exercised all six configuration steps and generated template, deployment and website archives without network access.

These checks do not execute Google services. Google authorization, account policies, trigger timing/quotas, email delivery, PDF/certificate rendering, browser iframe behavior and a complete fresh-account deployment remain acceptance work for the installing committee.
