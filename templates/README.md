# Google Sheet and document templates

Open `configure.html` → **Templates & data**. The generated builder creates native Google Sheets in your own account; no externally hosted template or previous committee account is required. CSV header files are included for inspection/import, and `schemas.json` is the authoritative template definition.

| Workbook | Organizer inputs | System-owned content |
|---|---|---|
| Accepted submissions | Full Papers, Projects, Field Notes, PhD Workshop, Book Forum: ID, Title, Authors, All Reviewer Comments | None; this is the importer source |
| Author Hub Master | Settings; approved corrections through the portal/admin workflows | Submissions, Authors, tasks, file/folder registries, registrations, activity and proof logs |
| Detailed Schedule | Conference and Workshops positional layouts | Read by Program, presentation sync, reminders and public calendar |
| Presentation Administration | Sessions/Assignments when not synchronizing; Settings; SessionContacts | Uploads, reminder state and readiness reports |
| Recognition Portal | Workshop_Catalog, Workshop_Registrations, Workshop_Instructors, Presentation_Confirmations, Volunteers, Awards, Settings | Reviewer import results, certificate logs and future-reviewer-interest responses |
| Session Chair Coordination | Sessions, with chair names/emails and meeting times | Read by Recognition |
| PhD Workshop Monitor | Volunteer Assignments columns H:K only | Submission monitoring and activity; other assignment columns are refreshed |

## Shared identifiers

`Paper ID` joins accepted submissions, Author Hub, schedule contribution rows, presentation assignments and recognition. IDs must be globally unique across tracks. `Session ID` joins Sessions, Assignments, SessionContacts and chair coordination. The parser generates P01, PR01, FN01 and BF01 from session titles. `Workshop ID` joins the workshop catalog and attendee/instructor rosters.

Use plain text for IDs, dates (`YYYY-MM-DD`), times (`HH:mm` or explicit AM/PM in the detailed schedule) and email addresses. Keep first-row headers exactly as generated. Do not insert decorative rows above headers except where the documented schedule layout requires DAY headings. The `Start (ET)` / `End (ET)` chair headers are retained for compatibility; values are in the **configured conference time zone**, even when it is not Eastern Time.

## Detailed schedule layout

Conference uses A = day/time, B = room or submission ID, C = session/title/author, D = expected contribution count/notes. Example:

| A | B | C | D |
|---|---|---|---|
| DAY 1 \| 2027-10-21 @ Main Venue | | | |
| 09:00 AM - 10:00 AM | Auditorium | Paper Session 1: Theme | 1 |
| | 1001 | Example accepted title | |
| | | Example Author | |
| | | Session Chair: Example Chair | |

Workshops uses A = day/time, B = activity and C:H = venue columns. Put the venue names on the DAY row. Use `Workshops begin`, `Workshops resume`, `Workshops continue` and `Workshops adjourn` to define blocks, with breaks/other events between them. Preserve the layout; the parser is not a generic event-table importer.

The sample kit supplies four presentation sessions and a complete workshop day so the inherited parser checks can be rehearsed. Fictional examples are disabled by default and roster Enabled values are FALSE. Replace every example before launch. The default minimum is four presentation sessions; change it explicitly under Presentation rules when rehearsing a smaller program.

## Certificate templates

The builder creates eight editable Google Docs with the exact placeholders expected by reviewer, workshop attendee, instructor, presenter, session chair, volunteer, award and acceptance-letter code. Customize typography and approved conference stationery in these new documents. Preserve placeholder spelling and test every certificate type. Optional visa letters and publication assets require committee-approved templates; they are not reproduced from the 2026 files.

## Template versioning

Update a source reader and its schema together. Header order matters for positional readers, especially workshop/instructor/volunteer rosters and certificate logs. Keep populated production files out of Git. A future schema migration must explain how existing records are preserved.

## Website content

The template builder also creates a private **Website Content and Publication History** folder containing `website-content.json`. Its resource IDs are included in the generated configuration. Re-running the builder preserves this file and all saved drafts/publications. It does not add or rename spreadsheet tabs. Deploy the separate Visual Editor to edit this content; do not edit the JSON store manually.
