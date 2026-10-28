/** Official acceptance letters: authenticated, all-author, on-demand PDF download. */
const ACCEPTANCE_LETTER_TEMPLATE_ID_ = "__ACADIA_RESOURCE_acceptanceTemplateId__";

// Normalize display whitespace only; never change the saved submission metadata.
function acceptanceLetterInline_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function acceptanceLetterRecord_(submission, authors) {
  const track = normalizeTrack_(submission.Track);
  const labels = {'Full Paper': 'Full Paper', 'Projects': 'Project', 'Field Note': 'Field Note', 'PhD Workshop': 'PhD Workshop', 'Book Forum': 'Book Forum'};
  if (!labels[track]) throw new Error('An acceptance letter is not available for this submission track.');
  const title = acceptanceLetterInline_(submission['Final Title'] || submission['Original Title']);
  const paperId = normalizePaperId_(submission['Paper ID']);
  if (!title || !paperId) throw new Error('The submission title or ID is missing. Please contact the organizers.');
  const allAuthors = (authors || []).map(function (author) {
    return {name: acceptanceLetterInline_(author.name), affiliation: acceptanceLetterInline_(author.affiliation)};
  });
  const issues = [];
  if (!allAuthors.length) issues.push('No author metadata has been saved for this submission.');
  allAuthors.forEach(function (author, index) {
    if (!author.name) issues.push('Author ' + (index + 1) + ' is missing a name.');
    if (!author.affiliation) issues.push('Author ' + (index + 1) + ' is missing an affiliation.');
  });
  const affiliations = [];
  const affiliationKeys = [];
  allAuthors.forEach(function (author) {
    const key = author.affiliation.replace(/\s+/g, ' ').toLowerCase();
    let index = affiliationKeys.indexOf(key);
    if (index < 0) { index = affiliations.length; affiliations.push(author.affiliation); affiliationKeys.push(key); }
    author.affiliationNumber = index + 1;
  });
  const names = allAuthors.map(function (author) {
    return author.name + (affiliations.length > 1 ? ' [' + author.affiliationNumber + ']' : '');
  });
  const authorText = names.length < 3 ? names.join(' and ') : names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
  const affiliationText = affiliations.map(function (value, index) {
    return (affiliations.length > 1 ? '[' + (index + 1) + '] ' : '') + value;
  }).join('; ');
  let statement = 'The Association for Computer-Aided Design in Architecture confirms that the peer-reviewed ' +
    (track === 'Full Paper' ? 'paper' : track === 'Projects' ? 'project' : 'field note') +
    ' listed below is accepted for publication and presentation at the Annual Conference of';
  if (track === 'PhD Workshop') statement = 'The Association for Computer-Aided Design in Architecture confirms that the submission listed below is accepted for participation in the PhD Workshop at';
  if (track === 'Book Forum') statement = 'The Association for Computer-Aided Design in Architecture confirms that the book listed below is accepted for presentation in the Book Forum at';
  const key = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify({paperId: paperId, track: track, title: title, authors: allAuthors}))).replace(/=+$/g, '');
  return {paperId: paperId, track: labels[track], title: title, authors: allAuthors,
    authorsText: authorText, affiliationsText: affiliationText, acceptanceStatement: statement,
    recordKey: key, ready: !issues.length, issues: issues};
}

function getAcceptanceLetterData(sessionToken) {
  return withSheetObjectsRuntimeCache_(function () {
    const session = requireAuthorSession_(sessionToken);
    return acceptanceLetterRecord_(requireSubmission_(session.paperId), getAuthors_(session.paperId));
  });
}

function acceptanceLetterValues_(record) {
  return {
    ACCEPTANCE_STATEMENT: record.acceptanceStatement,
    SUBMISSION_ID: record.paperId, TRACK: record.track, SUBMISSION_TITLE: record.title,
    AUTHORS: record.authorsText, AFFILIATIONS: record.affiliationsText,
    ISSUED_DATE: Utilities.formatDate(new Date(), "__ACADIA_TEXT_t0023__", 'MMMM d, yyyy')
  };
}

/** Replace literal tokens in existing text runs; preserve images, tables and typography. */
function acceptanceLetterPopulate_(documentId, values) {
  const doc = DocumentApp.openById(documentId);
  const found = {};
  function visit(element) {
    if (!element) return;
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const text = element.asText();
      const content = text.getText();
      const matches = [];
      const regex = /\{\{([A-Z_]+)\}\}/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (!Object.prototype.hasOwnProperty.call(values, match[1])) throw new Error('The acceptance-letter template contains an unsupported field. Please contact the organizers.');
        matches.push({start: match.index, end: match.index + match[0].length - 1, key: match[1], attributes: text.getAttributes(match.index)});
        found[match[1]] = true;
      }
      matches.reverse().forEach(function (item) {
        const value = String(values[item.key]);
        text.deleteText(item.start, item.end);
        if (value) { text.insertText(item.start, value); text.setAttributes(item.start, item.start + value.length - 1, item.attributes); }
      });
    } else if (typeof element.getNumChildren === 'function') {
      for (let i = 0; i < element.getNumChildren(); i += 1) visit(element.getChild(i));
    }
  }
  try {
    visit(doc.getBody()); visit(doc.getHeader()); visit(doc.getFooter());
    Object.keys(values).forEach(function (key) {
      if (!found[key]) throw new Error('The acceptance-letter template is missing a required field. Please contact the organizers.');
    });
  } finally { doc.saveAndClose(); }
}

function generateOfficialAcceptanceLetter(sessionToken, payload) {
  const record = getAcceptanceLetterData(sessionToken);
  if (!payload || payload.confirmed !== true) throw new Error('Confirm the submission details, all authors, author order and affiliations before downloading.');
  if (!record.ready) throw new Error(record.issues.join(' ') + "__ACADIA_TEXT_t0071__");
  if (!payload || payload.recordKey !== record.recordKey) throw new Error('The submission record has changed. Close and reopen this card to review the latest author information.');
  const cache = CacheService.getScriptCache();
  const busyKey = 'acceptance_letter_busy_' + record.paperId;
  const claim = Utilities.getUuid();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1500)) throw new Error('The service is busy. Please try again shortly.');
  try {
    if (cache.get(busyKey)) throw new Error('A letter is already being generated for this submission. Please wait before trying again.');
    cache.put(busyKey, claim, 360);
  } finally { lock.releaseLock(); }
  let tempFile = null;
  try {
    const template = DriveApp.getFileById(ACCEPTANCE_LETTER_TEMPLATE_ID_);
    if (template.isTrashed() || template.getMimeType() !== MimeType.GOOGLE_DOCS) throw new Error('The acceptance-letter template is unavailable. Please contact the organizers.');
    tempFile = template.makeCopy('TEMP_Acceptance_Letter_' + record.paperId + '_' + claim);
    acceptanceLetterPopulate_(tempFile.getId(), acceptanceLetterValues_(record));
    const name = "__ACADIA_TEXT_t0072__" + record.paperId.replace(/[^A-Za-z0-9_-]/g, '_') + '.pdf';
    const pdf = acceptanceLetterOnePagePdf_(tempFile).pdf.setName(name);
    return {fileName: name, mimeType: 'application/pdf', base64: Utilities.base64Encode(pdf.getBytes())};
  } finally {
    if (tempFile) { try { tempFile.setTrashed(true); } catch (error) { console.warn('Could not remove a temporary acceptance-letter copy.'); } }
    if (cache.get(busyKey) === claim) cache.remove(busyKey);
  }
}

/** Verify the page tree in Google Docs' PDF export, failing closed on an unknown format. */
function acceptanceLetterPdfPageCount_(blob) {
  const source = blob.getDataAsString('ISO-8859-1');
  if (source.indexOf('%PDF-') !== 0) throw new Error('The letter could not be exported as a PDF. Please try again.');
  // Ignore compressed content and image streams before inspecting object dictionaries.
  const dictionaries = source.replace(/stream\r?\n[\s\S]*?endstream/g, '');
  const pages = (dictionaries.match(/\/Type\s*\/Page\b/g) || []).length;
  const trees = dictionaries.match(/\d+\s+\d+\s+obj\s*<<(?:(?!endobj)[\s\S])*?\/Type\s*\/Pages\b(?:(?!endobj)[\s\S])*?endobj/g) || [];
  const rootCount = trees.reduce(function (largest, tree) {
    const count = tree.match(/\/Count\s+(\d+)\b/);
    return Math.max(largest, count ? Number(count[1]) : 0);
  }, 0);
  if (!pages || pages !== rootCount) throw new Error("__ACADIA_TEXT_t0073__");
  return pages;
}

/** Fit the temporary copy only. Keep every word, the letterhead, and both signatures. */
function acceptanceLetterOnePagePdf_(file) {
  const sizes = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  for (let attempt = 0; attempt < sizes.length; attempt += 1) {
    const size = sizes[attempt];
    const doc = DocumentApp.openById(file.getId());
    try {
      const body = doc.getBody();
      for (let i = 0; i < body.getNumChildren(); i += 1) {
        const child = body.getChild(i);
        // Tables and empty signature anchors retain their original geometry.
        if (child.getType() !== DocumentApp.ElementType.PARAGRAPH) continue;
        const paragraph = child.asParagraph();
        if (!paragraph.getText().trim()) continue;
        paragraph.editAsText().setFontSize(size);
        paragraph.setLineSpacing(1);
        paragraph.setSpacingBefore(Math.min(paragraph.getSpacingBefore() || 0, size * 0.45));
        paragraph.setSpacingAfter(Math.min(paragraph.getSpacingAfter() || 0, size * 0.45));
      }
    } finally { doc.saveAndClose(); }
    const pdf = file.getAs(MimeType.PDF);
    if (acceptanceLetterPdfPageCount_(pdf) === 1) return {pdf: pdf, bodyFontSize: size, attempts: attempt + 1};
  }
  // Never offer a multi-page or truncated letter for download.
  throw new Error("__ACADIA_TEXT_t0074__");
}
