/** Award certificates share verified Presenter sessions and submission-based author eligibility. */
const AWARD_PORTAL = Object.freeze({ROSTER:'Awards', LOG:'Award_Certificate_Log'});

function awardSettings_() {
  const settings=presenterSettings_();
  if(!toBoolean_(settings.AWARDS_ENABLED,false) || !settings.AWARD_TEMPLATE_FILE_ID || !settings.AWARD_OUTPUT_FOLDER_ID)
    throw new Error("__ACADIA_TEXT_t0163__");
  return settings;
}

function awardRoster_() {
  const rows=presenterTable_(masterSpreadsheet_(),AWARD_PORTAL.ROSTER,['Award ID','Award Name','Paper ID','Track','Award Work Title','Award Authors','Enabled']);
  const seen={};
  return rows.filter(row=>toBoolean_(row.Enabled,false)).map(row=>{
    const award={id:String(row['Award ID']).trim(),name:String(row['Award Name']).trim(),workId:presenterId_(row['Paper ID']),
      track:presenterTrack_(row.Track),title:String(row['Award Work Title']).trim(),authors:String(row['Award Authors']).split(';').map(value=>value.trim()).filter(Boolean)};
    if(!/^[A-Z0-9-]{3,50}$/.test(award.id) || seen[award.id] || !award.name || !award.workId || !['papers','projects'].includes(award.track) || !award.title || !award.authors.length)
      throw new Error("__ACADIA_TEXT_t0164__");
    seen[award.id]=true;
    return award;
  });
}

function awardsForGroups_(groups,roster) {
  const works={};
  groups.forEach(group=>group.presentations.forEach(work=>{works[work.id]=group.track}));
  return roster.filter(award=>works[award.workId]===award.track);
}

/** An award configuration issue must not prevent ordinary presentation downloads. */
function awardCatalogForPresenter_(groups,settings) {
  if(!toBoolean_(settings.AWARDS_ENABLED,false))return {awards:[],awardNotice:''};
  try {
    if(!settings.AWARD_TEMPLATE_FILE_ID || !settings.AWARD_OUTPUT_FOLDER_ID)throw new Error('Missing award configuration');
    return {awards:awardsForGroups_(groups,awardRoster_()),awardNotice:''};
  }catch(error){
    console.error('Award catalog is unavailable: '+error.message);
    return {awards:[],awardNotice:"__ACADIA_TEXT_t0165__"};
  }
}

function awardFromSession_(token,awardId,settings) {
  const clean=cleanToken_(token), value=clean && CacheService.getScriptCache().get(PRESENTER_PORTAL.SESSION_PREFIX+clean);
  if(!value)throw new Error('Your session has expired. Please sign in again.');
  const identity=JSON.parse(value), match=presenterMatches_(identity.name,identity.email,settings);
  const award=match && awardsForGroups_(match.groups,awardRoster_()).find(item=>item.id===String(awardId));
  if(!award)throw new Error("__ACADIA_TEXT_t0166__");
  return {name:match.name,email:match.email,award:award};
}

function awardFingerprint_(record,template) {
  return presenterDigest_(JSON.stringify(['award-v1',record,template.getId(),template.getLastUpdated().getTime()]));
}

function awardLogRows_() {
  const sheet=masterSpreadsheet_().getSheetByName(AWARD_PORTAL.LOG);
  if(!sheet)throw new Error('The award certificate log is unavailable.');
  return sheet.getDataRange().getValues().slice(1);
}

function existingAwardCertificate_(identityKey,awardId,fingerprint) {
  const rows=awardLogRows_();
  for(let i=rows.length-1;i>=0;i--){
    if(String(rows[i][2])!==identityKey || String(rows[i][5])!==awardId || String(rows[i][11])!==fingerprint)continue;
    try{const file=DriveApp.getFileById(String(rows[i][8]));if(!file.isTrashed())return certificateDownloadPayload_(file,true)}catch(ignored){}
  }
  return null;
}

function awardPopulateDocument_(doc,record) {
  const award=record.award,body=doc.getBody();
  workshopTokenFontSize_(body,'{{RECIPIENT_NAME}}',record.name.length>32?22:26);
  workshopTokenFontSize_(body,'{{AWARD_NAME}}',award.name.length>30?17:18);
  workshopTokenFontSize_(body,'{{WORK_TITLE}}',award.title.length>120?13:14);
  replaceDocumentPlaceholders_(doc,{
    '{{RECIPIENT_NAME}}':record.name,
    '{{AUTHOR_ROLE}}':award.authors.length===1?'the author':'a co-author',
    '{{WORK_TYPE}}':award.track==='projects'?'project':'paper',
    '{{AWARD_NAME}}':award.name,
    '{{WORK_TITLE}}':award.title,
    '{{AUTHOR_TEAM}}':(award.authors.length===1?'Author: ':'Authors: ')+award.authors.join(', '),
    '{{ISSUED_DATE}}':Utilities.formatDate(new Date(),"__ACADIA_TEXT_t0023__",'MMMM d, yyyy')
  });
}

function generateAwardCertificate(token,awardId) {
  let settings=awardSettings_(),record=awardFromSession_(token,awardId,settings);
  let template=DriveApp.getFileById(String(settings.AWARD_TEMPLATE_FILE_ID));
  if(template.getMimeType()!==MimeType.GOOGLE_DOCS)throw new Error('The award certificate template is unavailable.');
  const identityKey=presenterDigest_(presenterName_(record.name)+'|'+record.email);
  const existing=existingAwardCertificate_(identityKey,record.award.id,awardFingerprint_(record,template));
  if(existing)return existing;
  const lock=LockService.getScriptLock();lock.waitLock(30000);let working=null;
  try {
    settings=awardSettings_();record=awardFromSession_(token,awardId,settings);
    template=DriveApp.getFileById(String(settings.AWARD_TEMPLATE_FILE_ID));
    if(template.getMimeType()!==MimeType.GOOGLE_DOCS)throw new Error('The award certificate template is unavailable.');
    const fingerprint=awardFingerprint_(record,template),cached=existingAwardCertificate_(identityKey,record.award.id,fingerprint);
    if(cached)return cached;
    const folder=DriveApp.getFolderById(String(settings.AWARD_OUTPUT_FOLDER_ID));
    const filename="__ACADIA_TEXT_t0016__"+filenameSafe_(record.award.name)+'_'+filenameSafe_(record.name)+'_Certificate';
    working=template.makeCopy(filename+'_working',folder);
    const doc=DocumentApp.openById(working.getId());awardPopulateDocument_(doc,record);
    if(/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc)))throw new Error('The award template contains an unfilled field.');
    doc.saveAndClose();
    const pdf=folder.createFile(working.getAs(MimeType.PDF).setName(filename+'.pdf'));
    masterSpreadsheet_().getSheetByName(AWARD_PORTAL.LOG).appendRow([
      Utilities.getUuid(),new Date(),identityKey,record.name,record.email,record.award.id,record.award.workId,
      record.award.name,pdf.getId(),pdf.getName(),template.getId(),fingerprint
    ]);
    return certificateDownloadPayload_(pdf,false);
  }finally{if(working){try{working.setTrashed(true)}catch(ignored){}}lock.releaseLock()}
}

function RUN_VERIFY_AWARD_SETUP() {
  const settings=awardSettings_(),data=presenterBuildData_(presenterReadSources_(settings)),roster=awardRoster_();
  const text=collectDocumentText_(DocumentApp.openById(String(settings.AWARD_TEMPLATE_FILE_ID)));
  ['RECIPIENT_NAME','AUTHOR_ROLE','WORK_TYPE','AWARD_NAME','WORK_TITLE','AUTHOR_TEAM','ISSUED_DATE'].forEach(key=>{
    if(!text.includes('{{'+key+'}}'))throw new Error('Missing award template field: '+key);
  });
  const awards=roster.map(award=>{
    if(!data.works[award.workId] || data.works[award.workId].track!==award.track)throw new Error('Award work is not eligible: '+award.id);
    const authors=new Set(Object.values(data.identities).filter(identity=>identity.ids.includes(award.workId)).map(identity=>presenterAuthorKey_(identity.name)));
    if(!authors.size)throw new Error('No verified author identities for award: '+award.id);
    return {awardId:award.id,workId:award.workId,authors:authors.size};
  });
  awardLogRows_();
  const result={ok:true,awards:awards,templateReady:true};console.log(JSON.stringify(result));return result;
}
