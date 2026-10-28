/** Volunteer recognition: organizer-confirmed roster and name-only access. */
const VOLUNTEER_PORTAL = Object.freeze({
  ROSTER: 'Volunteers', LOG: 'Volunteer_Certificate_Log',
  SESSION_PREFIX: 'volunteer-session:', SESSION_SECONDS: 1800
});

function volunteerSettings_() {
  const settings = getSettings_();
  if (!toBoolean_(settings.PORTAL_ENABLED, true) || !toBoolean_(settings.VOLUNTEER_ENABLED, false))
    throw new Error('Volunteer certificates are temporarily unavailable. Please try again later.');
  if (!settings.VOLUNTEER_TEMPLATE_FILE_ID || !settings.VOLUNTEER_OUTPUT_FOLDER_ID)
    throw new Error('Volunteer certificates are being prepared. Please try again later.');
  return settings;
}

function volunteerNameKey_(name) {
  return normalizeName_(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'").replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

function volunteerRows_(sheetName) {
  const sheet = masterSpreadsheet_().getSheetByName(sheetName);
  if (!sheet) throw new Error("__ACADIA_TEXT_t0155__");
  return sheet.getDataRange().getValues().slice(1);
}

function volunteerRoster_() {
  const seen = {};
  return volunteerRows_(VOLUNTEER_PORTAL.ROSTER).filter(row => row.some(value => value !== false && String(value).trim())).map(row => {
    const record = {id: String(row[0]).trim(), name: String(row[1]).trim(), affiliation: String(row[2]).trim(),
      aliases: String(row[3] || '').split('|').map(value => value.trim()).filter(Boolean), enabled: toBoolean_(row[4], false)};
    if (!record.id || !record.name || !record.affiliation || seen[record.id])
      throw new Error("__ACADIA_TEXT_t0156__");
    seen[record.id] = true;
    return record;
  });
}

/** The organizer supplied names and affiliations; no email is required. */
function loginVolunteer(name) {
  volunteerSettings_();
  const raw = String(name == null ? '' : name), normalized = volunteerNameKey_(cleanText_(raw, 200));
  const mismatch = "__ACADIA_TEXT_t0157__";
  if (!normalized || raw.length > 200) throw new Error(mismatch);
  const cache = CacheService.getScriptCache(), failureKey = 'volunteer-login-fail:' + volunteerDigest_(normalized);
  const failures = Number(cache.get(failureKey) || 0);
  if (failures >= 8) throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  const matches = volunteerRoster_().filter(record => record.enabled && [record.name].concat(record.aliases)
    .some(value => volunteerNameKey_(value) === normalized));
  if (!matches.length) {cache.put(failureKey, String(failures + 1), 600); throw new Error(mismatch);}
  if (matches.length !== 1) throw new Error("__ACADIA_TEXT_t0158__");
  cache.remove(failureKey);
  const record = matches[0], token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  cache.put(VOLUNTEER_PORTAL.SESSION_PREFIX + token, JSON.stringify({id: record.id, nameKey: volunteerNameKey_(record.name)}), VOLUNTEER_PORTAL.SESSION_SECONDS);
  return {ok: true, token: token, volunteer: {name: record.name, affiliation: record.affiliation}};
}

function logoutVolunteer(token) {
  const clean = cleanToken_(token);
  if (clean) CacheService.getScriptCache().remove(VOLUNTEER_PORTAL.SESSION_PREFIX + clean);
  return {ok: true};
}

function volunteerFromSession_(token) {
  const clean = cleanToken_(token), data = clean && CacheService.getScriptCache().get(VOLUNTEER_PORTAL.SESSION_PREFIX + clean);
  if (!data) throw new Error('Your session has expired. Please sign in again.');
  const identity = JSON.parse(data);
  const record = volunteerRoster_().find(item => item.enabled && item.id === identity.id && volunteerNameKey_(item.name) === identity.nameKey);
  if (!record) throw new Error("__ACADIA_TEXT_t0159__");
  return record;
}

function volunteerDigest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8)
    .map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
}

function volunteerFingerprint_(record, template) {
  return volunteerDigest_(JSON.stringify(['volunteer-v1', record.id, record.name, record.affiliation,
    template.getId(), template.getLastUpdated().getTime()]));
}

function existingVolunteerCertificate_(id, fingerprint) {
  const rows = volunteerRows_(VOLUNTEER_PORTAL.LOG);
  for (let i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][2]) !== id || String(rows[i][8]) !== fingerprint) continue;
    try {
      const file = DriveApp.getFileById(String(rows[i][5]));
      if (!file.isTrashed()) return certificateDownloadPayload_(file, true);
    } catch (ignored) {}
  }
  return null;
}

function generateVolunteerCertificate(token) {
  const settings = volunteerSettings_();
  let record = volunteerFromSession_(token);
  const template = DriveApp.getFileById(String(settings.VOLUNTEER_TEMPLATE_FILE_ID));
  if (template.getMimeType() !== MimeType.GOOGLE_DOCS) throw new Error('The volunteer certificate template is unavailable.');
  const existing = existingVolunteerCertificate_(record.id, volunteerFingerprint_(record, template));
  if (existing) return existing;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let workingCopy = null;
  try {
    volunteerSettings_();
    record = volunteerFromSession_(token);
    const fingerprint = volunteerFingerprint_(record, template);
    const secondCheck = existingVolunteerCertificate_(record.id, fingerprint);
    if (secondCheck) return secondCheck;
    const folder = DriveApp.getFolderById(String(settings.VOLUNTEER_OUTPUT_FOLDER_ID));
    const filename = "__ACADIA_TEXT_t0160__" + filenameSafe_(record.name) + '_Certificate';
    workingCopy = template.makeCopy(filename + '_working', folder);
    const doc = DocumentApp.openById(workingCopy.getId());
    volunteerTokenSize_(doc.getBody(), '{{VOLUNTEER_NAME}}', record.name.length > 30 ? 22 : 26);
    volunteerTokenSize_(doc.getBody(), '{{VOLUNTEER_AFFILIATION}}', record.affiliation.length > 80 ? 11 : 12);
    replaceDocumentPlaceholders_(doc, {
      '{{VOLUNTEER_NAME}}': record.name, '{{VOLUNTEER_AFFILIATION}}': record.affiliation,
      '{{ISSUED_DATE}}': Utilities.formatDate(new Date(), "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy')
    });
    if (/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc))) throw new Error('The certificate template contains an unfilled field.');
    doc.saveAndClose();
    const pdf = folder.createFile(workingCopy.getAs(MimeType.PDF).setName(filename + '.pdf'));
    masterSpreadsheet_().getSheetByName(VOLUNTEER_PORTAL.LOG).appendRow([
      Utilities.getUuid(), new Date(), record.id, record.name, record.affiliation,
      pdf.getId(), pdf.getName(), template.getId(), fingerprint
    ]);
    return certificateDownloadPayload_(pdf, false);
  } finally {
    if (workingCopy) {try {workingCopy.setTrashed(true);} catch (ignored) {}}
    lock.releaseLock();
  }
}

function volunteerTokenSize_(body, token, size) {
  let match = body.findText(regexEscape_(token));
  while (match) {
    match.getElement().asText().setFontSize(match.getStartOffset(), match.getEndOffsetInclusive(), size);
    match = body.findText(regexEscape_(token), match);
  }
}

/** Read-only administrative validation. No personal records are logged. */
function RUN_VERIFY_VOLUNTEER_SETUP() {
  const settings = volunteerSettings_(), roster = volunteerRoster_(), names = {};
  roster.filter(record => record.enabled).forEach(record => {
    [record.name].concat(record.aliases).forEach(name => {
      const key = volunteerNameKey_(name);
      if (names[key] && names[key] !== record.id) throw new Error('Ambiguous volunteer login names.');
      names[key] = record.id;
    });
  });
  const text = collectDocumentText_(DocumentApp.openById(String(settings.VOLUNTEER_TEMPLATE_FILE_ID)));
  ['VOLUNTEER_NAME', 'VOLUNTEER_AFFILIATION', 'ISSUED_DATE'].forEach(key => {
    if (text.indexOf('{{' + key + '}}') === -1) throw new Error('Missing template field: ' + key);
  });
  volunteerRows_(VOLUNTEER_PORTAL.LOG);
  const result = {ok: true, records: roster.length, enabled: roster.filter(record => record.enabled).length, templateReady: true};
  console.log(JSON.stringify(result));
  return result;
}
