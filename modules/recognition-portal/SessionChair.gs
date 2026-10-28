/** Session chair certificates. Coordination and presentation sources are read-only. */
const SESSION_CHAIR_PORTAL = Object.freeze({
  LOG: 'Session_Chair_Certificate_Log', SESSION_PREFIX: 'session-chair:', SESSION_SECONDS: 1800,
  VERSION: 'session-chair-v1'
});

function chairSettings_() {
  const s=getSettings_();
  if(!toBoolean_(s.PORTAL_ENABLED,true) || !toBoolean_(s.CHAIR_ENABLED,false))
    throw new Error('Session chair certificates are temporarily unavailable. Please try again later.');
  if(!s.CHAIR_TEMPLATE_FILE_ID || !s.CHAIR_OUTPUT_FOLDER_ID || !s.CHAIR_SOURCE_SPREADSHEET_ID ||
     !s.PRESENTER_SOURCE_SPREADSHEET_ID || !s.PRESENTER_AUTHOR_SPREADSHEET_ID)
    throw new Error("__ACADIA_TEXT_t0139__");
  return s;
}

function chairReadCoordination_(settings) {
  const book=SpreadsheetApp.openById(String(settings.CHAIR_SOURCE_SPREADSHEET_ID));
  const sheet=book.getSheetByName('Sessions');
  if(!sheet)throw new Error("__ACADIA_TEXT_t0140__");
  const values=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),sheet.getLastColumn()).getDisplayValues();
  const required=['Session ID','Session title','Date','Start (ET)','End (ET)','Session chair','Chair email'];
  const headerRow=values.findIndex(row=>required.every(h=>row.includes(h)));
  if(headerRow<0)throw new Error("__ACADIA_TEXT_t0141__");
  const headers=values[headerRow];
  return values.slice(headerRow+1).filter(row=>row.some(String)).map(row=>{
    const item={};headers.forEach((h,i)=>{if(h)item[h]=String(row[i] || '').trim()});return item;
  });
}

function chairTrack_(id,title) {
  const key=String(id || '').toUpperCase();
  const track=/^PR\d+$/.test(key)?'projects':/^P\d+$/.test(key)?'papers':/^FN\d+$/.test(key)?'field-notes':/^BF\d+$/.test(key)?'book-forum':'';
  const prefix={papers:/^Paper Session\b/i,projects:/^Project Session\b/i,'field-notes':/^Field Notes?\b/i,'book-forum':/^Book Forum\b/i};
  if(!track || !prefix[track].test(title))throw new Error("__ACADIA_TEXT_t0142__");
  return track;
}

function chairDate_(value) {
  const text=String(value || '').trim(),months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  let y,m,d,match=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(match){y=+match[1];m=+match[2];d=+match[3]}
  else {
    match=text.match(/^(?:[A-Za-z]+,\s*)?([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if(match){m=months.findIndex(s=>s.toLowerCase().startsWith(match[1].toLowerCase()))+1;d=+match[2];y=+match[3]}
  }
  const date=new Date(Date.UTC(y,m-1,d));
  if(!y || !m || date.getUTCFullYear()!==y || date.getUTCMonth()!==m-1 || date.getUTCDate()!==d)
    throw new Error("__ACADIA_TEXT_t0143__");
  return {key:y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),label:months[m-1]+' '+d+', '+y};
}

function chairTime_(value) {
  const match=String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if(!match)throw new Error("__ACADIA_TEXT_t0144__");
  let h=+match[1];const m=+match[2],ap=String(match[3] || '').toUpperCase();
  if(m>59 || (ap?(h<1 || h>12):h>23))throw new Error("__ACADIA_TEXT_t0144__");
  if(ap)h=h%12+(ap==='PM'?12:0);
  return {minutes:h*60+m,label:(h%12 || 12)+':'+String(m).padStart(2,'0')+' '+(h<12?'AM':'PM')};
}

/** All counts use the same confirmed presentation model as the presenter channel. */
function chairBuildRecord_(rows,data,name,email) {
  const wantedName=presenterName_(name),wantedEmail=normalizeEmail_(email),sessions={};let displayName='';
  rows.forEach(row=>{
    if(presenterName_(row['Session chair'])!==wantedName || normalizeEmail_(row['Chair email'])!==wantedEmail)return;
    const id=presenterId_(row['Session ID']),title=String(row['Session title'] || '').trim();
    const track=chairTrack_(id,title),date=chairDate_(row.Date),start=chairTime_(row['Start (ET)']),end=chairTime_(row['End (ET)']);
    if(end.minutes<=start.minutes)throw new Error("__ACADIA_TEXT_t0145__");
    const presentations=Object.values(data.works).filter(w=>w.sessions.some(s=>s.id===id));
    if(presentations.some(w=>w.track!==track))throw new Error("__ACADIA_TEXT_t0146__");
    const session={id,track,trackLabel:PRESENTER_PORTAL.TRACKS[track],title,date:date.key,dateLabel:date.label,
      start:start.label,end:end.label,startMinutes:start.minutes,presentationCount:presentations.length,
      presentationIds:presentations.map(w=>w.id).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))};
    if(sessions[id] && JSON.stringify(sessions[id])!==JSON.stringify(session))
      throw new Error("__ACADIA_TEXT_t0147__");
    sessions[id]=session;displayName=displayName || cleanText_(row['Session chair'],200);
  });
  const ordered=Object.values(sessions).sort((a,b)=>a.date.localeCompare(b.date) || a.startMinutes-b.startMinutes || a.id.localeCompare(b.id));
  return ordered.length?{name:displayName,email:wantedEmail,sessions:ordered,totalPresentations:ordered.reduce((n,s)=>n+s.presentationCount,0)}:null;
}

function chairMatch_(name,email,settings) {
  const rows=chairReadCoordination_(settings);
  if(!rows.some(r=>presenterName_(r['Session chair'])===presenterName_(name) && normalizeEmail_(r['Chair email'])===normalizeEmail_(email)))return null;
  return chairBuildRecord_(rows,presenterBuildData_(presenterReadSources_(settings)),name,email);
}
function chairPublicRecord_(record) {
  return {name:record.name,totalPresentations:record.totalPresentations,sessions:record.sessions.map(s=>({
    id:s.id,track:s.track,trackLabel:s.trackLabel,title:s.title,date:s.date,dateLabel:s.dateLabel,start:s.start,end:s.end,presentationCount:s.presentationCount
  }))};
}

function loginSessionChair(name,email) {
  const s=chairSettings_(),raw=String(name == null?'':name),clean=cleanText_(raw,200),mail=normalizeEmail_(email);
  const mismatch="__ACADIA_TEXT_t0148__";
  if(!clean || raw.length>200 || mail.length>254 || !isValidEmail_(mail))throw new Error(mismatch);
  const cache=CacheService.getScriptCache(),key='chair-'+loginFailureKey_(mail),failures=Number(cache.get(key) || 0);
  if(failures>=8)throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  const record=chairMatch_(clean,mail,s);
  if(!record){cache.put(key,String(failures+1),600);throw new Error(mismatch)}
  cache.remove(key);
  const token=Utilities.getUuid()+Utilities.getUuid().replace(/-/g,'');
  cache.put(SESSION_CHAIR_PORTAL.SESSION_PREFIX+token,JSON.stringify({name:record.name,email:record.email}),SESSION_CHAIR_PORTAL.SESSION_SECONDS);
  return {ok:true,token,chair:chairPublicRecord_(record)};
}
function logoutSessionChair(token) {
  const clean=cleanToken_(token);if(clean)CacheService.getScriptCache().remove(SESSION_CHAIR_PORTAL.SESSION_PREFIX+clean);return {ok:true};
}
function chairFromSession_(token,settings) {
  const clean=cleanToken_(token),value=clean && CacheService.getScriptCache().get(SESSION_CHAIR_PORTAL.SESSION_PREFIX+clean);
  if(!value)throw new Error('Your session has expired. Please sign in again.');
  const identity=JSON.parse(value),record=chairMatch_(identity.name,identity.email,settings);
  if(!record)throw new Error("__ACADIA_TEXT_t0149__");
  return record;
}
function chairFingerprint_(record,template) {
  return presenterDigest_(JSON.stringify([record,template.getId(),template.getLastUpdated().getTime(),SESSION_CHAIR_PORTAL.VERSION]));
}
function chairLog_() {
  const sheet=masterSpreadsheet_().getSheetByName(SESSION_CHAIR_PORTAL.LOG);
  if(!sheet)throw new Error('The session chair certificate log is unavailable.');return sheet;
}
function chairExistingCertificate_(identityKey,fingerprint) {
  const rows=chairLog_().getDataRange().getValues();
  for(let i=rows.length-1;i>0;i--){
    if(String(rows[i][2])!==identityKey || String(rows[i][11])!==fingerprint)continue;
    try{const file=DriveApp.getFileById(String(rows[i][8]));if(!file.isTrashed())return certificateDownloadPayload_(file,true)}catch(ignored){}
  }
  return null;
}
function chairSessionText_(session) {
  return session.trackLabel+' track — '+session.title+'\n'+
    'on '+session.dateLabel+', from '+session.start+' to '+session.end+'\n'+
    "__ACADIA_TEXT_t0150__"+session.presentationCount+' presentation'+(session.presentationCount===1?'':'s');
}
function chairPopulateDocument_(doc,record) {
  const body=doc.getBody(),count=record.sessions.length;
  const statement='served as Session Chair for '+count+' session'+(count===1?'':'s')+'\nand moderated '+record.totalPresentations+' presentation'+(record.totalPresentations===1?'':'s')+' at';
  const entries=record.sessions.map(chairSessionText_),inline=count<=2 && entries.join('\n\n').length<=650;
  workshopTokenFontSize_(body,'{{CHAIR_NAME}}',record.name.length>35?21:26);
  replaceDocumentPlaceholders_(doc,{'{{CHAIR_NAME}}':record.name,'{{CHAIR_STATEMENT}}':statement,
    '{{CHAIR_SESSIONS}}':inline?entries.join('\n\n'):record.sessions.map(s=>s.trackLabel).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')+'\nThe complete session record follows on the next page.',
    '{{ISSUED_DATE}}':Utilities.formatDate(new Date(),"__ACADIA_TEXT_t0023__",'MMMM d, yyyy')});
  if(!inline){
    body.appendPageBreak();
    const heading=body.appendParagraph('SESSION CHAIR RECORD');
    heading.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(14).editAsText().setFontFamily('Montserrat').setFontSize(16).setBold(false);
    const who=body.appendParagraph(record.name+"__ACADIA_TEXT_t0133__");
    who.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(20).editAsText().setFontFamily('Montserrat').setFontSize(11).setBold(false);
    entries.forEach((entry,i)=>{
      const paragraph=body.appendParagraph((i+1)+'. '+entry);
      paragraph.setSpacingAfter(16).editAsText().setFontFamily('Montserrat').setFontSize(11).setBold(false);
    });
  }
}
function generateSessionChairCertificate(token) {
  const s=chairSettings_(),template=DriveApp.getFileById(String(s.CHAIR_TEMPLATE_FILE_ID));
  if(template.getMimeType()!==MimeType.GOOGLE_DOCS)throw new Error('The session chair template is unavailable.');
  let record=chairFromSession_(token,s);
  const identityKey=presenterDigest_(presenterName_(record.name)+'|'+record.email),existing=chairExistingCertificate_(identityKey,chairFingerprint_(record,template));
  if(existing)return existing;
  const lock=LockService.getScriptLock();lock.waitLock(30000);let working=null;
  try{
    record=chairFromSession_(token,s);
    const fingerprint=chairFingerprint_(record,template),cached=chairExistingCertificate_(identityKey,fingerprint);if(cached)return cached;
    const folder=DriveApp.getFolderById(String(s.CHAIR_OUTPUT_FOLDER_ID)),fileName="__ACADIA_TEXT_t0151__"+filenameSafe_(record.name)+'_Certificate';
    working=template.makeCopy(fileName+'_working',folder);
    const doc=DocumentApp.openById(working.getId());chairPopulateDocument_(doc,record);
    if(/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc)))throw new Error('The session chair template contains an unfilled field.');
    doc.saveAndClose();const pdf=folder.createFile(working.getAs(MimeType.PDF).setName(fileName+'.pdf'));
    chairLog_().appendRow([Utilities.getUuid(),new Date(),identityKey,record.name,record.email,record.sessions.map(s=>s.id).join(', '),record.sessions.length,record.totalPresentations,pdf.getId(),pdf.getName(),template.getId(),fingerprint]);
    return certificateDownloadPayload_(pdf,false);
  }finally{if(working){try{working.setTrashed(true)}catch(ignored){}}lock.releaseLock()}
}

function RUN_VERIFY_SESSION_CHAIR_SETUP() {
  const settings=getSettings_(),rows=chairReadCoordination_(settings),data=presenterBuildData_(presenterReadSources_(settings));
  const file=DriveApp.getFileById(String(settings.CHAIR_TEMPLATE_FILE_ID));
  if(file.getMimeType()!==MimeType.GOOGLE_DOCS)throw new Error('A native Google Docs session chair template is required.');
  const text=collectDocumentText_(DocumentApp.openById(file.getId()));
  const missing=['CHAIR_NAME','CHAIR_STATEMENT','CHAIR_SESSIONS','ISSUED_DATE'].filter(k=>!text.includes('{{'+k+'}}'));
  if(missing.length)throw new Error('Missing template fields: '+missing.join(', '));
  chairLog_();DriveApp.getFolderById(String(settings.CHAIR_OUTPUT_FOLDER_ID)).getName();
  const pairs={};rows.forEach(r=>{
    const name=cleanText_(r['Session chair'],200),email=normalizeEmail_(r['Chair email']);
    if(!name || !isValidEmail_(email))throw new Error('A chair name/email is missing or invalid.');
    pairs[presenterName_(name)+'|'+email]={name,email};
  });
  const records=Object.values(pairs).map(p=>chairBuildRecord_(rows,data,p.name,p.email));
  const sessions={};records.forEach(r=>r.sessions.forEach(s=>{sessions[s.id]={id:s.id,track:s.track,title:s.title,date:s.date,start:s.start,end:s.end,presentations:s.presentationCount}}));
  const result={ok:true,chairs:records.length,sessions:Object.keys(sessions).length,presentations:Object.values(sessions).reduce((n,s)=>n+s.presentations,0),sessionSummary:Object.values(sessions)};
  console.log(JSON.stringify(result));return result;
}
