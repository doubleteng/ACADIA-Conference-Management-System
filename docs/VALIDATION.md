# ACMS validation record

## Version 0.2.0

The local suite contains 20 tests. It exercises generated server and client syntax; arbitrary-year date parsing; shared schedule parsing; schema compatibility; configuration escaping; archive creation; template creation and reruns; installation guards; recognition initialization; read-only installation diagnostics; reminder delivery state handling; and automatic developer attribution across generated editions.

The Google-service tests use in-memory doubles. They verify control flow and data contracts without calling Google, sending email, creating events or accessing participant data. In particular, they verify that a simulated successful reminder is not sent twice, an ambiguous mail-service response is marked UNCERTAIN and held for review, and quota exhaustion or an unsuitable session time produces no send.

`RUN_CHECK_INSTALLATION` is available in every generated project. It reads the configured workbooks, checks required tab names and header order, and reports counts. It does not repair or change spreadsheets. Passing this check does not establish complete schedules, eligible recipients or successful document rendering.

The offline interface has also been exercised through all six steps using local DOM smoke tests, including template, settings, deployment and website-embed downloads. The resulting deployment ZIP was inspected independently.

## Google-side acceptance

On 2026-10-28, an isolated Apps Script rehearsal using a fictional 2099 edition completed template creation. Read-only Google Drive and Sheets readback verified seven native workbooks, all 52 tab names and header rows, and eight private native Google Docs templates. Google omits trailing empty cells in value responses; the intentionally blank final Conference header was compared as an empty value. No real participant data was used. This live rehearsal covered resource creation and schema compatibility; developer attribution is covered by the generated-output tests.

A complete fresh-installation acceptance is still required. Local service doubles cannot prove actual Google authorization, service quotas, trigger timing, email delivery, certificate/PDF rendering, browser iframe behavior or publication permissions. Follow `ACCEPTANCE.md` and record live results in a private edition handoff record.

Original conference projects remain outside this validation scope. Use separate test projects and synthetic data; do not run rehearsal actions against the original source resource IDs.
