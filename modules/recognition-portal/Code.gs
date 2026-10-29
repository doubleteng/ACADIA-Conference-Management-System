/**
 * ACADIA 2026 Peer Reviewer Portal
 * Standalone Google Apps Script web application.
 *
 * Certificates, sessions, and logs belong to this Recognition Portal.
 * The presenter module reads Author Hub and Presentation Administration records
 * by submission ID; it does not modify either source workbook.
 */

const REVIEWER_PORTAL = Object.freeze({
  MASTER_SPREADSHEET_ID: "__ACADIA_RESOURCE_recognitionId__",
  ROOT_FOLDER_ID: "__ACADIA_RESOURCE_recognitionRootId__",
  SOURCE_HTML_FILE_ID: "__ACADIA_RESOURCE_easychairHtmlId__",
  CERTIFICATE_OUTPUT_FOLDER_ID: "__ACADIA_RESOURCE_certificateOutputId__",
  SHEETS: Object.freeze({
    SETTINGS: 'Settings',
    COMPLETED: 'Completed_Reviews',
    SUMMARY: 'Reviewer_Summary',
    LOG: 'Certificate_Log',
    INTEREST: "__ACADIA_TEXT_t0090__"
  }),
  REQUIRED_STATUS: 'review added to EasyChair',
  SESSION_PREFIX: 'reviewer-session:',
  SESSION_SECONDS: 30 * 60,
  MAX_LOGIN_FAILURES: 8,
  LOGIN_WINDOW_SECONDS: 10 * 60
});

const DEFAULT_SETTINGS = Object.freeze({
  APP_NAME: "__ACADIA_TEXT_t0091__",
  PORTAL_ENABLED: 'TRUE',
  CONFERENCE_NAME: "__ACADIA_TEXT_t0002__",
  WORKSHOP_DATES: "__ACADIA_TEXT_t0004__",
  CONFERENCE_DATES: "__ACADIA_TEXT_t0005__",
  CONFERENCE_LOCATION: "__ACADIA_TEXT_t0003__",
  CONTACT_EMAIL: "__ACADIA_TEXT_t0037__",
  TICKET_URL: "__ACADIA_TEXT_t0092__",
  AUTHOR_PORTAL_URL: "__ACADIA_VALUE_authorPortalUrl__",
  BANNER_FILE_ID: "__ACADIA_RESOURCE_bannerId__",
  MASTER_SPREADSHEET_ID: REVIEWER_PORTAL.MASTER_SPREADSHEET_ID,
  ROOT_FOLDER_ID: REVIEWER_PORTAL.ROOT_FOLDER_ID,
  SOURCE_HTML_FILE_ID: REVIEWER_PORTAL.SOURCE_HTML_FILE_ID,
  CERTIFICATE_TEMPLATE_FILE_ID: '',
  CERTIFICATE_OUTPUT_FOLDER_ID: REVIEWER_PORTAL.CERTIFICATE_OUTPUT_FOLDER_ID,
  CERTIFICATE_TITLE: 'Peer Review Certification',
  CERTIFICATE_PREFIX: "__ACADIA_TEXT_t0093__",
  SESSION_MINUTES: '30',
  SOURCE_COMPLETION_STATUS: REVIEWER_PORTAL.REQUIRED_STATUS
});

function doGet() {
  return acmsDecorateOutput_(HtmlService.createTemplateFromFile('Index').evaluate(), 'recognition-portal')
    .setTitle("__ACADIA_TEXT_t0091__")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Run once after adding Code.gs and Index.html to a new standalone project. */
function RUN_SETUP_REVIEWER_PORTAL() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureWorkbook_();
    ensureSettings_();
    const imported = importCompletedReviewsFromEasyChair_();
    return {
      ok: true,
      completedReviews: imported.completedReviews,
      uniqueReviewers: imported.uniqueReviewers,
      duplicateRowsSkipped: imported.duplicateRowsSkipped,
      templateReady: Boolean(getSettings_().CERTIFICATE_TEMPLATE_FILE_ID),
      message: 'Reviewer Portal setup completed.'
    };
  } finally {
    lock.releaseLock();
  }
}

/** Re-read the EasyChair HTML and rebuild the independent reviewer database. */
function RUN_REFRESH_EASYCHAIR_DATA() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    ensureWorkbook_();
    ensureSettings_();
    return importCompletedReviewsFromEasyChair_();
  } finally {
    lock.releaseLock();
  }
}

/** Checks the template type and required placeholders without generating a PDF. */
function RUN_VERIFY_CERTIFICATE_TEMPLATE() {
  const settings = getSettings_();
  const templateId = String(settings.CERTIFICATE_TEMPLATE_FILE_ID || '').trim();
  if (!templateId) {
    throw new Error('CERTIFICATE_TEMPLATE_FILE_ID is blank in Settings.');
  }
  const file = DriveApp.getFileById(templateId);
  if (file.getMimeType() !== MimeType.GOOGLE_DOCS) {
    throw new Error('The certificate template must be a native Google Doc.');
  }
  const doc = DocumentApp.openById(templateId);
  const templateText = collectDocumentText_(doc);
  const required = ['{{REVIEWER_NAME}}', '{{REVIEW_COUNT}}', '{{REVIEWED_TITLES}}'];
  const missing = required.filter(token => templateText.indexOf(token) === -1);
  if (missing.length) {
    throw new Error('Template is missing: ' + missing.join(', '));
  }
  return {
    ok: true,
    templateId: templateId,
    templateName: file.getName(),
    optionalPlaceholders: ['{{DATE}}', '{{CONFERENCE_NAME}}', '{{CONFERENCE_DATES}}', '{{CONFERENCE_LOCATION}}', '{{CONTACT_EMAIL}}']
  };
}

function getPublicPortalConfig() {
  const settings = getSettings_();
  const configuredAppName = String(settings.APP_NAME || '').trim();
  return {
    appName: configuredAppName && configuredAppName !== "__ACADIA_TEXT_t0094__"
      ? configuredAppName
      : DEFAULT_SETTINGS.APP_NAME,
    enabled: toBoolean_(settings.PORTAL_ENABLED, true),
    conferenceName: settings.CONFERENCE_NAME || DEFAULT_SETTINGS.CONFERENCE_NAME,
    workshopDates: settings.WORKSHOP_DATES || DEFAULT_SETTINGS.WORKSHOP_DATES,
    conferenceDates: settings.CONFERENCE_DATES || DEFAULT_SETTINGS.CONFERENCE_DATES,
    conferenceLocation: settings.CONFERENCE_LOCATION || DEFAULT_SETTINGS.CONFERENCE_LOCATION,
    contactEmail: settings.CONTACT_EMAIL || DEFAULT_SETTINGS.CONTACT_EMAIL,
    ticketUrl: settings.TICKET_URL || DEFAULT_SETTINGS.TICKET_URL,
    certificateChannels: publicCertificateChannels_(settings),
    bannerUrl: settings.BANNER_FILE_ID
      ? 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(settings.BANNER_FILE_ID) + '&sz=w2000'
      : '',
    templateReady: Boolean(String(settings.CERTIFICATE_TEMPLATE_FILE_ID || '').trim())
  };
}

/**
 * Public channel registry for the shared Recognition Portal homepage.
 * A future certificate type can be activated without changing the homepage
 * layout; its own authentication and generation functions remain isolated.
 */
function publicCertificateChannels_(settings) {
  return [
    {
      id: 'peer-reviewer',
      title: 'Peer Reviewer',
      certificateTitle: 'Peer Review Certification',
      description: 'For reviewers with completed reviews recorded in EasyChair.',
      status: 'open'
    },
    {
      id: 'workshop-attendee',
      title: 'Workshop Attendee',
      certificateTitle: 'Workshop Participation Certificate',
      description: 'Sign in with your registered attendee name and email to download your workshop certificate.',
      status: toBoolean_((settings || {}).WORKSHOP_ENABLED, false) && Boolean((settings || {}).WORKSHOP_TEMPLATE_FILE_ID) ? 'open' : 'locked'
    },
    {
      id: 'workshop-instructor',
      title: 'Workshop Instructor',
      certificateTitle: 'Workshop Instruction Certificate',
      description: 'Enter your instructor name to download your workshop instruction certificate.',
      status: toBoolean_((settings || {}).INSTRUCTOR_ENABLED, false) && Boolean((settings || {}).INSTRUCTOR_TEMPLATE_FILE_ID) ? 'open' : 'locked'
    },
    {
      id: 'session-chair',
      title: 'Session Chair',
      certificateTitle: 'Session Chair Certificate',
      description: 'Sign in with your chair name and email to download a certificate listing your tracks, sessions, dates, times, and presentation counts.',
      status: toBoolean_((settings || {}).CHAIR_ENABLED, false) && Boolean((settings || {}).CHAIR_TEMPLATE_FILE_ID) ? 'open' : 'locked'
    },
    {
      id: 'conference-presenter',
      title: 'Conference Presenter',
      certificateTitle: 'Presentation Certificate',
      description: 'Sign in with your author name and registered email to download presentation certificates for papers, projects, field notes, and Book Forum.',
      status: toBoolean_((settings || {}).PRESENTER_ENABLED, false) && Boolean((settings || {}).PRESENTER_TEMPLATE_FILE_ID) ? 'open' : 'locked'
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      certificateTitle: 'Volunteer Certificate',
      description: "__ACADIA_TEXT_t0095__",
      status: toBoolean_((settings || {}).VOLUNTEER_ENABLED, false) && Boolean((settings || {}).VOLUNTEER_TEMPLATE_FILE_ID) ? 'open' : 'locked'
    }
  ];
}

/** Reviewer login uses EasyChair name + email from Reviewer_Summary. */
function loginReviewer(name, email) {
  const settings = getSettings_();
  if (!toBoolean_(settings.PORTAL_ENABLED, true)) {
    throw new Error('The Reviewer Portal is temporarily unavailable.');
  }

  const cleanName = cleanText_(name, 200);
  const cleanEmail = normalizeEmail_(email);
  if (!cleanName || !isValidEmail_(cleanEmail)) {
    throw new Error('Enter the name and email address used in EasyChair.');
  }
  enforceLoginLimit_(cleanEmail);

  const reviewer = findReviewer_(cleanName, cleanEmail);
  if (!reviewer) {
    registerLoginFailure_(cleanEmail);
    throw new Error('The name and email do not match a completed EasyChair review record.');
  }
  clearLoginFailures_(cleanEmail);

  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put(
    REVIEWER_PORTAL.SESSION_PREFIX + token,
    JSON.stringify({ email: reviewer.email, name: reviewer.name, issuedAt: Date.now() }),
    sessionSeconds_(settings)
  );

  return {
    ok: true,
    token: token,
    reviewer: publicReviewer_(reviewer),
    templateReady: Boolean(String(settings.CERTIFICATE_TEMPLATE_FILE_ID || '').trim())
  };
}

function getReviewerSession(token) {
  const reviewer = reviewerFromSession_(token);
  return { ok: true, reviewer: publicReviewer_(reviewer) };
}

function logoutReviewer(token) {
  const cleanToken = cleanToken_(token);
  if (cleanToken) CacheService.getScriptCache().remove(REVIEWER_PORTAL.SESSION_PREFIX + cleanToken);
  return { ok: true };
}

/** Generates or reuses the PDF certificate for the authenticated reviewer. */
function generateReviewerCertificate(token, certificateOptions) {
  const reviewer = reviewerFromSession_(token);
  const preferences = normalizeCertificatePreferences_(certificateOptions);
  const certificateDisplayName = certificateDisplayName_(reviewer.name, preferences);
  recordReviewerInterest_(reviewer, preferences, certificateDisplayName);
  const settings = getSettings_();
  const templateId = String(settings.CERTIFICATE_TEMPLATE_FILE_ID || '').trim();
  const outputFolderId = String(settings.CERTIFICATE_OUTPUT_FOLDER_ID || '').trim();
  if (!templateId) throw new Error('The certificate template has not been configured yet.');
  if (!outputFolderId) throw new Error('The certificate output folder is not configured.');

  const templateFile = DriveApp.getFileById(templateId);
  if (templateFile.getMimeType() !== MimeType.GOOGLE_DOCS) {
    throw new Error('The configured certificate template must be a native Google Doc.');
  }

  const fingerprint = certificateFingerprint_(reviewer, templateId, preferences, certificateDisplayName);
  const existing = findExistingCertificate_(reviewer.email, fingerprint);
  if (existing) return existing;

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let workingCopy = null;
  try {
    const secondCheck = findExistingCertificate_(reviewer.email, fingerprint);
    if (secondCheck) return secondCheck;

    const outputFolder = DriveApp.getFolderById(outputFolderId);
    const safeName = filenameSafe_(reviewer.name);
    const prefix = filenameSafe_(settings.CERTIFICATE_PREFIX || DEFAULT_SETTINGS.CERTIFICATE_PREFIX);
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "__ACADIA_TEXT_t0023__", 'yyyyMMdd-HHmmss');
    const baseName = prefix + '_' + safeName + '_' + timestamp;

    workingCopy = templateFile.makeCopy(baseName + '_working', outputFolder);
    const doc = DocumentApp.openById(workingCopy.getId());
    const replacements = {
      '{{REVIEWER_NAME}}': certificateDisplayName,
      '{{REVIEW_COUNT}}': String(reviewer.reviewCount),
      '{{REVIEWED_TITLES}}': formatReviewedTitlesForCertificate_(reviewer.reviews),
      '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy'),
      '{{CONFERENCE_NAME}}': settings.CONFERENCE_NAME || DEFAULT_SETTINGS.CONFERENCE_NAME,
      '{{CONFERENCE_DATES}}': settings.CONFERENCE_DATES || DEFAULT_SETTINGS.CONFERENCE_DATES,
      '{{CONFERENCE_LOCATION}}': settings.CONFERENCE_LOCATION || DEFAULT_SETTINGS.CONFERENCE_LOCATION,
      '{{CONTACT_EMAIL}}': settings.CONTACT_EMAIL || DEFAULT_SETTINGS.CONTACT_EMAIL,
      '{{SUBMISSION_IDS}}': reviewer.reviews.map(item => item.submissionId).join(', ')
    };
    replaceDocumentPlaceholders_(doc, replacements);
    doc.saveAndClose();

    const pdfBlob = workingCopy.getAs(MimeType.PDF).setName(baseName + '.pdf');
    const pdfFile = outputFolder.createFile(pdfBlob);
    workingCopy.setTrashed(true);
    workingCopy = null;

    const viewUrl = 'https://drive.google.com/file/d/' + encodeURIComponent(pdfFile.getId()) + '/view';
    appendCertificateLog_(reviewer, pdfFile, templateId, fingerprint, viewUrl);
    return certificateDownloadPayload_(pdfFile, false);
  } finally {
    if (workingCopy) {
      try { workingCopy.setTrashed(true); } catch (ignored) {}
    }
    lock.releaseLock();
  }
}

function importCompletedReviewsFromEasyChair_() {
  const settings = getSettings_();
  const sourceId = String(settings.SOURCE_HTML_FILE_ID || REVIEWER_PORTAL.SOURCE_HTML_FILE_ID).trim();
  const html = DriveApp.getFileById(sourceId).getBlob().getDataAsString('UTF-8');
  const parsed = parseEasyChairReviewHtml_(html);
  if (!parsed.rows.length) {
    throw new Error('No completed reviews were found. The source format or completion label may have changed.');
  }

  const ss = masterSpreadsheet_();
  const completedSheet = ss.getSheetByName(REVIEWER_PORTAL.SHEETS.COMPLETED);
  const summarySheet = ss.getSheetByName(REVIEWER_PORTAL.SHEETS.SUMMARY);
  const completedValues = [[
    'Submission ID', 'Paper Title', 'Reviewer Name', 'Reviewer Email',
    'Status', 'Completed Date (EasyChair)', 'Unique Key'
  ]].concat(parsed.rows.map(row => [
    Number(row.submissionId), row.title, row.name, row.email,
    row.status, row.completedDate, row.email + '|' + row.submissionId
  ]));

  replaceSheetValues_(completedSheet, completedValues);
  const summaries = summarizeReviews_(parsed.rows);
  const summaryValues = [[
    'Reviewer Name', 'Reviewer Email', 'Completed Review Count', 'Submission IDs',
    'Reviewed Paper Titles', 'Normalized Name', 'Login Enabled'
  ]].concat(summaries.map(item => [
    item.name, item.email, item.reviews.length,
    item.reviews.map(review => review.submissionId).join(', '),
    item.reviews.map((review, index) => (index + 1) + '. ' + review.title).join('\n'),
    normalizeName_(item.name), true
  ]));
  replaceSheetValues_(summarySheet, summaryValues);
  updateSetting_('LAST_SOURCE_IMPORT_AT', new Date().toISOString(), 'Most recent successful EasyChair HTML import');
  SpreadsheetApp.flush();
  return {
    ok: true,
    completedReviews: parsed.rows.length,
    uniqueReviewers: summaries.length,
    duplicateRowsSkipped: parsed.duplicates,
    sourceFileId: sourceId
  };
}

function parseEasyChairReviewHtml_(html) {
  const rowBlocks = String(html || '').match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || [];
  const rows = [];
  const seen = {};
  let duplicates = 0;

  rowBlocks.forEach(rowHtml => {
    const cells = rowHtml.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi) || [];
    if (cells.length < 7) return;
    const status = htmlText_(cells[5]);
    if (status.toLowerCase() !== REVIEWER_PORTAL.REQUIRED_STATUS.toLowerCase()) return;

    const idMatch = htmlText_(cells[0]).match(/\d+/);
    if (!idMatch) return;
    const submissionId = idMatch[0];
    const titleInner = cells[1].replace(/^<td\b[^>]*>/i, '').replace(/<\/td>$/i, '');
    const titleMatch = titleInner.match(/<\/i>\s*\.\s*([\s\S]*)$/i);
    const title = htmlText_(titleMatch ? titleMatch[1] : titleInner);
    const reviewerCell = htmlText_(cells[2]);
    const reviewerMatch = reviewerCell.match(/^(.*?)\s*<([^<>@\s]+@[^<>\s]+)>\s*$/);
    if (!reviewerMatch || !title) return;

    const name = reviewerMatch[1].trim();
    const email = normalizeEmail_(reviewerMatch[2]);
    const key = email + '|' + submissionId;
    if (seen[key]) {
      duplicates++;
      return;
    }
    seen[key] = true;
    rows.push({
      submissionId: submissionId,
      title: title,
      name: name,
      email: email,
      status: REVIEWER_PORTAL.REQUIRED_STATUS,
      completedDate: htmlText_(cells[6])
    });
  });

  rows.sort((a, b) => a.email.localeCompare(b.email) || Number(a.submissionId) - Number(b.submissionId));
  return { rows: rows, duplicates: duplicates };
}

function summarizeReviews_(rows) {
  const byEmail = {};
  rows.forEach(row => {
    if (!byEmail[row.email]) byEmail[row.email] = { name: row.name, email: row.email, reviews: [] };
    byEmail[row.email].reviews.push({ submissionId: row.submissionId, title: row.title, completedDate: row.completedDate });
  });
  return Object.keys(byEmail).map(email => byEmail[email]).sort((a, b) => a.name.localeCompare(b.name));
}

function findReviewer_(name, email) {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.SUMMARY);
  const values = sheet.getDataRange().getValues();
  const wantedName = normalizeName_(name);
  const wantedEmail = normalizeEmail_(email);
  for (let row = 1; row < values.length; row++) {
    const enabled = toBoolean_(values[row][6], true);
    if (!enabled) continue;
    const storedName = String(values[row][0] || '').trim();
    const storedEmail = normalizeEmail_(values[row][1]);
    const normalizedStoredName = String(values[row][5] || normalizeName_(storedName));
    if (storedEmail === wantedEmail && normalizedStoredName === wantedName) {
      return reviewerDetailsByEmail_(storedName, storedEmail);
    }
  }
  return null;
}

function reviewerDetailsByEmail_(name, email) {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.COMPLETED);
  const values = sheet.getDataRange().getValues();
  const reviews = [];
  for (let row = 1; row < values.length; row++) {
    if (normalizeEmail_(values[row][3]) !== email) continue;
    reviews.push({
      submissionId: String(values[row][0]),
      title: String(values[row][1]),
      completedDate: String(values[row][5] || '')
    });
  }
  reviews.sort((a, b) => Number(a.submissionId) - Number(b.submissionId));
  if (!reviews.length) return null;
  return { name: name, email: email, reviewCount: reviews.length, reviews: reviews };
}

function reviewerFromSession_(token) {
  const cleanToken = cleanToken_(token);
  if (!cleanToken) throw new Error('Your session has expired. Please sign in again.');
  const cache = CacheService.getScriptCache();
  const raw = cache.get(REVIEWER_PORTAL.SESSION_PREFIX + cleanToken);
  if (!raw) throw new Error('Your session has expired. Please sign in again.');
  const session = JSON.parse(raw);
  const reviewer = reviewerDetailsByEmail_(String(session.name), normalizeEmail_(session.email));
  if (!reviewer) throw new Error('No completed review record is currently available for this account.');
  cache.put(REVIEWER_PORTAL.SESSION_PREFIX + cleanToken, raw, sessionSeconds_(getSettings_()));
  return reviewer;
}

function publicReviewer_(reviewer) {
  return {
    name: reviewer.name,
    email: reviewer.email,
    reviewCount: reviewer.reviewCount,
    reviews: reviewer.reviews.map(item => ({
      submissionId: item.submissionId,
      title: item.title,
      completedDate: item.completedDate
    }))
  };
}

function findExistingCertificate_(email, fingerprint) {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.LOG);
  const values = sheet.getDataRange().getValues();
  for (let row = values.length - 1; row >= 1; row--) {
    if (normalizeEmail_(values[row][3]) !== email || String(values[row][11]) !== fingerprint) continue;
    const fileId = String(values[row][7] || '');
    if (!fileId) continue;
    try {
      const file = DriveApp.getFileById(fileId);
      if (file.isTrashed()) continue;
      return certificateDownloadPayload_(file, true);
    } catch (ignored) {}
  }
  return null;
}

/** Return the private PDF through the authenticated portal session. */
function certificateDownloadPayload_(file, reused) {
  const blob = file.getBlob();
  return {
    ok: true,
    reused: Boolean(reused),
    fileName: file.getName(),
    mimeType: blob.getContentType() || MimeType.PDF,
    pdfBase64: Utilities.base64Encode(blob.getBytes())
  };
}

function appendCertificateLog_(reviewer, file, templateId, fingerprint, viewUrl) {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.LOG);
  sheet.appendRow([
    Utilities.getUuid(), new Date(), reviewer.name, reviewer.email, reviewer.reviewCount,
    reviewer.reviews.map(item => item.submissionId).join(', '),
    reviewer.reviews.map(item => item.title).join('\n'),
    file.getId(), file.getName(), viewUrl, templateId, fingerprint
  ]);
}

function certificateFingerprint_(reviewer, templateId, preferences, certificateDisplayName) {
  const source = JSON.stringify({
    email: reviewer.email,
    name: reviewer.name,
    certificateDisplayName: certificateDisplayName,
    preferredPrefix: preferences.prefix,
    reviews: reviewer.reviews.map(item => [item.submissionId, item.title]),
    templateId: templateId,
    templateUpdatedAt: DriveApp.getFileById(templateId).getLastUpdated().getTime(),
    certificateLayoutVersion: 'one-page-v4-recognition-preferences'
  });
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, source, Utilities.Charset.UTF_8);
  return digest.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

/** Keep every generated certificate to one page by listing at most three titles. */
function formatReviewedTitlesForCertificate_(reviews) {
  const items = Array.isArray(reviews) ? reviews : [];
  const lines = items.slice(0, 3).map((item, index) => (index + 1) + '. ' + item.title);
  if (items.length > 3) lines.push('… and others.');
  return lines.join('\n');
}

function replaceDocumentPlaceholders_(doc, replacements) {
  const containers = [doc.getBody()];
  const header = doc.getHeader();
  const footer = doc.getFooter();
  if (header) containers.push(header);
  if (footer) containers.push(footer);
  containers.forEach(container => {
    Object.keys(replacements).forEach(token => {
      replacePlaceholderPreservingStyle_(
        container,
        token,
        String(replacements[token] == null ? '' : replacements[token])
      );
    });
  });
}

/**
 * Replace every occurrence while explicitly carrying the placeholder's
 * character formatting (font, size, bold, italic, color, etc.) to all inserted
 * text. This is required for multiline replacements such as reviewed titles,
 * whose formatting is not reliably preserved by ContainerElement.replaceText.
 */
function replacePlaceholderPreservingStyle_(container, token, replacement) {
  const pattern = regexEscape_(token);
  let match = container.findText(pattern);
  while (match) {
    const text = match.getElement().asText();
    const start = match.getStartOffset();
    const end = match.getEndOffsetInclusive();
    const attributes = text.getAttributes(start);

    text.deleteText(start, end);
    if (replacement) {
      text.insertText(start, replacement);
      text.setAttributes(start, start + replacement.length - 1, attributes);
    }

    match = container.findText(pattern);
  }
}

function normalizeCertificatePreferences_(input) {
  const options = input && typeof input === 'object' ? input : {};
  const key = String(options.prefixKey || '').trim().toLowerCase();
  const prefixes = {
    none: '',
    dr: 'Dr.',
    prof: 'Prof.',
    mr: 'Mr.',
    ms: 'Ms.',
    mrs: 'Mrs.',
    mx: 'Mx.'
  };
  let prefix = '';
  if (key === 'other') {
    prefix = cleanText_(options.customPrefix, 40).replace(/\s+/g, ' ').trim();
    if (!prefix) throw new Error('Enter the name prefix you want shown on the certificate.');
  } else if (Object.prototype.hasOwnProperty.call(prefixes, key)) {
    prefix = prefixes[key];
  } else {
    throw new Error('Choose how your name should appear on the certificate.');
  }

  const reviewAgain = String(options.reviewAgain || '').trim().toLowerCase();
  const interestLabels = {
    yes: 'Yes',
    maybe: 'Maybe — contact me later',
    no: 'No'
  };
  if (!Object.prototype.hasOwnProperty.call(interestLabels, reviewAgain)) {
    throw new Error('Please indicate whether you would be willing to review for ACADIA again next year.');
  }
  return {
    prefixKey: key,
    prefix: prefix,
    reviewAgain: reviewAgain,
    reviewAgainLabel: interestLabels[reviewAgain]
  };
}

function certificateDisplayName_(easyChairName, preferences) {
  const baseName = String(easyChairName || '')
    .replace(/^(?:dr\.?|prof\.?|professor|mr\.?|ms\.?|mrs\.?|mx\.?)\s+/i, '')
    .trim();
  return preferences.prefix ? preferences.prefix + ' ' + baseName : baseName;
}

/** Upsert one response per verified EasyChair email address. */
function recordReviewerInterest_(reviewer, preferences, certificateDisplayName) {
  const sheet = ensureReviewerInterestSheet_();
  const email = normalizeEmail_(reviewer.email);
  const rowValues = [[
    new Date(),
    reviewer.name,
    reviewer.email,
    preferences.prefix || 'No prefix',
    certificateDisplayName,
    preferences.reviewAgainLabel,
    reviewer.reviewCount,
    reviewer.reviews.map(item => item.submissionId).join(', ')
  ]];

  let targetRow = sheet.getLastRow() + 1;
  if (sheet.getLastRow() > 1) {
    const emails = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (let index = 0; index < emails.length; index++) {
      if (normalizeEmail_(emails[index][0]) === email) {
        targetRow = index + 2;
        break;
      }
    }
  }
  sheet.getRange(targetRow, 1, 1, rowValues[0].length).setValues(rowValues);
}

function ensureReviewerInterestSheet_() {
  const ss = masterSpreadsheet_();
  let sheet = ss.getSheetByName(REVIEWER_PORTAL.SHEETS.INTEREST);
  const headers = [
    'Response Updated At',
    'EasyChair Reviewer Name',
    'EasyChair Reviewer Email',
    'Preferred Name Prefix',
    'Certificate Display Name',
    "__ACADIA_TEXT_t0096__",
    'Completed Review Count',
    'Submission IDs'
  ];
  if (!sheet) sheet = ss.insertSheet(REVIEWER_PORTAL.SHEETS.INTEREST);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader_(sheet, headers.length);
  return sheet;
}

function collectDocumentText_(doc) {
  const parts = [doc.getBody().getText()];
  if (doc.getHeader()) parts.push(doc.getHeader().getText());
  if (doc.getFooter()) parts.push(doc.getFooter().getText());
  return parts.join('\n');
}

function ensureWorkbook_() {
  const ss = masterSpreadsheet_();
  const definitions = [
    [REVIEWER_PORTAL.SHEETS.SETTINGS, ['Key', 'Value', 'Notes']],
    [REVIEWER_PORTAL.SHEETS.COMPLETED, ['Submission ID', 'Paper Title', 'Reviewer Name', 'Reviewer Email', 'Status', 'Completed Date (EasyChair)', 'Unique Key']],
    [REVIEWER_PORTAL.SHEETS.SUMMARY, ['Reviewer Name', 'Reviewer Email', 'Completed Review Count', 'Submission IDs', 'Reviewed Paper Titles', 'Normalized Name', 'Login Enabled']],
    [REVIEWER_PORTAL.SHEETS.LOG, ['Request ID', 'Generated At', 'Reviewer Name', 'Reviewer Email', 'Review Count', 'Submission IDs', 'Paper Titles', 'PDF File ID', 'PDF File Name', 'PDF URL', 'Template File ID', 'Data Fingerprint']],
    [REVIEWER_PORTAL.SHEETS.INTEREST, ['Response Updated At', 'EasyChair Reviewer Name', 'EasyChair Reviewer Email', 'Preferred Name Prefix', 'Certificate Display Name', "__ACADIA_TEXT_t0096__", 'Completed Review Count', 'Submission IDs']]
  ];
  definitions.forEach(definition => {
    let sheet = ss.getSheetByName(definition[0]);
    if (!sheet) sheet = ss.insertSheet(definition[0]);
    if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, definition[1].length).setValues([definition[1]]);
    formatHeader_(sheet, definition[1].length);
  });
}

function ensureSettings_() {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const existing = {};
  for (let row = 1; row < values.length; row++) existing[String(values[row][0])] = true;
  const additions = [];
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    if (!existing[key]) additions.push([key, DEFAULT_SETTINGS[key], '']);
  });
  if (additions.length) sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, 3).setValues(additions);
}

function getSettings_() {
  ensureWorkbook_();
  ensureSettings_();
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.SETTINGS);
  const values = sheet.getDataRange().getValues();
  const settings = {};
  for (let row = 1; row < values.length; row++) {
    const key = String(values[row][0] || '').trim();
    if (key) settings[key] = values[row][1];
  }
  return settings;
}

function updateSetting_(key, value, notes) {
  const sheet = masterSpreadsheet_().getSheetByName(REVIEWER_PORTAL.SHEETS.SETTINGS);
  const values = sheet.getDataRange().getValues();
  for (let row = 1; row < values.length; row++) {
    if (String(values[row][0]) === key) {
      sheet.getRange(row + 1, 2, 1, 2).setValues([[value, notes || values[row][2] || '']]);
      return;
    }
  }
  sheet.appendRow([key, value, notes || '']);
}

function replaceSheetValues_(sheet, values) {
  sheet.clearContents();
  if (sheet.getMaxRows() < values.length) sheet.insertRowsAfter(sheet.getMaxRows(), values.length - sheet.getMaxRows());
  if (sheet.getMaxColumns() < values[0].length) sheet.insertColumnsAfter(sheet.getMaxColumns(), values[0].length - sheet.getMaxColumns());
  sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  formatHeader_(sheet, values[0].length);
  sheet.autoResizeColumns(1, values[0].length);
}

function formatHeader_(sheet, columns) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, columns)
    .setBackground('#e9533d')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
}

function masterSpreadsheet_() {
  return SpreadsheetApp.openById(REVIEWER_PORTAL.MASTER_SPREADSHEET_ID);
}

function htmlText_(value) {
  return decodeHtml_(String(value || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml_(value) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return String(value || '')
    .replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
      const lower = entity.toLowerCase();
      if (named[lower] != null) return named[lower];
      if (lower.charAt(0) === '#') {
        const hex = lower.charAt(1) === 'x';
        const number = parseInt(lower.slice(hex ? 2 : 1), hex ? 16 : 10);
        return isNaN(number) ? match : String.fromCodePoint(number);
      }
      return match;
    });
}

function normalizeName_(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeEmail_(value) {
  return String(value || '').normalize('NFKC').trim().toLowerCase();
}

function isValidEmail_(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength || 500);
}

function cleanToken_(value) {
  const token = String(value || '').trim();
  return /^[a-f0-9-]{40,100}$/i.test(token) ? token : '';
}

function filenameSafe_(value) {
  return String(value || '').normalize('NFKD').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'Reviewer';
}

function regexEscape_(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toBoolean_(value, fallback) {
  if (value === true || String(value).toUpperCase() === 'TRUE') return true;
  if (value === false || String(value).toUpperCase() === 'FALSE') return false;
  return fallback;
}

function sessionSeconds_(settings) {
  const minutes = Math.max(5, Math.min(360, Number(settings.SESSION_MINUTES || 30)));
  return Math.round(minutes * 60);
}

function loginFailureKey_(email) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalizeEmail_(email), Utilities.Charset.UTF_8);
  const shortHash = digest.slice(0, 12).map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
  return 'reviewer-login-fail:' + shortHash;
}

function enforceLoginLimit_(email) {
  const count = Number(CacheService.getScriptCache().get(loginFailureKey_(email)) || 0);
  if (count >= REVIEWER_PORTAL.MAX_LOGIN_FAILURES) {
    throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  }
}

function registerLoginFailure_(email) {
  const cache = CacheService.getScriptCache();
  const key = loginFailureKey_(email);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), REVIEWER_PORTAL.LOGIN_WINDOW_SECONDS);
}

function clearLoginFailures_(email) {
  CacheService.getScriptCache().remove(loginFailureKey_(email));
}

