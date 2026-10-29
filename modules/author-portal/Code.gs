/******************************************************************************
 * SOURCE: Config.gs
 ******************************************************************************/

/**
 * ACADIA 2026 Author Hub — configuration and shared constants.
 *
 * Values in the Settings sheet override DEFAULTS. Values in Script Properties
 * override both. setupAuthorHub_() creates the Settings sheet and records the
 * generated spreadsheet/form IDs in Script Properties.
 */

const DEFAULTS = Object.freeze({
  APP_NAME: "__ACADIA_TEXT_t0001__",
  CONFERENCE_NAME: "__ACADIA_TEXT_t0002__",
  CONFERENCE_LOCATION: "__ACADIA_TEXT_t0003__",
  WORKSHOP_DATES: "__ACADIA_TEXT_t0004__",
  CONFERENCE_DATES: "__ACADIA_TEXT_t0005__",

  // August 3, 2026 at 11:59 p.m. Anywhere on Earth = August 4, 2026 11:59 UTC.
  CAMERA_READY_DEADLINE_ISO_UTC: "__ACADIA_TEXT_t0006__",
  CAMERA_READY_DEADLINE_LABEL: "__ACADIA_TEXT_t0007__",

  // PhD Workshop materials: October 12, 2026, 11:59 PM Anywhere on Earth.
  PHD_WORKSHOP_DEADLINE_ISO_UTC: "__ACADIA_TEXT_t0008__",
  PHD_WORKSHOP_DEADLINE_LABEL: "__ACADIA_TEXT_t0009__",
  // Allow all PhD Workshop participants to submit or revise materials after the original deadline.
  PHD_WORKSHOP_REVISIONS_OPEN: true,

  // Display-only requested submission date for the Project / Field Note exhibition poster.
  // This label does not close or disable the poster uploader.
  PROJECT_POSTER_DEADLINE_LABEL: "__ACADIA_TEXT_t0010__",

  // Registration remains open after the camera-ready deadline.
  // October 21, 2026 at 11:59 p.m. Detroit time (EDT) = October 22, 2026 03:59 UTC.
  REGISTRATION_DEADLINE_ISO_UTC: "__ACADIA_TEXT_t0011__",
  REGISTRATION_DEADLINE_LABEL: "__ACADIA_TEXT_t0012__",
  EARLY_BIRD_REGISTRATION_DEADLINE_LABEL: "__ACADIA_TEXT_t0013__",

  ROOT_FOLDER_ID: "__ACADIA_RESOURCE_rootId__",
  SUBMISSION_ROOT_FOLDER_ID: "__ACADIA_RESOURCE_submissionRootId__",
  TRACK_FOLDER_HOST: "__ACADIA_RESOURCE_hostFolderId__",
  TRACK_FOLDER_PROJECTS: "__ACADIA_RESOURCE_projectsFolderId__",
  TRACK_FOLDER_FULL_PAPER: "__ACADIA_RESOURCE_papersFolderId__",
  TRACK_FOLDER_FIELD_NOTE: "__ACADIA_RESOURCE_fieldNotesFolderId__",
  TRACK_FOLDER_PHD_WORKSHOP: "__ACADIA_RESOURCE_phdFolderId__",
  TRACK_FOLDER_BOOK_FORUM: '',
  PHD_WORKSHOP_MONITOR_SPREADSHEET_ID: "__ACADIA_RESOURCE_phdMonitorId__",

  INDEXING_URL: "__ACADIA_VALUE_indexingUrl__",
  REGISTRATION_URL: "__ACADIA_VALUE_registrationUrl__",

  // Public author-download assets. Share as “Anyone with the link — Viewer”.
  BANNER_FILE_ID: "__ACADIA_RESOURCE_bannerId__",
  PAPER_TEMPLATE_FILE_ID: "__ACADIA_RESOURCE_paperTemplateId__",
  PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID: "__ACADIA_RESOURCE_projectTemplateId__",
  PROJECT_POSTER_TEMPLATE_FILE_ID: "__ACADIA_RESOURCE_posterTemplateId__",
  PROJECT_POSTER_INSTRUCTIONS_FILE_ID: "__ACADIA_RESOURCE_posterInstructionsId__",
  PRESENTATION_TEMPLATE_FILE_ID: "__ACADIA_RESOURCE_presentationTemplateId__",
  TEMPLATE_ZIP_FILE_ID: '', // Legacy fallback; no longer used when both track templates are configured.
  PUBLICATION_INSTRUCTIONS_FILE_ID: "__ACADIA_RESOURCE_publicationInstructionsId__",
  CONSENT_PDF_FILE_ID: "__ACADIA_RESOURCE_consentPdfId__", // Enter the final approved source PDF ID in Settings.

  // Final accepted-submission source: four tabs with ID, Title, and Authors.
  ACCEPTED_SOURCE_SPREADSHEET_ID: "__ACADIA_RESOURCE_acceptedId__",
  ACCEPTED_FULL_PAPERS_SHEET_NAME: 'Full Papers',
  ACCEPTED_PROJECTS_SHEET_NAME: 'Projects',
  ACCEPTED_FIELD_NOTES_SHEET_NAME: 'Field Notes',
  ACCEPTED_PHD_WORKSHOP_SHEET_NAME: 'PhD Workshop',
  ACCEPTED_BOOK_FORUM_SHEET_NAME: 'Book Forum',
  // Leave blank when PhD Workshop is a tab in ACCEPTED_SOURCE_SPREADSHEET_ID.
  PHD_WORKSHOP_SOURCE_SPREADSHEET_ID: '',

  REVIEWER_SOURCE_SPREADSHEET_ID: '',
  REVIEWER_SOURCE_SHEET_NAME: 'Reviewer Comments',

  CAMERA_READY_MAX_BYTES: '1000000000', // 1 GB
  PROJECT_POSTER_MAX_BYTES: String(100 * 1024 * 1024), // 100 MB press-quality PDF
  BOOK_FORUM_POSTER_MAX_BYTES: String(100 * 1024 * 1024),
  BOOK_FORUM_PROCEEDING_MAX_BYTES: '1000000000',
  AUTHOR_PROOF_ANNOTATED_MAX_BYTES: String(100 * 1024 * 1024), // 100 MB annotated return PDF
  AUTHOR_PROOF_ATTACHMENT_MAX_BYTES: String(250 * 1024 * 1024), // 250 MB per supporting file
  AUTHOR_PROOF_ATTACHMENT_SLOTS: '5',
  STANDARD_PDF_MAX_BYTES: String(50 * 1024 * 1024),
  WEBSITE_IMAGE_MAX_BYTES: String(25 * 1024 * 1024),
  PROOF_INLINE_MAX_BYTES: String(20 * 1024 * 1024),
  UPLOAD_CHUNK_BYTES: String(8 * 1024 * 1024),
  SESSION_HOURS: '8',
  PORTAL_ENABLED: 'TRUE',
  CONTACT_EMAIL: "__ACADIA_VALUE_contactEmail__",

  // Optional international-author invitation-letter module.
  // The dashboard card appears only when the module is enabled and a native
  // Google Docs template ID has been configured.
  VISA_LETTER_ENABLED: 'FALSE',
  VISA_LETTER_TEMPLATE_DOC_ID: "__ACADIA_RESOURCE_visaTemplateId__",
  VISA_LETTER_ARCHIVE_FOLDER_ID: '',

  SITE_CHAIRS: "__ACADIA_TEXT_t0014__",
  TECHNICAL_CHAIRS: "__ACADIA_TEXT_t0015__"
});

const SHEETS = Object.freeze({
  SETTINGS: 'Settings',
  SUBMISSIONS: 'Submissions',
  TASKS: 'Task_Status',
  TASK_DATA: 'Task_Data',
  REVIEWER_FEEDBACK: 'Reviewer_Feedback',
  AUTHORS: 'Authors',
  WEBSITE: 'Website_Materials',
  WEBSITE_IMAGES: 'Website_Images',
  FILES: 'File_Registry',
  FOLDERS: 'Folder_Registry',
  ATTENDANCE: 'Attendance',
  REGISTRATION: 'Registration',
  INDEXING: 'Indexing_Status',
  PROOF_COMMENTS: 'Proof_Comments',
  ACTIVITY: 'Activity_Log',
  VISA_LETTERS: 'Visa_Letter_Log',
  DASHBOARD: 'Admin_Dashboard'
});

const SHEET_HEADERS = Object.freeze({
  [SHEETS.SETTINGS]: ['Key', 'Value', 'Notes'],
  [SHEETS.SUBMISSIONS]: [
    'Paper ID', 'Original Title', 'Normalized Original Title', 'Final Title',
    'Track', 'Volume', 'Corresponding Author', 'Corresponding Email',
    'Presenting Author', 'Presenting Email', 'Submission Folder ID',
    'Portal Enabled', 'Overall Status', 'Proof Version', 'Proof Due Label',
    'Last Updated'
  ],
  [SHEETS.TASKS]: [
    'Paper ID', 'Task ID', 'Task Name', 'Status', 'Submitted At',
    'Approved At', 'Action Required Note', 'Last Updated'
  ],
  [SHEETS.TASK_DATA]: ['Paper ID', 'Task ID', 'Data JSON', 'Last Updated'],
  [SHEETS.REVIEWER_FEEDBACK]: [
    'Paper ID', 'Review Label', 'Reviewer Comment', 'Source', 'Imported At'
  ],
  [SHEETS.AUTHORS]: [
    'Paper ID', 'Position', 'Full Name', 'Email', 'Affiliation', 'ORCID',
    'Corresponding', 'Presenting', 'Last Updated'
  ],
  [SHEETS.WEBSITE]: [
    'Paper ID', 'Final Title', 'Category', 'Abstract', 'Keywords',
    'Corresponding Email', 'Last Updated'
  ],
  [SHEETS.WEBSITE_IMAGES]: [
    'Paper ID', 'Image Slot', 'Drive File ID', 'File Name', 'Caption',
    'Credit', 'Alt Text', 'Active', 'Last Updated'
  ],
  [SHEETS.FILES]: [
    'Paper ID', 'Task ID', 'Role', 'Version', 'Drive File ID', 'File Name',
    'Original File Name', 'MIME Type', 'Size Bytes', 'Parent Folder ID',
    'Active', 'Uploaded At'
  ],
  [SHEETS.FOLDERS]: [
    'Paper ID', 'Folder Role', 'Folder ID', 'Folder Name', 'Last Updated'
  ],
  [SHEETS.ATTENDANCE]: [
    'Paper ID', 'Attendance Confirmed', 'Presenter Name', 'Presenter Email',
    'Confirmed At', 'Last Updated'
  ],
  [SHEETS.REGISTRATION]: [
    'Paper ID', 'Registered Author', 'Registered Email',
    'Confirmation Number', 'Receipt File ID', 'Unique Author Check',
    'Last Updated'
  ],
  [SHEETS.INDEXING]: [
    'Paper ID', 'Opened At', 'Confirmed', 'Confirmation Note',
    'Confirmed At', 'Last Updated'
  ],
  [SHEETS.PROOF_COMMENTS]: [
    'Timestamp', 'Paper ID', 'Paper Title', 'Proof Version', 'Page Number',
    'Category', 'Location', 'Author Comment', 'Author Name',
    'Resolution Status', 'Copyeditor Response', 'Resolved At',
    'Form Response ID'
  ],
  [SHEETS.ACTIVITY]: ['Timestamp', 'Paper ID', 'Event', 'Task ID', 'Detail'],
  [SHEETS.VISA_LETTERS]: [
    'Request ID', 'Generated At', 'Paper ID', 'Paper Title', 'Track',
    'Author Name', 'Author Email', 'PDF File ID', 'PDF File Name',
    'PDF URL', 'Archive Folder ID', 'Template File ID', 'Template File Name'
  ],
  [SHEETS.DASHBOARD]: [
    'Paper ID', 'Title', 'Track', 'Reviewer Feedback', 'Metadata + Website',
    'Camera-ready ZIP', 'Consent', 'Attendance', 'Indexing', 'Registration',
    'Author Proof', 'Overall Status', 'Last Activity'
  ]
});

const TASK_DEFINITIONS = Object.freeze([
  { id: 'feedback', name: 'Reviewer feedback', phase: 'required', order: 1 },
  { id: 'metadata', name: 'Authors, publication metadata, and website materials', phase: 'required', order: 2 },
  { id: 'camera_ready', name: 'Camera-ready publication package', phase: 'required', order: 3 },
  { id: 'consent', name: 'Copyright and recording consent', phase: 'required', order: 4 },
  { id: 'attendance', name: 'Confirm your attendance', phase: 'required', order: 5 },
  { id: 'indexing', name: 'Indexing metadata', phase: 'required', order: 6 },
  { id: 'registration', name: 'Conference registration', phase: 'required', order: 7 },
  { id: 'author_proof', name: 'Author proof', phase: 'later', order: 8 }
]);

const CAMERA_READY_TASK_IDS = Object.freeze([
  'feedback', 'metadata', 'camera_ready', 'consent', 'attendance', 'indexing'
]);

const REQUIRED_TASK_IDS = Object.freeze(
  CAMERA_READY_TASK_IDS.concat(['registration'])
);

const TASK_STATUSES = Object.freeze([
  'Not started', 'Draft saved', 'Submitted', 'Under review',
  'Action required', 'Approved', 'Locked', 'Proof ready'
]);

const FOLDER_SPECS = Object.freeze([
  { role: 'PAPER_ROOT', name: null },
  { role: 'CAMERA_READY', name: '01_Camera_Ready' },
  { role: 'WEBSITE_MATERIALS', name: '02_Website_Materials' },
  { role: 'COPYRIGHT_CONSENT', name: '03_Copyright_Consent' },
  { role: 'REGISTRATION', name: '04_Registration' },
  { role: 'COPYEDITING', name: '05_Copyediting' },
  { role: 'AUTHOR_PROOF', name: '06_Author_Proof' },
  { role: 'FINAL_PUBLICATION', name: '07_Final_Publication' },
  { role: 'PROJECT_POSTER', name: '08_Project_Poster' },
  { role: 'PREVIOUS_VERSIONS', name: '99_Previous_Versions' }
]);

const PHD_WORKSHOP_TRACK = 'PhD Workshop';
const PHD_WORKSHOP_STATUS_SHEET = 'PhD_Workshop_Status';
const PHD_WORKSHOP_POSTER_TASK_ID = 'phd_poster';
const PHD_WORKSHOP_POSTER_ROLE = 'phd_workshop_poster_pdf';
const PHD_WORKSHOP_VOLUNTEER_TASK_ID = 'volunteer';
const PHD_WORKSHOP_MONITOR_SHEET = 'Submission Monitor';
const PHD_WORKSHOP_ACTIVITY_SHEET = 'Activity Log';
const PHD_WORKSHOP_ASSIGNMENTS_SHEET = 'Volunteer Assignments';
const PHD_WORKSHOP_VOLUNTEER_OPTIONS = Object.freeze([
  'Conference registration desk',
  'Author communications and slides',
  'Navigation guides',
  'AGM slides',
  'Other'
]);
const PHD_WORKSHOP_VOLUNTEER_SLOTS = Object.freeze("__ACADIA_VALUE_volunteerSlots__");

const PHD_WORKSHOP_TASK_DEFINITIONS = Object.freeze([
  { id: 'metadata', name: 'Authors, publication metadata, and website materials', phase: 'required', order: 1 },
  { id: 'phd_poster', name: 'Exhibition Poster', phase: 'required', order: 2 },
  { id: 'consent', name: 'Copyright and recording consent', phase: 'required', order: 3 },
  { id: 'attendance', name: 'Confirm your attendance', phase: 'required', order: 4 },
  { id: 'indexing', name: 'Indexing metadata', phase: 'required', order: 5 },
  { id: 'volunteer', name: 'Volunteer service preferences', phase: 'required', order: 6 },
  { id: 'registration', name: 'Conference registration', phase: 'required', order: 7 }
]);

const PHD_WORKSHOP_FOLDER_SPECS = Object.freeze([
  { role: 'PAPER_ROOT', name: null },
  { role: 'WEBSITE_MATERIALS', name: '01_Website_Materials' },
  { role: 'PHD_POSTER', name: '02_Exhibition_Poster' },
  { role: 'COPYRIGHT_CONSENT', name: '03_Copyright_Consent' },
  { role: 'REGISTRATION', name: '04_Registration' },
  { role: 'PREVIOUS_VERSIONS', name: '99_Previous_Versions' }
]);

function taskDefinitionsForTrack_(track) {
  const normalized = normalizeTrack_(track);
  if (normalized === PHD_WORKSHOP_TRACK) return PHD_WORKSHOP_TASK_DEFINITIONS;
  if (normalized === BOOK_FORUM_TRACK) {
    return BOOK_FORUM_TASK_DEFINITIONS.map(function (task) {
      return {
        id: task.id,
        name: task.name || task.label || '',
        phase: task.phase || 'required',
        order: task.order
      };
    }).concat([{id:'metadata',name:'Publication information',phase:'optional',order:4}]);
  }
  return TASK_DEFINITIONS;
}

function requiredTaskIdsForTrack_(track) {
  return taskDefinitionsForTrack_(track)
    .filter(function (task) { return task.phase === 'required'; })
    .map(function (task) { return task.id; });
}

function folderSpecsForTrack_(track) {
  const normalized = normalizeTrack_(track);
  if (normalized === PHD_WORKSHOP_TRACK) return PHD_WORKSHOP_FOLDER_SPECS;
  if (normalized === BOOK_FORUM_TRACK) return BOOK_FORUM_FOLDER_SPECS.concat([{role:'WEBSITE_MATERIALS',name:'04_Website_Materials'}]);
  return FOLDER_SPECS;
}

let AUTHOR_HUB_CONFIG_RUNTIME_CACHE_ = null;

function getConfig_() {
  if (AUTHOR_HUB_CONFIG_RUNTIME_CACHE_) return AUTHOR_HUB_CONFIG_RUNTIME_CACHE_;
  const cache = CacheService.getScriptCache();
  const cached = cache.get('author_hub_config_v1');
  if (cached) return (AUTHOR_HUB_CONFIG_RUNTIME_CACHE_ = JSON.parse(cached));

  const config = Object.assign({}, DEFAULTS);
  const props = PropertiesService.getScriptProperties().getProperties();
  Object.keys(props).forEach(function (key) {
    if (key.indexOf('CFG_') === 0) config[key.substring(4)] = props[key];
  });

  const masterId = props.MASTER_SPREADSHEET_ID || config.MASTER_SPREADSHEET_ID;
  if (masterId) {
    try {
      const ss = SpreadsheetApp.openById(masterId);
      const sheet = ss.getSheetByName(SHEETS.SETTINGS);
      if (sheet && sheet.getLastRow() > 1) {
        const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
        values.forEach(function (row) {
          const key = String(row[0] || '').trim();
          if (key) config[key] = row[1];
        });
      }
    } catch (err) {
      console.warn('Could not read Settings sheet: ' + err.message);
    }
  }

  config.MASTER_SPREADSHEET_ID = masterId || '';
  config.PROOF_FORM_ID = props.PROOF_FORM_ID || config.PROOF_FORM_ID || '';
  config.SYSTEM_FOLDER_ID = props.SYSTEM_FOLDER_ID || config.SYSTEM_FOLDER_ID || '';
  config.DOWNLOADS_FOLDER_ID = props.DOWNLOADS_FOLDER_ID || config.DOWNLOADS_FOLDER_ID || '';
  config.EXPORTS_FOLDER_ID = props.EXPORTS_FOLDER_ID || config.EXPORTS_FOLDER_ID || '';
  config.ARCHIVE_FOLDER_ID = props.ARCHIVE_FOLDER_ID || config.ARCHIVE_FOLDER_ID || '';

  cache.put('author_hub_config_v1', JSON.stringify(config), 60);
  AUTHOR_HUB_CONFIG_RUNTIME_CACHE_ = config;
  return config;
}

function invalidateConfigCache_() {
  AUTHOR_HUB_CONFIG_RUNTIME_CACHE_ = null;
  CacheService.getScriptCache().remove('author_hub_config_v1');
}

function setScriptConfig_(key, value) {
  PropertiesService.getScriptProperties().setProperty('CFG_' + key, String(value));
  invalidateConfigCache_();
}

function parseBoolean_(value, fallback) {
  if (value === true || value === false) return value;
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].indexOf(text) !== -1) return true;
  if (['false', 'no', '0', 'n'].indexOf(text) !== -1) return false;
  return fallback;
}

function parseInteger_(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

/* Compatibility helpers used only by the separately installed BookForum.gs. */
function withScriptLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function getSubmissions_() {
  return sheetObjects_(SHEETS.SUBMISSIONS);
}

function findSubmissionById_(paperId) {
  return getSubmissionByPaperId_(paperId);
}

function repairTaskRowsForSubmission_(paperId) {
  const submission = requireSubmission_(paperId);
  ensureTaskRows_(paperId, submission.Track);
}

function appendActivity_(entry) {
  entry = entry || {};
  logActivity_(
    entry.paperId,
    entry.action || 'Book Forum activity',
    entry.taskId || '',
    entry.details || ''
  );
}

function invalidateDataCaches_() {
  SpreadsheetApp.flush();
}

function getHeaderMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const map = {};
  headers.forEach(function (header, index) {
    map[String(header || '').trim().toLowerCase()] = index;
  });
  return map;
}

function setRowValueByHeader_(row, headerMap, aliases, value) {
  const candidates = (aliases || []).map(function (alias) {
    return String(alias || '').trim().toLowerCase();
  });
  if (candidates.indexOf('title') !== -1) candidates.push('original title');
  for (let index = 0; index < candidates.length; index += 1) {
    if (Object.prototype.hasOwnProperty.call(headerMap, candidates[index])) {
      row[headerMap[candidates[index]]] = value;
      return true;
    }
  }
  return false;
}

function publicConfig_() {
  const cfg = getConfig_();
  return {
    appName: cfg.APP_NAME,
    conferenceName: cfg.CONFERENCE_NAME,
    conferenceLocation: cfg.CONFERENCE_LOCATION,
    workshopDates: cfg.WORKSHOP_DATES,
    conferenceDates: cfg.CONFERENCE_DATES,
    deadlineIsoUtc: cfg.CAMERA_READY_DEADLINE_ISO_UTC,
    deadlineLabel: cfg.CAMERA_READY_DEADLINE_LABEL,
    phdWorkshopDeadlineIsoUtc: cfg.PHD_WORKSHOP_DEADLINE_ISO_UTC,
    phdWorkshopDeadlineLabel: cfg.PHD_WORKSHOP_DEADLINE_LABEL,
    registrationDeadlineIsoUtc: cfg.REGISTRATION_DEADLINE_ISO_UTC,
    registrationDeadlineLabel: cfg.REGISTRATION_DEADLINE_LABEL,
    earlyBirdRegistrationDeadlineLabel: cfg.EARLY_BIRD_REGISTRATION_DEADLINE_LABEL,
    projectPosterDeadlineLabel: cfg.PROJECT_POSTER_DEADLINE_LABEL,
    indexingUrl: cfg.INDEXING_URL,
    registrationUrl: cfg.REGISTRATION_URL,
    contactEmail: cfg.CONTACT_EMAIL,
    visaLetterEnabled:
      parseBoolean_(cfg.VISA_LETTER_ENABLED, false) &&
      Boolean(String(cfg.VISA_LETTER_TEMPLATE_DOC_ID || '').trim()),
    // Embed the banner as a data URL generated server-side. This avoids
    // Google Drive's non-embeddable preview/download responses inside the
    // Apps Script HTML-service iframe.
    bannerUrl: driveImageDataUrl_(cfg.BANNER_FILE_ID),
    paperTemplateUrl: driveDownloadUrl_(cfg.PAPER_TEMPLATE_FILE_ID || cfg.TEMPLATE_ZIP_FILE_ID),
    projectFieldNoteTemplateUrl: driveDownloadUrl_(cfg.PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID || cfg.TEMPLATE_ZIP_FILE_ID),
    projectPosterTemplateUrl: driveViewUrl_(cfg.PROJECT_POSTER_TEMPLATE_FILE_ID),
    bookForumPosterTemplateUrl: driveViewUrl_(cfg.PROJECT_POSTER_TEMPLATE_FILE_ID),
        bookForumProceedingTemplateUrl: driveDownloadUrl_("__ACADIA_RESOURCE_bookTemplateId__"),
    projectPosterInstructionsUrl: driveViewUrl_(cfg.PROJECT_POSTER_INSTRUCTIONS_FILE_ID),
    presentationTemplateUrl: driveViewUrl_(cfg.PRESENTATION_TEMPLATE_FILE_ID),
    templateZipUrl: driveDownloadUrl_(cfg.TEMPLATE_ZIP_FILE_ID), // Legacy fallback.
    publicationInstructionsUrl: driveViewUrl_(cfg.PUBLICATION_INSTRUCTIONS_FILE_ID),
    consentPdfUrl: driveViewUrl_(cfg.CONSENT_PDF_FILE_ID),
    uploadChunkBytes: parseInteger_(cfg.UPLOAD_CHUNK_BYTES, 8 * 1024 * 1024),
    cameraReadyMaxBytes: parseInteger_(cfg.CAMERA_READY_MAX_BYTES, 1000000000),
    projectPosterMaxBytes: parseInteger_(cfg.PROJECT_POSTER_MAX_BYTES, 100 * 1024 * 1024),
    bookForumPosterMaxBytes: parseInteger_(cfg.BOOK_FORUM_POSTER_MAX_BYTES, BOOK_FORUM_POSTER_MAX_BYTES),
    bookForumProceedingMaxBytes: parseInteger_(cfg.BOOK_FORUM_PROCEEDING_MAX_BYTES, BOOK_FORUM_PROCEEDING_MAX_BYTES),
    authorProofAttachmentSlots: Math.max(1, Math.min(5, parseInteger_(cfg.AUTHOR_PROOF_ATTACHMENT_SLOTS, 5))),
    authorProofAnnotatedMaxBytes: parseInteger_(cfg.AUTHOR_PROOF_ANNOTATED_MAX_BYTES, 100 * 1024 * 1024),
    authorProofAttachmentMaxBytes: parseInteger_(cfg.AUTHOR_PROOF_ATTACHMENT_MAX_BYTES, 250 * 1024 * 1024),
    siteChairs: String(cfg.SITE_CHAIRS || '').split('|').filter(Boolean),
    technicalChairs: String(cfg.TECHNICAL_CHAIRS || '').split('|').filter(Boolean)
  };
}

function driveViewUrl_(fileId) {
  const id = String(fileId || '').trim();
  return id ? 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/view' : '';
}

/**
 * Reads an image from Drive using the deployment owner's credentials and
 * returns a browser-safe data URL. The image can remain private; authors do
 * not need direct Drive access.
 */
function driveImageDataUrl_(fileId) {
  const id = String(fileId || '').trim();
  if (!id) return '';

  try {
    const file = DriveApp.getFileById(id);
    const blob = file.getBlob();
    const mimeType = String(blob.getContentType() || file.getMimeType() || '').toLowerCase();
    const bytes = blob.getBytes();

    if (mimeType.indexOf('image/') !== 0) {
      console.warn('Banner file is not an image: ' + file.getName() + ' (' + mimeType + ')');
      return '';
    }
    if (!bytes.length) {
      console.warn('Banner image is empty: ' + file.getName());
      return '';
    }

    // Prevent an accidentally huge file from making every portal page too large.
    const maxBannerBytes = 5 * 1024 * 1024;
    if (bytes.length > maxBannerBytes) {
      console.warn(
        'Banner image is larger than 5 MB. Use a web-optimized image. Current size: ' +
        bytes.length + ' bytes.'
      );
      return '';
    }

    return 'data:' + mimeType + ';base64,' + Utilities.base64Encode(bytes);
  } catch (err) {
    console.warn('Could not load the banner image from Drive: ' + err.message);
    return '';
  }
}

function driveDownloadUrl_(fileId) {
  const id = String(fileId || '').trim();
  return id ? 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id) : '';
}

/******************************************************************************
 * SOURCE: Code.gs
 ******************************************************************************/

/** Entry point for the standalone ACADIA 2026 Author Hub web app. */

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.bootstrapJson = acmsContentJSON_(publicConfig_());
  return acmsDecorateOutput_(template.evaluate(), 'author-portal')
    .setTitle("__ACADIA_TEXT_t0001__")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include_(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function healthCheck() {
  const cfg = getConfig_();
  return {
    ok: true,
    app: cfg.APP_NAME,
    masterSpreadsheetConfigured: Boolean(cfg.MASTER_SPREADSHEET_ID),
    proofFormConfigured: Boolean(cfg.PROOF_FORM_ID),
    deployedUrl: ScriptApp.getService().getUrl() || '',
    serverTime: new Date().toISOString()
  };
}

/******************************************************************************
 * SOURCE: Data.gs
 ******************************************************************************/

/** Spreadsheet persistence, normalization, task state, and portal data assembly. */

let MASTER_SPREADSHEET_RUNTIME_CACHE_ = null;
let MASTER_SPREADSHEET_RUNTIME_ID_ = '';
let SHEET_RUNTIME_CACHE_ = Object.create(null);
let SHEET_OBJECTS_RUNTIME_CACHE_ = null;

function withSheetObjectsRuntimeCache_(callback) {
  // Reuse a request-local snapshot across nested helpers; never share author data across requests.
  if (SHEET_OBJECTS_RUNTIME_CACHE_) return callback();
  const previous = SHEET_OBJECTS_RUNTIME_CACHE_;
  SHEET_OBJECTS_RUNTIME_CACHE_ = Object.create(null);
  try {
    return callback();
  } finally {
    SHEET_OBJECTS_RUNTIME_CACHE_ = previous;
  }
}

function invalidateSheetObjectsRuntimeCache_(sheetName) {
  if (SHEET_OBJECTS_RUNTIME_CACHE_) {
    delete SHEET_OBJECTS_RUNTIME_CACHE_[String(sheetName)];
  }
}

function getMasterSpreadsheet_() {
  const cfg = getConfig_();
  if (!cfg.MASTER_SPREADSHEET_ID) {
    throw new Error('Author Hub has not been initialized. Run RUN_SETUP() from the Apps Script editor first.');
  }
  const spreadsheetId = String(cfg.MASTER_SPREADSHEET_ID);
  if (MASTER_SPREADSHEET_RUNTIME_CACHE_ && MASTER_SPREADSHEET_RUNTIME_ID_ === spreadsheetId) {
    return MASTER_SPREADSHEET_RUNTIME_CACHE_;
  }
  MASTER_SPREADSHEET_RUNTIME_CACHE_ = SpreadsheetApp.openById(spreadsheetId);
  MASTER_SPREADSHEET_RUNTIME_ID_ = spreadsheetId;
  SHEET_RUNTIME_CACHE_ = Object.create(null);
  return MASTER_SPREADSHEET_RUNTIME_CACHE_;
}

function getSheet_(name) {
  const key = String(name);
  if (Object.prototype.hasOwnProperty.call(SHEET_RUNTIME_CACHE_, key)) {
    return SHEET_RUNTIME_CACHE_[key];
  }
  const sheet = getMasterSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error('Missing required sheet: ' + name);
  SHEET_RUNTIME_CACHE_[key] = sheet;
  return sheet;
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
    .map(function (value) { return String(value || '').trim(); });
}

function sheetObjects_(sheetName) {
  const cacheKey = String(sheetName);
  if (
    SHEET_OBJECTS_RUNTIME_CACHE_ &&
    Object.prototype.hasOwnProperty.call(SHEET_OBJECTS_RUNTIME_CACHE_, cacheKey)
  ) {
    return SHEET_OBJECTS_RUNTIME_CACHE_[cacheKey];
  }
  const sheet = getSheet_(sheetName);
  // One batch read supplies both headers and rows, preserving native Date/Boolean values.
  const values = sheet.getDataRange().getValues();
  if (values.length < 2 || !values[0].length) {
    if (SHEET_OBJECTS_RUNTIME_CACHE_) SHEET_OBJECTS_RUNTIME_CACHE_[cacheKey] = [];
    return [];
  }
  const headers = values[0].map(function (value) { return String(value || '').trim(); });
  const objects = values.slice(1).map(function (row, index) {
    const object = { __row: index + 2 };
    headers.forEach(function (header, col) { object[header] = row[col]; });
    return object;
  });
  if (SHEET_OBJECTS_RUNTIME_CACHE_) SHEET_OBJECTS_RUNTIME_CACHE_[cacheKey] = objects;
  return objects;
}

function appendObject_(sheetName, object) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  sheet.appendRow(headers.map(function (header) {
    return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
  }));
  invalidateSheetObjectsRuntimeCache_(sheetName);
  return sheet.getLastRow();
}

function updateObjectRow_(sheetName, rowNumber, object) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const current = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  const next = headers.map(function (header, index) {
    return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : current[index];
  });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([next]);
  invalidateSheetObjectsRuntimeCache_(sheetName);
}

function clearDataRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(1, sheet.getLastColumn())).clearContent();
  }
  invalidateSheetObjectsRuntimeCache_(sheetName);
}


function replaceSheetObjects_(sheetName, objects) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(1, headers.length)).clearContent();
  }
  const rows = (objects || []).map(function (object) {
    return headers.map(function (header) {
      return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
    });
  });
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  invalidateSheetObjectsRuntimeCache_(sheetName);
  return rows.length;
}

function findObject_(sheetName, predicate) {
  const rows = sheetObjects_(sheetName);
  for (let i = 0; i < rows.length; i += 1) {
    if (predicate(rows[i])) return rows[i];
  }
  return null;
}

function findObjects_(sheetName, predicate) {
  return sheetObjects_(sheetName).filter(predicate);
}

function normalizePaperId_(value) {
  return String(value == null ? '' : value).trim().replace(/^#/, '');
}

function normalizeTitle_(value) {
  let text = String(value == null ? '' : value).trim().toLowerCase();
  try { text = text.normalize('NFKD'); } catch (err) {}
  return text
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”„‟«»‘’‚‛'"`´]/g, '')
    .replace(/[‐‑‒–—―-]/g, ' ')
    .replace(/[\[\]{}()<>:;,.!?/\\|@#$%^&*_+=~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeEmail_(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

function normalizeTrack_(value) {
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (['paper', 'papers', 'full paper', 'full papers'].indexOf(text) !== -1) return 'Full Paper';
  if (['project', 'projects'].indexOf(text) !== -1) return 'Projects';
  if (['field note', 'field notes', 'fieldnote', 'fieldnotes'].indexOf(text) !== -1) return 'Field Note';
  if (['phd workshop', 'phd workshop participant', 'phd workshop participants', 'phd'].indexOf(text) !== -1) {
    return PHD_WORKSHOP_TRACK;
  }
  if (['book forum', 'bookforum', 'book forums', 'book'].indexOf(text) !== -1) {
    return BOOK_FORUM_TRACK;
  }
  if (text === 'host') return 'Host';
  return String(value == null ? '' : value).trim();
}

function isPosterTrack_(track) {
  const normalized = normalizeTrack_(track);
  return normalized === 'Projects' || normalized === 'Field Note';
}

function inferredVolume_(track) {
  const normalized = normalizeTrack_(track);
  if (normalized === 'Projects') return 'Volume 1';
  if (normalized === 'Full Paper') return 'Volume 2';
  if (normalized === 'Field Note') return 'Volume 3';
  if (normalized === 'Host') return 'Host';
  return '';
}

function getSubmissionByPaperId_(paperId) {
  const id = normalizePaperId_(paperId);
  return findObject_(SHEETS.SUBMISSIONS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
}

function requireSubmission_(paperId) {
  const submission = getSubmissionByPaperId_(paperId);
  if (!submission) throw new Error('Submission record not found.');
  return submission;
}

function upsertSubmission_(input) {
  const now = new Date();
  const paperId = normalizePaperId_(input['Paper ID']);
  if (!paperId) throw new Error('Paper ID is required.');
  const originalTitle = String(input['Original Title'] || '').trim();
  if (!originalTitle) throw new Error('Original Title is required for Paper ' + paperId + '.');

  const existing = getSubmissionByPaperId_(paperId);
  const track = normalizeTrack_(input.Track || (existing && existing.Track) || '');
  const object = {
    'Paper ID': paperId,
    'Original Title': originalTitle,
    'Normalized Original Title': normalizeTitle_(originalTitle),
    'Final Title': input['Final Title'] || (existing && existing['Final Title']) || originalTitle,
    'Track': track,
    'Volume': input.Volume || (existing && existing.Volume) || inferredVolume_(track),
    'Corresponding Author': input['Corresponding Author'] || (existing && existing['Corresponding Author']) || '',
    'Corresponding Email': input['Corresponding Email'] || (existing && existing['Corresponding Email']) || '',
    'Presenting Author': input['Presenting Author'] || (existing && existing['Presenting Author']) || '',
    'Presenting Email': input['Presenting Email'] || (existing && existing['Presenting Email']) || '',
    'Submission Folder ID': (existing && existing['Submission Folder ID']) || input['Submission Folder ID'] || '',
    'Portal Enabled': input['Portal Enabled'] == null
      ? (existing ? parseBoolean_(existing['Portal Enabled'], true) : true)
      : parseBoolean_(input['Portal Enabled'], true),
    'Overall Status': (existing && existing['Overall Status']) || 'Accepted — Awaiting Materials',
    'Proof Version': (existing && existing['Proof Version']) || '',
    'Proof Due Label': (existing && existing['Proof Due Label']) || '',
    'Last Updated': now
  };

  if (existing) updateObjectRow_(SHEETS.SUBMISSIONS, existing.__row, object);
  else appendObject_(SHEETS.SUBMISSIONS, object);

  ensureTaskRows_(paperId);
  return object;
}

function ensureTaskRows_(paperId, trackOverride) {
  const id = normalizePaperId_(paperId);
  const submission = getSubmissionByPaperId_(id);
  const track = String(trackOverride || (submission && submission.Track) || '');
  const definitions = taskDefinitionsForTrack_(track);
  const existing = findObjects_(SHEETS.TASKS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  const byTask = {};
  existing.forEach(function (row) { byTask[String(row['Task ID'])] = row; });
  definitions.forEach(function (task) {
    if (!byTask[task.id]) {
      appendObject_(SHEETS.TASKS, {
        'Paper ID': id,
        'Task ID': task.id,
        'Task Name': task.name,
        'Status': task.id === 'author_proof' ? 'Locked' : 'Not started',
        'Submitted At': '',
        'Approved At': '',
        'Action Required Note': '',
        'Last Updated': new Date()
      });
    }
  });
}

function getTaskRows_(paperId) {
  const submission = requireSubmission_(paperId);
  ensureTaskRows_(paperId, submission.Track);
  const id = normalizePaperId_(paperId);
  const definitions = taskDefinitionsForTrack_(submission.Track);
  const orderById = {};
  definitions.forEach(function (task) { orderById[task.id] = task.order; });
  const rows = findObjects_(SHEETS.TASKS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  rows.sort(function (a, b) {
    return (orderById[String(a['Task ID'])] || 999) -
      (orderById[String(b['Task ID'])] || 999);
  });
  return rows;
}

function getTaskRow_(paperId, taskId) {
  const id = normalizePaperId_(paperId);
  ensureTaskRows_(id);
  return findObject_(SHEETS.TASKS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && String(row['Task ID']) === String(taskId);
  });
}

function setTaskStatus_(paperId, taskId, status, options) {
  options = options || {};
  if (TASK_STATUSES.indexOf(status) === -1) throw new Error('Invalid task status: ' + status);
  const row = getTaskRow_(paperId, taskId);
  if (!row) throw new Error('Task not found: ' + taskId);
  const now = new Date();
  const update = {
    'Status': status,
    'Last Updated': now,
    'Action Required Note': options.note == null ? row['Action Required Note'] : options.note
  };
  if (status === 'Submitted') update['Submitted At'] = options.submittedAt || now;
  if (status === 'Approved') update['Approved At'] = options.approvedAt || now;
  if (options.clearSubmittedAt) update['Submitted At'] = '';
  if (options.clearApprovedAt) update['Approved At'] = '';
  if (status !== 'Action required' && options.clearNote) update['Action Required Note'] = '';
  updateObjectRow_(SHEETS.TASKS, row.__row, update);
  updateSubmissionOverallStatus_(paperId);
  try { updateAdminDashboardForPaper_(paperId); } catch (err) { console.warn(err.message); }
  return Object.assign({}, row, update);
}


function updateAdminDashboardForPaper_(paperId) {
  const id = normalizePaperId_(paperId);
  const submission = requireSubmission_(id);
  const tasks = getTaskRows_(id);
  const status = {};
  tasks.forEach(function (row) { status[String(row['Task ID'])] = String(row.Status || ''); });
  const activities = getActivity_(id, 1);
  const values = [
    id,
    submission['Final Title'] || submission['Original Title'],
    submission.Track,
    status.feedback || '',
    status.metadata || '',
    status.camera_ready || '',
    status.consent || '',
    status.attendance || '',
    status.indexing || '',
    status.registration || '',
    status.author_proof || '',
    submission['Overall Status'] || '',
    activities.length && activities[0].timestamp ? new Date(activities[0].timestamp) : ''
  ];
  const sheet = getSheet_(SHEETS.DASHBOARD);
  const rows = sheetObjects_(SHEETS.DASHBOARD);
  const existing = rows.find(function (row) { return normalizePaperId_(row['Paper ID']) === id; });
  if (existing) sheet.getRange(existing.__row, 1, 1, values.length).setValues([values]);
  else sheet.appendRow(values);
  invalidateSheetObjectsRuntimeCache_(SHEETS.DASHBOARD);
}

function updateSubmissionOverallStatus_(paperId) {
  const submission = requireSubmission_(paperId);
  const requiredIds = requiredTaskIdsForTrack_(submission.Track);
  const required = getTaskRows_(paperId).filter(function (row) {
    return requiredIds.indexOf(String(row['Task ID'])) !== -1;
  });
  const statuses = required.map(function (row) { return String(row.Status || ''); });
  let overall = 'Accepted — Awaiting Materials';
  const materialRows = required.filter(function (row) {
    return String(row['Task ID']) !== 'registration';
  });
  const materialStatuses = materialRows.map(function (row) { return String(row.Status || ''); });
  const registrationRow = required.find(function (row) { return String(row['Task ID']) === 'registration'; });
  const registrationStatus = registrationRow ? String(registrationRow.Status || '') : 'Not started';
  const reviewReady = ['Submitted', 'Under review', 'Approved'];
  const isPhd = normalizeTrack_(submission.Track) === PHD_WORKSHOP_TRACK;

  if (statuses.indexOf('Action required') !== -1) overall = 'Action Required — Incomplete';
  else if (statuses.length && statuses.every(function (status) { return status === 'Approved'; })) {
    overall = 'Complete — Final Acceptance';
  } else if (statuses.length && statuses.every(function (status) { return reviewReady.indexOf(status) !== -1; })) {
    overall = 'Submitted — Technical Review Pending';
  } else if (
    materialStatuses.length &&
    materialStatuses.every(function (status) { return reviewReady.indexOf(status) !== -1; }) &&
    reviewReady.indexOf(registrationStatus) === -1
  ) {
    overall = isPhd
      ? 'Workshop materials submitted — Registration pending'
      : 'Camera-ready submitted — Registration pending';
  } else if (statuses.some(function (status) { return status !== 'Not started'; })) {
    overall = isPhd ? 'Workshop materials in progress' : 'Camera-ready in progress';
  }

  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Overall Status': overall,
    'Last Updated': new Date()
  });
  return overall;
}


function getTaskData_(paperId, taskId) {
  const id = normalizePaperId_(paperId);
  const row = findObject_(SHEETS.TASK_DATA, function (item) {
    return normalizePaperId_(item['Paper ID']) === id && String(item['Task ID']) === String(taskId);
  });
  if (!row || !String(row['Data JSON'] || '').trim()) return {};
  try { return JSON.parse(String(row['Data JSON'])); } catch (err) { return {}; }
}

function upsertTaskData_(paperId, taskId, data) {
  const id = normalizePaperId_(paperId);
  const existing = findObject_(SHEETS.TASK_DATA, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && String(row['Task ID']) === String(taskId);
  });
  const object = {
    'Paper ID': id,
    'Task ID': String(taskId),
    'Data JSON': JSON.stringify(data || {}),
    'Last Updated': new Date()
  };
  if (existing) updateObjectRow_(SHEETS.TASK_DATA, existing.__row, object);
  else appendObject_(SHEETS.TASK_DATA, object);
}

function getWebsiteRecord_(paperId) {
  const id = normalizePaperId_(paperId);
  return findObject_(SHEETS.WEBSITE, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
}

function upsertWebsiteRecord_(paperId, object) {
  const id = normalizePaperId_(paperId);
  const existing = getWebsiteRecord_(id);
  const next = Object.assign({ 'Paper ID': id, 'Last Updated': new Date() }, object);
  if (existing) updateObjectRow_(SHEETS.WEBSITE, existing.__row, next);
  else appendObject_(SHEETS.WEBSITE, next);
}

function replaceAuthors_(paperId, authors) {
  const id=normalizePaperId_(paperId),sheet=getSheet_(SHEETS.AUTHORS);
  const existing=sheetObjects_(SHEETS.AUTHORS).filter(function(row){return normalizePaperId_(row['Paper ID'])===id;})
    .sort(function(a,b){return Number(a.Position||0)-Number(b.Position||0);});
  authors.forEach(function(author,index){
    const row={'Paper ID':id,'Position':index+1,'Full Name':String(author.name||'').trim(),
      'Email':String(author.email||'').trim(),'Affiliation':String(author.affiliation||'').trim(),
      'ORCID':String(author.orcid||'').trim(),'Corresponding':Boolean(author.corresponding),
      'Presenting':Boolean(author.presenting),'Last Updated':new Date()};
    if(existing[index])updateObjectRow_(SHEETS.AUTHORS,existing[index].__row,row);
    else appendObject_(SHEETS.AUTHORS,row);
  });
  existing.slice(authors.length).sort(function(a,b){return b.__row-a.__row;}).forEach(function(row){sheet.deleteRow(row.__row);});
  invalidateSheetObjectsRuntimeCache_(SHEETS.AUTHORS);
}

function getAuthors_(paperId) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.AUTHORS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  rows.sort(function (a, b) { return Number(a.Position || 0) - Number(b.Position || 0); });
  return rows.map(function (row) {
    return {
      name: String(row['Full Name'] || ''),
      email: String(row.Email || ''),
      affiliation: String(row.Affiliation || ''),
      orcid: String(row.ORCID || ''),
      corresponding: parseBoolean_(row.Corresponding, false),
      presenting: parseBoolean_(row.Presenting, false)
    };
  });
}

function upsertWebsiteImageMetadata_(paperId, slot, metadata) {
  const id = normalizePaperId_(paperId);
  const slotNumber = Number(slot);
  const existing = findObject_(SHEETS.WEBSITE_IMAGES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && Number(row['Image Slot']) === slotNumber;
  });
  const object = {
    'Paper ID': id,
    'Image Slot': slotNumber,
    'Caption': String(metadata.caption || ''),
    'Credit': String(metadata.credit || ''),
    'Alt Text': String(metadata.altText || ''),
    'Active': existing ? existing.Active : false,
    'Last Updated': new Date()
  };
  if (existing) updateObjectRow_(SHEETS.WEBSITE_IMAGES, existing.__row, object);
  else appendObject_(SHEETS.WEBSITE_IMAGES, object);
}

function getWebsiteImages_(paperId) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.WEBSITE_IMAGES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  rows.sort(function (a, b) { return Number(a['Image Slot'] || 0) - Number(b['Image Slot'] || 0); });
  return rows.map(function (row) {
    return {
      slot: Number(row['Image Slot']),
      fileId: String(row['Drive File ID'] || ''),
      fileName: String(row['File Name'] || ''),
      caption: String(row.Caption || ''),
      credit: String(row.Credit || ''),
      altText: String(row['Alt Text'] || ''),
      active: parseBoolean_(row.Active, false)
    };
  });
}

function getActiveFiles_(paperId) {
  const id = normalizePaperId_(paperId);
  return findObjects_(SHEETS.FILES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && parseBoolean_(row.Active, false);
  }).map(function (row) {
    return {
      taskId: String(row['Task ID'] || ''),
      role: String(row.Role || ''),
      version: parseFileVersionNumber_(row.Version, 0),
      fileId: String(row['Drive File ID'] || ''),
      fileName: String(row['File Name'] || ''),
      originalFileName: String(row['Original File Name'] || ''),
      mimeType: String(row['MIME Type'] || ''),
      sizeBytes: Number(row['Size Bytes'] || 0),
      uploadedAt: row['Uploaded At'] ? new Date(row['Uploaded At']).toISOString() : ''
    };
  });
}

function ensureAttendanceSheet_() {
  const spreadsheet = getMasterSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEETS.ATTENDANCE);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.ATTENDANCE);
    const headers = SHEET_HEADERS[SHEETS.ATTENDANCE];
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatDataSheet_(sheet, headers.length);
  }
  return sheet;
}

function getAttendance_(paperId) {
  const id = normalizePaperId_(paperId);
  ensureAttendanceSheet_();
  const row = findObject_(SHEETS.ATTENDANCE, function (item) {
    return normalizePaperId_(item['Paper ID']) === id;
  });
  const submission = getSubmissionByPaperId_(id) || {};
  return row ? {
    confirmed: parseBoolean_(row['Attendance Confirmed'], false),
    presenterName: String(row['Presenter Name'] || submission['Presenting Author'] || ''),
    presenterEmail: String(row['Presenter Email'] || submission['Presenting Email'] || ''),
    confirmedAt: row['Confirmed At'] ? new Date(row['Confirmed At']).toISOString() : '',
    lastUpdated: row['Last Updated'] ? new Date(row['Last Updated']).toISOString() : ''
  } : {
    confirmed: false,
    presenterName: String(submission['Presenting Author'] || ''),
    presenterEmail: String(submission['Presenting Email'] || ''),
    confirmedAt: '',
    lastUpdated: ''
  };
}

function upsertAttendance_(paperId, object) {
  const id = normalizePaperId_(paperId);
  ensureAttendanceSheet_();
  const existing = findObject_(SHEETS.ATTENDANCE, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  const next = Object.assign({ 'Paper ID': id, 'Last Updated': new Date() }, object || {});
  if (existing) updateObjectRow_(SHEETS.ATTENDANCE, existing.__row, next);
  else appendObject_(SHEETS.ATTENDANCE, next);
}

function synchronizePresentingAuthor_(paperId, presenterName, presenterEmail, requireMatch) {
  const id = normalizePaperId_(paperId);
  const email = normalizeEmail_(presenterEmail);
  const nameKey = normalizeTitle_(presenterName);
  const metadataTaskNumber = normalizeTrack_(requireSubmission_(paperId).Track) === PHD_WORKSHOP_TRACK ? '1' : '2';
  const rows = findObjects_(SHEETS.AUTHORS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });

  if (!rows.length) {
    if (requireMatch) throw new Error('Complete Task ' + metadataTaskNumber + ' before confirming attendance. The presenter must be listed in the final author list.');
    return false;
  }

  let matched = null;
  rows.forEach(function (row) {
    const rowEmail = normalizeEmail_(row.Email);
    const rowName = normalizeTitle_(row['Full Name']);
    if (!matched && ((email && rowEmail === email) || (!email && nameKey && rowName === nameKey))) matched = row;
  });

  if (!matched && requireMatch) {
    throw new Error('The presenter must be one of the authors entered in Task ' + metadataTaskNumber + '. Check the presenter name and email.');
  }
  if (!matched) return false;

  rows.forEach(function (row) {
    updateObjectRow_(SHEETS.AUTHORS, row.__row, {
      'Presenting': row.__row === matched.__row,
      'Last Updated': new Date()
    });
  });
  return true;
}

function getRegistration_(paperId) {
  const id = normalizePaperId_(paperId);
  const row = findObject_(SHEETS.REGISTRATION, function (item) {
    return normalizePaperId_(item['Paper ID']) === id;
  });
  if (!row) return null;
  return {
    registeredAuthor: String(row['Registered Author'] || ''),
    registeredEmail: String(row['Registered Email'] || ''),
    confirmationNumber: String(row['Confirmation Number'] || ''),
    receiptFileId: String(row['Receipt File ID'] || ''),
    uniqueAuthorCheck: String(row['Unique Author Check'] || '')
  };
}

function upsertRegistration_(paperId, object) {
  const id = normalizePaperId_(paperId);
  const existing = findObject_(SHEETS.REGISTRATION, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  const next = Object.assign({ 'Paper ID': id, 'Last Updated': new Date() }, object);
  if (existing) updateObjectRow_(SHEETS.REGISTRATION, existing.__row, next);
  else appendObject_(SHEETS.REGISTRATION, next);
}

function getIndexing_(paperId) {
  const id = normalizePaperId_(paperId);
  const row = findObject_(SHEETS.INDEXING, function (item) {
    return normalizePaperId_(item['Paper ID']) === id;
  });
  if (!row) return null;
  return {
    openedAt: row['Opened At'] ? new Date(row['Opened At']).toISOString() : '',
    confirmed: parseBoolean_(row.Confirmed, false),
    confirmationNote: String(row['Confirmation Note'] || ''),
    confirmedAt: row['Confirmed At'] ? new Date(row['Confirmed At']).toISOString() : ''
  };
}

function upsertIndexing_(paperId, object) {
  const id = normalizePaperId_(paperId);
  const existing = findObject_(SHEETS.INDEXING, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  const next = Object.assign({ 'Paper ID': id, 'Last Updated': new Date() }, object);
  if (existing) updateObjectRow_(SHEETS.INDEXING, existing.__row, next);
  else appendObject_(SHEETS.INDEXING, next);
}

function getReviews_(paperId) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.REVIEWER_FEEDBACK, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && String(row['Reviewer Comment'] || '').trim();
  });
  return rows.map(function (row, index) {
    return {
      label: String(row['Review Label'] || ('Reviewer ' + (index + 1))),
      comment: String(row['Reviewer Comment'] || ''),
      source: String(row.Source || '')
    };
  });
}

function logActivity_(paperId, event, taskId, detail) {
  appendObject_(SHEETS.ACTIVITY, {
    'Timestamp': new Date(),
    'Paper ID': normalizePaperId_(paperId),
    'Event': String(event || ''),
    'Task ID': String(taskId || ''),
    'Detail': String(detail || '')
  });
  try { updateAdminDashboardForPaper_(paperId); } catch (err) { console.warn(err.message); }
  try {
    syncPhdWorkshopMonitorEvent_(paperId, event, taskId, detail);
  } catch (err) {
    console.warn('PhD Workshop monitor sync failed: ' + err.message);
  }
}

function getActivity_(paperId, limit) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.ACTIVITY, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  rows.sort(function (a, b) { return new Date(b.Timestamp) - new Date(a.Timestamp); });
  return rows.slice(0, limit || 20).map(function (row) {
    return {
      timestamp: row.Timestamp ? new Date(row.Timestamp).toISOString() : '',
      event: String(row.Event || ''),
      taskId: String(row['Task ID'] || ''),
      detail: String(row.Detail || '')
    };
  });
}

function wordCount_(value) {
  const text = String(value == null ? '' : value).trim();
  return text ? text.split(/\s+/).length : 0;
}

function isCameraReadyOpen_() {
  return parseBoolean_(getConfig_().PORTAL_ENABLED,true);
}

function isPhdWorkshopOpen_() {
  return parseBoolean_(getConfig_().PORTAL_ENABLED,true);
}

function isRegistrationOpen_() {
  return parseBoolean_(getConfig_().PORTAL_ENABLED,true);
}

function isProjectPosterOpen_() {
  const cfg = getConfig_();
  return parseBoolean_(cfg.PORTAL_ENABLED, true);
}

/**
 * Authors may replace files in their own available tasks while the portal is enabled.
 * Track-specific upload rules and proof availability still apply.
 */
function assertUploadOpen_(paperId, taskId, role) {
  const id = String(taskId || '');
  const uploadRole = String(role || '');

  if ([BOOK_FORUM_POSTER_TASK_ID, BOOK_FORUM_PROCEEDING_TASK_ID].indexOf(id) !== -1) {
    const submission = requireSubmission_(paperId);
    if (normalizeTrack_(submission.Track || '') !== BOOK_FORUM_TRACK) {
      throw new Error('This uploader is available only to Book Forum submissions.');
    }
    if (!parseBoolean_(getConfig_().PORTAL_ENABLED, true)) {
      throw new Error('The Author Portal is currently disabled.');
    }
    return;
  }

  if (id === 'camera_ready' && uploadRole === 'project_poster_pdf') {
    const submission = requireSubmission_(paperId);
    if (!isPosterTrack_(submission.Track || '')) {
      throw new Error('The poster upload is available only to submissions accepted in the Projects or Field Note tracks.');
    }
    if (!isProjectPosterOpen_()) {
      throw new Error('The Author Portal is currently disabled.');
    }
    return;
  }

  if (id === 'author_proof') {
    const task = getTaskRow_(paperId, 'author_proof');
    const status = task ? String(task.Status || '') : '';
    if (['Proof ready', 'Draft saved', 'Action required', 'Submitted', 'Under review', 'Approved'].indexOf(status) === -1) {
      throw new Error('The Author Proof return is not currently open. Contact the Technical Chairs if another response is required.');
    }
    if (!activeFileForRole_(paperId, 'author_proof', 'author_proof_pdf')) {
      throw new Error('The copyedited proof PDF has not been attached to this submission.');
    }
    if (!parseBoolean_(getConfig_().PORTAL_ENABLED, true)) {
      throw new Error('The Author Portal is currently disabled.');
    }
    ensureAuthorProofRoundData_(paperId);
    return;
  }

  assertRequiredTaskOpen_(id, paperId);
}

/**
 * Authors can update their own available tasks while their portal remains enabled.
 * Submission deadlines are advisory for revisions; track and proof-stage checks remain enforced.
 */
function assertRequiredTaskOpen_(taskId, paperId) {
  const cfg=getConfig_(),submission=requireSubmission_(paperId);
  if (!parseBoolean_(cfg.PORTAL_ENABLED,true) || !parseBoolean_(submission['Portal Enabled'],true)) {
    throw new Error('The Author Portal is currently disabled.');
  }
  const allowed=taskDefinitionsForTrack_(submission.Track).some(function(task){
    return task.id===String(taskId||'') && task.id!=='author_proof';
  });
  if(!allowed) throw new Error('This task is not available to this submission.');
  // Organizing deadlines remain visible; authors may continue revising their own materials.
}

function serializeSubmission_(submission) {
  return {
    paperId: normalizePaperId_(submission['Paper ID']),
    originalTitle: String(submission['Original Title'] || ''),
    finalTitle: String(submission['Final Title'] || submission['Original Title'] || ''),
    track: String(submission.Track || ''),
    volume: String(submission.Volume || ''),
    correspondingAuthor: String(submission['Corresponding Author'] || ''),
    correspondingEmail: String(submission['Corresponding Email'] || ''),
    presentingAuthor: String(submission['Presenting Author'] || ''),
    presentingEmail: String(submission['Presenting Email'] || ''),
    overallStatus: String(submission['Overall Status'] || ''),
    proofVersion: String(submission['Proof Version'] || ''),
    proofDueLabel: String(submission['Proof Due Label'] || '')
  };
}

function buildPortalData_(paperId) {
  const submission = requireSubmission_(paperId);
  const definitions = taskDefinitionsForTrack_(submission.Track);
  const definitionById = {};
  definitions.forEach(function (task) { definitionById[task.id] = task; });
  const taskRows = getTaskRows_(paperId).filter(function (row) {
    return Boolean(definitionById[String(row['Task ID'])]);
  });
  const website = getWebsiteRecord_(paperId);
  const tasks = taskRows.map(function (row) {
    const definition = definitionById[String(row['Task ID'])];
    return {
      id: String(row['Task ID']),
      name: String(row['Task Name'] || definition.name || ''),
      phase: definition.phase,
      order: definition.order,
      status: String(row.Status || 'Not started'),
      submittedAt: row['Submitted At'] ? new Date(row['Submitted At']).toISOString() : '',
      approvedAt: row['Approved At'] ? new Date(row['Approved At']).toISOString() : '',
      actionRequiredNote: String(row['Action Required Note'] || '')
    };
  });

  return {
    submission: serializeSubmission_(submission),
    tasks: tasks.concat(presentationPortalTasks_(paperId, submission.Track)),
    taskData: {
      feedback: getTaskData_(paperId, 'feedback'),
      volunteer: getTaskData_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID)
    },
    reviews: getReviews_(paperId),
    authors: getAuthors_(paperId),
    website: website ? {
      finalTitle: String(website['Final Title'] || ''),
      category: String(website.Category || ''),
      abstract: String(website.Abstract || ''),
      keywords: String(website.Keywords || ''),
      correspondingEmail: String(website['Corresponding Email'] || '')
    } : {
      finalTitle: String(submission['Final Title'] || submission['Original Title'] || ''),
      category: String(submission.Track || ''),
      abstract: '', keywords: '',
      correspondingEmail: String(submission['Corresponding Email'] || '')
    },
    websiteImages: getWebsiteImages_(paperId),
    files: getActiveFiles_(paperId),
    attendance: getAttendance_(paperId),
    registration: getRegistration_(paperId),
    indexing: getIndexing_(paperId),
    activity: getActivity_(paperId, 15),
    authorUpdatesOpen: parseBoolean_(getConfig_().PORTAL_ENABLED,true) && parseBoolean_(submission['Portal Enabled'],true),
    authorProofOpen: Boolean(activeFileForRole_(paperId,'author_proof','author_proof_pdf')) &&
      tasks.some(function(task){return task.id==='author_proof' && ['Proof ready','Draft saved','Action required','Submitted','Under review','Approved'].indexOf(task.status)!==-1;}),
    cameraReadyOpen: isCameraReadyOpen_(),
    paperCameraReadyOpen: normalizeTrack_(submission.Track) === 'Full Paper' &&
      parseBoolean_(getConfig_().PORTAL_ENABLED, true),
    paperCameraReadyHistory: normalizeTrack_(submission.Track) === 'Full Paper'
      ? getPaperCameraReadyHistory_(paperId) : [],
    phdWorkshopOpen: normalizeTrack_(submission.Track) === PHD_WORKSHOP_TRACK && isPhdWorkshopOpen_(),
    projectPosterRequired: isPosterTrack_(submission.Track || ''),
    projectPosterOpen: isPosterTrack_(submission.Track || '') && isProjectPosterOpen_(),
    bookForumOpen: normalizeTrack_(submission.Track || '') === BOOK_FORUM_TRACK &&
      parseBoolean_(getConfig_().PORTAL_ENABLED, true),
    registrationOpen: isRegistrationOpen_(),
    serverTime: new Date().toISOString()
  };
}

/******************************************************************************
 * SOURCE: Auth.gs
 ******************************************************************************/

/** Stateless Paper ID + original-title access and signed upload/session tokens. */

function loginAuthor(paperId, originalTitle, clientId) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return loginAuthorPerformanceImpl_.apply(null, args);
  });
}

function loginAuthorPerformanceImpl_(paperId, originalTitle, clientId) {
  const cfg = getConfig_();
  if (!parseBoolean_(cfg.PORTAL_ENABLED, true)) {
    throw new Error('The Author Hub is temporarily unavailable.');
  }

  const id = normalizePaperId_(paperId);
  const title = normalizeTitle_(originalTitle);
  const client = String(clientId || 'unknown').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
  const throttleKey = 'login_fail_' + Utilities.base64EncodeWebSafe(id + '|' + client).slice(0, 120);
  const cache = CacheService.getScriptCache();
  const attempts = Number(cache.get(throttleKey) || 0);
  if (attempts >= 12) {
    throw new Error('Too many unsuccessful attempts. Please wait 15 minutes and try again.');
  }

  const submission = getSubmissionByPaperId_(id);
  const enabled = submission && parseBoolean_(submission['Portal Enabled'], true);
  const expectedTitle = submission
    ? String(submission['Normalized Original Title'] || normalizeTitle_(submission['Original Title']))
    : '';

  if (!submission || !enabled || !title || title !== expectedTitle) {
    cache.put(throttleKey, String(attempts + 1), 15 * 60);
    throw new Error('The Paper ID and original title do not match an accepted submission.');
  }

  cache.remove(throttleKey);
  // Upload endpoints validate/provision their destination when an upload starts.
  // Folder scans and activity/dashboard writes do not belong on the login path.
  const token = issueSignedToken_({
    kind: 'author_session',
    paperId: id,
    expiresAt: Date.now() + parseInteger_(cfg.SESSION_HOURS, 8) * 60 * 60 * 1000,
    nonce: Utilities.getUuid()
  });
  return { token: token, portal: buildPortalData_(id), logPortalOpen: true };
}

function getPortalData(sessionToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return getPortalDataPerformanceImpl_.apply(null, args);
  });
}

function getPortalDataPerformanceImpl_(sessionToken) {
  const session = requireAuthorSession_(sessionToken);
  const portal = withSheetObjectsRuntimeCache_(function () {
    return buildPortalData_(session.paperId);
  });
  return JSON.stringify(portal);
}

function recordPortalOpened(sessionToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return recordPortalOpenedPerformanceImpl_.apply(null, args);
  });
}

function recordPortalOpenedPerformanceImpl_(sessionToken) {
  const session = requireAuthorSession_(sessionToken);
  logActivity_(session.paperId, 'Portal opened', '', 'Author accessed the submission portal.');
  return true;
}

function requireAuthorSession_(token) {
  const payload = verifySignedToken_(token);
  if (!payload || payload.kind !== 'author_session') throw new Error('Your portal session is invalid. Please sign in again.');
  if (Number(payload.expiresAt || 0) < Date.now()) throw new Error('Your portal session has expired. Please sign in again.');
  const submission = getSubmissionByPaperId_(payload.paperId);
  if (!submission || !parseBoolean_(submission['Portal Enabled'], true)) {
    throw new Error('This submission is not currently available in the Author Hub.');
  }
  return payload;
}

function issueSignedToken_(payload) {
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(payload)).replace(/=+$/g, '');
  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(body, getSigningSecret_())
  ).replace(/=+$/g, '');
  return body + '.' + signature;
}

function verifySignedToken_(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;
  const expected = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(parts[0], getSigningSecret_())
  ).replace(/=+$/g, '');
  if (!constantTimeEquals_(parts[1], expected)) return null;
  try {
    return JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
  } catch (err) {
    return null;
  }
}

function getSigningSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('AUTHOR_HUB_SIGNING_SECRET');
  if (!secret) {
    secret = Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        Utilities.getUuid() + '|' + new Date().toISOString() + '|' + Math.random()
      )
    );
    props.setProperty('AUTHOR_HUB_SIGNING_SECRET', secret);
  }
  return secret;
}

function constantTimeEquals_(a, b) {
  const left = String(a || '');
  const right = String(b || '');
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    mismatch |= (left.charCodeAt(i % Math.max(1, left.length)) || 0) ^
      (right.charCodeAt(i % Math.max(1, right.length)) || 0);
  }
  return mismatch === 0;
}

/******************************************************************************
 * SOURCE: Drive.gs
 ******************************************************************************/

/** Google Drive folder provisioning and authenticated REST helpers. */

function driveApiFetch_(url, options) {
  const request = Object.assign({}, options || {});
  request.headers = Object.assign({}, request.headers || {}, {
    Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
  });
  request.muteHttpExceptions = true;
  const response = UrlFetchApp.fetch(url, request);
  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Google Drive API error ' + code + ': ' + response.getContentText().slice(0, 1000));
  }
  return response;
}

function driveGetMetadata_(fileId, fields) {
  const id = encodeURIComponent(String(fileId || ''));
  if (!id) throw new Error('A Drive file ID is required.');
  const url = 'https://www.googleapis.com/drive/v3/files/' + id +
    '?supportsAllDrives=true&fields=' + encodeURIComponent(fields || 'id,name,mimeType,size,parents,trashed,webViewLink,createdTime,md5Checksum');
  return JSON.parse(driveApiFetch_(url, { method: 'get' }).getContentText());
}

function driveListChildrenByName_(parentId, name, mimeType) {
  const clauses = [
    "'" + String(parentId).replace(/'/g, "\\'") + "' in parents",
    "name = '" + String(name).replace(/'/g, "\\'") + "'",
    'trashed = false'
  ];
  if (mimeType) clauses.push("mimeType = '" + String(mimeType).replace(/'/g, "\\'") + "'");
  const url = 'https://www.googleapis.com/drive/v3/files' +
    '?q=' + encodeURIComponent(clauses.join(' and ')) +
    '&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=100' +
    '&fields=' + encodeURIComponent('files(id,name,mimeType,parents)');
  const data = JSON.parse(driveApiFetch_(url, { method: 'get' }).getContentText());
  return data.files || [];
}

function driveCreateFolder_(parentId, name) {
  const url = 'https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name,parents';
  const metadata = {
    name: String(name),
    mimeType: 'application/vnd.google-apps.folder',
    parents: [String(parentId)]
  };
  return JSON.parse(driveApiFetch_(url, {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify(metadata)
  }).getContentText());
}

function driveEnsureFolder_(parentId, name) {
  const existing = driveListChildrenByName_(parentId, name, 'application/vnd.google-apps.folder');
  if (existing.length) return existing[0];
  return driveCreateFolder_(parentId, name);
}

function driveMoveFile_(fileId, targetParentId) {
  const meta = driveGetMetadata_(fileId, 'id,parents,name');
  const parents = meta.parents || [];
  const params = [
    'supportsAllDrives=true',
    'addParents=' + encodeURIComponent(targetParentId),
    'fields=' + encodeURIComponent('id,name,parents')
  ];
  if (parents.length) params.push('removeParents=' + encodeURIComponent(parents.join(',')));
  const url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) + '?' + params.join('&');
  return JSON.parse(driveApiFetch_(url, {
    method: 'patch',
    contentType: 'application/json; charset=UTF-8',
    payload: '{}'
  }).getContentText());
}

function driveCopyFile_(fileId, parentId, newName) {
  const url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '/copy?supportsAllDrives=true&fields=' + encodeURIComponent('id,name,mimeType,size,parents,webViewLink');
  const metadata = { parents: [String(parentId)] };
  if (newName) metadata.name = String(newName);
  return JSON.parse(driveApiFetch_(url, {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify(metadata)
  }).getContentText());
}

function driveRenameFile_(fileId, newName) {
  const url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '?supportsAllDrives=true&fields=' + encodeURIComponent('id,name,parents');
  return JSON.parse(driveApiFetch_(url, {
    method: 'patch',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify({ name: String(newName) })
  }).getContentText());
}

function driveTrashFile_(fileId) {
  const url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '?supportsAllDrives=true&fields=id,trashed';
  return JSON.parse(driveApiFetch_(url, {
    method: 'patch',
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify({ trashed: true })
  }).getContentText());
}

function folderSlug_(title) {
  const slug = normalizeTitle_(title)
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return slug || 'submission';
}

function trackParentFolderId_(track) {
  const cfg = getConfig_();
  const normalized = normalizeTrack_(track);
  if (normalized === 'Projects') return cfg.TRACK_FOLDER_PROJECTS;
  if (normalized === 'Full Paper') return cfg.TRACK_FOLDER_FULL_PAPER;
  if (normalized === 'Field Note') return cfg.TRACK_FOLDER_FIELD_NOTE;
  if (normalized === PHD_WORKSHOP_TRACK) return cfg.TRACK_FOLDER_PHD_WORKSHOP;
  if (normalized === BOOK_FORUM_TRACK) return ensureBookForumTrackFolder_();
  if (normalized === 'Host') return cfg.TRACK_FOLDER_HOST;
  throw new Error('No Drive folder is configured for track: ' + normalized);
}

function ensureBookForumTrackFolder_() {
  const cfg = getConfig_();
  const configuredId = String(cfg.TRACK_FOLDER_BOOK_FORUM || '').trim();
  if (configuredId) return configuredId;
  const parentId = String(cfg.SUBMISSION_ROOT_FOLDER_ID || '').trim();
  if (!parentId) throw new Error('SUBMISSION_ROOT_FOLDER_ID is not configured.');
  const folder = driveEnsureFolder_(parentId, 'Book Forum');
  setScriptConfig_('TRACK_FOLDER_BOOK_FORUM', folder.id);
  return folder.id;
}

function getFolderRegistryRow_(paperId, role) {
  const id = normalizePaperId_(paperId);
  return findObject_(SHEETS.FOLDERS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id && String(row['Folder Role']) === String(role);
  });
}

function upsertFolderRegistry_(paperId, role, folder) {
  const existing = getFolderRegistryRow_(paperId, role);
  const object = {
    'Paper ID': normalizePaperId_(paperId),
    'Folder Role': String(role),
    'Folder ID': String(folder.id),
    'Folder Name': String(folder.name || ''),
    'Last Updated': new Date()
  };
  if (existing) updateObjectRow_(SHEETS.FOLDERS, existing.__row, object);
  else appendObject_(SHEETS.FOLDERS, object);
}

function ensureSubmissionFolders_(paperId) {
  const submission = requireSubmission_(paperId);
  const id = normalizePaperId_(paperId);
  let rootId = String(submission['Submission Folder ID'] || '');
  let rootMeta = null;

  if (rootId) {
    try {
      rootMeta = driveGetMetadata_(rootId, 'id,name,mimeType,parents,trashed');
      if (rootMeta.trashed || rootMeta.mimeType !== 'application/vnd.google-apps.folder') rootMeta = null;
    } catch (err) {
      rootMeta = null;
    }
  }

  if (!rootMeta) {
    const parentId = trackParentFolderId_(submission.Track);
    const folderName = 'PAPER-' + id + '__' + folderSlug_(submission['Original Title']);
    rootMeta = driveEnsureFolder_(parentId, folderName);
    rootId = rootMeta.id;
    updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
      'Submission Folder ID': rootId,
      'Last Updated': new Date()
    });
  }

  upsertFolderRegistry_(id, 'PAPER_ROOT', rootMeta);
  folderSpecsForTrack_(submission.Track)
    .filter(function (spec) { return spec.role !== 'PAPER_ROOT'; })
    .forEach(function (spec) {
    let row = getFolderRegistryRow_(id, spec.role);
    let folder = null;
    if (row && row['Folder ID']) {
      try {
        folder = driveGetMetadata_(row['Folder ID'], 'id,name,mimeType,parents,trashed');
        if (folder.trashed || folder.mimeType !== 'application/vnd.google-apps.folder') folder = null;
      } catch (err) {
        folder = null;
      }
    }
    if (!folder) folder = driveEnsureFolder_(rootId, spec.name);
    upsertFolderRegistry_(id, spec.role, folder);
    });
  return getSubmissionFolderMap_(id);
}

function getSubmissionFolderMap_(paperId) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.FOLDERS, function (row) {
    return normalizePaperId_(row['Paper ID']) === id;
  });
  const map = {};
  rows.forEach(function (row) { map[String(row['Folder Role'])] = String(row['Folder ID']); });
  return map;
}

function requiredFolderRoleForUpload_(taskId, role) {
  if (taskId === BOOK_FORUM_POSTER_TASK_ID && String(role) === BOOK_FORUM_POSTER_FOLDER_ROLE) {
    return BOOK_FORUM_POSTER_FOLDER_ROLE;
  }
  if (taskId === BOOK_FORUM_PROCEEDING_TASK_ID && String(role) === BOOK_FORUM_PROCEEDING_FOLDER_ROLE) {
    return BOOK_FORUM_PROCEEDING_FOLDER_ROLE;
  }
  if (taskId === PHD_WORKSHOP_POSTER_TASK_ID && String(role) === PHD_WORKSHOP_POSTER_ROLE) {
    return 'PHD_POSTER';
  }
  if (taskId === 'camera_ready' && String(role) === 'camera_ready_zip') return 'CAMERA_READY';
  if (taskId === 'camera_ready' && String(role) === 'project_poster_pdf') return 'PROJECT_POSTER';
  if (taskId === 'consent') return 'COPYRIGHT_CONSENT';
  if (taskId === 'registration') return 'REGISTRATION';
  if (taskId === 'metadata' && /^website_image_[1-5]$/.test(role)) return 'WEBSITE_MATERIALS';
  if (taskId === 'author_proof' && (
      String(role) === 'author_annotated_proof_pdf' ||
      /^author_proof_attachment_(0[1-5])$/.test(String(role))
    )) return 'AUTHOR_PROOF';
  throw new Error('This upload type is not supported.');
}

function driveDownloadBlob_(fileId, fileName, mimeType) {
  const url = 'https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(fileId) +
    '?alt=media&supportsAllDrives=true';
  const response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  if (response.getResponseCode() !== 200) {
    throw new Error('Could not read the proof PDF from Google Drive: ' + response.getContentText().slice(0, 500));
  }
  const blob = response.getBlob();
  if (fileName) blob.setName(String(fileName));
  if (mimeType) blob.setContentType(String(mimeType));
  return blob;
}

/******************************************************************************
 * SOURCE: Upload.gs
 ******************************************************************************/

/**
 * Chunked author uploads proxied through Apps Script into a Google Drive
 * resumable-upload session.
 *
 * The browser never receives the deployment owner's OAuth token. Each browser
 * chunk is sent to Apps Script as base64, decoded server-side, and forwarded to
 * the private Drive upload session with UrlFetchApp. This avoids browser CORS
 * restrictions while allowing files much larger than a single Apps Script
 * request.
 */

function ensureUploadDestination_(paperId, folderRole) {
  const existing = getFolderRegistryRow_(paperId, folderRole);
  if (existing && existing['Folder ID']) {
    try {
      const folder = driveGetMetadata_(existing['Folder ID'], 'id,mimeType,trashed');
      if (!folder.trashed && folder.mimeType === 'application/vnd.google-apps.folder') return folder.id;
    } catch (err) {
      // Preserve the existing repair path when a destination is missing or inaccessible.
    }
  }
  return ensureSubmissionFolders_(paperId)[folderRole] || '';
}

function createDriveUploadSession(sessionToken, request) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return createDriveUploadSessionPerformanceImpl_.apply(null, args);
  });
}

function createDriveUploadSessionPerformanceImpl_(sessionToken, request) {
  const session = requireAuthorSession_(sessionToken);
  request = request || {};
  const paperId = session.paperId;
  const taskId = String(request.taskId || '');
  const role = String(request.role || '');
  const originalName = String(request.originalName || '').trim();
  const mimeType = String(request.mimeType || 'application/octet-stream').trim() || 'application/octet-stream';
  const sizeBytes = Number(request.sizeBytes || 0);

  assertUploadOpen_(paperId, taskId, role);
  if (!originalName || !sizeBytes || sizeBytes < 1) throw new Error('Choose a non-empty file to upload.');

  const validation = validateUploadRequest_(paperId, taskId, role, originalName, mimeType, sizeBytes);
  const folderRole = requiredFolderRoleForUpload_(taskId, role);
  const parentFolderId = ensureUploadDestination_(paperId, folderRole);
  if (!parentFolderId) throw new Error('The destination folder is not configured for this submission.');

  const proofVersion = taskId === 'author_proof' ? currentProofVersion_(paperId) : '';
  const version = nextFileVersion_(paperId, taskId, role);
  const canonicalName = canonicalUploadName_(paperId, taskId, role, originalName, version);
  const appProperties = {
    acadiaPaperId: paperId,
    acadiaTaskId: taskId,
    acadiaRole: role,
    acadiaVersion: String(version)
  };
  if (proofVersion) appProperties.acadiaProofVersion = proofVersion;

  const metadata = {
    name: canonicalName,
    mimeType: validation.mimeType,
    parents: [parentFolderId],
    appProperties: appProperties
  };

  const url = 'https://www.googleapis.com/upload/drive/v3/files' +
    '?uploadType=resumable&supportsAllDrives=true&fields=' +
    encodeURIComponent('id,name,size,mimeType,md5Checksum,parents,webViewLink,createdTime,appProperties');

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': validation.mimeType,
      'X-Upload-Content-Length': String(sizeBytes)
    },
    contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify(metadata),
    muteHttpExceptions: true
  });

  if (response.getResponseCode() !== 200) {
    throw new Error('Could not start the Google Drive upload: ' + response.getContentText().slice(0, 1000));
  }

  const headers = response.getAllHeaders();
  const uploadUrl = responseHeader_(headers, 'Location');
  if (!uploadUrl) throw new Error('Google Drive did not return a resumable upload URL.');

  const cfg = getConfig_();
  cleanupExpiredUploadSessions_();
  const uploadId = Utilities.getUuid();
  const expiresAt = Date.now() + parseInteger_(cfg.SESSION_HOURS, 8) * 60 * 60 * 1000;
  storeUploadSession_(uploadId, {
    uploadId: uploadId,
    paperId: paperId,
    taskId: taskId,
    role: role,
    originalName: originalName,
    canonicalName: canonicalName,
    mimeType: validation.mimeType,
    sizeBytes: sizeBytes,
    parentFolderId: parentFolderId,
    version: version,
    proofVersion: proofVersion,
    uploadUrl: uploadUrl,
    expiresAt: expiresAt
  });
  const receipt = issueSignedToken_({
    kind: 'drive_upload_receipt',
    uploadId: uploadId,
    paperId: paperId,
    expiresAt: expiresAt,
    nonce: Utilities.getUuid()
  });

  logActivity_(paperId, 'Upload started', taskId, canonicalName + ' (' + sizeBytes + ' bytes)');
  return {
    receipt: receipt,
    canonicalName: canonicalName,
    chunkBytes: normalizedUploadChunkBytes_()
  };
}

/**
 * Receives one base64 chunk from the HTML client and forwards it to Drive.
 * Returns the next byte offset, or the finalized file and refreshed portal.
 */
function uploadDriveChunk(sessionToken, receiptToken, offset, base64Data) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return uploadDriveChunkPerformanceImpl_.apply(null, args);
  });
}

function uploadDriveChunkPerformanceImpl_(sessionToken, receiptToken, offset, base64Data) {
  const session = requireAuthorSession_(sessionToken);
  const receipt = requireUploadReceipt_(session, receiptToken);
  assertUploadOpen_(receipt.paperId, receipt.taskId, receipt.role);

  const start = Number(offset || 0);
  if (!Number.isInteger(start) || start < 0 || start >= Number(receipt.sizeBytes)) {
    throw new Error('The upload byte offset is invalid.');
  }

  const encoded = String(base64Data || '');
  if (!encoded) throw new Error('The upload chunk is empty.');
  const maxEncodedLength = Math.ceil(normalizedUploadChunkBytes_() * 4 / 3) + 16;
  if (encoded.length > maxEncodedLength) throw new Error('The encoded upload chunk is too large.');
  let bytes;
  try {
    bytes = Utilities.base64Decode(encoded);
  } catch (err) {
    throw new Error('The upload chunk could not be decoded. Please retry the upload.');
  }

  const maxChunk = normalizedUploadChunkBytes_();
  if (!bytes.length || bytes.length > maxChunk) {
    throw new Error('The upload chunk exceeds the configured chunk size.');
  }

  const total = Number(receipt.sizeBytes);
  const end = start + bytes.length - 1;
  if (end >= total) throw new Error('The upload chunk exceeds the declared file size.');
  const isFinal = end === total - 1;
  if (!isFinal && bytes.length % (256 * 1024) !== 0) {
    throw new Error('Non-final upload chunks must use a 256 KB multiple.');
  }

  const response = UrlFetchApp.fetch(String(receipt.uploadUrl), {
    method: 'put',
    contentType: String(receipt.mimeType || 'application/octet-stream'),
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total
    },
    payload: bytes,
    followRedirects: false,
    muteHttpExceptions: true
  });

  return processUploadResponse_(session, receipt, response, end + 1);
}

/** Query Drive after a transient failure so the browser can resume safely. */
function queryDriveUploadStatus(sessionToken, receiptToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return queryDriveUploadStatusPerformanceImpl_.apply(null, args);
  });
}

function queryDriveUploadStatusPerformanceImpl_(sessionToken, receiptToken) {
  const session = requireAuthorSession_(sessionToken);
  const receipt = requireUploadReceipt_(session, receiptToken);
  assertUploadOpen_(receipt.paperId, receipt.taskId, receipt.role);

  const total = Number(receipt.sizeBytes);
  const response = UrlFetchApp.fetch(String(receipt.uploadUrl), {
    method: 'put',
    contentType: String(receipt.mimeType || 'application/octet-stream'),
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Range': 'bytes */' + total
    },
    payload: '',
    followRedirects: false,
    muteHttpExceptions: true
  });
  return processUploadResponse_(session, receipt, response, 0);
}

/** Kept as a public verification endpoint for recovery and diagnostics. */
function finalizeDriveUpload(sessionToken, receiptToken, fileId) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return finalizeDriveUploadPerformanceImpl_.apply(null, args);
  });
}

function finalizeDriveUploadPerformanceImpl_(sessionToken, receiptToken, fileId) {
  const session = requireAuthorSession_(sessionToken);
  const receipt = requireUploadReceipt_(session, receiptToken);
  const result = finalizeDriveUpload_(session, receipt, fileId);
  deleteUploadSession_(receipt.uploadId);
  return result;
}

function requireUploadReceipt_(session, receiptToken) {
  const token = verifySignedToken_(receiptToken);
  if (!token || token.kind !== 'drive_upload_receipt' || !token.uploadId) {
    throw new Error('The upload receipt is invalid.');
  }
  if (Number(token.expiresAt || 0) < Date.now()) {
    deleteUploadSession_(token.uploadId);
    throw new Error('The upload receipt has expired. Please upload the file again.');
  }
  if (normalizePaperId_(token.paperId) !== normalizePaperId_(session.paperId)) {
    throw new Error('The upload receipt does not belong to this submission.');
  }
  const receipt = loadUploadSession_(token.uploadId);
  if (!receipt) throw new Error('The upload session is no longer available. Start this file upload again.');
  if (Number(receipt.expiresAt || 0) < Date.now()) {
    deleteUploadSession_(token.uploadId);
    throw new Error('The upload receipt has expired. Please upload the file again.');
  }
  if (normalizePaperId_(receipt.paperId) !== normalizePaperId_(session.paperId) ||
      normalizePaperId_(receipt.paperId) !== normalizePaperId_(token.paperId)) {
    throw new Error('The upload receipt does not belong to this submission.');
  }
  if (!receipt.uploadUrl || !receipt.taskId || !receipt.role) throw new Error('The upload receipt is incomplete.');
  receipt.uploadId = String(token.uploadId);
  return receipt;
}

function uploadSessionPropertyKey_(uploadId) {
  return 'UPLOAD_SESSION_' + String(uploadId || '').replace(/[^A-Za-z0-9_-]/g, '');
}

function storeUploadSession_(uploadId, data) {
  PropertiesService.getScriptProperties().setProperty(
    uploadSessionPropertyKey_(uploadId),
    JSON.stringify(data || {})
  );
}

function loadUploadSession_(uploadId) {
  const raw = PropertiesService.getScriptProperties().getProperty(uploadSessionPropertyKey_(uploadId));
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (err) { return null; }
}

function deleteUploadSession_(uploadId) {
  if (!uploadId) return;
  PropertiesService.getScriptProperties().deleteProperty(uploadSessionPropertyKey_(uploadId));
}

function cleanupExpiredUploadSessions_() {
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  const now = Date.now();
  Object.keys(all).filter(function (key) {
    return key.indexOf('UPLOAD_SESSION_') === 0;
  }).forEach(function (key) {
    let remove = false;
    try {
      const value = JSON.parse(all[key]);
      remove = Number(value.expiresAt || 0) < now;
    } catch (err) {
      remove = true;
    }
    if (remove) props.deleteProperty(key);
  });
}

function normalizedUploadChunkBytes_() {
  const configured = parseInteger_(getConfig_().UPLOAD_CHUNK_BYTES, 8 * 1024 * 1024);
  const minimum = 256 * 1024;
  const maximum = 16 * 1024 * 1024;
  return Math.max(minimum, Math.min(maximum, Math.floor(configured / minimum) * minimum));
}

function responseHeader_(headers, name) {
  const target = String(name || '').toLowerCase();
  const keys = Object.keys(headers || {});
  for (let i = 0; i < keys.length; i += 1) {
    if (String(keys[i]).toLowerCase() === target) {
      const value = headers[keys[i]];
      return Array.isArray(value) ? String(value[0] || '') : String(value || '');
    }
  }
  return '';
}

function processUploadResponse_(session, receipt, response, fallbackNextOffset) {
  const code = response.getResponseCode();
  const body = response.getContentText();
  const headers = response.getAllHeaders();

  if (code === 200 || code === 201) {
    let metadata = {};
    try { metadata = body ? JSON.parse(body) : {}; } catch (err) { metadata = {}; }
    if (!metadata.id) {
      throw new Error('Google Drive completed the upload but did not return a file ID. Please contact the Technical Chairs.');
    }
    const finalized = finalizeDriveUpload_(session, receipt, metadata.id);
    deleteUploadSession_(receipt.uploadId);
    return Object.assign({ complete: true, nextOffset: Number(receipt.sizeBytes) }, finalized);
  }

  if (code === 308) {
    const range = responseHeader_(headers, 'Range');
    let nextOffset = 0;
    const match = range.match(/bytes\s*=\s*0-(\d+)/i);
    if (match) nextOffset = Number(match[1]) + 1;
    return { complete: false, nextOffset: nextOffset, totalBytes: Number(receipt.sizeBytes) };
  }

  if (code === 404 || code === 410) {
    deleteUploadSession_(receipt.uploadId);
    throw new Error('The Google Drive upload session expired. Start this file upload again.');
  }
  if (code >= 500) {
    throw new Error('Google Drive temporarily interrupted the upload. The portal will check the received byte range and retry.');
  }
  throw new Error('Google Drive upload error ' + code + ': ' + body.slice(0, 800));
}

function finalizeDriveUpload_(session, receipt, fileId) {
  if (normalizePaperId_(receipt.paperId) !== normalizePaperId_(session.paperId)) {
    throw new Error('The upload receipt does not belong to this submission.');
  }

  const existingRegistry = findObject_(SHEETS.FILES, function (row) {
    return String(row['Drive File ID'] || '') === String(fileId || '');
  });
  if (existingRegistry) {
    return {
      fileId: String(existingRegistry['Drive File ID']),
      fileName: String(existingRegistry['File Name'] || receipt.canonicalName),
      sizeBytes: Number(existingRegistry['Size Bytes'] || receipt.sizeBytes),
      version: parseFileVersionNumber_(existingRegistry.Version, receipt.version),
      portal: buildPortalData_(receipt.paperId)
    };
  }

  if (receipt.taskId === 'author_proof' && String(receipt.proofVersion || '') !== currentProofVersion_(receipt.paperId)) {
    try { driveTrashFile_(fileId); } catch (ignore) {}
    throw new Error('A newer proof round was released while this upload was in progress. Download the current proof and upload your response again.');
  }

  const metadata = driveGetMetadata_(fileId, 'id,name,mimeType,size,parents,trashed,md5Checksum,createdTime,appProperties');
  const correctParent = (metadata.parents || []).indexOf(String(receipt.parentFolderId)) !== -1;
  const correctName = String(metadata.name || '') === String(receipt.canonicalName);
  const correctSize = Number(metadata.size || 0) === Number(receipt.sizeBytes || 0);
  const properties = metadata.appProperties || {};
  const correctProperties = (!properties.acadiaPaperId || normalizePaperId_(properties.acadiaPaperId) === normalizePaperId_(receipt.paperId)) &&
    (!properties.acadiaTaskId || String(properties.acadiaTaskId) === String(receipt.taskId)) &&
    (!properties.acadiaRole || String(properties.acadiaRole) === String(receipt.role)) &&
    (!receipt.proofVersion || !properties.acadiaProofVersion || String(properties.acadiaProofVersion) === String(receipt.proofVersion));
  if (metadata.trashed || !correctParent || !correctName || !correctSize || !correctProperties) {
    try { driveTrashFile_(fileId); } catch (ignore) {}
    throw new Error('The uploaded file did not pass the server verification check. Please try again.');
  }

  const isPaperCameraReady = receipt.taskId === 'camera_ready' && receipt.role === 'camera_ready_zip' &&
    normalizeTrack_(requireSubmission_(receipt.paperId).Track) === 'Full Paper';
  if (!isPaperCameraReady) deactivatePriorFiles_(receipt.paperId, receipt.taskId, receipt.role, fileId);
  appendObject_(SHEETS.FILES, {
    'Paper ID': receipt.paperId,
    'Task ID': receipt.taskId,
    'Role': receipt.role,
    'Version': receipt.version,
    'Drive File ID': fileId,
    'File Name': metadata.name,
    'Original File Name': receipt.originalName,
    'MIME Type': metadata.mimeType || receipt.mimeType,
    'Size Bytes': Number(metadata.size || receipt.sizeBytes),
    'Parent Folder ID': receipt.parentFolderId,
    'Active': true,
    'Uploaded At': new Date()
  });

  // Register the verified new Paper version before archiving any previous file.
  if (isPaperCameraReady) {
    deactivatePriorFiles_(receipt.paperId, receipt.taskId, receipt.role, fileId);
  }

  if (receipt.taskId === 'metadata' && /^website_image_[1-5]$/.test(receipt.role)) {
    const slot = Number(receipt.role.split('_').pop());
    const existing = findObject_(SHEETS.WEBSITE_IMAGES, function (row) {
      return normalizePaperId_(row['Paper ID']) === normalizePaperId_(receipt.paperId) && Number(row['Image Slot']) === slot;
    });
    const imageUpdate = {
      'Paper ID': receipt.paperId,
      'Image Slot': slot,
      'Drive File ID': fileId,
      'File Name': metadata.name,
      'Active': true,
      'Last Updated': new Date()
    };
    if (existing) updateObjectRow_(SHEETS.WEBSITE_IMAGES, existing.__row, imageUpdate);
    else appendObject_(SHEETS.WEBSITE_IMAGES, imageUpdate);
  }

  if (receipt.taskId === 'registration') {
    upsertRegistration_(receipt.paperId, { 'Receipt File ID': fileId });
  }

  const isProjectPoster = receipt.taskId === 'camera_ready' && receipt.role === 'project_poster_pdf';
  const isAuthorProofReturn = receipt.taskId === 'author_proof' && (
    receipt.role === 'author_annotated_proof_pdf' || /^author_proof_attachment_0[1-5]$/.test(receipt.role)
  );

  if (isAuthorProofReturn) {
    const round = ensureAuthorProofRoundData_(receipt.paperId);
    const draft = Object.assign({}, round.draft || {});
    draft.proofVersion = round.proofVersion;
    draft.confirmed = false;
    if (receipt.role === 'author_annotated_proof_pdf') {
      draft.responseProofVersion = round.proofVersion;
      draft.responseFileId = fileId;
    } else {
      const attachmentVersions = Object.assign({}, draft.attachmentProofVersions || {});
      attachmentVersions[receipt.role] = round.proofVersion;
      draft.attachmentProofVersions = attachmentVersions;
    }
    upsertTaskData_(receipt.paperId, 'author_proof', draft);

    const taskRow = getTaskRow_(receipt.paperId, 'author_proof');
    if (taskRow && ['Proof ready', 'Draft saved', 'Action required', 'Submitted', 'Under review', 'Approved'].indexOf(String(taskRow.Status)) !== -1) {
      setTaskStatus_(receipt.paperId, 'author_proof', 'Draft saved', {clearSubmittedAt:true,clearApprovedAt:true});
    }
  } else {
    const taskRow = getTaskRow_(receipt.paperId, receipt.taskId);
    if (isPaperCameraReady && taskRow) {
      // The new version requires a fresh author submission and editorial review.
      setTaskStatus_(receipt.paperId, receipt.taskId, 'Draft saved', {
        clearSubmittedAt: true, clearApprovedAt: true
      });
    } else if (!isProjectPoster && taskRow && ['Not started', 'Draft saved'].indexOf(String(taskRow.Status)) !== -1) {
      setTaskStatus_(receipt.paperId, receipt.taskId, 'Draft saved');
    }
  }

  const eventName = isProjectPoster
    ? 'Poster uploaded'
    : isAuthorProofReturn && receipt.role === 'author_annotated_proof_pdf'
      ? 'Annotated author proof uploaded'
      : isAuthorProofReturn
        ? 'Author proof supporting file uploaded'
        : 'File uploaded';
  logActivity_(receipt.paperId, eventName, receipt.taskId,
    metadata.name + ' · version ' + receipt.version);

  return {
    fileId: fileId,
    fileName: metadata.name,
    sizeBytes: Number(metadata.size || 0),
    version: Number(receipt.version || 0),
    portal: buildPortalData_(receipt.paperId)
  };
}

function validateUploadRequest_(paperId, taskId, role, originalName, mimeType, sizeBytes) {
  const cfg = getConfig_();
  const lowerName = originalName.toLowerCase();
  const ext = lowerName.indexOf('.') !== -1 ? lowerName.split('.').pop() : '';

  if (taskId === BOOK_FORUM_POSTER_TASK_ID) {
    const submission = requireSubmission_(paperId);
    if (normalizeTrack_(submission.Track || '') !== BOOK_FORUM_TRACK) {
      throw new Error('The Book Forum poster uploader is available only to Book Forum submissions.');
    }
    if (role !== BOOK_FORUM_POSTER_FOLDER_ROLE) {
      throw new Error('Invalid Book Forum poster upload role.');
    }
    if (ext !== 'pdf') throw new Error('Upload the Book Forum poster as one PDF.');
    const max = parseInteger_(cfg.BOOK_FORUM_POSTER_MAX_BYTES, BOOK_FORUM_POSTER_MAX_BYTES);
    if (sizeBytes > max) {
      throw new Error('The Book Forum poster is larger than the ' + Math.floor(max / 1024 / 1024) + ' MB limit.');
    }
    return { mimeType: 'application/pdf' };
  }

  if (taskId === BOOK_FORUM_PROCEEDING_TASK_ID) {
    const submission = requireSubmission_(paperId);
    if (normalizeTrack_(submission.Track || '') !== BOOK_FORUM_TRACK) {
      throw new Error('The Book Forum proceedings uploader is available only to Book Forum submissions.');
    }
    if (role !== BOOK_FORUM_PROCEEDING_FOLDER_ROLE) {
      throw new Error('Invalid Book Forum proceedings upload role.');
    }
    if (ext !== 'zip') throw new Error('Upload the complete Book Forum Proceedings InDesign package as one ZIP. The formatted contribution must not exceed four pages.');
    const max = parseInteger_(cfg.BOOK_FORUM_PROCEEDING_MAX_BYTES, 1000000000);
    if (sizeBytes > max) {
      throw new Error('The Book Forum Proceedings ZIP is larger than the ' + Math.floor(max / 1024 / 1024) + ' MB limit.');
    }
    return { mimeType: 'application/zip' };
  }

  if (taskId === PHD_WORKSHOP_POSTER_TASK_ID) {
    const submission = requireSubmission_(paperId);
    if (normalizeTrack_(submission.Track) !== PHD_WORKSHOP_TRACK) {
      throw new Error('The PhD Workshop poster uploader is available only to PhD Workshop participants.');
    }
    if (role !== PHD_WORKSHOP_POSTER_ROLE) {
      throw new Error('Invalid PhD Workshop poster upload role.');
    }
    if (ext !== 'pdf') throw new Error('Upload the exhibition poster as one PDF.');
    if (sizeBytes > parseInteger_(cfg.PROJECT_POSTER_MAX_BYTES, 100 * 1024 * 1024)) {
      throw new Error('The poster PDF is larger than the 100 MB limit.');
    }
    return { mimeType: 'application/pdf' };
  }

  if (taskId === 'camera_ready') {
    if (role === 'camera_ready_zip') {
      if (ext !== 'zip') throw new Error('The camera-ready publication package must be a ZIP file.');
      if (sizeBytes > parseInteger_(cfg.CAMERA_READY_MAX_BYTES, 1000000000)) {
        throw new Error('The camera-ready ZIP is larger than the 1 GB limit.');
      }
      return { mimeType: 'application/zip' };
    }

    if (role === 'project_poster_pdf') {
      const submission = requireSubmission_(paperId);
      if (!isPosterTrack_(submission.Track || '')) {
        throw new Error('Only submissions accepted in the Projects or Field Note tracks may upload a poster.');
      }
      if (ext !== 'pdf') throw new Error('Upload the final poster as one PDF.');
      if (sizeBytes > parseInteger_(cfg.PROJECT_POSTER_MAX_BYTES, 100 * 1024 * 1024)) {
        throw new Error('The poster PDF is larger than the 100 MB limit.');
      }
      return { mimeType: 'application/pdf' };
    }

    throw new Error('Invalid camera-ready upload role.');
  }

  if (taskId === 'author_proof') {
    if (role === 'author_annotated_proof_pdf') {
      if (ext !== 'pdf') throw new Error('Upload the annotated author proof as one PDF.');
      const max = parseInteger_(cfg.AUTHOR_PROOF_ANNOTATED_MAX_BYTES, 100 * 1024 * 1024);
      if (sizeBytes > max) {
        throw new Error('The annotated author proof is larger than the ' + Math.floor(max / 1024 / 1024) + ' MB limit.');
      }
      return { mimeType: 'application/pdf' };
    }

    if (/^author_proof_attachment_0[1-5]$/.test(role)) {
      const allowed = ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'pdf', 'eps', 'ai', 'psd', 'svg', 'zip'];
      if (allowed.indexOf(ext) === -1) {
        throw new Error('Supporting files must be JPG, PNG, TIFF, PDF, EPS, AI, PSD, SVG, or ZIP.');
      }
      const max = parseInteger_(cfg.AUTHOR_PROOF_ATTACHMENT_MAX_BYTES, 250 * 1024 * 1024);
      if (sizeBytes > max) {
        throw new Error('This supporting file is larger than the ' + Math.floor(max / 1024 / 1024) + ' MB limit.');
      }
      const mimeByExt = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        tif: 'image/tiff', tiff: 'image/tiff', pdf: 'application/pdf',
        eps: 'application/postscript', ai: 'application/postscript',
        psd: 'image/vnd.adobe.photoshop', svg: 'image/svg+xml', zip: 'application/zip'
      };
      return { mimeType: mimeByExt[ext] || mimeType || 'application/octet-stream' };
    }

    throw new Error('Invalid Author Proof upload role.');
  }

  if (taskId === 'consent') {
    if (role !== 'signed_consent') throw new Error('Invalid consent upload role.');
    if (ext !== 'pdf') throw new Error('Upload the signed consent as one PDF.');
    if (lowerName !== String(paperId).toLowerCase() + '.pdf') {
      throw new Error('Rename the signed consent exactly ' + paperId + '.pdf before uploading.');
    }
    if (sizeBytes > parseInteger_(cfg.STANDARD_PDF_MAX_BYTES, 50 * 1024 * 1024)) {
      throw new Error('The signed consent PDF is too large.');
    }
    return { mimeType: 'application/pdf' };
  }

  if (taskId === 'registration') {
    if (role !== 'registration_receipt') throw new Error('Invalid registration upload role.');
    if (ext !== 'pdf') throw new Error('Upload the registration confirmation page as one PDF.');
    if (sizeBytes > parseInteger_(cfg.STANDARD_PDF_MAX_BYTES, 50 * 1024 * 1024)) {
      throw new Error('The registration PDF is too large.');
    }
    return { mimeType: 'application/pdf' };
  }

  if (taskId === 'metadata' && /^website_image_[1-5]$/.test(role)) {
    if (['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff'].indexOf(ext) === -1) {
      throw new Error('Website images must be JPG, PNG, WEBP, or TIFF files.');
    }
    if (sizeBytes > parseInteger_(cfg.WEBSITE_IMAGE_MAX_BYTES, 25 * 1024 * 1024)) {
      throw new Error('This website image is larger than the configured image limit.');
    }
    const mimeByExt = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
      tif: 'image/tiff', tiff: 'image/tiff'
    };
    return { mimeType: mimeByExt[ext] || mimeType || 'application/octet-stream' };
  }

  throw new Error('This upload type is not allowed.');
}

function canonicalUploadName_(paperId, taskId, role, originalName, version) {
  const versionLabel = String(version).padStart(2, '0');
  const lower = String(originalName).toLowerCase();
  const extension = lower.indexOf('.') !== -1 ? lower.split('.').pop() : '';
  if (taskId === BOOK_FORUM_POSTER_TASK_ID && role === BOOK_FORUM_POSTER_FOLDER_ROLE) {
    return "__ACADIA_TEXT_t0016__" + paperId + '_BookForumPoster_v' + versionLabel + '.pdf';
  }
  if (taskId === BOOK_FORUM_PROCEEDING_TASK_ID && role === BOOK_FORUM_PROCEEDING_FOLDER_ROLE) {
    return "__ACADIA_TEXT_t0016__" + paperId + '_BookForumProceedings_v' + versionLabel + '.zip';
  }
  if (taskId === PHD_WORKSHOP_POSTER_TASK_ID && role === PHD_WORKSHOP_POSTER_ROLE) {
    return "__ACADIA_TEXT_t0016__" + paperId + '_PhDWorkshopPoster_v' + versionLabel + '.pdf';
  }
  if (taskId === 'camera_ready' && role === 'camera_ready_zip') return "__ACADIA_TEXT_t0016__" + paperId + '_CameraReady_v' + versionLabel + '.zip';
  if (taskId === 'camera_ready' && role === 'project_poster_pdf') {
    const posterTrack = normalizeTrack_(requireSubmission_(paperId).Track || '');
    const posterLabel = posterTrack === 'Field Note' ? 'FieldNotePoster' : 'ProjectPoster';
    return "__ACADIA_TEXT_t0016__" + paperId + '_' + posterLabel + '_v' + versionLabel + '.pdf';
  }
  if (taskId === 'author_proof' && role === 'author_annotated_proof_pdf') {
    return "__ACADIA_TEXT_t0016__" + paperId + '_AuthorAnnotatedProof_' + safeProofVersionLabel_(currentProofVersion_(paperId)) + '_v' + versionLabel + '.pdf';
  }
  if (taskId === 'author_proof' && /^author_proof_attachment_0[1-5]$/.test(role)) {
    const slot = role.slice(-2);
    const originalBase = safeAuthorProofAttachmentName_(originalName);
    return "__ACADIA_TEXT_t0016__" + paperId + '_AuthorProofAttachment_' + slot + '_' +
      safeProofVersionLabel_(currentProofVersion_(paperId)) + '_v' + versionLabel + '__' + originalBase;
  }
  if (taskId === 'consent') return paperId + '.pdf';
  if (taskId === 'registration') return "__ACADIA_TEXT_t0016__" + paperId + '_RegistrationReceipt_v' + versionLabel + '.pdf';
  if (taskId === 'metadata' && /^website_image_[1-5]$/.test(role)) {
    const slot = String(Number(role.split('_').pop())).padStart(2, '0');
    return "__ACADIA_TEXT_t0016__" + paperId + '_WebsiteImage_' + slot + '_v' + versionLabel + '.' + extension;
  }
  throw new Error('Could not build a canonical filename.');
}

function nextFileVersion_(paperId, taskId, role) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.FILES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id &&
      String(row['Task ID']) === String(taskId) && String(row.Role) === String(role);
  });
  return rows.reduce(function (max, row) {
    return Math.max(max, parseFileVersionNumber_(row.Version, 0));
  }, 0) + 1;
}

function deactivatePriorFiles_(paperId, taskId, role, keepFileId) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.FILES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id &&
      String(row['Task ID']) === String(taskId) &&
      String(row.Role) === String(role) &&
      parseBoolean_(row.Active, false) &&
      String(row['Drive File ID']) !== String(keepFileId);
  });
  if (!rows.length) return;
  const folders = ensureSubmissionFolders_(id);
  const archiveFolder = folders.PREVIOUS_VERSIONS;
  rows.forEach(function (row) {
    updateObjectRow_(SHEETS.FILES, row.__row, { 'Active': false });
    if (archiveFolder && row['Drive File ID']) {
      try { driveMoveFile_(row['Drive File ID'], archiveFolder); } catch (err) {
        console.warn('Could not archive prior file ' + row['Drive File ID'] + ': ' + err.message);
      }
    }
  });
}

function parseFileVersionNumber_(value, fallback) {
  const text = String(value == null ? '' : value).trim();
  const direct = Number(text);
  if (Number.isFinite(direct) && direct >= 0) return direct;

  const match = text.match(/\d+/);
  if (match) {
    const parsed = Number(match[0]);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  const fallbackNumber = Number(fallback);
  return Number.isFinite(fallbackNumber) && fallbackNumber >= 0 ? fallbackNumber : 0;
}

function activeFileForRole_(paperId, taskId, role) {
  const id = normalizePaperId_(paperId);
  const rows = findObjects_(SHEETS.FILES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id &&
      String(row['Task ID']) === String(taskId) && String(row.Role) === String(role) &&
      parseBoolean_(row.Active, false);
  });
  if (!rows.length) return null;
  rows.sort(function (a, b) { return parseFileVersionNumber_(b.Version, 0) - parseFileVersionNumber_(a.Version, 0); });
  return rows[0];
}

// Metadata only; historical files retain their existing Drive access settings.
function getPaperCameraReadyHistory_(paperId) {
  const id = normalizePaperId_(paperId);
  return findObjects_(SHEETS.FILES, function (row) {
    return normalizePaperId_(row['Paper ID']) === id &&
      String(row['Task ID']) === 'camera_ready' && String(row.Role) === 'camera_ready_zip';
  }).map(function (row) {
    return Object.assign(fileRecordSummary_(row), { active: parseBoolean_(row.Active, false) });
  }).sort(function (a, b) {
    return b.version - a.version || b.uploadedAt.localeCompare(a.uploadedAt);
  });
}

function fileRecordSummary_(file) {
  if (!file) return null;
  return {
    taskId: String(file['Task ID'] || ''),
    role: String(file.Role || ''),
    version: parseFileVersionNumber_(file.Version, 0),
    fileId: String(file['Drive File ID'] || ''),
    fileName: String(file['File Name'] || ''),
    originalFileName: String(file['Original File Name'] || ''),
    mimeType: String(file['MIME Type'] || ''),
    sizeBytes: Number(file['Size Bytes'] || 0),
    uploadedAt: file['Uploaded At'] ? new Date(file['Uploaded At']).toISOString() : ''
  };
}

function currentProofVersion_(paperId) {
  const submission = requireSubmission_(paperId);
  const configured = String(submission['Proof Version'] || '').trim();
  if (configured && !/^v?nan$/i.test(configured)) return configured;

  const proof = activeFileForRole_(paperId, 'author_proof', 'author_proof_pdf');
  const version = proof ? parseFileVersionNumber_(proof.Version, 1) : 1;
  return 'v' + String(Math.max(1, version)).padStart(2, '0');
}

function safeProofVersionLabel_(value) {
  const raw = String(value || '').trim();
  if (!raw || /^v?nan$/i.test(raw)) return 'v01';
  const clean = raw.replace(/[^A-Za-z0-9_-]/g, '');
  return clean || 'v01';
}

function safeAuthorProofAttachmentName_(fileName) {
  const text = String(fileName || 'attachment').replace(/[\\/:*?"<>|#%]+/g, '_').replace(/\s+/g, '_');
  return text.replace(/^_+|_+$/g, '').slice(0, 120) || 'attachment';
}

function archiveAuthorProofReturnFiles_(paperId) {
  const id = normalizePaperId_(paperId);
  deactivatePriorFiles_(id, 'author_proof', 'author_annotated_proof_pdf', '');
  for (let slot = 1; slot <= 5; slot += 1) {
    deactivatePriorFiles_(id, 'author_proof', 'author_proof_attachment_' + String(slot).padStart(2, '0'), '');
  }
}

function ensureAuthorProofRoundData_(paperId) {
  const id = normalizePaperId_(paperId);
  const proofVersion = currentProofVersion_(id);
  let draft = getTaskData_(id, 'author_proof') || {};
  const storedVersion = String(draft.proofVersion || '');
  const task = getTaskRow_(id, 'author_proof');
  const taskStatus = task ? String(task.Status || '') : '';
  const legacySubmitted = !storedVersion &&
    ['Submitted', 'Approved'].indexOf(taskStatus) !== -1 &&
    (Boolean(draft.authorName) || Boolean(draft.confirmed) || (Array.isArray(draft.comments) && draft.comments.length > 0));

  if (legacySubmitted) {
    // Preserve completed responses from the former page-specific comment
    // workflow. Add the proof version without deleting historical draft data.
    draft.proofVersion = proofVersion;
    upsertTaskData_(id, 'author_proof', draft);
  } else if (storedVersion !== proofVersion) {
    archiveAuthorProofReturnFiles_(id);
    draft = {
      proofVersion: proofVersion,
      authorName: '',
      confirmed: false,
      responseProofVersion: '',
      responseFileId: '',
      attachmentProofVersions: {}
    };
    upsertTaskData_(id, 'author_proof', draft);
  }
  return { proofVersion: proofVersion, draft: draft };
}

function upsertProofReturnSummary_(entry) {
  const existing = findObject_(SHEETS.PROOF_COMMENTS, function (row) {
    return normalizePaperId_(row['Paper ID']) === normalizePaperId_(entry.paperId) &&
      String(row['Proof Version'] || '') === String(entry.proofVersion || '') &&
      String(row.Category || '') === 'File-based author proof';
  });
  const object = {
    'Timestamp': new Date(),
    'Paper ID': normalizePaperId_(entry.paperId),
    'Paper Title': String(entry.paperTitle || ''),
    'Proof Version': String(entry.proofVersion || ''),
    'Page Number': 'See annotated PDF',
    'Category': 'File-based author proof',
    'Location': String(entry.fileName || ''),
    'Author Comment': String(entry.attachmentCount || 0) + ' supporting/replacement file(s) uploaded.',
    'Author Name': String(entry.authorName || ''),
    'Resolution Status': 'Open',
    'Copyeditor Response': '',
    'Resolved At': '',
    'Form Response ID': ''
  };
  if (existing) updateObjectRow_(SHEETS.PROOF_COMMENTS, existing.__row, object);
  else appendObject_(SHEETS.PROOF_COMMENTS, object);
}


function submitFileTask(sessionToken, taskId) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return submitFileTaskPerformanceImpl_.apply(null, args);
  });
}

function submitFileTaskPerformanceImpl_(sessionToken, taskId) {
  const session = requireAuthorSession_(sessionToken);
  const id = session.paperId;
  assertRequiredTaskOpen_(taskId, id);

  let role = '';
  if (taskId === 'camera_ready') role = 'camera_ready_zip';
  else if (taskId === PHD_WORKSHOP_POSTER_TASK_ID) role = PHD_WORKSHOP_POSTER_ROLE;
  else if (taskId === BOOK_FORUM_POSTER_TASK_ID) role = BOOK_FORUM_POSTER_FOLDER_ROLE;
  else if (taskId === BOOK_FORUM_PROCEEDING_TASK_ID) role = BOOK_FORUM_PROCEEDING_FOLDER_ROLE;
  else if (taskId === 'consent') role = 'signed_consent';
  else throw new Error('This task does not use the file-only submission endpoint.');

  const file = activeFileForRole_(id, taskId, role);
  if (!file) throw new Error('Upload the required file before submitting this task.');
  setTaskStatus_(id, taskId, 'Submitted', { clearNote: true });
  logActivity_(id, 'Task submitted', taskId, String(file['File Name'] || ''));
  return buildPortalData_(id);
}

/******************************************************************************
 * SOURCE: Tasks.gs
 ******************************************************************************/

/** Author-facing task save and submit endpoints. */

function saveFeedbackTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveFeedbackTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveFeedbackTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertRequiredTaskOpen_('feedback', paperId);
  payload = payload || {};
  const confirmed = Boolean(payload.confirmed);
  if (submit && !confirmed) throw new Error('Confirm that you reviewed the feedback and revised the submission.');

  const note = String(payload.revisionSummary || '').trim();
  const detail = JSON.stringify({ confirmed: confirmed, revisionSummary: note });
  setTaskStatus_(paperId, 'feedback', submit ? 'Submitted' : 'Draft saved', { clearNote: submit });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', 'feedback', detail);
  upsertTaskData_(paperId, 'feedback', { confirmed: confirmed, revisionSummary: note });
  return buildPortalData_(paperId);
}

function saveMetadataTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveMetadataTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveMetadataTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertRequiredTaskOpen_('metadata', paperId);
  payload = payload || {};

  const finalTitle = String(payload.finalTitle || '').trim();
  const submission = requireSubmission_(paperId);
  const category = normalizeTrack_(submission.Track || '');
  if (['Full Paper', 'Projects', 'Field Note', PHD_WORKSHOP_TRACK, BOOK_FORUM_TRACK].indexOf(category) === -1) {
    throw new Error('This submission has an invalid track. Contact the Technical Chairs.');
  }
  const abstractText = String(payload.abstract || '').trim();
  const keywords = String(payload.keywords || '').trim();
  let correspondingEmail = String(payload.correspondingEmail || '').trim();
  const authors = Array.isArray(payload.authors) ? payload.authors : [];
  const imageMetadata = Array.isArray(payload.images) ? payload.images : [];
  const correspondingAuthor=authors.filter(function(author){return Boolean(author.corresponding);});
  if(correspondingAuthor.length===1){
    const previousEmail=String((getWebsiteRecord_(paperId)||{})['Corresponding Email']||'').trim();
    if(correspondingEmail!==previousEmail)correspondingAuthor[0].email=correspondingEmail;
    else correspondingEmail=String(correspondingAuthor[0].email||'').trim();
  }

  if (submit) {
    if (!finalTitle) throw new Error('Enter the final publication title.');
    if (!authors.length) throw new Error('Enter at least one author.');
    authors.forEach(function (author, index) {
      if (!String(author.name || '').trim()) throw new Error('Author ' + (index + 1) + ' is missing a full name.');
      if (!String(author.affiliation || '').trim()) throw new Error('Author ' + (index + 1) + ' is missing an affiliation.');
      const email = normalizeEmail_(author.email);
      if (!email || email.indexOf('@') === -1) throw new Error('Author ' + (index + 1) + ' is missing a valid email address.');
    });
    const correspondingAuthors = authors.filter(function (author) { return Boolean(author.corresponding); });
    const presentingAuthors = authors.filter(function (author) { return Boolean(author.presenting); });
    if (correspondingAuthors.length !== 1) {
      throw new Error('Identify exactly one corresponding author.');
    }
    if (presentingAuthors.length !== 1) {
      throw new Error('Identify exactly one presenting author for this submission.');
    }
    if (!abstractText) throw new Error('Enter the unblinded abstract for the conference website.');
    if (wordCount_(abstractText) > 250) throw new Error('The unblinded abstract exceeds 250 words.');
    if (imageMetadata.length > 5) throw new Error('A maximum of five website images may be submitted.');
  }

  replaceAuthors_(paperId, authors);
  upsertWebsiteRecord_(paperId, {
    'Final Title': finalTitle,
    'Category': category,
    'Abstract': abstractText,
    'Keywords': keywords,
    'Corresponding Email': correspondingEmail
  });

  for (let slot = 1; slot <= 5; slot += 1) {
    const metadata = imageMetadata.find(function (item) { return Number(item.slot) === slot; }) || {};
    upsertWebsiteImageMetadata_(paperId, slot, metadata);
  }

  const corresponding = authors.find(function (author) { return Boolean(author.corresponding); }) || {};
  const presenting = authors.find(function (author) { return Boolean(author.presenting); }) || {};
  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Final Title': finalTitle || submission['Final Title'] || submission['Original Title'],
    'Track': category || submission.Track,
    'Volume': submission.Volume || inferredVolume_(category),
    'Corresponding Author': String(corresponding.name || submission['Corresponding Author'] || ''),
    'Corresponding Email': String(corresponding.email || correspondingEmail || submission['Corresponding Email'] || ''),
    'Presenting Author': String(presenting.name || submission['Presenting Author'] || ''),
    'Presenting Email': String(presenting.email || submission['Presenting Email'] || ''),
    'Last Updated': new Date()
  });

  setTaskStatus_(paperId, 'metadata', submit ? 'Submitted' : 'Draft saved', { clearNote: submit });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', 'metadata',
    'Authors: ' + authors.length + '; abstract words: ' + wordCount_(abstractText));
  return buildPortalData_(paperId);
}

function saveAttendanceTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveAttendanceTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveAttendanceTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertRequiredTaskOpen_('attendance', paperId);
  payload = payload || {};

  const confirmed = Boolean(payload.confirmed);
  const presenterName = String(payload.presenterName || '').trim();
  const presenterEmail = normalizeEmail_(payload.presenterEmail);
  const existing = getAttendance_(paperId);

  if (submit) {
    if (!confirmed) throw new Error("__ACADIA_TEXT_t0017__");
    if (!presenterName) throw new Error('Enter the presenting author’s full name.');
    if (!presenterEmail || presenterEmail.indexOf('@') === -1) {
      throw new Error('Enter a valid email address for the presenting author.');
    }
    synchronizePresentingAuthor_(paperId, presenterName, presenterEmail, true);
  } else if (presenterName || presenterEmail) {
    synchronizePresentingAuthor_(paperId, presenterName, presenterEmail, false);
  }

  const confirmedAt = submit && confirmed
    ? (existing.confirmedAt ? new Date(existing.confirmedAt) : new Date())
    : (existing.confirmedAt ? new Date(existing.confirmedAt) : '');

  upsertAttendance_(paperId, {
    'Attendance Confirmed': confirmed,
    'Presenter Name': presenterName,
    'Presenter Email': presenterEmail,
    'Confirmed At': confirmedAt
  });

  const submission = requireSubmission_(paperId);
  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Presenting Author': presenterName || submission['Presenting Author'],
    'Presenting Email': presenterEmail || submission['Presenting Email'],
    'Last Updated': new Date()
  });

  setTaskStatus_(paperId, 'attendance', submit ? 'Submitted' : 'Draft saved', { clearNote: submit });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', 'attendance',
    presenterName ? 'Presenter: ' + presenterName + (presenterEmail ? ' <' + presenterEmail + '>' : '') : 'Attendance draft updated.');
  return buildPortalData_(paperId);
}

function saveRegistrationTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveRegistrationTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveRegistrationTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertRequiredTaskOpen_('registration', paperId);
  payload = payload || {};

  const registeredAuthor = String(payload.registeredAuthor || '').trim();
  const registeredEmail = normalizeEmail_(payload.registeredEmail);
  const confirmationNumber = String(payload.confirmationNumber || '').trim();
  const receipt = activeFileForRole_(paperId, 'registration', 'registration_receipt');
  const conflict = registeredEmail ? registrationConflict_(paperId, registeredEmail) : null;
  const isPhd = normalizeTrack_(requireSubmission_(paperId).Track) === PHD_WORKSHOP_TRACK;

  if (submit) {
    if (!registeredAuthor) throw new Error('Enter the registered presenting author’s full name.');
    if (!registeredEmail || registeredEmail.indexOf('@') === -1) throw new Error('Enter the email used for conference registration.');
    if (!receipt) throw new Error('Upload the conference registration confirmation PDF.');
    if (conflict) {
      if (isPhd) {
        throw new Error('This registration is already linked to another PhD Workshop submission.');
      }
      throw new Error('This registration already covers another accepted submission in the same registration-coverage category. A single registration may cover one Full Paper + one Project/Field Note, or one Project, or one Field Note. It cannot cover Project + Project or Project + Field Note. A coauthor must register separately for the additional submission.');
    }
  }

  upsertRegistration_(paperId, {
    'Registered Author': registeredAuthor,
    'Registered Email': registeredEmail,
    'Confirmation Number': confirmationNumber,
    'Receipt File ID': receipt ? receipt['Drive File ID'] : '',
    'Unique Author Check': conflict ? 'CONFLICT' : (registeredEmail ? 'PASS' : '')
  });

  const submission = requireSubmission_(paperId);
  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Presenting Author': registeredAuthor || submission['Presenting Author'],
    'Presenting Email': registeredEmail || submission['Presenting Email'],
    'Last Updated': new Date()
  });

  setTaskStatus_(paperId, 'registration', submit ? 'Submitted' : 'Draft saved', { clearNote: submit });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', 'registration',
    registeredEmail ? 'Registered email: ' + registeredEmail : 'Registration draft updated.');
  return buildPortalData_(paperId);
}

function registrationCoverageBucket_(track) {
  const normalized = normalizeTrack_(track);
  if (normalized === 'Full Paper') return 'FULL_PAPER';
  if (normalized === 'Projects' || normalized === 'Field Note') return 'PROJECT_OR_FIELD_NOTE';
  return normalized || 'OTHER';
}

/**
 * Registration coverage follows the current ACADIA 2026 FAQ: one registration may cover
 * one Full Paper plus one Project/Field Note, or a single Project, or a single Field Note.
 * Project + Project and Project + Field Note are not covered by one registration.
 */
function registrationConflict_(paperId, registeredEmail) {
  const id = normalizePaperId_(paperId);
  const email = normalizeEmail_(registeredEmail);
  if (!email) return null;

  const currentSubmission = requireSubmission_(id);
  const currentBucket = registrationCoverageBucket_(currentSubmission.Track);

  const registrations = findObjects_(SHEETS.REGISTRATION, function (row) {
    return normalizePaperId_(row['Paper ID']) !== id &&
      normalizeEmail_(row['Registered Email']) === email;
  });

  for (let i = 0; i < registrations.length; i += 1) {
    const otherPaperId = normalizePaperId_(registrations[i]['Paper ID']);
    const otherSubmission = getSubmissionByPaperId_(otherPaperId);
    if (!otherSubmission) continue;

    const otherBucket = registrationCoverageBucket_(otherSubmission.Track);
    if (otherBucket === currentBucket) return registrations[i];
  }
  return null;
}

function recordIndexingOpened(sessionToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return recordIndexingOpenedPerformanceImpl_.apply(null, args);
  });
}

function recordIndexingOpenedPerformanceImpl_(sessionToken) {
  const session = requireAuthorSession_(sessionToken);
  assertRequiredTaskOpen_('indexing', session.paperId);
  const current = getIndexing_(session.paperId);
  upsertIndexing_(session.paperId, {
    'Opened At': current && current.openedAt ? new Date(current.openedAt) : new Date()
  });
  logActivity_(session.paperId, 'Indexing portal opened', 'indexing', getConfig_().INDEXING_URL);
  return { ok: true, url: getConfig_().INDEXING_URL };
}

function saveIndexingTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveIndexingTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveIndexingTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertRequiredTaskOpen_('indexing', paperId);
  payload = payload || {};
  const confirmed = Boolean(payload.confirmed);
  const note = String(payload.confirmationNote || '').trim();
  if (submit && !confirmed) throw new Error('Confirm that the indexing information was submitted in the external system.');

  const existing = getIndexing_(paperId);
  upsertIndexing_(paperId, {
    'Opened At': existing && existing.openedAt ? new Date(existing.openedAt) : '',
    'Confirmed': confirmed,
    'Confirmation Note': note,
    'Confirmed At': confirmed ? new Date() : ''
  });
  setTaskStatus_(paperId, 'indexing', submit ? 'Submitted' : 'Draft saved', { clearNote: submit });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', 'indexing',
    confirmed ? 'External indexing submission confirmed.' : 'Indexing draft updated.');
  return buildPortalData_(paperId);
}

function savePhdWorkshopVolunteerTask(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=savePhdWorkshopVolunteerTaskPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function savePhdWorkshopVolunteerTaskPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  const submission = requireSubmission_(paperId);
  if (normalizeTrack_(submission.Track) !== PHD_WORKSHOP_TRACK) {
    throw new Error('Volunteer service preferences are available only to PhD Workshop participants.');
  }
  assertRequiredTaskOpen_(PHD_WORKSHOP_VOLUNTEER_TASK_ID, paperId);
  payload = payload || {};

  const requested = Array.isArray(payload.preferences) ? payload.preferences : [];
  const seen = {};
  const preferences = requested.filter(function (option) {
    const value = String(option || '').trim();
    if (PHD_WORKSHOP_VOLUNTEER_OPTIONS.indexOf(value) === -1 || seen[value]) return false;
    seen[value] = true;
    return true;
  });
  const otherPreference = String(payload.otherPreference || '').trim().slice(0, 500);
  const requestedSlots = Array.isArray(payload.availabilitySlots) ? payload.availabilitySlots : [];
  const seenSlots = {};
  const availabilitySlots = requestedSlots.filter(function (slot) {
    const value = String(slot || '').trim();
    if (PHD_WORKSHOP_VOLUNTEER_SLOTS.indexOf(value) === -1 || seenSlots[value]) return false;
    seenSlots[value] = true;
    return true;
  });
  const confirmed = Boolean(payload.confirmed);
  const existing = getTaskData_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID);

  if (submit) {
    if (!preferences.length) {
      throw new Error('Select at least one volunteer service preference.');
    }
    if (preferences.indexOf('Other') !== -1 && !otherPreference) {
      throw new Error('Describe the other volunteer work you would be willing to support.');
    }
    if (!availabilitySlots.length) {
      throw new Error('Select at least one available volunteer time slot.');
    }
    if (!confirmed) {
      throw new Error('Confirm that you are available to complete an assigned volunteer role.');
    }
  }

  upsertTaskData_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID, {
    preferences: preferences,
    otherPreference: otherPreference,
    availabilitySlots: availabilitySlots,
    confirmed: confirmed,
    updatedAt: new Date().toISOString(),
    submittedAt: submit
      ? new Date().toISOString()
      : String(existing.submittedAt || '')
  });
  setTaskStatus_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID, submit ? 'Submitted' : 'Draft saved', {
    clearNote: submit
  });
  logActivity_(paperId, submit ? 'Task submitted' : 'Draft saved', PHD_WORKSHOP_VOLUNTEER_TASK_ID,
    preferences.length || availabilitySlots.length
      ? 'Volunteer preferences: ' + (preferences.join(', ') || 'None selected') +
        (otherPreference ? ' — ' + otherPreference : '') +
        '; availability: ' + (availabilitySlots.join(', ') || 'None selected')
      : 'Volunteer preference draft updated.');
  return buildPortalData_(paperId);
}

/******************************************************************************
 * SOURCE: Proofs.gs
 ******************************************************************************/

/** Copyediting-to-author-proof handoff and file-based author return workflow. */

function publishAuthorProof_(paperId, sourcePdfFileId, proofVersion, proofDueLabel) {
  const submission = requireSubmission_(paperId);
  const id = normalizePaperId_(paperId);
  const source = driveGetMetadata_(sourcePdfFileId, 'id,name,mimeType,size,parents,trashed');
  if (source.trashed || source.mimeType !== 'application/pdf') {
    throw new Error('The author proof source must be an active PDF file in Google Drive.');
  }

  const folders = ensureSubmissionFolders_(id);
  const version = String(proofVersion || ('v' + String(nextFileVersion_(id, 'author_proof', 'author_proof_pdf')).padStart(2, '0')));
  const canonicalName = "__ACADIA_TEXT_t0016__" + id + '_AuthorProof_' + version.replace(/[^A-Za-z0-9_-]/g, '') + '.pdf';
  const copy = driveCopyFile_(sourcePdfFileId, folders.AUTHOR_PROOF, canonicalName);
  deactivatePriorFiles_(id, 'author_proof', 'author_proof_pdf', copy.id);
  archiveAuthorProofReturnFiles_(id);

  const numericVersion = nextFileVersion_(id, 'author_proof', 'author_proof_pdf');
  appendObject_(SHEETS.FILES, {
    'Paper ID': id,
    'Task ID': 'author_proof',
    'Role': 'author_proof_pdf',
    'Version': numericVersion,
    'Drive File ID': copy.id,
    'File Name': copy.name,
    'Original File Name': source.name,
    'MIME Type': 'application/pdf',
    'Size Bytes': Number(copy.size || source.size || 0),
    'Parent Folder ID': folders.AUTHOR_PROOF,
    'Active': true,
    'Uploaded At': new Date()
  });

  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Proof Version': version,
    'Proof Due Label': String(proofDueLabel || ''),
    'Last Updated': new Date()
  });
  setTaskStatus_(id, 'author_proof', 'Proof ready', {
    clearNote: true,
    clearSubmittedAt: true,
    clearApprovedAt: true
  });
  upsertTaskData_(id, 'author_proof', {
    proofVersion: version,
    authorName: '',
    confirmed: false,
    responseProofVersion: '',
    responseFileId: '',
    attachmentProofVersions: {}
  });
  logActivity_(id, 'Author proof published', 'author_proof', copy.name);
  return { paperId: id, proofFileId: copy.id, proofVersion: version };
}

function getAuthorProof(sessionToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return getAuthorProofPerformanceImpl_.apply(null, args);
  });
}

function getAuthorProofPerformanceImpl_(sessionToken) {
  const session = requireAuthorSession_(sessionToken);
  const task = getTaskRow_(session.paperId, 'author_proof');
  if (!task || ['Proof ready', 'Draft saved', 'Submitted', 'Action required', 'Under review', 'Approved'].indexOf(String(task.Status)) === -1) {
    throw new Error('The author proof is not yet available.');
  }
  const file = activeFileForRole_(session.paperId, 'author_proof', 'author_proof_pdf');
  if (!file) throw new Error('The proof PDF has not been attached to this submission.');
  const cfg = getConfig_();
  const size = Number(file['Size Bytes'] || 0);
  if (size > parseInteger_(cfg.PROOF_INLINE_MAX_BYTES, 20 * 1024 * 1024)) {
    throw new Error('The proof PDF is too large for secure delivery through the portal. Ask the copyediting team to upload a compressed proof under ' +
      Math.floor(parseInteger_(cfg.PROOF_INLINE_MAX_BYTES, 20 * 1024 * 1024) / 1024 / 1024) + ' MB.');
  }
  const blob = driveDownloadBlob_(String(file['Drive File ID']), String(file['File Name'] || 'author-proof.pdf'), 'application/pdf');
  const submission = requireSubmission_(session.paperId);
  const round = ensureAuthorProofRoundData_(session.paperId);
  const attachments = [];
  const slots = Math.max(1, Math.min(5, parseInteger_(cfg.AUTHOR_PROOF_ATTACHMENT_SLOTS, 5)));
  for (let slot = 1; slot <= slots; slot += 1) {
    const role = 'author_proof_attachment_' + String(slot).padStart(2, '0');
    const attachment = activeFileForRole_(session.paperId, 'author_proof', role);
    if (attachment) attachments.push(fileRecordSummary_(attachment));
  }
  return {
    fileName: String(file['File Name'] || blob.getName()),
    mimeType: blob.getContentType() || 'application/pdf',
    base64: Utilities.base64Encode(blob.getBytes()),
    version: round.proofVersion || String(submission['Proof Version'] || ('v' + file.Version)),
    dueLabel: String(submission['Proof Due Label'] || ''),
    draft: round.draft,
    authorResponse: fileRecordSummary_(activeFileForRole_(session.paperId, 'author_proof', 'author_annotated_proof_pdf')),
    attachments: attachments
  };
}

function saveAuthorProof(sessionToken, payload, submit) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveAuthorProofPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveAuthorProofPerformanceImpl_(sessionToken, payload, submit) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertUploadOpen_(paperId, 'author_proof', 'author_annotated_proof_pdf');
  payload = payload || {};
  const task = getTaskRow_(paperId, 'author_proof');
  if (!task || ['Proof ready', 'Draft saved', 'Action required', 'Submitted', 'Under review', 'Approved'].indexOf(String(task.Status)) === -1) {
    throw new Error('The Author Proof return is not currently open. Contact the Technical Chairs if another response is required.');
  }

  const authorName = String(payload.authorName || '').trim();
  const confirmed = Boolean(payload.confirmed);
  const round = ensureAuthorProofRoundData_(paperId);
  const existing = Object.assign({}, round.draft || {});
  const responseFile = activeFileForRole_(paperId, 'author_proof', 'author_annotated_proof_pdf');

  if (submit) {
    if (!authorName) throw new Error('Enter the name of the author completing this proof review.');
    if (!responseFile || String(existing.responseProofVersion || '') !== String(round.proofVersion || '')) {
      throw new Error('Upload the annotated author proof PDF for the current proof round before submitting.');
    }
    if (!confirmed) {
      throw new Error('Confirm that all copyeditor queries were answered in the annotated PDF and all requested replacement files were uploaded.');
    }
  }

  const nextDraft = Object.assign({}, existing, {
    proofVersion: round.proofVersion,
    authorName: authorName,
    confirmed: confirmed
  });
  upsertTaskData_(paperId, 'author_proof', nextDraft);

  if (!submit) {
    setTaskStatus_(paperId, 'author_proof', 'Draft saved');
    logActivity_(paperId, 'Draft saved', 'author_proof', responseFile ? 'Annotated proof uploaded.' : 'Author Proof return started.');
    return buildPortalData_(paperId);
  }

  const submission = requireSubmission_(paperId);
  const cfg = getConfig_();
  const slots = Math.max(1, Math.min(5, parseInteger_(cfg.AUTHOR_PROOF_ATTACHMENT_SLOTS, 5)));
  let attachmentCount = 0;
  for (let slot = 1; slot <= slots; slot += 1) {
    if (activeFileForRole_(paperId, 'author_proof', 'author_proof_attachment_' + String(slot).padStart(2, '0'))) {
      attachmentCount += 1;
    }
  }

  upsertProofReturnSummary_({
    paperId: paperId,
    paperTitle: String(submission['Final Title'] || submission['Original Title'] || ''),
    proofVersion: round.proofVersion,
    fileName: String(responseFile['File Name'] || ''),
    attachmentCount: attachmentCount,
    authorName: authorName
  });

  setTaskStatus_(paperId, 'author_proof', 'Submitted', { clearNote: true });
  logActivity_(paperId, 'Author proof submitted', 'author_proof',
    String(responseFile['File Name'] || '') + ' · ' + attachmentCount + ' supporting file(s)');
  return buildPortalData_(paperId);
}

function saveAuthorProofDraftForUpload(sessionToken, payload) {
  const args = arguments;
  return withScriptLock_(function () {
    return withSheetObjectsRuntimeCache_(function () {
      const result=saveAuthorProofDraftForUploadPerformanceImpl_.apply(null,args);
      SpreadsheetApp.flush();
      return result;
    });
  });
}

function saveAuthorProofDraftForUploadPerformanceImpl_(sessionToken, payload) {
  const session = requireAuthorSession_(sessionToken);
  const paperId = session.paperId;
  assertUploadOpen_(paperId, 'author_proof', 'author_annotated_proof_pdf');
  payload = payload || {};

  const task = getTaskRow_(paperId, 'author_proof');
  if (!task || ['Proof ready', 'Draft saved', 'Action required', 'Submitted', 'Under review', 'Approved'].indexOf(String(task.Status)) === -1) {
    throw new Error('The Author Proof return is not currently open. Contact the Technical Chairs if another response is required.');
  }

  const round = ensureAuthorProofRoundData_(paperId);
  const existing = Object.assign({}, round.draft || {});
  const responseFile = activeFileForRole_(paperId, 'author_proof', 'author_annotated_proof_pdf');
  const nextDraft = Object.assign({}, existing, {
    proofVersion: round.proofVersion,
    authorName: String(payload.authorName || '').trim(),
    confirmed: Boolean(payload.confirmed)
  });

  upsertTaskData_(paperId, 'author_proof', nextDraft);
  setTaskStatus_(paperId, 'author_proof', 'Draft saved');
  logActivity_(paperId, 'Draft saved', 'author_proof',
    responseFile ? 'Annotated proof uploaded.' : 'Author Proof return started.');

  return {
    ok: true,
    taskId: 'author_proof',
    status: 'Draft saved',
    proofVersion: round.proofVersion,
    hasAnnotatedProof: Boolean(responseFile)
  };
}

function submitProofFormResponse_(entry) {
  const cfg = getConfig_();
  if (!cfg.PROOF_FORM_ID) throw new Error('The Author Proof Google Form is not configured. Run setupAuthorHub_() again.');
  const form = FormApp.openById(cfg.PROOF_FORM_ID);
  const byTitle = {};
  form.getItems().forEach(function (item) { byTitle[item.getTitle()] = item; });
  const response = form.createResponse();
  function add(title, value) {
    const item = byTitle[title];
    if (!item) throw new Error('The proof form is missing the field: ' + title);
    const text = String(value == null ? '' : value);
    if (item.getType() === FormApp.ItemType.PARAGRAPH_TEXT) {
      response.withItemResponse(item.asParagraphTextItem().createResponse(text));
    } else {
      response.withItemResponse(item.asTextItem().createResponse(text));
    }
  }
  add('Paper ID', entry.paperId);
  add('Paper Title', entry.paperTitle);
  add('Proof Version', entry.proofVersion);
  add('Page Number', entry.page);
  add('Comment Category', entry.category);
  add('Location in Proof', entry.location);
  add('Author Comment', entry.comment);
  add('Author Name', entry.authorName);
  const submitted = response.submit();
  const responseId = submitted && submitted.getId ? submitted.getId() : '';

  appendObject_(SHEETS.PROOF_COMMENTS, {
    'Timestamp': new Date(),
    'Paper ID': entry.paperId,
    'Paper Title': entry.paperTitle,
    'Proof Version': entry.proofVersion,
    'Page Number': entry.page,
    'Category': entry.category,
    'Location': entry.location,
    'Author Comment': entry.comment,
    'Author Name': entry.authorName,
    'Resolution Status': 'Open',
    'Copyeditor Response': '',
    'Resolved At': '',
    'Form Response ID': responseId
  });
  return responseId;
}

/******************************************************************************
 * SOURCE: Setup.gs
 ******************************************************************************/

/** One-time installation, data import, folder provisioning, and chair utilities. */

function setupAuthorHub_() {
  const rootId = DEFAULTS.ROOT_FOLDER_ID;
  driveGetMetadata_(rootId, 'id,name,mimeType,trashed'); // permission check

  const systemRoot = driveEnsureFolder_(rootId, '00_SYSTEM_DO_NOT_SHARE');
  const masterFolder = driveEnsureFolder_(systemRoot.id, '01_Master_Sheets');
  driveEnsureFolder_(systemRoot.id, '02_Reviewer_Feedback');
  const proofFolder = driveEnsureFolder_(systemRoot.id, '03_Author_Proof_Form_and_Responses');
  driveEnsureFolder_(systemRoot.id, '04_Author_Hub_Config');
  driveEnsureFolder_(systemRoot.id, '05_Activity_Logs');
  driveEnsureFolder_(systemRoot.id, '06_Backups');

  const downloadsRoot = driveEnsureFolder_(rootId, '01_AUTHOR_DOWNLOADS_VIEW_ONLY');
  driveEnsureFolder_(downloadsRoot.id, '01_Publication_Template_ZIP');
  driveEnsureFolder_(downloadsRoot.id, '02_Publication_Instructions');
  driveEnsureFolder_(downloadsRoot.id, '03_Copyright_and_Recording_Consent');

  const exportsRoot = driveEnsureFolder_(rootId, '90_COLLECTIVE_EXPORTS');
  driveEnsureFolder_(exportsRoot.id, '01_Website_Export');
  driveEnsureFolder_(exportsRoot.id, '02_Indexing_Export');
  driveEnsureFolder_(exportsRoot.id, '03_Program_Export');
  driveEnsureFolder_(exportsRoot.id, '04_Final_Proceedings');

  const archiveRoot = driveEnsureFolder_(rootId, '99_ARCHIVE');
  driveEnsureFolder_(archiveRoot.id, 'Withdrawn');
  driveEnsureFolder_(archiveRoot.id, 'Superseded_System_Exports');

  const props = PropertiesService.getScriptProperties();
  let masterId = props.getProperty('MASTER_SPREADSHEET_ID');
  let master = null;
  if (masterId) {
    try { master = SpreadsheetApp.openById(masterId); } catch (err) { master = null; }
  }
  if (!master) {
    master = SpreadsheetApp.create("__ACADIA_TEXT_t0018__");
    masterId = master.getId();
    props.setProperty('MASTER_SPREADSHEET_ID', masterId);
    driveMoveFile_(masterId, masterFolder.id);
  }

  props.setProperties({
    SYSTEM_FOLDER_ID: systemRoot.id,
    DOWNLOADS_FOLDER_ID: downloadsRoot.id,
    EXPORTS_FOLDER_ID: exportsRoot.id,
    ARCHIVE_FOLDER_ID: archiveRoot.id
  }, false);

  ensureMasterSheets_(master);
  getSigningSecret_();

  let proofFormId = props.getProperty('PROOF_FORM_ID');
  let proofForm = null;
  if (proofFormId) {
    try { proofForm = FormApp.openById(proofFormId); } catch (err) { proofForm = null; }
  }
  if (!proofForm) {
    proofForm = createProofForm_(masterId, proofFolder.id);
    proofFormId = proofForm.getId();
    props.setProperty('PROOF_FORM_ID', proofFormId);
  }

  upsertDefaultSettings_(master, {
    MASTER_SPREADSHEET_ID: masterId,
    PROOF_FORM_ID: proofFormId,
    SYSTEM_FOLDER_ID: systemRoot.id,
    DOWNLOADS_FOLDER_ID: downloadsRoot.id,
    EXPORTS_FOLDER_ID: exportsRoot.id,
    ARCHIVE_FOLDER_ID: archiveRoot.id
  });
  invalidateConfigCache_();
  refreshAdminDashboard_();

  return {
    masterSpreadsheetId: masterId,
    masterSpreadsheetUrl: master.getUrl(),
    proofFormId: proofFormId,
    proofFormEditUrl: proofForm.getEditUrl(),
    rootFolderId: rootId,
    rootFolderUrl: 'https://drive.google.com/drive/folders/' + rootId,
    webAppUrl: ScriptApp.getService().getUrl() || 'Deploy the project as a Web app to obtain the /exec URL.'
  };
}

function ensureMasterSheets_(spreadsheet) {
  const defaultSheet = spreadsheet.getSheets()[0];
  const allNames = Object.keys(SHEET_HEADERS);
  allNames.forEach(function (name, index) {
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet && index === 0 && defaultSheet && spreadsheet.getSheets().length === 1 && defaultSheet.getName() === 'Sheet1') {
      defaultSheet.setName(name);
      sheet = defaultSheet;
    }
    if (!sheet) sheet = spreadsheet.insertSheet(name);
    const headers = SHEET_HEADERS[name];
    if (sheet.getMaxColumns() < headers.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatDataSheet_(sheet, headers.length);
  });
}

function formatDataSheet_(sheet, columnCount) {
  sheet.setFrozenRows(1);
  const header = sheet.getRange(1, 1, 1, columnCount);
  header.setBackground('#1b1b1a').setFontColor('#ffffff').setFontWeight('bold');
  header.setWrap(true);
  if (sheet.getFilter()) sheet.getFilter().remove();
  if (sheet.getMaxRows() > 1) sheet.getRange(1, 1, sheet.getMaxRows(), columnCount).createFilter();
  sheet.autoResizeColumns(1, Math.min(columnCount, 12));
}

function upsertDefaultSettings_(spreadsheet, generated) {
  const sheet = spreadsheet.getSheetByName(SHEETS.SETTINGS);
  const notes = {
    CAMERA_READY_DEADLINE_ISO_UTC: 'Informational deadline for Tasks 1–6; never closes uploads, saves, or submissions.',
    REGISTRATION_DEADLINE_ISO_UTC: 'Informational deadline for Task 7; never closes registration uploads, saves, or submissions.',
    REGISTRATION_DEADLINE_LABEL: 'Public label for the Task 7 conference-registration deadline.',
    EARLY_BIRD_REGISTRATION_DEADLINE_LABEL: 'Public label for the early-bird conference-registration deadline.',
    REGISTRATION_URL: 'Paste the external conference ticket-purchase URL.',
    PAPER_TEMPLATE_FILE_ID: 'Drive file ID for the Full Paper InDesign template package.',
    PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID: 'Drive file ID for the shared Project / Field Note InDesign template package.',
    PROJECT_POSTER_TEMPLATE_FILE_ID: 'Drive file ID for the Project / Field Note poster InDesign template.',
    PROJECT_POSTER_INSTRUCTIONS_FILE_ID: 'Drive file ID for the Project / Field Note poster instructions/reference PDF.',
    PROJECT_POSTER_DEADLINE_LABEL: 'Display-only requested submission date for the Project / Field Note poster. It does not close the uploader.',
    PROJECT_POSTER_MAX_BYTES: 'Maximum Project / Field Note poster PDF size in bytes.',
    TEMPLATE_ZIP_FILE_ID: 'Legacy fallback template ID. Leave blank when the two track-specific template IDs are configured.',
    PUBLICATION_INSTRUCTIONS_FILE_ID: 'Drive file ID for the publication-instructions PDF.',
    CONSENT_PDF_FILE_ID: 'Drive file ID for the unsigned copyright and recording-consent PDF.',
    ACCEPTED_SOURCE_SPREADSHEET_ID: 'Native Google Sheet containing the final Full Papers, Projects, and Field Notes tabs.',
    ACCEPTED_FULL_PAPERS_SHEET_NAME: 'Tab name for accepted Full Papers.',
    ACCEPTED_PROJECTS_SHEET_NAME: 'Tab name for accepted Projects.',
    ACCEPTED_FIELD_NOTES_SHEET_NAME: 'Tab name for accepted Field Notes.',
    REVIEWER_SOURCE_SPREADSHEET_ID: 'Optional separate reviewer source. The three-track final importer reads All Reviewer Comments from the accepted-submission source.',
    BANNER_FILE_ID: 'Drive image file shown on every portal page. Share as Anyone with the link — Viewer.',
    VISA_LETTER_ENABLED: 'Show the international-author invitation-letter card when TRUE and a Google Docs template is configured.',
    VISA_LETTER_TEMPLATE_DOC_ID: 'Native Google Docs template used to generate personalized invitation letters.',
    VISA_LETTER_ARCHIVE_FOLDER_ID: 'Private Drive folder where generated invitation-letter PDFs are archived.'
  };
  const existing = {};
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues().forEach(function (row, index) {
      existing[String(row[0] || '').trim()] = { row: index + 2, value: row[1] };
    });
  }
  const values = Object.assign({}, DEFAULTS, generated || {});
  Object.keys(values).sort().forEach(function (key) {
    const value = values[key] == null ? '' : values[key];
    if (existing[key]) {
      if (!String(existing[key].value || '').trim()) sheet.getRange(existing[key].row, 2).setValue(value);
      if (notes[key]) sheet.getRange(existing[key].row, 3).setValue(notes[key]);
    } else {
      sheet.appendRow([key, value, notes[key] || '']);
    }
  });
}

function createProofForm_(masterSpreadsheetId, destinationFolderId) {
  const form = FormApp.create("__ACADIA_TEXT_t0019__");
  form.setDescription("__ACADIA_TEXT_t0020__");
  [
    'Paper ID', 'Paper Title', 'Proof Version', 'Page Number',
    'Comment Category', 'Location in Proof', 'Author Name'
  ].forEach(function (title) {
    const required = title !== 'Location in Proof';
    form.addTextItem().setTitle(title).setRequired(required);
  });
  form.addParagraphTextItem().setTitle('Author Comment').setRequired(true);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, masterSpreadsheetId);
  driveMoveFile_(form.getId(), destinationFolderId);
  return form;
}

function seedDemoSubmission_() {
  const setup = setupAuthorHub_();
  upsertSubmission_({
    'Paper ID': '319',
    'Original Title': 'Responsive Assemblies for Human-Centered Fabrication',
    'Final Title': 'Responsive Assemblies for Human-Centered Fabrication',
    'Track': 'Full Paper',
    'Volume': 'Volume 2',
    'Corresponding Author': 'Alex Morgan',
    'Corresponding Email': 'alex@example.edu',
    'Portal Enabled': true
  });
  clearReviewerFeedbackForPaper_('319');
  [
    ['Reviewer 1', 'Please clarify how the proposed assembly system differs from prior modular fabrication research. Specify the number and scale of prototypes.'],
    ['Reviewer 2', 'Connect the material tests more directly to the final design decisions and identify the study’s limitations.'],
    ['Reviewer 3', 'Standardize terminology across the manuscript and expand the discussion of human participation during installation.']
  ].forEach(function (review) {
    appendObject_(SHEETS.REVIEWER_FEEDBACK, {
      'Paper ID': '319', 'Review Label': review[0], 'Reviewer Comment': review[1],
      'Source': 'Demo data', 'Imported At': new Date()
    });
  });
  ensureSubmissionFolders_('319');
  refreshAdminDashboard_();
  return setup;
}

function clearReviewerFeedbackForPaper_(paperId) {
  const id = normalizePaperId_(paperId);
  const sheet = getSheet_(SHEETS.REVIEWER_FEEDBACK);
  sheetObjects_(SHEETS.REVIEWER_FEEDBACK)
    .filter(function (row) { return normalizePaperId_(row['Paper ID']) === id; })
    .map(function (row) { return row.__row; })
    .sort(function (a, b) { return b - a; })
    .forEach(function (rowNumber) { sheet.deleteRow(rowNumber); });
}


function setSettingsValues_(updates) {
  const sheet = getSheet_(SHEETS.SETTINGS);
  const existing = {};
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues().forEach(function (row, index) {
      const key = String(row[0] || '').trim();
      if (key) existing[key] = index + 2;
    });
  }
  Object.keys(updates || {}).forEach(function (key) {
    const value = updates[key] == null ? '' : updates[key];
    if (existing[key]) sheet.getRange(existing[key], 2).setValue(value);
    else sheet.appendRow([key, value, 'Updated by RUN_APPLY_CURRENT_CONTENT_CONFIG.']);
  });
  invalidateConfigCache_();
  return { updatedKeys: Object.keys(updates || {}), updatedAt: new Date().toISOString() };
}

function applyCurrentContentConfig_() {
  setupAuthorHub_();
  return setSettingsValues_({
    BANNER_FILE_ID: DEFAULTS.BANNER_FILE_ID,
    PAPER_TEMPLATE_FILE_ID: DEFAULTS.PAPER_TEMPLATE_FILE_ID,
    PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID: DEFAULTS.PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID,
    PROJECT_POSTER_TEMPLATE_FILE_ID: DEFAULTS.PROJECT_POSTER_TEMPLATE_FILE_ID,
    PROJECT_POSTER_INSTRUCTIONS_FILE_ID: DEFAULTS.PROJECT_POSTER_INSTRUCTIONS_FILE_ID,
    PROJECT_POSTER_DEADLINE_LABEL: DEFAULTS.PROJECT_POSTER_DEADLINE_LABEL,
    PROJECT_POSTER_MAX_BYTES: DEFAULTS.PROJECT_POSTER_MAX_BYTES,
    ACCEPTED_SOURCE_SPREADSHEET_ID: DEFAULTS.ACCEPTED_SOURCE_SPREADSHEET_ID,
    ACCEPTED_FULL_PAPERS_SHEET_NAME: DEFAULTS.ACCEPTED_FULL_PAPERS_SHEET_NAME,
    ACCEPTED_PROJECTS_SHEET_NAME: DEFAULTS.ACCEPTED_PROJECTS_SHEET_NAME,
    ACCEPTED_FIELD_NOTES_SHEET_NAME: DEFAULTS.ACCEPTED_FIELD_NOTES_SHEET_NAME
  });
}

function splitReviewerBlocks_(rawValue) {
  const text = String(rawValue == null ? '' : rawValue).replace(/\r\n?/g, '\n').trim();
  if (!text) return [];
  return text.split(/\n\s*---\s*\n/g).map(function (rawBlock, index) {
    const block = String(rawBlock || '').trim();
    const match = block.match(/^\s*(Review\s*\d+|Consolidated jury comment|Jury comment|Reviewer feedback)\s*:\s*/i);
    if (match) {
      return {
        label: String(match[1] || '').replace(/\s+/g, ' ').trim(),
        comment: block.substring(match[0].length).trim()
      };
    }
    return {
      label: index === 0 ? 'Reviewer feedback' : 'Review ' + (index + 1),
      comment: block
    };
  }).filter(function (entry) { return entry.comment; });
}

function ensureTaskRowsBatch_(acceptedPaperIds) {
  const existing = sheetObjects_(SHEETS.TASKS);
  const output = existing.map(function (row) {
    const object = {};
    SHEET_HEADERS[SHEETS.TASKS].forEach(function (header) { object[header] = row[header]; });
    return object;
  });
  const keys = {};
  output.forEach(function (row) {
    keys[normalizePaperId_(row['Paper ID']) + '|' + String(row['Task ID'] || '')] = true;
  });
  (acceptedPaperIds || []).forEach(function (paperId) {
    TASK_DEFINITIONS.forEach(function (task) {
      const key = normalizePaperId_(paperId) + '|' + task.id;
      if (keys[key]) return;
      output.push({
        'Paper ID': normalizePaperId_(paperId),
        'Task ID': task.id,
        'Task Name': task.name,
        'Status': task.id === 'author_proof' ? 'Locked' : 'Not started',
        'Submitted At': '',
        'Approved At': '',
        'Action Required Note': '',
        'Last Updated': new Date()
      });
      keys[key] = true;
    });
  });
  replaceSheetObjects_(SHEETS.TASKS, output);
  return output.length;
}


/**
 * Reads the configured three-track accepted-submission source without writing
 * to the Author Hub database.
 */
function readConfiguredAcceptedSourceForIncremental_() {
  const cfg = getConfig_();
  const sourceId = String(cfg.ACCEPTED_SOURCE_SPREADSHEET_ID || '').trim();
  if (!sourceId) throw new Error('ACCEPTED_SOURCE_SPREADSHEET_ID is not configured.');

  const source = SpreadsheetApp.openById(sourceId);
  const specs = [
    { sheetName: String(cfg.ACCEPTED_FULL_PAPERS_SHEET_NAME || 'Full Papers'), track: 'Full Paper', volume: 'Volume 2' },
    { sheetName: String(cfg.ACCEPTED_PROJECTS_SHEET_NAME || 'Projects'), track: 'Projects', volume: 'Volume 1' },
    { sheetName: String(cfg.ACCEPTED_FIELD_NOTES_SHEET_NAME || 'Field Notes'), track: 'Field Note', volume: 'Volume 3' }
  ];

  const records = [];
  const feedbackByPaper = {};
  const seen = {};
  const counts = { 'Full Paper': 0, 'Projects': 0, 'Field Note': 0 };

  specs.forEach(function (spec) {
    const sheet = source.getSheetByName(spec.sheetName);
    if (!sheet) throw new Error('Accepted-submission tab not found: ' + spec.sheetName);

    const values = sheet.getDataRange().getValues();
    if (!values.length) throw new Error('Accepted-submission tab is empty: ' + spec.sheetName);

    const headerInfo = detectHeaderRow_(values, ['id', 'title']);
    const index = headerIndex_(headerInfo.headers);
    const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
    const titleCol = firstHeaderIndex_(index, ['original title', 'paper title', 'submission title', 'title']);
    const authorsCol = firstHeaderIndex_(index, ['authors', 'author list', 'all authors']);
    const commentsCol = firstHeaderIndex_(index, ['all reviewer comments', 'reviewer comments', 'reviewer feedback', 'comments']);

    if (idCol < 0 || titleCol < 0) {
      throw new Error(spec.sheetName + ' must contain ID and Title columns.');
    }

    for (let r = headerInfo.row + 1; r < values.length; r += 1) {
      const paperId = normalizePaperId_(values[r][idCol]);
      const title = String(values[r][titleCol] || '').trim();

      if (!paperId && !title) continue;
      if (!paperId || !title) {
        throw new Error(spec.sheetName + ' row ' + (r + 1) + ' is missing an ID or Title.');
      }
      if (seen[paperId]) {
        throw new Error(
          'Duplicate Paper ID ' + paperId + ' appears in both ' +
          seen[paperId] + ' and ' + spec.sheetName + '.'
        );
      }

      seen[paperId] = spec.sheetName;
      counts[spec.track] += 1;

      const record = {
        paperId: paperId,
        title: title,
        sourceAuthors: authorsCol >= 0 ? String(values[r][authorsCol] || '').trim() : '',
        track: spec.track,
        volume: spec.volume,
        sourceSheet: spec.sheetName,
        sourceRow: r + 1
      };
      records.push(record);

      feedbackByPaper[paperId] = commentsCol >= 0
        ? splitReviewerBlocks_(values[r][commentsCol])
        : [];
    }
  });

  return {
    sourceSpreadsheetId: sourceId,
    sourceSpreadsheetName: source.getName(),
    records: records,
    feedbackByPaper: feedbackByPaper,
    counts: counts,
    totalSourceRecords: records.length
  };
}

/**
 * Produces a no-write preview. Existing Author Hub records are never changed by
 * the incremental importer. Any reused Paper ID whose title or track differs
 * from the current Master Sheet is treated as a conflict.
 */
function previewNewAcceptedSubmissions_() {
  const sourceData = readConfiguredAcceptedSourceForIncremental_();
  const existingRows = sheetObjects_(SHEETS.SUBMISSIONS);
  const existingById = {};
  existingRows.forEach(function (row) {
    const paperId = normalizePaperId_(row['Paper ID']);
    if (paperId) existingById[paperId] = row;
  });

  const newRecords = [];
  const conflicts = [];
  let existingRecordsLeftUntouched = 0;

  sourceData.records.forEach(function (record) {
    const existing = existingById[record.paperId];
    if (!existing) {
      newRecords.push(record);
      return;
    }

    existingRecordsLeftUntouched += 1;

    const sameTitle = normalizeTitle_(existing['Original Title']) === normalizeTitle_(record.title);
    const sameTrack = normalizeTrack_(existing.Track) === normalizeTrack_(record.track);

    if (!sameTitle || !sameTrack) {
      conflicts.push({
        paperId: record.paperId,
        sourceSheet: record.sourceSheet,
        sourceRow: record.sourceRow,
        sourceTitle: record.title,
        masterTitle: String(existing['Original Title'] || ''),
        sourceTrack: record.track,
        masterTrack: String(existing.Track || '')
      });
    }
  });

  const result = {
    sourceSpreadsheetId: sourceData.sourceSpreadsheetId,
    sourceSpreadsheetName: sourceData.sourceSpreadsheetName,
    sourceCounts: sourceData.counts,
    totalSourceRecords: sourceData.totalSourceRecords,
    currentMasterSubmissionRows: existingRows.length,
    newSubmissionCount: newRecords.length,
    newSubmissions: newRecords.map(function (record) {
      return {
        paperId: record.paperId,
        title: record.title,
        track: record.track,
        volume: record.volume,
        sourceSheet: record.sourceSheet,
        sourceRow: record.sourceRow,
        reviewerFeedbackBlocks: (sourceData.feedbackByPaper[record.paperId] || []).length
      };
    }),
    existingRecordsLeftUntouched: existingRecordsLeftUntouched,
    conflicts: conflicts,
    safeToImport: conflicts.length === 0
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

function incrementalReviewerFeedbackKey_(paperId, label, comment) {
  return [
    normalizePaperId_(paperId),
    String(label || '').trim().toLowerCase(),
    String(comment || '').replace(/\r\n?/g, '\n').trim()
  ].join('|');
}

/**
 * Adds only Paper IDs that do not already exist in the Master Sheet.
 *
 * Existing submissions, tasks, authors, metadata, uploads, registration,
 * attendance, indexing, proof comments, and reviewer feedback are left
 * untouched. The function is idempotent and safe to run again.
 */
function addNewAcceptedSubmissionsSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another administrative update is running. Wait one minute and retry.');
  }

  try {
    const preview = previewNewAcceptedSubmissions_();
    if (preview.conflicts.length) {
      throw new Error(
        'Import stopped. ' + preview.conflicts.length +
        ' existing Paper ID(s) have a different title or track in the source Sheet. ' +
        'Correct those rows before importing new submissions. See the execution log for details.'
      );
    }

    if (!preview.newSubmissionCount) {
      return {
        changed: false,
        message: 'No new Paper IDs were found. Existing Author Hub records were not changed.',
        preview: preview
      };
    }

    const cfg = getConfig_();
    const master = getMasterSpreadsheet_();
    const masterId = master.getId();

    // Full Master Sheet backup before any write.
    const systemFolderId = String(cfg.SYSTEM_FOLDER_ID || '').trim();
    const backupFolder = systemFolderId
      ? driveEnsureFolder_(systemFolderId, '06_Backups')
      : driveEnsureFolder_(String(cfg.ROOT_FOLDER_ID), '00_SYSTEM_DO_NOT_SHARE');
    const stamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'Etc/UTC',
      'yyyyMMdd-HHmmss'
    );
    const backup = driveCopyFile_(
      masterId,
      backupFolder.id,
      "__ACADIA_TEXT_t0021__" + stamp
    );

    const sourceData = readConfiguredAcceptedSourceForIncremental_();
    const currentIds = {};
    sheetObjects_(SHEETS.SUBMISSIONS).forEach(function (row) {
      const id = normalizePaperId_(row['Paper ID']);
      if (id) currentIds[id] = true;
    });
    const newRecords = sourceData.records.filter(function (record) {
      return !currentIds[record.paperId];
    });

    ensureAttendanceSheet_();

    // De-duplicate reviewer blocks so a retry after a partial execution remains safe.
    const existingFeedbackKeys = {};
    sheetObjects_(SHEETS.REVIEWER_FEEDBACK).forEach(function (row) {
      existingFeedbackKeys[incrementalReviewerFeedbackKey_(
        row['Paper ID'],
        row['Review Label'],
        row['Reviewer Comment']
      )] = true;
    });

    const importedAt = new Date();
    let reviewerBlocksAdded = 0;
    const added = [];

    newRecords.forEach(function (record) {
      // Build dependent rows first. These helpers are idempotent.
      ensureTaskRows_(record.paperId);
      upsertAttendance_(record.paperId, {
        'Attendance Confirmed': false,
        'Presenter Name': '',
        'Presenter Email': '',
        'Confirmed At': '',
        'Last Updated': importedAt
      });

      (sourceData.feedbackByPaper[record.paperId] || []).forEach(function (entry) {
        const key = incrementalReviewerFeedbackKey_(
          record.paperId,
          entry.label,
          entry.comment
        );
        if (existingFeedbackKeys[key]) return;

        appendObject_(SHEETS.REVIEWER_FEEDBACK, {
          'Paper ID': record.paperId,
          'Review Label': entry.label,
          'Reviewer Comment': entry.comment,
          'Source': sourceData.sourceSpreadsheetName + ' / ' + record.sourceSheet,
          'Imported At': importedAt
        });
        existingFeedbackKeys[key] = true;
        reviewerBlocksAdded += 1;
      });

      // The submission row is written last, so a partially completed run never
      // exposes an incomplete new portal record.
      appendObject_(SHEETS.SUBMISSIONS, {
        'Paper ID': record.paperId,
        'Original Title': record.title,
        'Normalized Original Title': normalizeTitle_(record.title),
        'Final Title': record.title,
        'Track': record.track,
        'Volume': record.volume,
        'Corresponding Author': record.sourceAuthors,
        'Corresponding Email': '',
        'Presenting Author': '',
        'Presenting Email': '',
        'Submission Folder ID': '',
        'Portal Enabled': true,
        'Overall Status': 'Accepted — Awaiting Materials',
        'Proof Version': '',
        'Proof Due Label': '',
        'Last Updated': importedAt
      });

      appendObject_(SHEETS.ACTIVITY, {
        'Timestamp': importedAt,
        'Paper ID': record.paperId,
        'Event': 'Accepted submission added',
        'Task ID': '',
        'Detail': 'Added safely from ' + record.sourceSheet +
          ' row ' + record.sourceRow + '. Existing submissions were not modified.'
      });

      added.push({
        paperId: record.paperId,
        title: record.title,
        track: record.track,
        volume: record.volume,
        reviewerFeedbackBlocks: (sourceData.feedbackByPaper[record.paperId] || []).length
      });
    });

    refreshAdminDashboard_();

    const result = {
      changed: true,
      backupFileId: backup.id,
      backupFileName: backup.name,
      newSubmissionsAdded: added.length,
      reviewerFeedbackBlocksAdded: reviewerBlocksAdded,
      added: added,
      existingAuthorDataReplaced: false,
      existingSubmissionRowsUpdated: 0,
      foldersStillToProvision: added.length,
      importedAt: importedAt.toISOString()
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Creates Drive folders only for enabled submissions whose Submission Folder ID
 * is blank. Existing paper folders are never scanned, renamed, or rebuilt.
 * Intended for a small number of newly accepted submissions.
 */
function provisionNewAcceptedFoldersSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another administrative update is running. Wait one minute and retry.');
  }

  try {
    const missing = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
      return normalizePaperId_(row['Paper ID']) &&
        parseBoolean_(row['Portal Enabled'], true) &&
        !String(row['Submission Folder ID'] || '').trim();
    });

    if (!missing.length) {
      return {
        changed: false,
        message: 'All enabled submissions already have paper folders.',
        provisioned: []
      };
    }

    if (missing.length > 20) {
      throw new Error(
        missing.length + ' submissions are missing folders. ' +
        'This safe runner is intended for up to 20 new submissions at a time. ' +
        'Use RUN_START_FOLDER_PROVISIONING for a larger batch.'
      );
    }

    const provisioned = [];
    missing.forEach(function (row) {
      const paperId = normalizePaperId_(row['Paper ID']);
      const folders = ensureSubmissionFolders_(paperId);
      provisioned.push({
        paperId: paperId,
        paperRootFolderId: folders.PAPER_ROOT || '',
        cameraReadyFolderId: folders.CAMERA_READY || '',
        websiteMaterialsFolderId: folders.WEBSITE_MATERIALS || '',
        copyrightConsentFolderId: folders.COPYRIGHT_CONSENT || '',
        registrationFolderId: folders.REGISTRATION || ''
      });
    });

    refreshAdminDashboard_();

    const result = {
      changed: true,
      provisionedCount: provisioned.length,
      provisioned: provisioned
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Read-only status after an incremental import.
 */
function newAcceptedSubmissionsStatus_() {
  const preview = previewNewAcceptedSubmissions_();
  const enabled = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
    return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
  });
  const missingFolders = enabled.filter(function (row) {
    return !String(row['Submission Folder ID'] || '').trim();
  }).map(function (row) {
    return {
      paperId: normalizePaperId_(row['Paper ID']),
      title: String(row['Original Title'] || ''),
      track: String(row.Track || '')
    };
  });

  const result = {
    enabledMasterSubmissions: enabled.length,
    pendingNewSourceSubmissions: preview.newSubmissionCount,
    sourceConflicts: preview.conflicts,
    submissionsMissingFolders: missingFolders.length,
    missingFolders: missingFolders,
    ready: preview.newSubmissionCount === 0 &&
      preview.conflicts.length === 0 &&
      missingFolders.length === 0
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}


function importFinalAcceptedSubmissions_(sourceSpreadsheetId) {
  setupAuthorHub_();
  const cfg = getConfig_();
  const sourceId = String(sourceSpreadsheetId || cfg.ACCEPTED_SOURCE_SPREADSHEET_ID || '').trim();
  if (!sourceId) throw new Error('ACCEPTED_SOURCE_SPREADSHEET_ID is not configured.');

  const source = SpreadsheetApp.openById(sourceId);
  const specs = [
    { sheetName: String(cfg.ACCEPTED_FULL_PAPERS_SHEET_NAME || 'Full Papers'), track: 'Full Paper', volume: 'Volume 2' },
    { sheetName: String(cfg.ACCEPTED_PROJECTS_SHEET_NAME || 'Projects'), track: 'Projects', volume: 'Volume 1' },
    { sheetName: String(cfg.ACCEPTED_FIELD_NOTES_SHEET_NAME || 'Field Notes'), track: 'Field Note', volume: 'Volume 3' }
  ];

  const records = [];
  const feedback = [];
  const seen = {};
  const counts = { 'Full Paper': 0, 'Projects': 0, 'Field Note': 0 };
  const importedAt = new Date();

  specs.forEach(function (spec) {
    const sheet = source.getSheetByName(spec.sheetName);
    if (!sheet) throw new Error('Accepted-submission tab not found: ' + spec.sheetName);
    const values = sheet.getDataRange().getValues();
    if (!values.length) throw new Error('Accepted-submission tab is empty: ' + spec.sheetName);
    const headerInfo = detectHeaderRow_(values, ['id', 'title']);
    const index = headerIndex_(headerInfo.headers);
    const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
    const titleCol = firstHeaderIndex_(index, ['original title', 'paper title', 'submission title', 'title']);
    const authorsCol = firstHeaderIndex_(index, ['authors', 'author list', 'all authors']);
    const commentsCol = firstHeaderIndex_(index, ['all reviewer comments', 'reviewer comments', 'reviewer feedback', 'comments']);
    if (idCol < 0 || titleCol < 0) {
      throw new Error(spec.sheetName + ' must contain ID and Title columns.');
    }

    for (let r = headerInfo.row + 1; r < values.length; r += 1) {
      const paperId = normalizePaperId_(values[r][idCol]);
      const title = String(values[r][titleCol] || '').trim();
      if (!paperId && !title) continue;
      if (!paperId || !title) throw new Error(spec.sheetName + ' row ' + (r + 1) + ' is missing an ID or Title.');
      if (seen[paperId]) {
        throw new Error('Duplicate Paper ID ' + paperId + ' appears in both ' + seen[paperId] + ' and ' + spec.sheetName + '.');
      }
      seen[paperId] = spec.sheetName;
      counts[spec.track] += 1;
      records.push({
        paperId: paperId,
        title: title,
        sourceAuthors: authorsCol >= 0 ? String(values[r][authorsCol] || '').trim() : '',
        track: spec.track,
        volume: spec.volume,
        sourceSheet: spec.sheetName
      });

      if (commentsCol >= 0) {
        splitReviewerBlocks_(values[r][commentsCol]).forEach(function (entry) {
          feedback.push({
            'Paper ID': paperId,
            'Review Label': entry.label,
            'Reviewer Comment': entry.comment,
            'Source': source.getName() + ' / ' + spec.sheetName,
            'Imported At': importedAt
          });
        });
      }
    }
  });

  const existing = sheetObjects_(SHEETS.SUBMISSIONS);
  const existingById = {};
  existing.forEach(function (row) { existingById[normalizePaperId_(row['Paper ID'])] = row; });
  const acceptedSet = {};
  const submissionOutput = [];

  records.forEach(function (record) {
    acceptedSet[record.paperId] = true;
    const old = existingById[record.paperId] || {};
    submissionOutput.push({
      'Paper ID': record.paperId,
      'Original Title': record.title,
      'Normalized Original Title': normalizeTitle_(record.title),
      'Final Title': String(old['Final Title'] || record.title),
      'Track': record.track,
      'Volume': record.volume,
      'Corresponding Author': String(old['Corresponding Author'] || ''),
      'Corresponding Email': String(old['Corresponding Email'] || ''),
      'Presenting Author': String(old['Presenting Author'] || ''),
      'Presenting Email': String(old['Presenting Email'] || ''),
      'Submission Folder ID': String(old['Submission Folder ID'] || ''),
      'Portal Enabled': true,
      'Overall Status': String(old['Overall Status'] || 'Accepted — Awaiting Materials'),
      'Proof Version': String(old['Proof Version'] || ''),
      'Proof Due Label': String(old['Proof Due Label'] || ''),
      'Last Updated': importedAt
    });
  });

  let disabledNotInFinalList = 0;
  existing.forEach(function (row) {
    const paperId = normalizePaperId_(row['Paper ID']);
    if (!paperId || acceptedSet[paperId]) return;
    const object = {};
    SHEET_HEADERS[SHEETS.SUBMISSIONS].forEach(function (header) { object[header] = row[header]; });
    object['Portal Enabled'] = false;
    object['Last Updated'] = importedAt;
    submissionOutput.push(object);
    disabledNotInFinalList += 1;
  });

  replaceSheetObjects_(SHEETS.SUBMISSIONS, submissionOutput);
  ensureTaskRowsBatch_(records.map(function (record) { return record.paperId; }));
  replaceSheetObjects_(SHEETS.REVIEWER_FEEDBACK, feedback);
  refreshAdminDashboard_();

  const result = {
    sourceSpreadsheetId: sourceId,
    sourceSpreadsheetName: source.getName(),
    counts: counts,
    totalAccepted: records.length,
    uniquePaperIds: Object.keys(seen).length,
    reviewerFeedbackBlocks: feedback.length,
    disabledNotInFinalList: disabledNotInFinalList,
    importedAt: importedAt.toISOString()
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function importAcceptedSubmissions_(sourceSpreadsheetId, sourceSheetName) {
  setupAuthorHub_();
  const source = SpreadsheetApp.openById(String(sourceSpreadsheetId));
  const sheet = source.getSheetByName(String(sourceSheetName || source.getSheets()[0].getName()));
  if (!sheet) throw new Error('Source sheet not found.');
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { imported: 0 };
  const headerInfo = detectHeaderRow_(values, ['id', 'title']);
  const headers = headerInfo.headers;
  const index = headerIndex_(headers);
  const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
  const titleCol = firstHeaderIndex_(index, ['original title', 'paper title', 'submission title', 'title']);
  if (idCol < 0 || titleCol < 0) throw new Error('The source must include an ID column and a Title column.');
  const trackCol = firstHeaderIndex_(index, ['track', 'submission type', 'category', 'type']);
  const volumeCol = firstHeaderIndex_(index, ['volume']);
  const authorCol = firstHeaderIndex_(index, ['corresponding author', 'contact author']);
  const emailCol = firstHeaderIndex_(index, ['corresponding email', 'contact email', 'email']);
  const finalTitleCol = firstHeaderIndex_(index, ['final title']);
  let imported = 0;
  for (let r = headerInfo.row + 1; r < values.length; r += 1) {
    const row = values[r];
    const paperId = normalizePaperId_(row[idCol]);
    const title = String(row[titleCol] || '').trim();
    if (!paperId || !title) continue;
    const track = trackCol >= 0 ? normalizeTrack_(row[trackCol]) : '';
    upsertSubmission_({
      'Paper ID': paperId,
      'Original Title': title,
      'Final Title': finalTitleCol >= 0 ? row[finalTitleCol] : title,
      'Track': track,
      'Volume': volumeCol >= 0 ? row[volumeCol] : inferredVolume_(track),
      'Corresponding Author': authorCol >= 0 ? row[authorCol] : '',
      'Corresponding Email': emailCol >= 0 ? row[emailCol] : '',
      'Portal Enabled': true
    });
    imported += 1;
  }
  refreshAdminDashboard_();
  return { imported: imported, sourceSheet: sheet.getName() };
}

function importReviewerFeedback_(sourceSpreadsheetId, sourceSheetName, append) {
  setupAuthorHub_();
  const source = SpreadsheetApp.openById(String(sourceSpreadsheetId));
  const sheet = source.getSheetByName(String(sourceSheetName || source.getSheets()[0].getName()));
  if (!sheet) throw new Error('Reviewer source sheet not found.');
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { imported: 0 };
  const headerInfo = detectHeaderRow_(values, ['id', 'reviewer comment']);
  const index = headerIndex_(headerInfo.headers);
  const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
  const reviewCol = firstHeaderIndex_(index, ['review', 'review label', 'reviewer']);
  const commentCol = firstHeaderIndex_(index, ['reviewer comment', 'comment to author', 'author comment']);
  if (idCol < 0 || commentCol < 0) {
    throw new Error('The reviewer sheet must include Submission ID/ID and Reviewer Comment columns.');
  }
  if (!append) clearDataRows_(SHEETS.REVIEWER_FEEDBACK);
  let imported = 0;
  for (let r = headerInfo.row + 1; r < values.length; r += 1) {
    const paperId = normalizePaperId_(values[r][idCol]);
    const comment = String(values[r][commentCol] || '').trim();
    if (!paperId || !comment) continue;
    appendObject_(SHEETS.REVIEWER_FEEDBACK, {
      'Paper ID': paperId,
      'Review Label': reviewCol >= 0 ? String(values[r][reviewCol] || '') : '',
      'Reviewer Comment': comment,
      'Source': source.getName() + ' / ' + sheet.getName(),
      'Imported At': new Date()
    });
    imported += 1;
  }
  return { imported: imported, sourceSheet: sheet.getName(), committeeOnlyNotesImported: false };
}

function syncReviewerFeedbackFromConfiguredSheet_() {
  const cfg = getConfig_();
  if (!cfg.REVIEWER_SOURCE_SPREADSHEET_ID) throw new Error('Set REVIEWER_SOURCE_SPREADSHEET_ID in the Settings sheet.');
  return importReviewerFeedback_(cfg.REVIEWER_SOURCE_SPREADSHEET_ID, cfg.REVIEWER_SOURCE_SHEET_NAME, false);
}

function detectHeaderRow_(values, requiredTerms) {
  const scan = Math.min(values.length, 25);
  for (let r = 0; r < scan; r += 1) {
    const headers = values[r].map(function (value) { return normalizeHeader_(value); });
    const joined = headers.join('|');
    if (requiredTerms.every(function (term) { return joined.indexOf(normalizeHeader_(term)) !== -1; })) {
      return { row: r, headers: headers };
    }
  }
  return { row: 0, headers: values[0].map(function (value) { return normalizeHeader_(value); }) };
}

function normalizeHeader_(value) {
  return String(value == null ? '' : value).trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function headerIndex_(headers) {
  const index = {};
  headers.forEach(function (header, i) { if (header) index[header] = i; });
  return index;
}

function firstHeaderIndex_(index, aliases) {
  for (let i = 0; i < aliases.length; i += 1) {
    const key = normalizeHeader_(aliases[i]);
    if (Object.prototype.hasOwnProperty.call(index, key)) return index[key];
  }
  return -1;
}

/**
 * Provisions submission folders in small, non-overlapping batches.
 * A script lock and one-time continuation trigger prevent duplicate folders
 * when a Drive batch takes longer than expected.
 */
function deleteFolderProvisioningTriggers_() {
  ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === 'continueFolderProvisioning_';
  }).forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
}

function scheduleFolderProvisioningContinuation_() {
  deleteFolderProvisioningTriggers_();
  ScriptApp.newTrigger('continueFolderProvisioning_')
    .timeBased()
    .after(45 * 1000)
    .create();
}

function startFolderProvisioning_() {
  setupAuthorHub_();
  stopFolderProvisioning_();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('FOLDER_PROVISION_NEXT_ROW', '2');
  props.deleteProperty('FOLDER_PROVISION_LAST_ERROR');
  return continueFolderProvisioning_();
}

function continueFolderProvisioning_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { done: false, busy: true, message: 'Another folder-provisioning batch is still running.' };
  }

  const props = PropertiesService.getScriptProperties();
  try {
    deleteFolderProvisioningTriggers_();

    const nextRow = Number(props.getProperty('FOLDER_PROVISION_NEXT_ROW') || 2);
    const sheet = getSheet_(SHEETS.SUBMISSIONS);
    const lastRow = sheet.getLastRow();
    if (nextRow > lastRow) {
      stopFolderProvisioning_();
      return { done: true, processed: 0, nextRow: nextRow, lastRow: lastRow };
    }

    const headers = getHeaders_(sheet);
    const idIndex = headers.indexOf('Paper ID');
    const enabledIndex = headers.indexOf('Portal Enabled');
    const batchSize = 4;
    const batchEnd = Math.min(lastRow, nextRow + batchSize - 1);
    const values = sheet.getRange(
      nextRow,
      1,
      batchEnd - nextRow + 1,
      headers.length
    ).getValues();

    let processed = 0;
    values.forEach(function (row) {
      const paperId = normalizePaperId_(row[idIndex]);
      const enabled = enabledIndex < 0 ? true : parseBoolean_(row[enabledIndex], true);
      if (paperId && enabled) {
        ensureSubmissionFolders_(paperId);
        processed += 1;
      }
    });

    const followingRow = batchEnd + 1;
    props.setProperty('FOLDER_PROVISION_NEXT_ROW', String(followingRow));
    props.deleteProperty('FOLDER_PROVISION_LAST_ERROR');

    const done = batchEnd >= lastRow;
    if (done) stopFolderProvisioning_();
    else scheduleFolderProvisioningContinuation_();

    const result = {
      done: done,
      processed: processed,
      nextRow: followingRow,
      lastRow: lastRow
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    props.setProperty(
      'FOLDER_PROVISION_LAST_ERROR',
      String(err && (err.stack || err.message) || err)
    );
    stopFolderProvisioning_();
    throw err;
  } finally {
    lock.releaseLock();
  }
}

function stopFolderProvisioning_() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('FOLDER_PROVISION_NEXT_ROW');
  deleteFolderProvisioningTriggers_();
}

function folderProvisionStatus_() {
  const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
    return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
  });
  const provisioned = submissions.filter(function (row) {
    return String(row['Submission Folder ID'] || '').trim();
  }).length;
  const props = PropertiesService.getScriptProperties();
  const result = {
    acceptedSubmissions: submissions.length,
    provisionedPaperFolders: provisioned,
    remaining: Math.max(0, submissions.length - provisioned),
    nextRow: props.getProperty('FOLDER_PROVISION_NEXT_ROW') || '',
    activeContinuationTriggers: ScriptApp.getProjectTriggers().filter(function (trigger) {
      return trigger.getHandlerFunction() === 'continueFolderProvisioning_';
    }).length,
    lastError: props.getProperty('FOLDER_PROVISION_LAST_ERROR') || '',
    done: submissions.length > 0 && provisioned === submissions.length
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * One-time safe migration for the new 08_Project_Poster folder.
 *
 * This migration creates only the missing 08_Project_Poster subfolder and its
 * Folder_Registry row. It does not rename, move, delete, or rewrite any
 * existing submission files or existing folder records.
 */
function deleteProjectPosterFolderProvisioningTriggers_() {
  ScriptApp.getProjectTriggers().filter(function (trigger) {
    return trigger.getHandlerFunction() === 'continueProjectPosterFolderProvisioning_';
  }).forEach(function (trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
}

function scheduleProjectPosterFolderProvisioningContinuation_() {
  deleteProjectPosterFolderProvisioningTriggers_();
  ScriptApp.newTrigger('continueProjectPosterFolderProvisioning_')
    .timeBased()
    .after(30 * 1000)
    .create();
}

function startProjectPosterFolderProvisioning_() {
  stopProjectPosterFolderProvisioning_();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('PROJECT_POSTER_FOLDER_NEXT_ROW', '2');
  props.deleteProperty('PROJECT_POSTER_FOLDER_LAST_ERROR');
  return continueProjectPosterFolderProvisioning_();
}

function continueProjectPosterFolderProvisioning_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { done: false, busy: true, message: 'Another Project poster folder batch is still running.' };
  }

  const props = PropertiesService.getScriptProperties();
  try {
    deleteProjectPosterFolderProvisioningTriggers_();

    const sheet = getSheet_(SHEETS.SUBMISSIONS);
    const headers = getHeaders_(sheet);
    const idIndex = headers.indexOf('Paper ID');
    const rootIndex = headers.indexOf('Submission Folder ID');
    const enabledIndex = headers.indexOf('Portal Enabled');
    if (idIndex < 0 || rootIndex < 0) {
      throw new Error('Submissions sheet is missing Paper ID or Submission Folder ID.');
    }

    const nextRow = Number(props.getProperty('PROJECT_POSTER_FOLDER_NEXT_ROW') || 2);
    const lastRow = sheet.getLastRow();
    if (nextRow > lastRow) {
      stopProjectPosterFolderProvisioning_();
      return projectPosterFolderProvisionStatus_();
    }

    const existingPosterRows = findObjects_(SHEETS.FOLDERS, function (row) {
      return String(row['Folder Role'] || '') === 'PROJECT_POSTER';
    });
    const existingByPaper = {};
    existingPosterRows.forEach(function (row) {
      existingByPaper[normalizePaperId_(row['Paper ID'])] = row;
    });

    const batchSize = 12;
    const batchEnd = Math.min(lastRow, nextRow + batchSize - 1);
    const values = sheet.getRange(
      nextRow,
      1,
      batchEnd - nextRow + 1,
      headers.length
    ).getValues();

    let created = 0;
    let alreadyPresent = 0;
    let skipped = 0;

    values.forEach(function (row) {
      const paperId = normalizePaperId_(row[idIndex]);
      const rootId = String(row[rootIndex] || '').trim();
      const enabled = enabledIndex < 0 ? true : parseBoolean_(row[enabledIndex], true);

      if (!paperId || !enabled) {
        skipped += 1;
        return;
      }
      if (!rootId) {
        skipped += 1;
        return;
      }

      const registry = existingByPaper[paperId];
      if (registry && String(registry['Folder ID'] || '').trim()) {
        try {
          const meta = driveGetMetadata_(registry['Folder ID'], 'id,name,mimeType,parents,trashed');
          if (!meta.trashed &&
              meta.mimeType === 'application/vnd.google-apps.folder' &&
              String(meta.name || '') === '08_Project_Poster' &&
              (meta.parents || []).indexOf(rootId) !== -1) {
            alreadyPresent += 1;
            return;
          }
        } catch (ignore) {}
      }

      const folder = driveEnsureFolder_(rootId, '08_Project_Poster');
      upsertFolderRegistry_(paperId, 'PROJECT_POSTER', folder);
      existingByPaper[paperId] = {
        'Paper ID': paperId,
        'Folder Role': 'PROJECT_POSTER',
        'Folder ID': folder.id,
        'Folder Name': folder.name
      };
      created += 1;
    });

    const followingRow = batchEnd + 1;
    props.setProperty('PROJECT_POSTER_FOLDER_NEXT_ROW', String(followingRow));
    props.deleteProperty('PROJECT_POSTER_FOLDER_LAST_ERROR');

    const done = batchEnd >= lastRow;
    if (done) stopProjectPosterFolderProvisioning_();
    else scheduleProjectPosterFolderProvisioningContinuation_();

    const result = {
      done: done,
      processedRows: batchEnd - nextRow + 1,
      created: created,
      alreadyPresent: alreadyPresent,
      skipped: skipped,
      nextRow: followingRow,
      lastRow: lastRow
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    props.setProperty(
      'PROJECT_POSTER_FOLDER_LAST_ERROR',
      String(err && (err.stack || err.message) || err)
    );
    stopProjectPosterFolderProvisioning_();
    throw err;
  } finally {
    lock.releaseLock();
  }
}

function stopProjectPosterFolderProvisioning_() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('PROJECT_POSTER_FOLDER_NEXT_ROW');
  deleteProjectPosterFolderProvisioningTriggers_();
}

function projectPosterFolderProvisionStatus_() {
  const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
    return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
  });

  const posterFolders = {};
  findObjects_(SHEETS.FOLDERS, function (row) {
    return String(row['Folder Role'] || '') === 'PROJECT_POSTER' &&
      Boolean(String(row['Folder ID'] || '').trim());
  }).forEach(function (row) {
    posterFolders[normalizePaperId_(row['Paper ID'])] = String(row['Folder ID'] || '');
  });

  const missing = submissions.filter(function (row) {
    return !posterFolders[normalizePaperId_(row['Paper ID'])];
  }).map(function (row) {
    return normalizePaperId_(row['Paper ID']);
  });

  const props = PropertiesService.getScriptProperties();
  const result = {
    enabledSubmissions: submissions.length,
    projectPosterFolders: Object.keys(posterFolders).length,
    missingCount: missing.length,
    missingPaperIds: missing,
    nextRow: props.getProperty('PROJECT_POSTER_FOLDER_NEXT_ROW') || '',
    activeContinuationTriggers: ScriptApp.getProjectTriggers().filter(function (trigger) {
      return trigger.getHandlerFunction() === 'continueProjectPosterFolderProvisioning_';
    }).length,
    lastError: props.getProperty('PROJECT_POSTER_FOLDER_LAST_ERROR') || '',
    done: submissions.length > 0 && missing.length === 0
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}


function refreshAdminDashboard_() {
  const masterId = PropertiesService.getScriptProperties().getProperty('MASTER_SPREADSHEET_ID');
  if (!masterId) return { rows: 0 };
  const submissions = sheetObjects_(SHEETS.SUBMISSIONS);
  const tasks = sheetObjects_(SHEETS.TASKS);
  const activity = sheetObjects_(SHEETS.ACTIVITY);
  const byPaperTask = {};
  tasks.forEach(function (row) {
    const id = normalizePaperId_(row['Paper ID']);
    byPaperTask[id] = byPaperTask[id] || {};
    byPaperTask[id][String(row['Task ID'])] = String(row.Status || '');
  });
  const lastActivity = {};
  activity.forEach(function (row) {
    const id = normalizePaperId_(row['Paper ID']);
    const date = row.Timestamp ? new Date(row.Timestamp) : null;
    if (date && (!lastActivity[id] || date > lastActivity[id])) lastActivity[id] = date;
  });
  const sheet = getSheet_(SHEETS.DASHBOARD);
  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, SHEET_HEADERS[SHEETS.DASHBOARD].length).clearContent();
  const output = submissions.map(function (submission) {
    const id = normalizePaperId_(submission['Paper ID']);
    const status = byPaperTask[id] || {};
    return [
      id, submission['Final Title'] || submission['Original Title'], submission.Track,
      status.feedback || '', status.metadata || '', status.camera_ready || '',
      status.consent || '', status.attendance || '', status.indexing || '',
      status.registration || '', status.author_proof || '', submission['Overall Status'] || '', lastActivity[id] || ''
    ];
  });
  if (output.length) sheet.getRange(2, 1, output.length, output[0].length).setValues(output);
  formatDataSheet_(sheet, SHEET_HEADERS[SHEETS.DASHBOARD].length);
  return { rows: output.length };
}

function adminSetTaskStatus_(paperId, taskId, status, note) {
  const result = setTaskStatus_(paperId, taskId, status, { note: note || '', clearNote: status !== 'Action required' });
  logActivity_(paperId, 'Chair status update', taskId, status + (note ? ': ' + note : ''));
  refreshAdminDashboard_();
  return result;
}

function adminSetPortalEnabled_(paperId, enabled) {
  const submission = requireSubmission_(paperId);
  updateObjectRow_(SHEETS.SUBMISSIONS, submission.__row, {
    'Portal Enabled': Boolean(enabled),
    'Last Updated': new Date()
  });
  logActivity_(paperId, enabled ? 'Portal enabled' : 'Portal disabled', '', 'Updated by chair.');
  return Boolean(enabled);
}

/** Chair-only deployment-readiness report. Does not expose private file URLs. */
function systemReadinessCheck_() {
  const issues = [];
  const warnings = [];
  let cfg;
  try {
    cfg = getConfig_();
  } catch (err) {
    return { ready: false, issues: ['Configuration could not be loaded: ' + err.message], warnings: [], checkedAt: new Date().toISOString() };
  }

  const requiredText = [
    ['MASTER_SPREADSHEET_ID', cfg.MASTER_SPREADSHEET_ID],
    ['PROOF_FORM_ID', cfg.PROOF_FORM_ID],
    ['ROOT_FOLDER_ID', cfg.ROOT_FOLDER_ID],
    ['REGISTRATION_URL', cfg.REGISTRATION_URL],
    ['INDEXING_URL', cfg.INDEXING_URL],
    ['CONTACT_EMAIL', cfg.CONTACT_EMAIL],
    ['PAPER_TEMPLATE_FILE_ID', cfg.PAPER_TEMPLATE_FILE_ID],
    ['PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID', cfg.PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID],
    ['PROJECT_POSTER_TEMPLATE_FILE_ID', cfg.PROJECT_POSTER_TEMPLATE_FILE_ID],
    ['PROJECT_POSTER_INSTRUCTIONS_FILE_ID', cfg.PROJECT_POSTER_INSTRUCTIONS_FILE_ID],
    ['PROJECT_POSTER_DEADLINE_LABEL', cfg.PROJECT_POSTER_DEADLINE_LABEL],
    ['PUBLICATION_INSTRUCTIONS_FILE_ID', cfg.PUBLICATION_INSTRUCTIONS_FILE_ID],
    ['CONSENT_PDF_FILE_ID', cfg.CONSENT_PDF_FILE_ID],
    ['BANNER_FILE_ID', cfg.BANNER_FILE_ID],
    ['REGISTRATION_DEADLINE_ISO_UTC', cfg.REGISTRATION_DEADLINE_ISO_UTC],
    ['REGISTRATION_DEADLINE_LABEL', cfg.REGISTRATION_DEADLINE_LABEL],
    ['EARLY_BIRD_REGISTRATION_DEADLINE_LABEL', cfg.EARLY_BIRD_REGISTRATION_DEADLINE_LABEL]
  ];
  requiredText.forEach(function (entry) {
    if (!String(entry[1] || '').trim()) issues.push(entry[0] + ' is not configured.');
  });

  const driveChecks = [
    ['ROOT_FOLDER_ID', cfg.ROOT_FOLDER_ID, 'application/vnd.google-apps.folder'],
    ['SUBMISSION_ROOT_FOLDER_ID', cfg.SUBMISSION_ROOT_FOLDER_ID, 'application/vnd.google-apps.folder'],
    ['TRACK_FOLDER_PROJECTS', cfg.TRACK_FOLDER_PROJECTS, 'application/vnd.google-apps.folder'],
    ['TRACK_FOLDER_FULL_PAPER', cfg.TRACK_FOLDER_FULL_PAPER, 'application/vnd.google-apps.folder'],
    ['TRACK_FOLDER_FIELD_NOTE', cfg.TRACK_FOLDER_FIELD_NOTE, 'application/vnd.google-apps.folder'],
    ['TRACK_FOLDER_PHD_WORKSHOP', cfg.TRACK_FOLDER_PHD_WORKSHOP, 'application/vnd.google-apps.folder'],
    ['BANNER_FILE_ID', cfg.BANNER_FILE_ID, ''],
    ['PAPER_TEMPLATE_FILE_ID', cfg.PAPER_TEMPLATE_FILE_ID, ''],
    ['PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID', cfg.PROJECT_FIELD_NOTE_TEMPLATE_FILE_ID, ''],
    ['PROJECT_POSTER_TEMPLATE_FILE_ID', cfg.PROJECT_POSTER_TEMPLATE_FILE_ID, ''],
    ['PROJECT_POSTER_INSTRUCTIONS_FILE_ID', cfg.PROJECT_POSTER_INSTRUCTIONS_FILE_ID, 'application/pdf'],
    ['PUBLICATION_INSTRUCTIONS_FILE_ID', cfg.PUBLICATION_INSTRUCTIONS_FILE_ID, ''],
    ['CONSENT_PDF_FILE_ID', cfg.CONSENT_PDF_FILE_ID, '']
  ];
  driveChecks.forEach(function (entry) {
    if (!entry[1]) return;
    try {
      const meta = driveGetMetadata_(entry[1], 'id,name,mimeType,trashed');
      if (meta.trashed) issues.push(entry[0] + ' points to a trashed Drive item.');
      if (entry[2] && meta.mimeType !== entry[2]) issues.push(entry[0] + ' has the wrong Drive item type.');
    } catch (err) {
      issues.push(entry[0] + ' could not be accessed: ' + err.message);
    }
  });

  let submissions = 0;
  let reviews = 0;
  let taskRows = 0;
  let expectedTaskRows = 0;
  let paperRoots = 0;
  try {
    const enabledSubmissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
      return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
    });
    submissions = enabledSubmissions.length;
    expectedTaskRows = enabledSubmissions.reduce(function (total, row) {
      return total + taskDefinitionsForTrack_(row.Track).length;
    }, 0);
    reviews = sheetObjects_(SHEETS.REVIEWER_FEEDBACK).filter(function (row) {
      return normalizePaperId_(row['Paper ID']) && String(row['Reviewer Comment'] || '').trim();
    }).length;
    taskRows = sheetObjects_(SHEETS.TASKS).length;
    const paperRootIds = {};
    sheetObjects_(SHEETS.FOLDERS).forEach(function (row) {
      if (String(row['Folder Role']) !== 'PAPER_ROOT') return;
      const paperId = normalizePaperId_(row['Paper ID']);
      const folderId = String(row['Folder ID'] || '').trim();
      if (paperId && folderId) paperRootIds[paperId] = folderId;
    });
    paperRoots = Object.keys(paperRootIds).length;
  } catch (err) {
    issues.push('Master Sheet data could not be read: ' + err.message);
  }

  if (!submissions) issues.push('No accepted submissions have been imported.');
  if (submissions && taskRows < expectedTaskRows) {
    warnings.push('Some submissions may be missing task rows. Run the accepted-submission import again.');
  }
  if (submissions && paperRoots < submissions) {
    warnings.push((submissions - paperRoots) + ' submission folder(s) have not yet been provisioned.');
  }
  if (!reviews) warnings.push('No author-visible reviewer comments are currently loaded.');
  if (!ScriptApp.getService().getUrl()) warnings.push('The project has not yet been deployed as a Web app.');
  if (new Date(cfg.CAMERA_READY_DEADLINE_ISO_UTC).getTime() <= Date.now()) {
    warnings.push('The configured camera-ready deadline has already passed.');
  }

  warnings.push('Public sharing for the banner and author-download files must be checked manually: Anyone with the link — Viewer.');
  warnings.push('A real 1 GB camera-ready ZIP pilot is required before opening the portal to all authors.');

  const report = {
    ready: issues.length === 0,
    issues: issues,
    warnings: warnings,
    counts: {
      acceptedSubmissions: submissions,
      reviewerComments: reviews,
      taskRows: taskRows,
      provisionedPaperFolders: paperRoots
    },
    deadline: cfg.CAMERA_READY_DEADLINE_LABEL,
    deployedUrl: ScriptApp.getService().getUrl() || '',
    masterSpreadsheetUrl: cfg.MASTER_SPREADSHEET_ID ? 'https://docs.google.com/spreadsheets/d/' + cfg.MASTER_SPREADSHEET_ID + '/edit' : '',
    checkedAt: new Date().toISOString()
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

/**
 * Adds the new attendance task without replacing or clearing any author-entered
 * records. The function is idempotent and safe to run more than once.
 *
 * Run this from the Apps Script editor BEFORE deploying the new web-app version.
 * The currently deployed /exec version continues to serve authors while this
 * migration runs.
 */
function migrateAddAttendanceTaskSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Another administrative update is running. Wait one minute and retry.');

  try {
    const cfg = getConfig_();
    const master = getMasterSpreadsheet_();
    const masterId = master.getId();

    // Snapshot the complete Master Sheet before changing its structure.
    const systemFolderId = String(cfg.SYSTEM_FOLDER_ID || '').trim();
    const backupFolder = systemFolderId
      ? driveEnsureFolder_(systemFolderId, '06_Backups')
      : driveEnsureFolder_(String(cfg.ROOT_FOLDER_ID), '00_SYSTEM_DO_NOT_SHARE');
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Etc/UTC', 'yyyyMMdd-HHmmss');
    const backup = driveCopyFile_(
      masterId,
      backupFolder.id,
      "__ACADIA_TEXT_t0022__" + stamp
    );

    ensureAttendanceSheet_();
    upsertDefaultSettings_(master, {});
    invalidateConfigCache_();

    const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
      return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
    });

    // Add only the missing Task_Status rows. Existing statuses, timestamps,
    // action-required notes, and submitted records are never rewritten.
    const taskSheet = getSheet_(SHEETS.TASKS);
    const existingTasks = sheetObjects_(SHEETS.TASKS);
    const attendanceTaskKeys = {};
    existingTasks.forEach(function (row) {
      if (String(row['Task ID']) === 'attendance') {
        attendanceTaskKeys[normalizePaperId_(row['Paper ID'])] = true;
      }
    });
    const taskHeaders = getHeaders_(taskSheet);
    const taskRowsToAdd = [];
    submissions.forEach(function (submission) {
      const paperId = normalizePaperId_(submission['Paper ID']);
      if (attendanceTaskKeys[paperId]) return;
      const object = {
        'Paper ID': paperId,
        'Task ID': 'attendance',
        'Task Name': 'Confirm your attendance',
        'Status': 'Not started',
        'Submitted At': '',
        'Approved At': '',
        'Action Required Note': '',
        'Last Updated': new Date()
      };
      taskRowsToAdd.push(taskHeaders.map(function (header) {
        return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
      }));
    });
    if (taskRowsToAdd.length) {
      taskSheet.getRange(taskSheet.getLastRow() + 1, 1, taskRowsToAdd.length, taskHeaders.length).setValues(taskRowsToAdd);
    }

    // Seed the dedicated Attendance tab with the presenter already stored by
    // Task 2, but do not infer or mark attendance as confirmed.
    const attendanceSheet = ensureAttendanceSheet_();
    const existingAttendance = sheetObjects_(SHEETS.ATTENDANCE);
    const attendanceKeys = {};
    existingAttendance.forEach(function (row) {
      attendanceKeys[normalizePaperId_(row['Paper ID'])] = true;
    });
    const attendanceHeaders = getHeaders_(attendanceSheet);
    const attendanceRowsToAdd = [];
    submissions.forEach(function (submission) {
      const paperId = normalizePaperId_(submission['Paper ID']);
      if (attendanceKeys[paperId]) return;
      const object = {
        'Paper ID': paperId,
        'Attendance Confirmed': false,
        'Presenter Name': String(submission['Presenting Author'] || ''),
        'Presenter Email': String(submission['Presenting Email'] || ''),
        'Confirmed At': '',
        'Last Updated': new Date()
      };
      attendanceRowsToAdd.push(attendanceHeaders.map(function (header) {
        return Object.prototype.hasOwnProperty.call(object, header) ? object[header] : '';
      }));
    });
    if (attendanceRowsToAdd.length) {
      attendanceSheet.getRange(attendanceSheet.getLastRow() + 1, 1, attendanceRowsToAdd.length, attendanceHeaders.length).setValues(attendanceRowsToAdd);
    }

    // Admin_Dashboard is derived data. Rebuild it with the new Attendance
    // column; no author-entered source data is cleared or replaced.
    const dashboard = getSheet_(SHEETS.DASHBOARD);
    const dashboardHeaders = SHEET_HEADERS[SHEETS.DASHBOARD];
    if (dashboard.getMaxColumns() < dashboardHeaders.length) {
      dashboard.insertColumnsAfter(dashboard.getMaxColumns(), dashboardHeaders.length - dashboard.getMaxColumns());
    }
    if (dashboard.getFilter()) dashboard.getFilter().remove();
    dashboard.getRange(1, 1, 1, dashboardHeaders.length).setValues([dashboardHeaders]);
    if (dashboard.getLastRow() > 1) {
      dashboard.getRange(2, 1, dashboard.getLastRow() - 1, dashboard.getMaxColumns()).clearContent();
    }
    formatDataSheet_(dashboard, dashboardHeaders.length);

    // Recompute only derived overall-status and dashboard values.
    submissions.forEach(function (submission) {
      updateSubmissionOverallStatus_(submission['Paper ID']);
    });
    refreshAdminDashboard_();

    const afterTaskRows = sheetObjects_(SHEETS.TASKS);
    const attendanceTaskCount = afterTaskRows.filter(function (row) {
      return String(row['Task ID']) === 'attendance';
    }).length;
    const result = {
      backupFileId: backup.id,
      backupUrl: 'https://drive.google.com/file/d/' + backup.id + '/view',
      acceptedSubmissions: submissions.length,
      existingTaskRowsBefore: existingTasks.length,
      attendanceTaskRowsAdded: taskRowsToAdd.length,
      attendanceTaskRowsTotal: attendanceTaskCount,
      attendanceRecordsAdded: attendanceRowsToAdd.length,
      attendanceRecordsTotal: sheetObjects_(SHEETS.ATTENDANCE).length,
      taskRowsAfter: afterTaskRows.length,
      expectedTaskRows: submissions.length * TASK_DEFINITIONS.length,
      existingAuthorDataReplaced: false,
      completedAt: new Date().toISOString()
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function attendanceMigrationStatus_() {
  const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
    return normalizePaperId_(row['Paper ID']) && parseBoolean_(row['Portal Enabled'], true);
  });
  const tasks = sheetObjects_(SHEETS.TASKS);
  const attendanceTasks = tasks.filter(function (row) { return String(row['Task ID']) === 'attendance'; });
  const attendanceSheet = getMasterSpreadsheet_().getSheetByName(SHEETS.ATTENDANCE);
  const attendanceRecords = attendanceSheet ? sheetObjects_(SHEETS.ATTENDANCE).length : 0;
  const result = {
    acceptedSubmissions: submissions.length,
    totalTaskRows: tasks.length,
    expectedTaskRows: submissions.length * TASK_DEFINITIONS.length,
    attendanceTaskRows: attendanceTasks.length,
    attendanceRecords: attendanceRecords,
    readyToDeploy: submissions.length > 0 && attendanceTasks.length === submissions.length && attendanceRecords === submissions.length
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}


/******************************************************************************
 * SOURCE: VisaInvitationLetters.gs
 ******************************************************************************/

/**
 * International-author invitation-letter module.
 *
 * The dashboard card is informational only. Authors click the card button to
 * open a modal, enter a full legal name, and download a personalized PDF.
 * Every generated PDF is archived privately and logged in Visa_Letter_Log.
 *
 * This module does not create or update Task_Status records and therefore does
 * not affect the seven required tasks, progress, or existing author data.
 */

function ensureVisaLetterLogSheet_() {
  const spreadsheet = getMasterSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(SHEETS.VISA_LETTERS);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEETS.VISA_LETTERS);
    const headers = SHEET_HEADERS[SHEETS.VISA_LETTERS];
    if (sheet.getMaxColumns() < headers.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatDataSheet_(sheet, headers.length);
  }
  return sheet;
}

function appendSettingIfMissing_(key, value, notes) {
  const sheet = getSheet_(SHEETS.SETTINGS);
  const rows = sheetObjects_(SHEETS.SETTINGS);
  const existing = rows.find(function (row) {
    return String(row.Key || '').trim() === String(key || '').trim();
  });
  if (existing) return { added: false, row: existing.__row, value: existing.Value };
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 3).setValues([[
    String(key || ''),
    value == null ? '' : value,
    String(notes || '')
  ]]);
  return { added: true, row: row, value: value };
}

function normalizeVisaApplicantName_(value) {
  const name = String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 2) throw new Error('Enter the full legal name exactly as shown on the passport.');
  if (name.length > 160) throw new Error('The legal name is too long.');
  if (/[\u0000-\u001F\u007F]/.test(name)) throw new Error('The legal name contains unsupported characters.');
  return name;
}

function visaSafeFilePart_(value, fallback) {
  let text = String(value == null ? '' : value).trim();
  try { text = text.normalize('NFKD'); } catch (err) {}
  text = text
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .slice(0, 80);
  return text || String(fallback || 'author');
}

function visaSheetText_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function visaTemplateValues_(submission, authorName) {
  const cfg = getConfig_();
  return {
    '{{AUTHOR_NAME}}': authorName,
    '{{PAPER_TITLE}}': String(submission['Final Title'] || submission['Original Title'] || ''),
    '{{PAPER_ID}}': normalizePaperId_(submission['Paper ID']),
    '{{TRACK}}': String(submission.Track || ''),
    '{{VOLUME}}': String(submission.Volume || ''),
    '{{DATE}}': Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy'),
    '{{CONFERENCE_NAME}}': String(cfg.CONFERENCE_NAME || ''),
    '{{CONFERENCE_LOCATION}}': String(cfg.CONFERENCE_LOCATION || ''),
    '{{WORKSHOP_DATES}}': String(cfg.WORKSHOP_DATES || ''),
    '{{CONFERENCE_DATES}}': String(cfg.CONFERENCE_DATES || ''),
    '{{CONTACT_EMAIL}}': String(cfg.CONTACT_EMAIL || ''),
    '{{SITE_CHAIRS}}': String(cfg.SITE_CHAIRS || '').split('|').filter(Boolean).join(', '),
    '{{TECHNICAL_CHAIRS}}': String(cfg.TECHNICAL_CHAIRS || '').split('|').filter(Boolean).join(', ')
  };
}

function escapeRegexForDocs_(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceVisaTokensInElement_(element, values) {
  if (!element) return;
  Object.keys(values).forEach(function (token) {
    element.replaceText(escapeRegexForDocs_(token), String(values[token] == null ? '' : values[token]));
  });
}

function populateVisaTemplate_(documentId, values) {
  const doc = DocumentApp.openById(documentId);
  replaceVisaTokensInElement_(doc.getBody(), values);
  try { replaceVisaTokensInElement_(doc.getHeader(), values); } catch (err) {}
  try { replaceVisaTokensInElement_(doc.getFooter(), values); } catch (err) {}
  doc.saveAndClose();
}

function matchVisaApplicantEmail_(paperId, authorName) {
  const target = normalizeTitle_(authorName);
  if (!target) return '';
  const authors = getAuthors_(paperId);
  for (let i = 0; i < authors.length; i += 1) {
    if (normalizeTitle_(authors[i].name) === target) return String(authors[i].email || '');
  }
  return '';
}

function ensureVisaArchiveFolder_() {
  const cfg = getConfig_();
  let folderId = String(cfg.VISA_LETTER_ARCHIVE_FOLDER_ID || '').trim();
  if (folderId) {
    try {
      const metadata = driveGetMetadata_(folderId, 'id,name,mimeType,trashed');
      if (metadata && !metadata.trashed && metadata.mimeType === 'application/vnd.google-apps.folder') {
        return metadata;
      }
    } catch (err) {
      console.warn('Configured visa-letter archive folder is unavailable: ' + err.message);
    }
  }

  const systemFolderId = String(cfg.SYSTEM_FOLDER_ID || '').trim();
  if (!systemFolderId) {
    throw new Error('The Author Hub system folder is not configured. Run the visa-letter module setup from the Apps Script editor.');
  }
  const folder = driveEnsureFolder_(systemFolderId, '07_Visa_Invitation_Letters');
  setSettingsValues_({ VISA_LETTER_ARCHIVE_FOLDER_ID: folder.id });
  return folder;
}

function visaPaperArchiveFolder_(archiveFolderId, submission) {
  const name = 'PAPER-' + normalizePaperId_(submission['Paper ID']) + '__' +
    visaSafeFilePart_(submission['Original Title'] || submission['Final Title'], 'submission').slice(0, 60);
  return driveEnsureFolder_(archiveFolderId, name);
}

function generateVisaInvitationLetter(sessionToken, payload) {
  const session = requireAuthorSession_(sessionToken);
  const cfg = getConfig_();
  if (!parseBoolean_(cfg.VISA_LETTER_ENABLED, false)) {
    throw new Error('The invitation-letter service is not currently available.');
  }

  const templateId = String(cfg.VISA_LETTER_TEMPLATE_DOC_ID || '').trim();
  if (!templateId) throw new Error('The invitation-letter template has not been configured.');

  const authorName = normalizeVisaApplicantName_(payload && payload.authorName);
  const submission = requireSubmission_(session.paperId);
  const paperId = normalizePaperId_(submission['Paper ID']);
  const title = String(submission['Final Title'] || submission['Original Title'] || '').trim();
  const authorEmail = matchVisaApplicantEmail_(paperId, authorName);
  const archiveRoot = ensureVisaArchiveFolder_();
  const paperFolder = visaPaperArchiveFolder_(archiveRoot.id, submission);

  const requestId = Utilities.getUuid();
  const stamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || "__ACADIA_TEXT_t0023__",
    'yyyyMMdd-HHmmss'
  );
  const safeAuthor = visaSafeFilePart_(authorName, 'author');
  const pdfName = "__ACADIA_TEXT_t0024__" + paperId + '_' + safeAuthor + '_' + stamp + '.pdf';
  const tempDocName = 'TEMP_Visa_Letter_' + paperId + '_' + requestId;

  let tempDocId = '';
  try {
    const templateMeta = driveGetMetadata_(templateId, 'id,name,mimeType,trashed');
    if (!templateMeta || templateMeta.trashed) throw new Error('The invitation-letter template is unavailable.');
    if (templateMeta.mimeType !== 'application/vnd.google-apps.document') {
      throw new Error('The invitation-letter template must be a native Google Doc.');
    }

    const copy = driveCopyFile_(templateId, paperFolder.id, tempDocName);
    tempDocId = copy.id;

    populateVisaTemplate_(tempDocId, visaTemplateValues_(submission, authorName));

    const tempFile = DriveApp.getFileById(tempDocId);
    const pdfBlob = tempFile.getBlob().getAs(MimeType.PDF).setName(pdfName);
    const archiveFolder = DriveApp.getFolderById(paperFolder.id);
    const pdfFile = archiveFolder.createFile(pdfBlob);
    const pdfFileId = pdfFile.getId();
    const generatedAt = new Date();

    ensureVisaLetterLogSheet_();
    appendObject_(SHEETS.VISA_LETTERS, {
      'Request ID': requestId,
      'Generated At': generatedAt,
      'Paper ID': paperId,
      'Paper Title': visaSheetText_(title),
      'Track': visaSheetText_(submission.Track || ''),
      'Author Name': visaSheetText_(authorName),
      'Author Email': visaSheetText_(authorEmail),
      'PDF File ID': pdfFileId,
      'PDF File Name': pdfName,
      'PDF URL': 'https://drive.google.com/file/d/' + pdfFileId + '/view',
      'Archive Folder ID': paperFolder.id,
      'Template File ID': templateId,
      'Template File Name': visaSheetText_(templateMeta.name || '')
    });

    logActivity_(
      paperId,
      'Visa invitation letter generated',
      '',
      'Invitation letter generated for ' + authorName + '. Request ID: ' + requestId + '.'
    );

    return {
      requestId: requestId,
      generatedAt: generatedAt.toISOString(),
      fileName: "__ACADIA_TEXT_t0024__" + paperId + '_' + safeAuthor + '.pdf',
      mimeType: 'application/pdf',
      base64: Utilities.base64Encode(pdfBlob.getBytes()),
      archivedFileId: pdfFileId,
      archivedFileUrl: 'https://drive.google.com/file/d/' + pdfFileId + '/view'
    };
  } finally {
    if (tempDocId) {
      try { DriveApp.getFileById(tempDocId).setTrashed(true); } catch (err) {
        console.warn('Could not trash temporary visa-letter document: ' + err.message);
      }
    }
  }
}

function readGoogleDocTextForVisaCheck_(documentId) {
  const doc = DocumentApp.openById(documentId);
  const parts = [];
  try { parts.push(doc.getBody().getText()); } catch (err) {}
  try { if (doc.getHeader()) parts.push(doc.getHeader().getText()); } catch (err) {}
  try { if (doc.getFooter()) parts.push(doc.getFooter().getText()); } catch (err) {}
  return parts.join('\n');
}

function enableVisaLetterModuleSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another administrative update is running. Wait one minute and retry.');
  }

  try {
    const cfg = getConfig_();
    const master = getMasterSpreadsheet_();
    const systemFolderId = String(cfg.SYSTEM_FOLDER_ID || '').trim();
    if (!systemFolderId) throw new Error('SYSTEM_FOLDER_ID is not configured.');

    const backupFolder = driveEnsureFolder_(systemFolderId, '06_Backups');
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "__ACADIA_TEXT_t0023__", 'yyyyMMdd-HHmmss');
    const backup = driveCopyFile_(
      master.getId(),
      backupFolder.id,
      "__ACADIA_TEXT_t0025__" + stamp
    );

    const archive = driveEnsureFolder_(systemFolderId, '07_Visa_Invitation_Letters');
    ensureVisaLetterLogSheet_();

    const addedKeys = [];
    [
      [
        'VISA_LETTER_ENABLED',
        'FALSE',
        'Set to TRUE after the Google Docs template has been configured and tested.'
      ],
      [
        'VISA_LETTER_TEMPLATE_DOC_ID',
        '',
        'Native Google Docs template used to generate personalized visa and entry invitation letters.'
      ],
      [
        'VISA_LETTER_ARCHIVE_FOLDER_ID',
        archive.id,
        'Private Drive folder where generated invitation-letter PDFs are archived.'
      ]
    ].forEach(function (entry) {
      const result = appendSettingIfMissing_(entry[0], entry[1], entry[2]);
      if (result.added) addedKeys.push(entry[0]);
    });

    // Always retain the verified archive folder ID, but do not overwrite the
    // enabled flag or template ID selected by the organizer.
    const archiveRow = findObject_(SHEETS.SETTINGS, function (row) {
      return String(row.Key || '').trim() === 'VISA_LETTER_ARCHIVE_FOLDER_ID';
    });
    if (archiveRow && !String(archiveRow.Value || '').trim()) {
      updateObjectRow_(SHEETS.SETTINGS, archiveRow.__row, { Value: archive.id });
    }

    invalidateConfigCache_();

    const result = {
      backupFileId: backup.id,
      backupFileName: backup.name,
      archiveFolderId: archive.id,
      archiveFolderName: archive.name,
      logSheetName: SHEETS.VISA_LETTERS,
      addedKeys: addedKeys,
      existingSubmissionDataChanged: false,
      existingTaskDataChanged: false,
      readyForTemplateConfiguration: true
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function visaLetterModuleCheck_() {
  const cfg = getConfig_();
  const templateId = String(cfg.VISA_LETTER_TEMPLATE_DOC_ID || '').trim();
  const archiveId = String(cfg.VISA_LETTER_ARCHIVE_FOLDER_ID || '').trim();
  const issues = [];
  const requiredTokens = ['{{AUTHOR_NAME}}', '{{PAPER_TITLE}}'];
  const recommendedTokens = [
    '{{DATE}}', '{{PAPER_ID}}', '{{TRACK}}', '{{CONFERENCE_NAME}}',
    '{{CONFERENCE_LOCATION}}', '{{CONFERENCE_DATES}}', '{{CONTACT_EMAIL}}'
  ];
  let templateName = '';
  let missingRequiredPlaceholders = requiredTokens.slice();
  let missingRecommendedPlaceholders = recommendedTokens.slice();

  if (!templateId) {
    issues.push('VISA_LETTER_TEMPLATE_DOC_ID is blank.');
  } else {
    try {
      const metadata = driveGetMetadata_(templateId, 'id,name,mimeType,trashed');
      templateName = metadata.name || '';
      if (metadata.trashed) issues.push('The invitation-letter template is in Trash.');
      if (metadata.mimeType !== 'application/vnd.google-apps.document') {
        issues.push('The invitation-letter template must be a native Google Doc.');
      } else {
        const text = readGoogleDocTextForVisaCheck_(templateId);
        missingRequiredPlaceholders = requiredTokens.filter(function (token) {
          return text.indexOf(token) === -1;
        });
        missingRecommendedPlaceholders = recommendedTokens.filter(function (token) {
          return text.indexOf(token) === -1;
        });
        if (missingRequiredPlaceholders.length) {
          issues.push('The template is missing required placeholders: ' + missingRequiredPlaceholders.join(', '));
        }
      }
    } catch (err) {
      issues.push('The invitation-letter template could not be opened: ' + err.message);
    }
  }

  if (!archiveId) {
    issues.push('VISA_LETTER_ARCHIVE_FOLDER_ID is blank. Run the module setup.');
  } else {
    try {
      const archive = driveGetMetadata_(archiveId, 'id,name,mimeType,trashed');
      if (archive.trashed || archive.mimeType !== 'application/vnd.google-apps.folder') {
        issues.push('The invitation-letter archive folder is unavailable.');
      }
    } catch (err) {
      issues.push('The invitation-letter archive folder could not be opened: ' + err.message);
    }
  }

  const result = {
    enabled: parseBoolean_(cfg.VISA_LETTER_ENABLED, false),
    templateFileId: templateId,
    templateFileName: templateName,
    archiveFolderId: archiveId,
    logSheetName: SHEETS.VISA_LETTERS,
    generatedLetterRecords: getMasterSpreadsheet_().getSheetByName(SHEETS.VISA_LETTERS)
      ? sheetObjects_(SHEETS.VISA_LETTERS).length
      : 0,
    missingRequiredPlaceholders: missingRequiredPlaceholders,
    missingRecommendedPlaceholders: missingRecommendedPlaceholders,
    issues: issues,
    ready: issues.length === 0
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

/******************************************************************************
 * SOURCE: AdminRunners.gs
 ******************************************************************************/

/**
 * Chair-only editor runner functions.
 *
 * The public RUN_* wrappers appear in the Apps Script editor's function menu.
 * Each wrapper first verifies that the active user and effective user are the
 * same account. That is true for an authorized chair running the function from
 * the Apps Script editor, but not for anonymous authors calling the deployed
 * web app, which executes as the deployment owner.
 *
 * All implementation functions still end with an underscore, so they remain
 * private to google.script.run.
 */

const ADMIN_INPUTS = Object.freeze("__ACADIA_VALUE_adminInputs__");

/**
 * Prevents anonymous/public web-app calls from invoking chair runners.
 * Project editors already have source access, so allowing a verified editor
 * account to run these functions is the intended administrative boundary.
 */
function assertChairEditorRun_() {
  const active = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  const effective = String(Session.getEffectiveUser().getEmail() || '').trim().toLowerCase();
  if (!active || !effective || active !== effective) {
    throw new Error(
      'Chair-only editor function. Open the Apps Script project while signed in as an authorized project editor, then run this function from the editor.'
    );
  }
  return active;
}

/* Public editor-menu wrappers. */

function RUN_SETUP() {
  assertChairEditorRun_();
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  return RUN_SETUP_();
}

function RUN_SEED_DEMO() {
  assertChairEditorRun_();
  return RUN_SEED_DEMO_();
}

function RUN_APPLY_CURRENT_CONTENT_CONFIG() {
  assertChairEditorRun_();
  return RUN_APPLY_CURRENT_CONTENT_CONFIG_();
}

function RUN_IMPORT_FINAL_ACCEPTED_SUBMISSIONS() {
  assertChairEditorRun_();
  return RUN_IMPORT_FINAL_ACCEPTED_SUBMISSIONS_();
}

function RUN_PREVIEW_NEW_ACCEPTED_SUBMISSIONS() {
  assertChairEditorRun_();
  return previewNewAcceptedSubmissions_();
}

function RUN_ADD_NEW_ACCEPTED_SUBMISSIONS_SAFE() {
  assertChairEditorRun_();
  return addNewAcceptedSubmissionsSafe_();
}

function RUN_PROVISION_NEW_ACCEPTED_FOLDERS_SAFE() {
  assertChairEditorRun_();
  return provisionNewAcceptedFoldersSafe_();
}

function RUN_NEW_ACCEPTED_SUBMISSIONS_STATUS() {
  assertChairEditorRun_();
  return newAcceptedSubmissionsStatus_();
}

function RUN_IMPORT_ACCEPTED_SUBMISSIONS() {
  assertChairEditorRun_();
  return RUN_IMPORT_ACCEPTED_SUBMISSIONS_();
}

function RUN_IMPORT_REVIEWER_FEEDBACK() {
  assertChairEditorRun_();
  return RUN_IMPORT_REVIEWER_FEEDBACK_();
}

function RUN_SYNC_CONFIGURED_REVIEWER_FEEDBACK() {
  assertChairEditorRun_();
  return RUN_SYNC_CONFIGURED_REVIEWER_FEEDBACK_();
}

function RUN_START_FOLDER_PROVISIONING() {
  assertChairEditorRun_();
  return RUN_START_FOLDER_PROVISIONING_();
}

function RUN_FOLDER_PROVISION_STATUS() {
  assertChairEditorRun_();
  return RUN_FOLDER_PROVISION_STATUS_();
}

function RUN_START_PROJECT_POSTER_FOLDER_PROVISIONING() {
  assertChairEditorRun_();
  return startProjectPosterFolderProvisioning_();
}

function RUN_PROJECT_POSTER_FOLDER_PROVISION_STATUS() {
  assertChairEditorRun_();
  return projectPosterFolderProvisionStatus_();
}

function RUN_REFRESH_DASHBOARD() {
  assertChairEditorRun_();
  return RUN_REFRESH_DASHBOARD_();
}

function RUN_SYSTEM_CHECK() {
  assertChairEditorRun_();
  return RUN_SYSTEM_CHECK_();
}

/**
 * Manual banner diagnostic. Run from the Apps Script editor.
 */
function RUN_MIGRATE_ADD_ATTENDANCE_TASK_SAFE() {
  assertChairEditorRun_();
  return migrateAddAttendanceTaskSafe_();
}

function RUN_ATTENDANCE_MIGRATION_STATUS() {
  assertChairEditorRun_();
  return attendanceMigrationStatus_();
}

function RUN_ENABLE_VISA_LETTER_MODULE_SAFE() {
  assertChairEditorRun_();
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  return enableVisaLetterModuleSafe_();
}

function RUN_VISA_LETTER_CHECK() {
  assertChairEditorRun_();
  ScriptApp.requireAllScopes(ScriptApp.AuthMode.FULL);
  return visaLetterModuleCheck_();
}

function RUN_BANNER_CHECK() {
  assertChairEditorRun_();
  const cfg = getConfig_();
  const fileId = String(cfg.BANNER_FILE_ID || '').trim();
  if (!fileId) throw new Error('BANNER_FILE_ID is blank in the Settings sheet.');

  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();
  const result = {
    fileId: fileId,
    name: file.getName(),
    mimeType: blob.getContentType() || file.getMimeType(),
    sizeBytes: blob.getBytes().length,
    dataUrlCreated: Boolean(driveImageDataUrl_(fileId))
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function RUN_PUBLISH_AUTHOR_PROOF() {
  assertChairEditorRun_();
  return RUN_PUBLISH_AUTHOR_PROOF_();
}

function RUN_SET_TASK_STATUS() {
  assertChairEditorRun_();
  return RUN_SET_TASK_STATUS_();
}

/* Private implementations. */

function RUN_SETUP_() {
  return setupAuthorHub_();
}

function RUN_SEED_DEMO_() {
  return seedDemoSubmission_();
}

function RUN_APPLY_CURRENT_CONTENT_CONFIG_() {
  return applyCurrentContentConfig_();
}

function RUN_IMPORT_FINAL_ACCEPTED_SUBMISSIONS_() {
  const sourceId = ADMIN_INPUTS.acceptedSubmissionsSpreadsheetId || getConfig_().ACCEPTED_SOURCE_SPREADSHEET_ID;
  return importFinalAcceptedSubmissions_(sourceId);
}

function RUN_IMPORT_ACCEPTED_SUBMISSIONS_() {
  const cfg = getConfig_();
  const sourceId = ADMIN_INPUTS.acceptedSubmissionsSpreadsheetId || cfg.ACCEPTED_SOURCE_SPREADSHEET_ID;
  if (!sourceId) throw new Error('Set ACCEPTED_SOURCE_SPREADSHEET_ID in Settings or ADMIN_INPUTS.');
  if (ADMIN_INPUTS.acceptedSubmissionsSheetName) {
    return importAcceptedSubmissions_(sourceId, ADMIN_INPUTS.acceptedSubmissionsSheetName);
  }
  return importFinalAcceptedSubmissions_(sourceId);
}

function RUN_IMPORT_REVIEWER_FEEDBACK_() {
  if (!ADMIN_INPUTS.reviewerSpreadsheetId) {
    throw new Error('Set ADMIN_INPUTS.reviewerSpreadsheetId first.');
  }
  return importReviewerFeedback_(
    ADMIN_INPUTS.reviewerSpreadsheetId,
    ADMIN_INPUTS.reviewerSheetName,
    ADMIN_INPUTS.appendReviewerFeedback
  );
}

function RUN_SYNC_CONFIGURED_REVIEWER_FEEDBACK_() {
  return syncReviewerFeedbackFromConfiguredSheet_();
}

function RUN_START_FOLDER_PROVISIONING_() {
  return startFolderProvisioning_();
}

function RUN_FOLDER_PROVISION_STATUS_() {
  return folderProvisionStatus_();
}

function RUN_REFRESH_DASHBOARD_() {
  return refreshAdminDashboard_();
}

function RUN_SYSTEM_CHECK_() {
  return systemReadinessCheck_();
}

function RUN_PUBLISH_AUTHOR_PROOF_() {
  if (!ADMIN_INPUTS.proofPaperId || !ADMIN_INPUTS.proofSourcePdfFileId) {
    throw new Error('Set proofPaperId and proofSourcePdfFileId in ADMIN_INPUTS first.');
  }
  return publishAuthorProof_(
    ADMIN_INPUTS.proofPaperId,
    ADMIN_INPUTS.proofSourcePdfFileId,
    ADMIN_INPUTS.proofVersion,
    ADMIN_INPUTS.proofDueLabel
  );
}

function RUN_SET_TASK_STATUS_() {
  if (!ADMIN_INPUTS.statusPaperId || !ADMIN_INPUTS.statusTaskId) {
    throw new Error('Set statusPaperId and statusTaskId in ADMIN_INPUTS first.');
  }
  return adminSetTaskStatus_(
    ADMIN_INPUTS.statusPaperId,
    ADMIN_INPUTS.statusTaskId,
    ADMIN_INPUTS.statusValue,
    ADMIN_INPUTS.statusNote
  );
}

function phdWorkshopSourceData_() {
  const cfg = getConfig_();
  const sourceId = String(
    cfg.PHD_WORKSHOP_SOURCE_SPREADSHEET_ID ||
    cfg.ACCEPTED_SOURCE_SPREADSHEET_ID ||
    ''
  ).trim();
  if (!sourceId) {
    throw new Error('Set PHD_WORKSHOP_SOURCE_SPREADSHEET_ID or ACCEPTED_SOURCE_SPREADSHEET_ID in Settings.');
  }

  const sheetName = String(cfg.ACCEPTED_PHD_WORKSHOP_SHEET_NAME || 'PhD Workshop').trim();
  const source = SpreadsheetApp.openById(sourceId);
  const sheet = source.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(
      'PhD Workshop source tab not found: ' + sheetName + '. ' +
      'If it is in a separate Google Sheet, set PHD_WORKSHOP_SOURCE_SPREADSHEET_ID in Settings.'
    );
  }

  const values = sheet.getDataRange().getValues();
  if (!values.length) throw new Error('The PhD Workshop source tab is empty: ' + sheetName);

  const headerInfo = detectHeaderRow_(values, ['id', 'title']);
  const index = headerIndex_(headerInfo.headers);
  const idCol = firstHeaderIndex_(index, ['paper id', 'submission id', 'id']);
  const titleCol = firstHeaderIndex_(index, ['original title', 'paper title', 'submission title', 'title']);
  const authorsCol = firstHeaderIndex_(index, ['authors', 'author list', 'all authors', 'name', 'names']);
  if (idCol < 0 || titleCol < 0) {
    throw new Error(sheetName + ' must contain ID and Title columns.');
  }

  const records = [];
  const seen = {};
  for (let r = headerInfo.row + 1; r < values.length; r += 1) {
    const paperId = normalizePaperId_(values[r][idCol]);
    const title = String(values[r][titleCol] || '').trim();
    if (!paperId && !title) continue;
    if (!paperId || !title) {
      throw new Error(sheetName + ' row ' + (r + 1) + ' is missing an ID or Title.');
    }
    if (seen[paperId]) {
      throw new Error('Duplicate Paper ID ' + paperId + ' appears in rows ' + seen[paperId] + ' and ' + (r + 1) + '.');
    }
    seen[paperId] = r + 1;
    records.push({
      paperId: paperId,
      title: title,
      sourceAuthors: authorsCol >= 0 ? String(values[r][authorsCol] || '').trim() : '',
      track: PHD_WORKSHOP_TRACK,
      volume: '',
      sourceSheet: sheetName,
      sourceRow: r + 1
    });
  }

  return {
    sourceSpreadsheetId: sourceId,
    sourceSpreadsheetName: source.getName(),
    sourceSheetName: sheetName,
    records: records
  };
}

function previewPhdWorkshopImport_() {
  const sourceData = phdWorkshopSourceData_();
  const existingById = {};
  sheetObjects_(SHEETS.SUBMISSIONS).forEach(function (row) {
    const paperId = normalizePaperId_(row['Paper ID']);
    if (paperId) existingById[paperId] = row;
  });

  const newRecords = [];
  const alreadyPresent = [];
  const conflicts = [];
  sourceData.records.forEach(function (record) {
    const existing = existingById[record.paperId];
    if (!existing) {
      newRecords.push(record);
      return;
    }
    const sameTitle = normalizeTitle_(existing['Original Title']) === normalizeTitle_(record.title);
    const sameTrack = normalizeTrack_(existing.Track) === PHD_WORKSHOP_TRACK;
    if (sameTitle && sameTrack) {
      alreadyPresent.push(record.paperId);
    } else {
      conflicts.push({
        paperId: record.paperId,
        sourceSheet: record.sourceSheet,
        sourceRow: record.sourceRow,
        sourceTitle: record.title,
        masterTitle: String(existing['Original Title'] || ''),
        masterTrack: String(existing.Track || '')
      });
    }
  });

  const result = {
    sourceSpreadsheetId: sourceData.sourceSpreadsheetId,
    sourceSpreadsheetName: sourceData.sourceSpreadsheetName,
    sourceSheetName: sourceData.sourceSheetName,
    sourceRecordCount: sourceData.records.length,
    newSubmissionCount: newRecords.length,
    newSubmissions: newRecords,
    alreadyPresent: alreadyPresent,
    conflicts: conflicts,
    safeToImport: conflicts.length === 0
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function installPhdWorkshopSupportSafe_() {
  const settings = [
    appendSettingIfMissing_(
      'TRACK_FOLDER_PHD_WORKSHOP',
      "__ACADIA_RESOURCE_phdFolderId__",
      "__ACADIA_TEXT_t0026__"
    ),
    appendSettingIfMissing_(
      'ACCEPTED_PHD_WORKSHOP_SHEET_NAME',
      'PhD Workshop',
      'Tab containing PhD Workshop ID, Title, and optional Authors columns.'
    ),
    appendSettingIfMissing_(
      'PHD_WORKSHOP_SOURCE_SPREADSHEET_ID',
      '',
      'Leave blank when the PhD Workshop tab is in ACCEPTED_SOURCE_SPREADSHEET_ID; otherwise paste the separate Google Sheet ID.'
    ),
    appendSettingIfMissing_(
      'PHD_WORKSHOP_MONITOR_SPREADSHEET_ID',
      "__ACADIA_RESOURCE_phdMonitorId__",
      'Separate spreadsheet shared with the PhD Workshop monitoring and volunteer-coordination team.'
    ),
    appendSettingIfMissing_(
      'PRESENTATION_TEMPLATE_FILE_ID',
      '',
      'Later-stage presentation template shown to every track when a Drive file ID is entered.'
    )
  ];
  invalidateConfigCache_();
  sheetObjects_(SHEETS.SUBMISSIONS).forEach(function (row) {
    if (normalizeTrack_(row.Track) === PHD_WORKSHOP_TRACK) {
      ensureTaskRows_(row['Paper ID'], PHD_WORKSHOP_TRACK);
    }
  });
  const status = ensurePhdWorkshopStatusSheet_();
  return { settings: settings, statusSheet: status };
}

function importPhdWorkshopSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another administrative update is running. Wait one minute and retry.');
  }
  try {
    const preview = previewPhdWorkshopImport_();
    if (preview.conflicts.length) {
      throw new Error('Import stopped because one or more Paper IDs conflict with existing submissions. See the execution log.');
    }

    const sourceData = phdWorkshopSourceData_();
    const currentIds = {};
    sheetObjects_(SHEETS.SUBMISSIONS).forEach(function (row) {
      const id = normalizePaperId_(row['Paper ID']);
      if (id) currentIds[id] = true;
    });
    const newRecords = sourceData.records.filter(function (record) {
      return !currentIds[record.paperId];
    });

    ensureAttendanceSheet_();
    const importedAt = new Date();
    const added = [];

    newRecords.forEach(function (record) {
      // Dependent records first; the portal-facing Submissions row is appended last.
      ensureTaskRows_(record.paperId, PHD_WORKSHOP_TRACK);
      upsertAttendance_(record.paperId, {
        'Attendance Confirmed': false,
        'Presenter Name': '',
        'Presenter Email': '',
        'Confirmed At': '',
        'Last Updated': importedAt
      });

      appendObject_(SHEETS.SUBMISSIONS, {
        'Paper ID': record.paperId,
        'Original Title': record.title,
        'Normalized Original Title': normalizeTitle_(record.title),
        'Final Title': record.title,
        'Track': PHD_WORKSHOP_TRACK,
        'Volume': '',
        'Corresponding Author': '',
        'Corresponding Email': '',
        'Presenting Author': '',
        'Presenting Email': '',
        'Submission Folder ID': '',
        'Portal Enabled': true,
        'Overall Status': 'Accepted — Awaiting Materials',
        'Proof Version': '',
        'Proof Due Label': '',
        'Last Updated': importedAt
      });

      appendObject_(SHEETS.ACTIVITY, {
        'Timestamp': importedAt,
        'Paper ID': record.paperId,
        'Event': 'PhD Workshop participant added',
        'Task ID': '',
        'Detail': 'Added from ' + record.sourceSheet + ' row ' + record.sourceRow + '. Existing submissions were not modified.'
      });
      added.push({ paperId: record.paperId, title: record.title });
    });

    // Idempotent repair for a retry after a partial run; adds missing PhD task rows only.
    sourceData.records.forEach(function (record) {
      const submission = getSubmissionByPaperId_(record.paperId);
      if (submission && normalizeTrack_(submission.Track) === PHD_WORKSHOP_TRACK) {
        ensureTaskRows_(record.paperId, PHD_WORKSHOP_TRACK);
      }
    });

    ensurePhdWorkshopStatusSheet_();
    const result = {
      changed: added.length > 0,
      newSubmissionsAdded: added.length,
      added: added,
      existingSubmissionRowsUpdated: 0,
      existingFilesChanged: 0,
      importedAt: importedAt.toISOString()
    };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function provisionPhdWorkshopFoldersSafe_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Another administrative update is running. Wait one minute and retry.');
  }
  try {
    const rows = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
      return normalizePaperId_(row['Paper ID']) &&
        normalizeTrack_(row.Track) === PHD_WORKSHOP_TRACK &&
        parseBoolean_(row['Portal Enabled'], true);
    });

    const provisioned = rows.map(function (row) {
      const paperId = normalizePaperId_(row['Paper ID']);
      const folders = ensureSubmissionFolders_(paperId);
      return {
        paperId: paperId,
        paperRootFolderId: folders.PAPER_ROOT || '',
        websiteMaterialsFolderId: folders.WEBSITE_MATERIALS || '',
        exhibitionPosterFolderId: folders.PHD_POSTER || '',
        copyrightConsentFolderId: folders.COPYRIGHT_CONSENT || '',
        registrationFolderId: folders.REGISTRATION || '',
        previousVersionsFolderId: folders.PREVIOUS_VERSIONS || ''
      };
    });

    ensurePhdWorkshopStatusSheet_();
    const result = { provisionedCount: provisioned.length, provisioned: provisioned };
    console.log(JSON.stringify(result, null, 2));
    return result;
  } finally {
    lock.releaseLock();
  }
}

function ensurePhdWorkshopStatusSheet_() {
  const ss = getMasterSpreadsheet_();
  const expectedHeaders = [
    'Paper ID', 'Title', 'Corresponding Author', 'Corresponding Email',
    '1 Metadata + Website', '2 Exhibition Poster Task', 'Poster Upload',
    '3 Consent', '4 Attendance', '5 Indexing', '6 Registration',
    'Overall Status', 'Poster Version', 'Poster File Name', 'Poster Uploaded At',
    'Paper Root Folder ID', '02_Exhibition_Poster Folder ID'
  ];
  let sheet = ss.getSheetByName(PHD_WORKSHOP_STATUS_SHEET);
  if (sheet) {
    const current = sheet.getRange(1, 1, 1, expectedHeaders.length).getDisplayValues()[0];
    if (current.join('\u001f') !== expectedHeaders.join('\u001f')) {
      throw new Error(
        PHD_WORKSHOP_STATUS_SHEET + ' already exists with different headers. It was not changed.'
      );
    }
    return { created: false, sheetName: PHD_WORKSHOP_STATUS_SHEET };
  }

  sheet = ss.insertSheet(PHD_WORKSHOP_STATUS_SHEET);
  if (sheet.getMaxColumns() < expectedHeaders.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), expectedHeaders.length - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, expectedHeaders.length)
    .setFontWeight('bold')
    .setBackground('#173b4f')
    .setFontColor('#ffffff');
  sheet.getRange('A2').setFormula(
    '=IFERROR(SORT(FILTER({Submissions!A2:A,Submissions!D2:D,Submissions!G2:G,Submissions!H2:H},Submissions!E2:E="PhD Workshop"),1,TRUE),"")'
  );

  const lastRow = sheet.getMaxRows();
  const formulas = [];
  const taskIds = ['metadata', 'phd_poster', null, 'consent', 'attendance', 'indexing', 'registration'];
  for (let row = 2; row <= lastRow; row += 1) {
    const taskFormula = function (taskId) {
      return '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(Task_Status!$D:$D,Task_Status!$A:$A=$A' + row + ',Task_Status!$B:$B="' + taskId + '"),1),"Not started"))';
    };
    formulas.push([
      taskFormula(taskIds[0]),
      taskFormula(taskIds[1]),
      '=IF($A' + row + '="","",IF(COUNTIFS(File_Registry!$A:$A,$A' + row + ',File_Registry!$C:$C,"phd_workshop_poster_pdf",File_Registry!$K:$K,TRUE)>0,"Uploaded","Not uploaded"))',
      taskFormula(taskIds[3]),
      taskFormula(taskIds[4]),
      taskFormula(taskIds[5]),
      taskFormula(taskIds[6]),
      '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(Submissions!$M:$M,Submissions!$A:$A=$A' + row + '),1),""))',
      '=IF($A' + row + '="","",IFERROR(MAX(FILTER(File_Registry!$D:$D,File_Registry!$A:$A=$A' + row + ',File_Registry!$C:$C,"phd_workshop_poster_pdf",File_Registry!$K:$K=TRUE)),""))',
      '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(File_Registry!$F:$F,File_Registry!$A:$A=$A' + row + ',File_Registry!$C:$C,"phd_workshop_poster_pdf",File_Registry!$K:$K=TRUE),1),""))',
      '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(File_Registry!$L:$L,File_Registry!$A:$A=$A' + row + ',File_Registry!$C:$C,"phd_workshop_poster_pdf",File_Registry!$K:$K=TRUE),1),""))',
      '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(Folder_Registry!$C:$C,Folder_Registry!$A:$A=$A' + row + ',Folder_Registry!$B:$B="PAPER_ROOT"),1),""))',
      '=IF($A' + row + '="","",IFERROR(INDEX(FILTER(Folder_Registry!$C:$C,Folder_Registry!$A:$A=$A' + row + ',Folder_Registry!$B:$B="PHD_POSTER"),1),""))'
    ]);
  }
  sheet.getRange(2, 5, formulas.length, formulas[0].length).setFormulas(formulas);
  sheet.autoResizeColumns(1, expectedHeaders.length);
  return { created: true, sheetName: PHD_WORKSHOP_STATUS_SHEET };
}

function phdWorkshopMonitorHeaders_() {
  return [
    'Paper ID', 'Title', 'Authors', 'Corresponding Author', 'Corresponding Email',
    'Overall Status', 'Task 1 Metadata + Website', 'Task 2 Exhibition Poster',
    'Poster File', 'Task 3 Copyright + Recording Consent', 'Consent File',
    'Task 4 Attendance', 'Presenter', 'Task 5 Indexing',
    'Task 6 Volunteer Preferences', 'Volunteer Preferences', 'Other Preference',
    'Available Time Slots', 'Task 7 Conference Registration', 'Registration Confirmation File',
    'Last Activity', 'Last Activity Detail', 'Last Updated', 'Submission Folder'
  ];
}

function phdWorkshopActivityHeaders_() {
  return ['Timestamp', 'Paper ID', 'Title', 'Event', 'Task', 'Detail'];
}

function phdWorkshopAssignmentHeaders_() {
  return [
    'Paper ID', 'Title', 'Participant / Authors', 'Volunteer Preferences',
    'Other Preference', 'Available Time Slots', 'Preference Submitted', 'Assigned Role',
    'Shift / Date / Time', 'Coordinator Notes', 'Assignment Status'
  ];
}

function getPhdWorkshopMonitorSpreadsheet_() {
  const spreadsheetId = String(getConfig_().PHD_WORKSHOP_MONITOR_SPREADSHEET_ID || '').trim();
  if (!spreadsheetId) {
    throw new Error('Set PHD_WORKSHOP_MONITOR_SPREADSHEET_ID in Settings.');
  }
  return SpreadsheetApp.openById(spreadsheetId);
}

function ensurePhdWorkshopMonitorTab_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  const current = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const hasCurrentHeader = current.some(function (value) { return String(value || '').trim(); });
  if (hasCurrentHeader && current.join('\u001f') !== headers.join('\u001f')) {
    throw new Error(name + ' has unexpected headers. No monitoring data was changed.');
  }
  if (!hasCurrentHeader) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#e8eaed')
    .setFontColor('#202124')
    .setWrap(true);
  return sheet;
}

function phdWorkshopMonitorSubmissionRows_() {
  return sheetObjects_(SHEETS.SUBMISSIONS)
    .filter(function (row) { return normalizeTrack_(row.Track) === PHD_WORKSHOP_TRACK; })
    .sort(function (a, b) {
      return String(a['Paper ID'] || '').localeCompare(String(b['Paper ID'] || ''), undefined, { numeric: true });
    });
}

function phdWorkshopMonitorRow_(submission) {
  const paperId = normalizePaperId_(submission['Paper ID']);
  const taskStatus = {};
  getTaskRows_(paperId).forEach(function (row) {
    taskStatus[String(row['Task ID'] || '')] = String(row.Status || 'Not started');
  });
  const authors = getAuthors_(paperId);
  const authorNames = authors.map(function (author) { return author.name; }).filter(Boolean);
  const attendance = getAttendance_(paperId);
  const volunteer = getTaskData_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID);
  const preferences = Array.isArray(volunteer.preferences) ? volunteer.preferences : [];
  const availabilitySlots = Array.isArray(volunteer.availabilitySlots) ? volunteer.availabilitySlots : [];
  const poster = activeFileForRole_(paperId, PHD_WORKSHOP_POSTER_TASK_ID, PHD_WORKSHOP_POSTER_ROLE);
  const consent = activeFileForRole_(paperId, 'consent', 'signed_consent');
  const registration = activeFileForRole_(paperId, 'registration', 'registration_receipt');
  const activity = getActivity_(paperId, 1)[0] || {};
  const folderId = String(submission['Submission Folder ID'] || '').trim();
  return [
    paperId,
    String(submission['Final Title'] || submission['Original Title'] || ''),
    authorNames.length ? authorNames.join('; ') : String(submission['Corresponding Author'] || ''),
    String(submission['Corresponding Author'] || ''),
    String(submission['Corresponding Email'] || ''),
    String(submission['Overall Status'] || ''),
    taskStatus.metadata || 'Not started',
    taskStatus[PHD_WORKSHOP_POSTER_TASK_ID] || 'Not started',
    poster ? String(poster['File Name'] || '') : '',
    taskStatus.consent || 'Not started',
    consent ? String(consent['File Name'] || '') : '',
    taskStatus.attendance || 'Not started',
    String(attendance.presenterName || submission['Presenting Author'] || ''),
    taskStatus.indexing || 'Not started',
    taskStatus[PHD_WORKSHOP_VOLUNTEER_TASK_ID] || 'Not started',
    preferences.join('; '),
    String(volunteer.otherPreference || ''),
    availabilitySlots.join('; '),
    taskStatus.registration || 'Not started',
    registration ? String(registration['File Name'] || '') : '',
    activity.timestamp ? new Date(activity.timestamp) : '',
    String(activity.detail || activity.event || ''),
    submission['Last Updated'] ? new Date(submission['Last Updated']) : new Date(),
    folderId ? 'https://drive.google.com/drive/folders/' + folderId : ''
  ];
}

function phdWorkshopAssignmentRow_(submission, preserved) {
  const paperId = normalizePaperId_(submission['Paper ID']);
  const volunteer = getTaskData_(paperId, PHD_WORKSHOP_VOLUNTEER_TASK_ID);
  const preferences = Array.isArray(volunteer.preferences) ? volunteer.preferences : [];
  const availabilitySlots = Array.isArray(volunteer.availabilitySlots) ? volunteer.availabilitySlots : [];
  const authors = getAuthors_(paperId).map(function (author) { return author.name; }).filter(Boolean);
  const editable = preserved || ['', '', '', 'Unassigned'];
  return [
    paperId,
    String(submission['Final Title'] || submission['Original Title'] || ''),
    authors.length ? authors.join('; ') : String(submission['Corresponding Author'] || ''),
    preferences.join('; '),
    String(volunteer.otherPreference || ''),
    availabilitySlots.join('; '),
    volunteer.submittedAt ? new Date(volunteer.submittedAt) : '',
    editable[0] || '',
    editable[1] || '',
    editable[2] || '',
    editable[3] || 'Unassigned'
  ];
}

function replaceExternalSheetRows_(sheet, columnCount, rows) {
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, columnCount).clearContent();
  }
  if (rows.length) sheet.getRange(2, 1, rows.length, columnCount).setValues(rows);
}

function refreshAllPhdWorkshopMonitoring_() {
  const spreadsheet = getPhdWorkshopMonitorSpreadsheet_();
  const monitorSheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_MONITOR_SHEET, phdWorkshopMonitorHeaders_()
  );
  const activitySheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_ACTIVITY_SHEET, phdWorkshopActivityHeaders_()
  );
  const assignmentSheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_ASSIGNMENTS_SHEET, phdWorkshopAssignmentHeaders_()
  );
  const submissions = phdWorkshopMonitorSubmissionRows_();
  submissions.forEach(function (row) { ensureTaskRows_(row['Paper ID'], PHD_WORKSHOP_TRACK); });

  replaceExternalSheetRows_(
    monitorSheet,
    phdWorkshopMonitorHeaders_().length,
    submissions.map(phdWorkshopMonitorRow_)
  );

  const existingAssignments = {};
  if (assignmentSheet.getLastRow() > 1) {
    assignmentSheet.getRange(2, 1, assignmentSheet.getLastRow() - 1, 11).getValues()
      .forEach(function (row) {
        const paperId = normalizePaperId_(row[0]);
        if (paperId) existingAssignments[paperId] = row.slice(7, 11);
      });
  }
  replaceExternalSheetRows_(
    assignmentSheet,
    phdWorkshopAssignmentHeaders_().length,
    submissions.map(function (row) {
      const paperId = normalizePaperId_(row['Paper ID']);
      return phdWorkshopAssignmentRow_(row, existingAssignments[paperId]);
    })
  );

  const submissionById = {};
  submissions.forEach(function (row) { submissionById[normalizePaperId_(row['Paper ID'])] = row; });
  const activityRows = sheetObjects_(SHEETS.ACTIVITY)
    .filter(function (row) { return Boolean(submissionById[normalizePaperId_(row['Paper ID'])]); })
    .map(function (row) {
      const paperId = normalizePaperId_(row['Paper ID']);
      const submission = submissionById[paperId];
      return [
        row.Timestamp ? new Date(row.Timestamp) : '',
        paperId,
        String(submission['Final Title'] || submission['Original Title'] || ''),
        String(row.Event || ''),
        String(row['Task ID'] || ''),
        String(row.Detail || '')
      ];
    });
  replaceExternalSheetRows_(activitySheet, phdWorkshopActivityHeaders_().length, activityRows);

  if (monitorSheet.getLastRow() > 1) monitorSheet.getRange(2, 21, monitorSheet.getLastRow() - 1, 3).setNumberFormat('yyyy-mm-dd hh:mm');
  if (activitySheet.getLastRow() > 1) activitySheet.getRange(2, 1, activitySheet.getLastRow() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  if (assignmentSheet.getLastRow() > 1) assignmentSheet.getRange(2, 7, assignmentSheet.getLastRow() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    submissions: submissions.length,
    activityRows: activityRows.length,
    refreshedAt: new Date().toISOString()
  };
}

function findOrAppendExternalPaperRow_(sheet, paperId) {
  const id = normalizePaperId_(paperId);
  if (sheet.getLastRow() > 1) {
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues();
    for (let i = 0; i < values.length; i += 1) {
      if (normalizePaperId_(values[i][0]) === id) return i + 2;
    }
    if (sheet.getLastRow() === 2 && !normalizePaperId_(values[0][0])) return 2;
  }
  return sheet.getLastRow() + 1;
}

function syncPhdWorkshopMonitorEvent_(paperId, event, taskId, detail) {
  const submission = getSubmissionByPaperId_(paperId);
  if (!submission || normalizeTrack_(submission.Track) !== PHD_WORKSHOP_TRACK) return;
  const spreadsheetId = String(getConfig_().PHD_WORKSHOP_MONITOR_SPREADSHEET_ID || '').trim();
  if (!spreadsheetId) return;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const monitorSheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_MONITOR_SHEET, phdWorkshopMonitorHeaders_()
  );
  const activitySheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_ACTIVITY_SHEET, phdWorkshopActivityHeaders_()
  );
  const assignmentSheet = ensurePhdWorkshopMonitorTab_(
    spreadsheet, PHD_WORKSHOP_ASSIGNMENTS_SHEET, phdWorkshopAssignmentHeaders_()
  );

  const monitorRow = findOrAppendExternalPaperRow_(monitorSheet, paperId);
  monitorSheet.getRange(monitorRow, 1, 1, phdWorkshopMonitorHeaders_().length)
    .setValues([phdWorkshopMonitorRow_(submission)]);

  const assignmentRowNumber = findOrAppendExternalPaperRow_(assignmentSheet, paperId);
  const preserved = assignmentSheet.getRange(assignmentRowNumber, 8, 1, 4).getValues()[0];
  assignmentSheet.getRange(assignmentRowNumber, 1, 1, 7)
    .setValues([phdWorkshopAssignmentRow_(submission, preserved).slice(0, 7)]);

  let activityRow = activitySheet.getLastRow() + 1;
  if (activitySheet.getLastRow() === 2 && !normalizePaperId_(activitySheet.getRange(2, 2).getDisplayValue())) {
    activityRow = 2;
  }
  activitySheet.getRange(activityRow, 1, 1, phdWorkshopActivityHeaders_().length).setValues([[
    new Date(),
    normalizePaperId_(paperId),
    String(submission['Final Title'] || submission['Original Title'] || ''),
    String(event || ''),
    String(taskId || ''),
    String(detail || '')
  ]]);
}

function setupPhdWorkshopMonitoringSafe_() {
  appendSettingIfMissing_(
    'PHD_WORKSHOP_MONITOR_SPREADSHEET_ID',
    "__ACADIA_RESOURCE_phdMonitorId__",
    'Separate spreadsheet shared with the PhD Workshop monitoring and volunteer-coordination team.'
  );
  invalidateConfigCache_();
  return refreshAllPhdWorkshopMonitoring_();
}

function phdWorkshopStatus_() {
  const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
    return normalizeTrack_(row.Track) === PHD_WORKSHOP_TRACK;
  });
  const ids = {};
  submissions.forEach(function (row) { ids[normalizePaperId_(row['Paper ID'])] = true; });
  const activePosterUploads = sheetObjects_(SHEETS.FILES).filter(function (row) {
    return ids[normalizePaperId_(row['Paper ID'])] &&
      String(row.Role) === PHD_WORKSHOP_POSTER_ROLE &&
      parseBoolean_(row.Active, false);
  }).length;
  const missingPaperFolders = submissions.filter(function (row) {
    return !String(row['Submission Folder ID'] || '').trim();
  }).length;
  const result = {
    phdWorkshopSubmissions: submissions.length,
    activePosterUploads: activePosterUploads,
    missingPaperFolders: missingPaperFolders,
    statusSheet: PHD_WORKSHOP_STATUS_SHEET,
    checkedAt: new Date().toISOString()
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}

function RUN_INSTALL_PHD_WORKSHOP_SUPPORT_SAFE() {
  assertChairEditorRun_();
  return installPhdWorkshopSupportSafe_();
}

function RUN_PREVIEW_PHD_WORKSHOP_IMPORT() {
  assertChairEditorRun_();
  return previewPhdWorkshopImport_();
}

function RUN_IMPORT_PHD_WORKSHOP_SAFE() {
  assertChairEditorRun_();
  return importPhdWorkshopSafe_();
}

function RUN_PROVISION_PHD_WORKSHOP_FOLDERS_SAFE() {
  assertChairEditorRun_();
  return provisionPhdWorkshopFoldersSafe_();
}

function RUN_SETUP_PHD_WORKSHOP_MONITORING_SAFE() {
  assertChairEditorRun_();
  return setupPhdWorkshopMonitoringSafe_();
}

function RUN_REFRESH_PHD_WORKSHOP_MONITORING_SAFE() {
  assertChairEditorRun_();
  return refreshAllPhdWorkshopMonitoring_();
}

function RUN_PHD_WORKSHOP_STATUS() {
  assertChairEditorRun_();
  return phdWorkshopStatus_();
}


/** Read-only organizer audit; private to Apps Script, never exposed through google.script.run. */
function auditPhdWorkshopReupload_() {
  return withSheetObjectsRuntimeCache_(function () {
    const submissions = sheetObjects_(SHEETS.SUBMISSIONS).filter(function (row) {
      return normalizeTrack_(row.Track) === PHD_WORKSHOP_TRACK;
    });
    const blocked = [], ids = [];
    submissions.forEach(function (submission) {
      const id = normalizePaperId_(submission['Paper ID']); ids.push(id);
      PHD_WORKSHOP_TASK_DEFINITIONS.forEach(function (task) {
        try {
          assertRequiredTaskOpen_(task.id, id);
          const row = getTaskRow_(id, task.id);
          if (!row || String(row.Status) === 'Locked') throw new Error('Task is missing or locked.');
        } catch (err) { blocked.push({id:id, task:task.id, message:err.message}); }
      });
      [['metadata','website_image_1'],['phd_poster',PHD_WORKSHOP_POSTER_ROLE],['consent','signed_consent'],['registration','registration_receipt']].forEach(function (entry) {
        try { assertUploadOpen_(id,entry[0],entry[1]); }
        catch (err) { blocked.push({id:id, upload:entry[1], message:err.message}); }
      });
    });
    const result={phdWorkshopOpen:isPhdWorkshopOpen_(), submissions:ids.length, ids:ids, blocked:blocked, checkedAt:new Date().toISOString()};
    console.log(JSON.stringify(result)); return result;
  });
}

function RUN_AUDIT_PHD_REUPLOAD() {
  assertChairEditorRun_();
  return auditPhdWorkshopReupload_();
}
