# Integrate with 2027.acadia.org and later conference sites

The conference website supplies navigation and page layout. Apps Script hosts the three interactive applications. GitHub stores the reusable source and configuration interface; GitHub is not the live application database.

| Website page | Embed or link | When to expose it |
|---|---|---|
| `/authors/` or `/submission/` | Author Portal web-app `/exec` URL | Before the conference and through publication |
| `/program/` or `/schedule/` | Conference Program `/exec` URL | When the approved program is ready |
| `/recognition/` or `/certificates/` | Recognition Portal `/exec` URL | After records and certificate templates are verified |
| Calendar link in program page | Your new Google Calendar public view/subscription link | After calendar preview and synchronization checks |

The reminder service and calendar-sync service run in the background. They are not website pages and must not be deployed as public web apps.

## Configure and deploy

1. Enter `https://2027.acadia.org/` in the configurator's website field for the 2027 edition. This also sets the program guide's expected parent website origin. For another edition, enter its actual HTTPS origin.
2. Deploy Author Portal, Program and Recognition separately as Apps Script web apps. The copied application model runs as the deploying account, which must have access to this edition's private Sheets/Drive assets. Choose the audience required by the conference; an organization may restrict the Anyone option.
3. Use the deployment's **`/exec` URL**, not the editor URL or `/dev` test URL. Test each application directly in an incognito browser before embedding.
4. Enter all three URLs in **Website integration**, generate the HTML snippets, and give them to the conference website maintainer. Updating the Author Portal URL also requires regenerating the linking modules so reminders and Recognition point to the new portal.
5. Paste each HTML block into the appropriate page's HTML/embed component. On a custom HTML site use the block directly. In a CMS use its custom HTML/embed block. In Google Sites use Insert → Embed and the deployed web-app URL. The toolkit does not depend on a particular CMS.

The generated iframe uses a responsive width and a fixed minimum height, with an “Open in a new tab” link. This avoids assuming cross-origin access to the iframe document. Do not add an iframe sandbox attribute without testing uploads, navigation, forms and PDF downloads.

The source keeps `HtmlService.XFrameOptionsMode.ALLOWALL` for embedding. This allows framing; it does not authorize viewers to read private spreadsheets. The application endpoints still enforce their inherited login/session checks. A host site's Content Security Policy may need `frame-src` entries for `https://script.google.com` and the relevant `https://*.googleusercontent.com` frame origins. Test the actual browser policy rather than weakening unrelated directives.

## Optional conference guide

The Program module includes an optional guide. Standard program embedding needs no parent-page JavaScript. For the specialized external/floating guide, the original program supports `?view=bot` and `?bot=external` plus a channel token; its parent integration is a separate advanced task. This release generates the standard program iframe and does not claim to supply the full floating-guide host bridge. The website origin setting is used by the existing message-origin checks.

## Update without changing website links

For a code/configuration update, upload the regenerated files to **this edition's** projects and update the existing deployment to a new version through Deploy → Manage deployments. Retain the deployment ID to retain its `/exec` URL. If a new deployment is created, update both the website embeds and any cross-module links in the configurator.

## Website acceptance checks

- Test desktop and mobile layouts, scrolling and keyboard access.
- Test author login, upload, document download and session expiry from inside the iframe.
- Confirm Program shows this edition's live schedule and the correct local time zone.
- Confirm Recognition displays only enabled channels and serves the correct test certificate.
- Verify direct links work when browser/account restrictions prevent embedded use.
- Confirm no links point to an old conference, old deployment or private source spreadsheet.

References: [Google Apps Script web apps](https://developers.google.com/apps-script/guides/web), [XFrameOptionsMode](https://developers.google.com/apps-script/reference/html/x-frame-options-mode), [versioned deployments](https://developers.google.com/apps-script/concepts/deployments).
