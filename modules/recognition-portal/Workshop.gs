/** Workshop certificates: private roster, separate sessions, server-side ownership checks. */
const WORKSHOP_PORTAL = Object.freeze({
  REGISTRATIONS: 'Workshop_Registrations', CATALOG: 'Workshop_Catalog', LOG: 'Workshop_Certificate_Log',
  SESSION_PREFIX: 'workshop-session:', SESSION_SECONDS: 1800
});

function workshopSettings_() {
  const settings = getSettings_();
  if (!toBoolean_(settings.PORTAL_ENABLED, true) || !toBoolean_(settings.WORKSHOP_ENABLED, false))
    throw new Error('Workshop certificates are temporarily unavailable. Please try again later.');
  if (!settings.WORKSHOP_TEMPLATE_FILE_ID || !settings.WORKSHOP_OUTPUT_FOLDER_ID)
    throw new Error('Workshop certificates are being prepared. Please try again later.');
  return settings;
}

function workshopRows_(name) {
  const sheet = masterSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error("__ACADIA_TEXT_t0114__");
  return sheet.getDataRange().getValues().slice(1);
}

function workshopMatches_(name, email) {
  const catalog = {};
  workshopRows_(WORKSHOP_PORTAL.CATALOG).forEach(row => {
    catalog[String(row[0])] = {title: String(row[1]), dates: String(row[2]), location: String(row[3])};
  });
  const seen = {};
  return workshopRows_(WORKSHOP_PORTAL.REGISTRATIONS).filter(row => {
    const key = String(row[3]);
    if (!toBoolean_(row[4], false) || !catalog[key] || seen[key] ||
        normalizeName_(row[1]) !== normalizeName_(name) || normalizeEmail_(row[2]) !== normalizeEmail_(email)) return false;
    seen[key] = true;
    return true;
  }).map(row => ({registrationId: String(row[0]), name: String(row[1]), email: normalizeEmail_(row[2]),
    workshopId: String(row[3]), title: catalog[String(row[3])].title,
    dates: catalog[String(row[3])].dates, location: catalog[String(row[3])].location}));
}

function loginWorkshopAttendee(name, email) {
  workshopSettings_();
  const cleanName = cleanText_(name, 200), cleanEmail = normalizeEmail_(email);
  const mismatch = "__ACADIA_TEXT_t0115__";
  if (!cleanName || cleanEmail.length > 254 || !isValidEmail_(cleanEmail)) throw new Error(mismatch);
  const cache = CacheService.getScriptCache();
  const key = 'workshop-' + loginFailureKey_(cleanEmail);
  const failures = Number(cache.get(key) || 0);
  if (failures >= 8) throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  const matches = workshopMatches_(cleanName, cleanEmail);
  if (!matches.length) { cache.put(key, String(failures + 1), 600); throw new Error(mismatch); }
  cache.remove(key);
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  cache.put(WORKSHOP_PORTAL.SESSION_PREFIX + token,
    JSON.stringify({name: matches[0].name, email: cleanEmail}), WORKSHOP_PORTAL.SESSION_SECONDS);
  return {ok: true, token: token, attendee: {name: matches[0].name, email: cleanEmail},
    workshops: matches.map(item => ({registrationId: item.registrationId, title: item.title, dates: item.dates, location: item.location}))};
}

function logoutWorkshopAttendee(token) {
  const cleanToken = cleanToken_(token);
  if (cleanToken) CacheService.getScriptCache().remove(WORKSHOP_PORTAL.SESSION_PREFIX + cleanToken);
  return {ok: true};
}

function workshopRegistrationFromSession_(token, registrationId) {
  const cleanToken = cleanToken_(token);
  const data = cleanToken && CacheService.getScriptCache().get(WORKSHOP_PORTAL.SESSION_PREFIX + cleanToken);
  if (!data) throw new Error('Your session has expired. Please sign in again.');
  const identity = JSON.parse(data);
  const registration = workshopMatches_(identity.name, identity.email)
    .find(item => item.registrationId === String(registrationId));
  if (!registration) throw new Error("__ACADIA_TEXT_t0116__");
  return registration;
}

function workshopFingerprint_(registration, templateFile) {
  const data = JSON.stringify([registration, templateFile.getId(), templateFile.getLastUpdated().getTime()]);
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data, Utilities.Charset.UTF_8)
    .map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function existingWorkshopCertificate_(registrationId, fingerprint) {
  const rows = workshopRows_(WORKSHOP_PORTAL.LOG);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][2]) !== registrationId || String(rows[i][10]) !== fingerprint) continue;
    try {
      const file = DriveApp.getFileById(String(rows[i][7]));
      if (!file.isTrashed()) return certificateDownloadPayload_(file, true);
    } catch (ignored) {}
  }
  return null;
}

function generateWorkshopCertificate(token, registrationId) {
  const settings = workshopSettings_();
  let registration = workshopRegistrationFromSession_(token, registrationId);
  const template = DriveApp.getFileById(String(settings.WORKSHOP_TEMPLATE_FILE_ID));
  if (template.getMimeType() !== MimeType.GOOGLE_DOCS) throw new Error('The workshop certificate template is unavailable.');
  const fingerprint = workshopFingerprint_(registration, template);
  const existing = existingWorkshopCertificate_(registration.registrationId, fingerprint);
  if (existing) return existing;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let workingCopy = null;
  try {
    // Recheck identity and eligibility after waiting for the generation lock.
    registration = workshopRegistrationFromSession_(token, registrationId);
    const currentFingerprint = workshopFingerprint_(registration, template);
    const secondCheck = existingWorkshopCertificate_(registration.registrationId, currentFingerprint);
    if (secondCheck) return secondCheck;
    const folder = DriveApp.getFolderById(String(settings.WORKSHOP_OUTPUT_FOLDER_ID));
    const fileName = "__ACADIA_TEXT_t0117__" + registration.workshopId + '_' + filenameSafe_(registration.name) + '_Certificate';
    workingCopy = template.makeCopy(fileName + '_working', folder);
    const doc = DocumentApp.openById(workingCopy.getId());
    const body = doc.getBody();
    // Longer registered names and workshop titles retain a single-page layout.
    workshopTokenFontSize_(body, '{{ATTENDEE_NAME}}', registration.name.length > 35 ? 21 : 26);
    workshopTokenFontSize_(body, '{{WORKSHOP_TITLE}}', registration.title.length > 90 ? 14 : 16);
    replaceDocumentPlaceholders_(doc, {
      '{{ATTENDEE_NAME}}': registration.name, '{{WORKSHOP_TITLE}}': registration.title,
      '{{WORKSHOP_DATES}}': registration.dates, '{{WORKSHOP_LOCATION}}': registration.location,
      '{{ISSUED_DATE}}': Utilities.formatDate(new Date(), "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy')
    });
    if (/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc))) throw new Error('The certificate template contains an unfilled field.');
    doc.saveAndClose();
    const pdfFile = folder.createFile(workingCopy.getAs(MimeType.PDF).setName(fileName + '.pdf'));
    masterSpreadsheet_().getSheetByName(WORKSHOP_PORTAL.LOG).appendRow([
      Utilities.getUuid(), new Date(), registration.registrationId, registration.name, registration.email,
      registration.workshopId, registration.title, pdfFile.getId(), pdfFile.getName(), template.getId(), currentFingerprint
    ]);
    return certificateDownloadPayload_(pdfFile, false);
  } finally {
    if (workingCopy) { try { workingCopy.setTrashed(true); } catch (ignored) {} }
    lock.releaseLock();
  }
}

function workshopTokenFontSize_(body, token, size) {
  let match = body.findText(regexEscape_(token));
  while (match) {
    match.getElement().asText().setFontSize(match.getStartOffset(), match.getEndOffsetInclusive(), size);
    match = body.findText(regexEscape_(token), match);
  }
}

/** Read-only administrative validation; never returns roster identities. */
function RUN_VERIFY_WORKSHOP_SETUP() {
  const settings = workshopSettings_();
  const template = DriveApp.getFileById(String(settings.WORKSHOP_TEMPLATE_FILE_ID));
  const text = collectDocumentText_(DocumentApp.openById(template.getId()));
  const missing = ['ATTENDEE_NAME','WORKSHOP_TITLE','WORKSHOP_DATES','WORKSHOP_LOCATION','ISSUED_DATE']
    .filter(key => text.indexOf('{{' + key + '}}') === -1);
  if (missing.length) throw new Error('Missing template fields: ' + missing.join(', '));
  const rows = workshopRows_(WORKSHOP_PORTAL.REGISTRATIONS);
  const result = {ok: true, registrations: rows.length, enabled: rows.filter(row => toBoolean_(row[4], false)).length,
    workshops: workshopRows_(WORKSHOP_PORTAL.CATALOG).length, templateReady: true};
  console.log(JSON.stringify(result));
  return result;
}
