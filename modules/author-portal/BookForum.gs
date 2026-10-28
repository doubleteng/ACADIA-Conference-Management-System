/**
 * ACADIA 2026 Author Hub — Book Forum module.
 *
 * Login uses the complete book title only. Matching ignores capitalization,
 * punctuation, symbols, and whitespace.
 *
 * This module adds three Book Forum tasks:
 * 1. Conference Registration
 * 2. Book Forum Poster
 * 3. Book Forum Proceedings Pages (maximum four pages)
 */

const BOOK_FORUM_TRACK = 'Book Forum';
const BOOK_FORUM_SOURCE_SHEET_NAME = 'Book Forum';

const BOOK_FORUM_POSTER_TASK_ID = 'book_poster';
const BOOK_FORUM_PROCEEDING_TASK_ID = 'book_proceeding';
const BOOK_FORUM_POSTER_FOLDER_ROLE = 'BOOK_FORUM_POSTER';
const BOOK_FORUM_PROCEEDING_FOLDER_ROLE = 'BOOK_FORUM_PROCEEDING';

const BOOK_FORUM_POSTER_MAX_BYTES = 100 * 1024 * 1024;
const BOOK_FORUM_PROCEEDING_MAX_BYTES = 1000000000;

const BOOK_FORUM_TASK_DEFINITIONS = Object.freeze([
  {
    id: 'registration',
    name: 'Conference registration',
    label: 'Conference Registration',
    phase: 'required',
    order: 1,
    type: 'registration',
    required: true
  },
  {
    id: BOOK_FORUM_POSTER_TASK_ID,
    name: 'Book Forum Poster',
    label: 'Book Forum Poster',
    phase: 'required',
    order: 2,
    type: 'file',
    required: true,
    folderRole: BOOK_FORUM_POSTER_FOLDER_ROLE
  },
  {
    id: BOOK_FORUM_PROCEEDING_TASK_ID,
    name: 'Book Forum Proceedings Pages',
    label: 'Book Forum Proceedings Pages',
    phase: 'required',
    order: 3,
    type: 'file',
    required: true,
    folderRole: BOOK_FORUM_PROCEEDING_FOLDER_ROLE
  }
]);

const BOOK_FORUM_FOLDER_SPECS = Object.freeze([
  { role: 'PAPER_ROOT', name: null },
  { role: BOOK_FORUM_POSTER_FOLDER_ROLE, name: '01_Book_Forum_Poster' },
  { role: BOOK_FORUM_PROCEEDING_FOLDER_ROLE, name: '02_Book_Forum_Proceedings' },
  { role: 'REGISTRATION', name: '03_Registration' },
  { role: 'PREVIOUS_VERSIONS', name: '99_Previous_Versions' }
]);

function normalizeBookForumLoginTitle_(value) {
  let text = String(value == null ? '' : value);
  try { text = text.normalize('NFKC'); } catch (err) {}
  return text
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s+/g, '');
}

function bookForumSourceData_() {
  const cfg = getConfig_();
  const spreadsheetId = String(cfg.ACCEPTED_SOURCE_SPREADSHEET_ID || '').trim();
  if (!spreadsheetId) throw new Error('ACCEPTED_SOURCE_SPREADSHEET_ID is not configured.');

  const sheetName = String(
    cfg.ACCEPTED_BOOK_FORUM_SHEET_NAME || BOOK_FORUM_SOURCE_SHEET_NAME
  ).trim();
  const source = SpreadsheetApp.openById(spreadsheetId);
  const sheet = source.getSheetByName(sheetName);
  if (!sheet) throw new Error('Accepted-submission tab not found: ' + sheetName);

  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('The Book Forum source tab is empty.');

  const headerInfo = detectHeaderRow_(values, ['id', 'title']);
  const index = headerIndex_(headerInfo.headers);
  const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
  const titleCol = firstHeaderIndex_(index, ['original title', 'book title', 'submission title', 'title']);
  const authorsCol = firstHeaderIndex_(index, ['authors', 'author list', 'all authors']);
  const commentsCol = firstHeaderIndex_(index, ['all reviewer comments', 'reviewer comments', 'reviewer feedback', 'comments']);
  if (idCol < 0 || titleCol < 0) {
    throw new Error('The Book Forum tab must contain ID and Title columns.');
  }

  const records = [];
  for (let rowIndex = headerInfo.row + 1; rowIndex < values.length; rowIndex += 1) {
    const paperId = normalizePaperId_(values[rowIndex][idCol]);
    const title = String(values[rowIndex][titleCol] || '').trim();
    if (!paperId && !title) continue;
    if (!paperId || !title) {
      throw new Error('Book Forum row ' + (rowIndex + 1) + ' is missing an ID or Title.');
    }
    records.push({
      paperId: paperId,
      title: title,
      authors: authorsCol >= 0 ? String(values[rowIndex][authorsCol] || '').trim() : '',
      reviewerComments: commentsCol >= 0 ? String(values[rowIndex][commentsCol] || '').trim() : '',
      track: BOOK_FORUM_TRACK,
      sourceRow: rowIndex + 1,
      normalizedLoginTitle: normalizeBookForumLoginTitle_(title)
    });
  }
  return records;
}

function validateBookForumSourceRecords_(records) {
  const errors = [];
  const seenIds = {};
  const seenTitles = {};
  (records || []).forEach(function (record) {
    const idKey = normalizePaperId_(record.paperId).toLowerCase();
    const titleKey = normalizeBookForumLoginTitle_(record.title);
    if (!idKey) errors.push('Source row ' + record.sourceRow + ': missing ID.');
    if (!titleKey) errors.push('Source row ' + record.sourceRow + ': missing title.');
    if (idKey && seenIds[idKey]) errors.push('Duplicate Book Forum ID: ' + record.paperId);
    if (titleKey && seenTitles[titleKey]) {
      errors.push('Duplicate Book Forum login title: ' + record.title);
    }
    if (idKey) seenIds[idKey] = true;
    if (titleKey) seenTitles[titleKey] = true;
  });
  return errors;
}

function findBookForumSubmissionByTitle_(bookTitle) {
  const normalizedInput = normalizeBookForumLoginTitle_(bookTitle);
  if (!normalizedInput) return null;
  const matches = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (submission) {
    return normalizeTrack_(submission.Track) === BOOK_FORUM_TRACK &&
      normalizeBookForumLoginTitle_(submission['Original Title']) === normalizedInput;
  });
  if (matches.length > 1) {
    throw new Error('More than one Book Forum entry matches this title. Contact the Technical Chairs.');
  }
  return matches.length ? matches[0] : null;
}

function loginBookForum(bookTitle, clientId) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return loginBookForumPerformanceImpl_.apply(null, args);
  });
}

function loginBookForumPerformanceImpl_(bookTitle, clientId) {
  const cfg = getConfig_();
  if (!parseBoolean_(cfg.PORTAL_ENABLED, true)) {
    throw new Error('The Author Hub is temporarily unavailable.');
  }

  const normalizedTitle = normalizeBookForumLoginTitle_(bookTitle);
  const client = String(clientId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  const throttleKey = 'book_forum_login_fail_' +
    Utilities.base64EncodeWebSafe(normalizedTitle + '|' + client).slice(0, 120);
  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(throttleKey) || 0);
  if (attempts >= 12) {
    throw new Error('Too many unsuccessful attempts. Please wait 15 minutes and try again.');
  }
  if (!normalizedTitle) throw new Error('Enter the complete accepted book title.');

  const submission = findBookForumSubmissionByTitle_(bookTitle);
  const enabled = submission && parseBoolean_(submission['Portal Enabled'], true);
  if (!submission || !enabled) {
    cache.put(throttleKey, String(attempts + 1), 15 * 60);
    throw new Error(
      'No Book Forum entry matches that title. Enter the complete accepted book title. ' +
      'Capitalization, punctuation, symbols, and spaces do not affect matching.'
    );
  }

  cache.remove(throttleKey);
  const paperId = normalizePaperId_(submission['Paper ID']);

  const token = issueSignedToken_({
    kind: 'author_session',
    paperId: paperId,
    expiresAt: Date.now() + parseInteger_(cfg.SESSION_HOURS, 8) * 60 * 60 * 1000,
    nonce: Utilities.getUuid()
  });
  return { token: token, portal: buildPortalData_(paperId), logPortalOpen: true };
}

function previewBookForumImport_() {
  const sourceRecords = bookForumSourceData_();
  const validationErrors = validateBookForumSourceRecords_(sourceRecords);
  const existingById = {};
  sheetObjects_(SHEETS.SUBMISSIONS).forEach(function (submission) {
    existingById[normalizePaperId_(submission['Paper ID']).toLowerCase()] = submission;
  });

  const newRecords = [];
  const existingMatches = [];
  const conflicts = [];
  sourceRecords.forEach(function (record) {
    const existing = existingById[normalizePaperId_(record.paperId).toLowerCase()];
    if (!existing) {
      newRecords.push(record);
      return;
    }
    const sameTrack = normalizeTrack_(existing.Track) === BOOK_FORUM_TRACK;
    const sameTitle = normalizeBookForumLoginTitle_(existing['Original Title']) ===
      normalizeBookForumLoginTitle_(record.title);
    if (sameTrack && sameTitle) {
      existingMatches.push({ paperId: record.paperId, title: record.title });
    } else {
      conflicts.push({
        paperId: record.paperId,
        sourceTitle: record.title,
        existingTitle: String(existing['Original Title'] || ''),
        existingTrack: String(existing.Track || '')
      });
    }
  });

  return {
    sourceSheet: String(getConfig_().ACCEPTED_BOOK_FORUM_SHEET_NAME || BOOK_FORUM_SOURCE_SHEET_NAME),
    sourceCount: sourceRecords.length,
    newCount: newRecords.length,
    existingMatchCount: existingMatches.length,
    conflictCount: conflicts.length,
    validationErrorCount: validationErrors.length,
    validationErrors: validationErrors,
    newRecords: newRecords,
    existingMatches: existingMatches,
    conflicts: conflicts
  };
}

function RUN_PREVIEW_BOOK_FORUM_IMPORT() {
  assertChairEditorRun_();
  const result = previewBookForumImport_();
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function importBookForumSafe_() {
  const preview = previewBookForumImport_();
  if (preview.validationErrorCount) {
    throw new Error('Book Forum import stopped:\n' + preview.validationErrors.join('\n'));
  }
  if (preview.conflictCount) {
    throw new Error(
      'Book Forum import stopped because existing records conflict with the source data:\n' +
      JSON.stringify(preview.conflicts, null, 2)
    );
  }

  const imported = [];
  preview.newRecords.forEach(function (record) {
    if (getSubmissionByPaperId_(record.paperId)) {
      throw new Error('Import stopped. Submission ID already exists: ' + record.paperId);
    }
    upsertSubmission_({
      'Paper ID': record.paperId,
      'Original Title': record.title,
      'Final Title': record.title,
      'Track': BOOK_FORUM_TRACK,
      'Volume': 'Book Forum',
      'Portal Enabled': true
    });
    ensureTaskRows_(record.paperId, BOOK_FORUM_TRACK);
    ensureSubmissionFolders_(record.paperId);

    if (record.reviewerComments) {
      splitReviewerBlocks_(record.reviewerComments).forEach(function (entry) {
        appendObject_(SHEETS.REVIEWER_FEEDBACK, {
          'Paper ID': record.paperId,
          'Review Label': entry.label,
          'Reviewer Comment': entry.comment,
          'Source': 'Book Forum',
          'Imported At': new Date()
        });
      });
    }
    logActivity_(record.paperId, 'Book Forum imported', '', 'Added from the accepted Book Forum source tab.');
    imported.push({ paperId: record.paperId, title: record.title });
  });

  SpreadsheetApp.flush();
  return {
    sourceCount: preview.sourceCount,
    importedCount: imported.length,
    skippedExistingMatches: preview.existingMatchCount,
    imported: imported
  };
}

function RUN_IMPORT_BOOK_FORUM_SAFE() {
  assertChairEditorRun_();
  return withScriptLock_(function () {
    const result = importBookForumSafe_();
    console.log(JSON.stringify(result, null, 2));
    return result;
  });
}
