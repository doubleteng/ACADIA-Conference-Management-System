/** Workshop instructor certificates: name-only access; separate sessions and certificate log. */
const INSTRUCTOR_PORTAL = Object.freeze({
  REGISTRATIONS: 'Workshop_Instructors', CATALOG: 'Workshop_Catalog', LOG: 'Workshop_Instructor_Log',
  SESSION_PREFIX: 'instructor-session:', SESSION_SECONDS: 1800
});

function instructorSettings_() {
  const settings = getSettings_();
  if (!toBoolean_(settings.PORTAL_ENABLED, true) || !toBoolean_(settings.INSTRUCTOR_ENABLED, false))
    throw new Error('Workshop certificates are temporarily unavailable. Please try again later.');
  if (!settings.INSTRUCTOR_TEMPLATE_FILE_ID || !settings.INSTRUCTOR_OUTPUT_FOLDER_ID)
    throw new Error('Workshop certificates are being prepared. Please try again later.');
  return settings;
}

function instructorRows_(name) {
  const sheet = masterSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error("__ACADIA_TEXT_t0114__");
  return sheet.getDataRange().getValues().slice(1);
}

function instructorMatches_(name) {
  const catalog = {};
  instructorRows_(INSTRUCTOR_PORTAL.CATALOG).forEach(row => {
    catalog[String(row[0])] = {title: String(row[1]), dates: String(row[2]), location: String(row[3])};
  });
  const normalized = normalizeName_(name), seen = {};
  return instructorRows_(INSTRUCTOR_PORTAL.REGISTRATIONS).filter(row => {
    const key = normalizeName_(row[1]) + '|' + String(row[3]);
    const names = [String(row[1])].concat(String(row[2] || '').split('|'));
    if (!toBoolean_(row[4], false) || !catalog[String(row[3])] || seen[key] ||
        !names.some(value => value.trim() && normalizeName_(value) === normalized)) return false;
    seen[key] = true; return true;
  }).map(row => ({registrationId: String(row[0]), name: String(row[1]),
    workshopId: String(row[3]), title: catalog[String(row[3])].title,
    dates: catalog[String(row[3])].dates, location: catalog[String(row[3])].location}));
}

/** Instructor access intentionally requires only the roster name, per organizer policy. */
function loginWorkshopInstructor(name) {
  instructorSettings_();
  const rawName = String(name == null ? '' : name), cleanName = cleanText_(rawName, 200);
  const mismatch = "__ACADIA_TEXT_t0120__";
  if (!cleanName || rawName.length > 200) throw new Error(mismatch);
  const cache = CacheService.getScriptCache();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalizeName_(cleanName), Utilities.Charset.UTF_8);
  const key = 'instructor-login-fail:' + digest.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
  const failures = Number(cache.get(key) || 0);
  if (failures >= 8) throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  const matches = instructorMatches_(cleanName);
  if (!matches.length) {cache.put(key, String(failures + 1), 600); throw new Error(mismatch);}
  const identities = [...new Set(matches.map(item => normalizeName_(item.name)))];
  if (identities.length !== 1) throw new Error("__ACADIA_TEXT_t0121__");
  cache.remove(key);
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  cache.put(INSTRUCTOR_PORTAL.SESSION_PREFIX + token, JSON.stringify({name: matches[0].name}), INSTRUCTOR_PORTAL.SESSION_SECONDS);
  return {ok: true, token: token, instructor: {name: matches[0].name},
    workshops: matches.map(item => ({registrationId: item.registrationId, title: item.title, dates: item.dates, location: item.location}))};
}

function logoutWorkshopInstructor(token) {
  const cleanToken = cleanToken_(token);
  if (cleanToken) CacheService.getScriptCache().remove(INSTRUCTOR_PORTAL.SESSION_PREFIX + cleanToken);
  return {ok: true};
}

function instructorRegistrationFromSession_(token, registrationId) {
  const cleanToken = cleanToken_(token);
  const data = cleanToken && CacheService.getScriptCache().get(INSTRUCTOR_PORTAL.SESSION_PREFIX + cleanToken);
  if (!data) throw new Error('Your session has expired. Please sign in again.');
  const identity = JSON.parse(data);
  const registration = instructorMatches_(identity.name)
    .find(item => item.registrationId === String(registrationId));
  if (!registration) throw new Error("__ACADIA_TEXT_t0122__");
  return registration;
}

function instructorFingerprint_(registration, templateFile) {
  const data = JSON.stringify([registration, templateFile.getId(), templateFile.getLastUpdated().getTime()]);
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data, Utilities.Charset.UTF_8)
    .map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function instructorCertificateLocation_(location) {
  return String(location || '');
}

function existingInstructorCertificate_(registrationId, fingerprint) {
  const rows = instructorRows_(INSTRUCTOR_PORTAL.LOG);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][2]) !== registrationId || String(rows[i][10]) !== fingerprint) continue;
    try {
      const file = DriveApp.getFileById(String(rows[i][7]));
      if (!file.isTrashed()) return certificateDownloadPayload_(file, true);
    } catch (ignored) {}
  }
  return null;
}

function generateInstructorCertificate(token, registrationId) {
  const settings = instructorSettings_();
  let registration = instructorRegistrationFromSession_(token, registrationId);
  const template = DriveApp.getFileById(String(settings.INSTRUCTOR_TEMPLATE_FILE_ID));
  if (template.getMimeType() !== MimeType.GOOGLE_DOCS) throw new Error('The workshop certificate template is unavailable.');
  const fingerprint = instructorFingerprint_(registration, template);
  const existing = existingInstructorCertificate_(registration.registrationId, fingerprint);
  if (existing) return existing;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let workingCopy = null;
  try {
    // Recheck identity and eligibility after waiting for the generation lock.
    registration = instructorRegistrationFromSession_(token, registrationId);
    const currentFingerprint = instructorFingerprint_(registration, template);
    const secondCheck = existingInstructorCertificate_(registration.registrationId, currentFingerprint);
    if (secondCheck) return secondCheck;
    const folder = DriveApp.getFolderById(String(settings.INSTRUCTOR_OUTPUT_FOLDER_ID));
    const fileName = "__ACADIA_TEXT_t0123__" + registration.workshopId + '_' + filenameSafe_(registration.name) + '_Certificate';
    workingCopy = template.makeCopy(fileName + '_working', folder);
    const doc = DocumentApp.openById(workingCopy.getId());
    const body = doc.getBody();
    // Longer registered names and workshop titles retain a single-page layout.
    instructorTokenFontSize_(body, '{{INSTRUCTOR_NAME}}', registration.name.length > 35 ? 21 : 26);
    instructorTokenFontSize_(body, '{{WORKSHOP_TITLE}}', registration.title.length > 90 ? 14 : 16);
    replaceDocumentPlaceholders_(doc, {
      '{{INSTRUCTOR_NAME}}': registration.name, '{{WORKSHOP_TITLE}}': registration.title,
      '{{WORKSHOP_DATES}}': registration.dates, '{{WORKSHOP_LOCATION}}': instructorCertificateLocation_(registration.location),
      '{{ISSUED_DATE}}': Utilities.formatDate(new Date(), "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy')
    });
    if (/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc))) throw new Error('The certificate template contains an unfilled field.');
    doc.saveAndClose();
    const pdfFile = folder.createFile(workingCopy.getAs(MimeType.PDF).setName(fileName + '.pdf'));
    masterSpreadsheet_().getSheetByName(INSTRUCTOR_PORTAL.LOG).appendRow([
      Utilities.getUuid(), new Date(), registration.registrationId, registration.name, registration.name,
      registration.workshopId, registration.title, pdfFile.getId(), pdfFile.getName(), template.getId(), currentFingerprint
    ]);
    return certificateDownloadPayload_(pdfFile, false);
  } finally {
    if (workingCopy) { try { workingCopy.setTrashed(true); } catch (ignored) {} }
    lock.releaseLock();
  }
}

function instructorTokenFontSize_(body, token, size) {
  let match = body.findText(regexEscape_(token));
  while (match) {
    match.getElement().asText().setFontSize(match.getStartOffset(), match.getEndOffsetInclusive(), size);
    match = body.findText(regexEscape_(token), match);
  }
}

/** Read-only administrative validation; never returns roster identities. */
function RUN_VERIFY_INSTRUCTOR_SETUP() {
  const settings = instructorSettings_();
  const template = DriveApp.getFileById(String(settings.INSTRUCTOR_TEMPLATE_FILE_ID));
  const text = collectDocumentText_(DocumentApp.openById(template.getId()));
  const missing = ['INSTRUCTOR_NAME','WORKSHOP_TITLE','WORKSHOP_DATES','WORKSHOP_LOCATION','ISSUED_DATE']
    .filter(key => text.indexOf('{{' + key + '}}') === -1);
  if (missing.length) throw new Error('Missing template fields: ' + missing.join(', '));
  const rows = instructorRows_(INSTRUCTOR_PORTAL.REGISTRATIONS);
  const result = {ok: true, registrations: rows.length, enabled: rows.filter(row => toBoolean_(row[4], false)).length,
    workshops: instructorRows_(INSTRUCTOR_PORTAL.CATALOG).length, templateReady: true};
  console.log(JSON.stringify(result));
  return result;
}
