# ACMS Visual Editor

The Visual Editor is a separate, English-language Apps Script web app for committee members. It edits the public-facing content of Author Portal, Conference Program and Recognition Portal. The original submission, upload, recognition, reminder and calendar applications remain in place.

To try the interface without a Google installation, download the repository and open `editor-demo.html`. It uses fictional configuration, stores drafts and publications in that browser, and labels every publication as a local demo. It does not connect to Google or publish a conference website. The offline demo may load a banner image if you enter its public URL.

## Included editing controls

- Click outlined page text and type directly, or edit the matching field in the inspector.
- Edit 20 selected public-facing text regions across the three portal entry pages: headings, welcome messages, instructions, program introduction, and recognition committee credits.
- Set a public HTTPS banner image, its accessibility description, an accent color and a background color for each page.
- Switch between desktop and 390-pixel mobile preview widths, and between Edit and Preview modes.
- Save a shared draft, review before/after changes for all pages, and publish one version of the three pages together.
- Restore an earlier publication as a draft, review it, and publish it when ready. Existing publication snapshots are retained.

The fixed **Developed by Teng Teng** attribution is outside the editable content schema.

These controls change presentation content only. Displaying a new date in text does not change a real deadline or session. Schedules, participant records, author-task rules, certificate eligibility, email delivery, and calendar synchronization retain their existing management interfaces. Version 0.3 does not add schedule drag-and-drop, email-template editing, arbitrary HTML, or editing inside authenticated author/certificate workflows.

## First installation

1. Download the repository and open `configure.html`. Complete the normal edition configuration.
2. Generate and run the latest template builder in a **new edition's template project**. Alongside the seven workbooks and eight document templates it creates a private **Website Content and Publication History** folder and `website-content.json`. Import the generated configuration back into the configurator. The two resource fields are **Website Content Store** and **Website Content History Folder**.
3. In **Advanced content → Visual editor access**, enter any additional committee Google-account email addresses. The editor's setup owner is included automatically. The account list is an administrative deployment setting, not a field public users can change.
4. Include `content-editor` and the three public portals when generating the deployment ZIP. All four must use this edition's **same content store ID**. Keep the editor project separate from the five management projects and from the template builder.
5. Paste the generated editor files into a new Apps Script project: combined `Code.gs`, `Index.html`, `ContentRenderer.html`, `Previews.html`, and `appsscript.json`. `Previews.html` contains generated JSON with portal markup; paste it unchanged into an HTML file named `Previews`.
6. Run `RUN_CONFIGURE_NEW_INSTALLATION` in the editor project as its owner, then `RUN_CHECK_INSTALLATION`. Setup binds the content store to this one editor project and records the setup owner. It does not send mail, create triggers or change conference workbooks.
7. Deploy the editor as a web app with **Execute as: User accessing the web app**. Require Google sign-in. The generated manifest uses `USER_ACCESSING` and `ANYONE` (signed-in users, not anonymous); server-side checks further restrict every editor endpoint to the setup owner and configured editor accounts. If your organization restricts deployment audiences, choose the allowed signed-in audience and test access.
8. Share the content store file and history folder as **Editor** only with the named committee editors. Give each public portal's operating account read access to the content store. If the same account owns everything, no extra sharing is needed. Keep the store and snapshots private: they contain drafts and publication history.
9. Install and deploy the new versions of the three **new edition** portal projects. These include `Content.gs` and `ContentRenderer.html`. Existing production projects from the original conference are not an upgrade target.
10. Open the editor's `/exec` URL as an authorized committee member. Keep this URL in the private handoff record; embed only the three public portal URLs on the conference website.

Additional editors need both a matching account in configuration and Google Drive access. Deploying the editor to run as the owner is unsupported: outside that account/domain, Apps Script may not disclose the visitor's identity. A blank identity is denied rather than treated as the owner.

Use one editor project per content store. It is the only application writer; do not hand-edit the JSON store while the editor is in use. Updating that editor's existing deployment preserves its connection. A second editor project is rejected by the store binding.

## Editing and publication

**Save draft** saves shared page content in Google Drive without changing the published content. An unsaved change is marked explicitly; switching pages keeps changes in memory. Closing the browser with unsaved changes prompts the user.

**Review & publish** first saves outstanding edits, then shows changes across all three portals. **Publish now** records an immutable-by-convention snapshot file and changes the published payload in the single content-store file. There are no write endpoints in the public portal modules. Refresh a public portal or its website iframe to load the newly published content; already open pages do not receive a push update.

**Publication history → Restore as draft** copies that version into the draft only. Publish it to complete a rollback. This restores page presentation content, not Sheets, participant records, files, emails or calendar events. Every successful publication remains in the history; the editor stops after 1,000 publications rather than deleting history automatically.

The editor uses a script lock plus revision checks. If another committee member saves first, the stale operation is rejected. The UI leaves unsaved text available; copy it if needed, then reload the current draft and reconcile changes. A failed network response can be ambiguous: reload and inspect the publication history before retrying.

## Preview boundaries

Previews are generated from the same portal HTML and CSS used for deployment, and use the same content renderer. The preview removes operational scripts, disables forms and sign-in, and substitutes explicit placeholder notices for live schedules and certificate channels. It does not load participant records or exercise uploads, certificate generation or account access. Existing asset loading outside the editable banner may differ until tested in the live portal.

Plain text is rendered through text nodes. The editor does not accept executable markup, arbitrary CSS, JavaScript URLs or edits to the developer credit. Banner URLs must point to publicly readable HTTPS images; a Drive sharing-page URL is not a direct image URL. A banner request is made by the visitor's browser to that image host.

Edits to content require no new Apps Script deployment after the editor and portal adapters are installed. Changes to functionality, editable-field definitions, committee authorization or base templates require generating and deploying a new code version. Rebuild the editor with the portals when their base markup changes so preview and installed markup remain aligned.

The editor controls ACMS content inside the website's embed. It does not edit the host website's navigation or other CMS pages.

## Acceptance checks

1. Use fictional data in a separate edition. Confirm an unlisted account and an anonymous request cannot open the editor or call save/publish functions.
2. Change one heading in each portal. Save the draft and reload each public page; the installed/published text must remain unchanged.
3. Review the three changes, publish, and reload each public page and website embed. Confirm text, banner, desktop/mobile layout and fixed developer credit.
4. Open two editor tabs. Save in the first, then try saving in the second. Confirm the stale revision is rejected and no newer draft is overwritten.
5. Publish a second version, restore the first as a draft, and confirm the second remains live until republishing.
6. Test author login/upload and recognition access with fictional records after installing the adapters. Confirm original management actions and eligibility behavior are unchanged.
7. Confirm no mail was sent, calendar event modified, certificate issued or conference workbook changed by editing, saving, publishing or restoring content.

Local tests cover these content/state contracts and the interface workflow using service doubles and DOM tests. Google authentication, actual Drive permissions and full deployment/browser rendering still require the live acceptance above.
