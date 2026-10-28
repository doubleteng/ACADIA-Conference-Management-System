/** ACADIA presentation module. Install manually; does not modify legacy task data. */
const PRES_ = Object.freeze({
  TEMPLATE: "__ACADIA_RESOURCE_presentationTemplateId__",
  ADMIN: 'ACADIA_PRESENTATION_ADMIN_ID', ROOT: 'ACADIA_PRESENTATION_ROOT_ID',
  UPLOAD: 'PRES_UPLOAD_', ACTIVE: 'PRES_ACTIVE_', CURRENT: 'PRES_CURRENT_',
  VIDEO_CURRENT: 'PRES_CURRENT_VIDEO_',
  TTL: 7 * 86400000,
  HEADERS: {
    Sessions: ['Session ID','Track','Subtheme','Session Title','Date','Start Time','End Time','Time Zone','Venue','Room','Chair','Folder ID','Chair Override'],
    Assignments: ['Paper ID','Session ID','Order','Presentation Start','Presentation End','Title','Authors','Presenter Name','Presenter Last Name','Schedule Source ID'],
    Uploads: ['Upload ID','Paper ID','Session ID','Presenter Name','Presenter Last Name','Title','File ID','File Name','Bytes','Version','Active','Uploaded At','Late','Folder ID','Original File Name'],
    Settings: ['Key','Value','Notes']
  }
});

function presentationSupported_(track) {
  return ['Full Paper','Projects','Field Note','Book Forum'].indexOf(normalizeTrack_(track)) !== -1;
}

function presentationPortalTasks_(paperId, track) {
  if (!presentationSupported_(track)) return [];
  const id=normalizePaperId_(paperId);
  const current = [presentationReadJson_(PRES_.CURRENT+id),presentationReadJson_(PRES_.VIDEO_CURRENT+id)]
    .filter(Boolean).sort(function(a,b){return new Date(b.uploadedAt).getTime()-new Date(a.uploadedAt).getTime();})[0]||null;
  return [{id:'presentation',name:'Conference presentation',phase:'presentation',order:normalizeTrack_(track)==='Book Forum'?4:8,
    status:current?'Uploaded':'Not started',submittedAt:current?current.uploadedAt:'',approvedAt:'',actionRequiredNote:''}];
}

function presentationReadJson_(key) {
  const value=PropertiesService.getScriptProperties().getProperty(key);
  return value?JSON.parse(value):null;
}

function presentationBook_() {
  const id=PropertiesService.getScriptProperties().getProperty(PRES_.ADMIN);
  if(!id) throw new Error('The presentation module is awaiting organizer setup.');
  return SpreadsheetApp.openById(id);
}

function presentationRows_(book,name) {
  const sheet=book.getSheetByName(name);
  if(!sheet) throw new Error('Presentation administration sheet is missing: '+name);
  const values=sheet.getDataRange().getDisplayValues(), heads=values.shift()||[];
  return values.map(function(row,i){const item={__row:i+2};heads.forEach(function(h,j){item[h]=row[j]||'';});return item;}).filter(function(r){return r[heads[0]];});
}

function presentationText_(value) {
  const text=String(value==null?'':value);
  return /^[=+@\-]/.test(text)?"'"+text:text;
}

function presentationAppend_(book,name,item) {
  const sheet=book.getSheetByName(name),heads=PRES_.HEADERS[name];
  sheet.getRange(sheet.getLastRow()+1,1,1,heads.length).setValues([heads.map(function(h){const v=item[h];return typeof v==='string'?presentationText_(v):v==null?'':v;})]);
}

function presentationSettings_(book) {
  const settings={TEMPLATE_FILE_ID:PRES_.TEMPLATE,DEADLINE_UTC:"__ACADIA_TEXT_t0065__",DEADLINE_LABEL:"__ACADIA_TEXT_t0066__",MAX_BYTES:String(3*1024*1024*1024),UPLOADS_ENABLED:'TRUE',FIELD_NOTE_INSTRUCTIONS:'Please prepare an 8-minute presentation. We will be strict with time.',PROJECT_MINUTES:'8'};
  presentationRows_(book,'Settings').forEach(function(r){settings[r.Key]=r.Value;});
  // Deadlines are display-only reminders. They never gate loading, starting, resuming, or completing an upload.
  if(!Number.isSafeInteger(Number(settings.MAX_BYTES))||Number(settings.MAX_BYTES)<1||Number(settings.MAX_BYTES)>5*1024*1024*1024) throw new Error('The presentation size limit is invalid. Please contact the organizers.');
  return settings;
}

function presentationContext_(paperId,book,loaded) {
  const all=loaded?loaded.assignments:presentationRows_(book,'Assignments');
  const matches=all.filter(function(r){return normalizePaperId_(r['Paper ID'])===normalizePaperId_(paperId);});
  if(matches.length>1) throw new Error('This submission has duplicate presentation assignments. Please contact the organizers.');
  const assignment=matches[0]||null;
  const sessions=loaded?loaded.sessions:presentationRows_(book,'Sessions');
  const found=assignment&&assignment['Session ID']?sessions.filter(function(r){return r['Session ID']===assignment['Session ID'];}):[];
  if(found.length>1) throw new Error('The session ID is duplicated. Please contact the organizers.');
  if(assignment&&assignment['Session ID']&&!found.length) throw new Error('The assigned session could not be found. Please contact the organizers.');
  if(found[0]&&found[0]['Chair Override'])found[0].Chair=found[0]['Chair Override'];
  return {assignment:assignment,session:found[0]||null,peers:found.length?all.filter(function(r){return r['Session ID']===found[0]['Session ID'];}).sort(function(a,b){return Number(a.Order)-Number(b.Order);}):[]};
}

/** Upload requirements follow the confirmed session date (Detroit local time). */
function presentationRequirements_(context) {
  const day=String(context&&context.session&&context.session.Date||'').trim();
  const rule=conferenceEdition_().presentationDays.find(function(r){return r.date===day;});
  if(!rule)return {confirmed:false,date:day,dateLabel:day,deadlineUtc:'',deadlineLabel:'Confirm with the organizers',venue:'',address:'',downtown:false,handover:'Your presentation date is not yet confirmed. You may upload now.',restrictions:[]};
  return Object.assign({confirmed:true,date:day,dateLabel:day,deadlineUtc:'',deadlineLabel:'',venue:context.session.Venue||'',address:'',downtown:false,handover:'',restrictions:[]},rule);
}

function presentationUploadIsLate_(uploadedAt,requirements) {
  return Boolean(requirements&&requirements.deadlineUtc&&new Date(uploadedAt).getTime()>new Date(requirements.deadlineUtc).getTime());
}

function getPresentationData(sessionToken) {
  const args = arguments;
  return withSheetObjectsRuntimeCache_(function () {
    return getPresentationDataPerformanceImpl_.apply(null, args);
  });
}

function getPresentationDataPerformanceImpl_(sessionToken) {
  const session=requireAuthorSession_(sessionToken),sub=requireSubmission_(session.paperId);
  if(!presentationSupported_(sub.Track)) throw new Error('This step does not apply to this track.');
  // Schedule edits and the existing five-minute trigger synchronize in the background.
  // A read must not wait for the sync lock or rewrite schedule tables.
  const book=presentationBook_();
  const cfg=presentationSettings_(book),ctx=presentationContext_(session.paperId,book);
  const requirements=presentationRequirements_(ctx);
  const track=normalizeTrack_(sub.Track),current=presentationReadJson_(PRES_.CURRENT+session.paperId);
  const videoCurrent=presentationReadJson_(PRES_.VIDEO_CURRENT+session.paperId);
  const pendingId=PropertiesService.getScriptProperties().getProperty(PRES_.ACTIVE+session.paperId);
  const pending=pendingId?presentationReadJson_(PRES_.UPLOAD+pendingId):null;
  const assignment=ctx.assignment||{};
  let instruction='';
  if(track==='Full Paper') instruction=ctx.session&&ctx.peers.length===4
    ?'Your session has four papers. You may present for up to 15 minutes. We will be strict with time.'
    :'Papers should plan for a 12–15 minute presentation. If your session has only four papers, it can be up to 15 minutes. We will be strict with time.';
  else if(track==='Projects') instruction='Please prepare an '+cfg.PROJECT_MINUTES+'-minute presentation. We will be strict with time.';
  else if(track==='Field Note') instruction=cfg.FIELD_NOTE_INSTRUCTIONS;
  const templateId=String(cfg.TEMPLATE_FILE_ID||PRES_.TEMPLATE).trim();
  return {paperId:session.paperId,track:track,title:String(sub['Final Title']||sub['Original Title']||''),
    scheduleSync:presentationScheduleStatus_(),calendar:presentationCalendarInfo_(session.paperId,ctx),session:ctx.session,order:assignment.Order||'',presentationStart:assignment['Presentation Start']||'',presentationEnd:assignment['Presentation End']||'',
    peers:ctx.peers.map(function(r){return {paperId:r['Paper ID'],order:r.Order,title:r.Title,authors:r.Authors,presenter:r['Presenter Name']||''};}),
    presenterName:assignment['Presenter Name']||(current&&current.presenterName)||(videoCurrent&&videoCurrent.presenterName)||String(sub['Presenting Author']||''),
    presenterLastName:assignment['Presenter Last Name']||(current&&current.presenterLastName)||(videoCurrent&&videoCurrent.presenterLastName)||'',
    instruction:instruction,templateUrl:templateId?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(templateId):'',
    requirements:requirements,deadlineLabel:requirements.deadlineLabel,deadlineUtc:requirements.deadlineUtc,isLate:presentationUploadIsLate_(Date.now(),requirements),
    maxBytes:Number(cfg.MAX_BYTES),uploadsEnabled:parseBoolean_(cfg.UPLOADS_ENABLED,true)&&parseBoolean_(getConfig_().PORTAL_ENABLED,true),
    current:current?Object.assign({},current,{fileKind:'slides',late:presentationUploadIsLate_(current.uploadedAt,requirements)}):null,
    videoCurrent:videoCurrent?Object.assign({},videoCurrent,{fileKind:'video',late:presentationUploadIsLate_(videoCurrent.uploadedAt,requirements)}):null,
    pending:pending&&pending.expiresAt>Date.now()&&!pending.completed&&!pending.abandoned
      ?{uploadId:pending.uploadId,originalName:pending.originalName,size:pending.size,fingerprint:pending.fingerprint,presenterName:pending.presenterName,presenterLastName:pending.presenterLastName}:null};
}

function presentationSafePart_(value,maxLength) {
  return String(value||'').normalize('NFC').replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g,' ').replace(/\s+/g,' ').trim().replace(/[. ]+$/g,'').slice(0,maxLength||130).trim();
}

function presentationFileType_(filename) {
  const match=String(filename||'').match(/\.([a-z0-9]+)$/i);
  if(!match)return null;
  const extension=match[1].toLowerCase();
  const types={ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp4:'video/mp4',mov:'video/quicktime',m4v:'video/x-m4v',webm:'video/webm',avi:'video/x-msvideo',mkv:'video/x-matroska'};
  if(!Object.prototype.hasOwnProperty.call(types,extension))return null;
  return {extension:extension,mime:types[extension],kind:extension==='ppt'||extension==='pptx'?'slides':'video'};
}

function presentationFileKind_(filename) {
  const type=presentationFileType_(filename);
  return type?type.kind:'';
}

function presentationFilename_(id,lastName,title,extension,track) {
  if(normalizeTrack_(track)==='Book Forum') {
    const bookTitle=presentationSafePart_(title,240-extension.length-1);
    if(!bookTitle) throw new Error('The book title is missing. Please contact the organizers.');
    return bookTitle+'.'+extension;
  }
  const last=presentationSafePart_(lastName,60);
  if(!last) throw new Error('Enter the presenter’s family/last name.');
  const paperId=presentationSafePart_(id,30);
  return paperId+'_'+last+'_'+presentationSafePart_(title,240-paperId.length-last.length-extension.length-3)+'.'+extension;
}

function presentationTarget_(book,context) {
  const root=PropertiesService.getScriptProperties().getProperty(PRES_.ROOT);
  if(!root) throw new Error('Presentation upload folders have not been configured.');
  if(!context.session) return driveEnsureFolder_(root,'_Unassigned').id;
  const s=context.session;
  if(s['Folder ID']) return s['Folder ID'];
  const theme=driveEnsureFolder_(root,presentationSafePart_(s.Subtheme.replace(/\//g,' + '),130));
  const folder=driveEnsureFolder_(theme.id,presentationSafePart_(s['Session ID']+' - '+s['Session Title'],170));
  book.getSheetByName('Sessions').getRange(s.__row,12).setValue(folder.id);
  return folder.id;
}

function presentationAssertUpload_(sessionToken) {
  const session=requireAuthorSession_(sessionToken),sub=requireSubmission_(session.paperId);
  if(!presentationSupported_(sub.Track)) throw new Error('This step does not apply to this track.');
  if(!parseBoolean_(getConfig_().PORTAL_ENABLED,true)) throw new Error('The Author Hub is temporarily closed.');
  const book=presentationBook_();presentationSyncSchedule_(book);const cfg=presentationSettings_(book);
  if(!parseBoolean_(cfg.UPLOADS_ENABLED,true)) throw new Error('Presentation uploads are temporarily closed.');
  return {session:session,sub:sub,book:book,cfg:cfg};
}

function presentationReceipt_(session,uploadId) {
  if(!/^[a-zA-Z0-9-]{20,60}$/.test(String(uploadId||''))) throw new Error('Invalid upload reference.');
  let r=presentationReadJson_(PRES_.UPLOAD+uploadId);
  if(!r) {
    const saved=presentationRows_(presentationBook_(),'Uploads').find(function(x){return x['Upload ID']===uploadId&&x['Paper ID']===session.paperId;});
    if(saved) {
      const result={uploadId:uploadId,fileId:saved['File ID'],fileName:saved['File Name'],fileKind:presentationFileKind_(saved['File Name']),size:Number(saved.Bytes),version:Number(saved.Version),uploadedAt:saved['Uploaded At'],late:parseBoolean_(saved.Late,false),sessionId:saved['Session ID'],presenterName:saved['Presenter Name'],presenterLastName:saved['Presenter Last Name']};
      r={uploadId:uploadId,paperId:session.paperId,completed:true,expiresAt:Date.now()+60000,size:result.size,fileName:result.fileName,result:result};
    }
  }
  if(!r||r.paperId!==session.paperId||r.abandoned) throw new Error('This upload is unavailable for this submission.');
  if(r.expiresAt<Date.now()) throw new Error('This upload session expired. Please start a new upload.');
  return r;
}

function startPresentationUpload(sessionToken,payload) {
  const c=presentationAssertUpload_(sessionToken);payload=payload||{};
  const size=Number(payload.size),fileType=presentationFileType_(payload.originalName);
  if(!Number.isSafeInteger(size)||size<1||size>Number(c.cfg.MAX_BYTES)) throw new Error('The presentation file exceeds the configured size limit or is empty.');
  if(!fileType) throw new Error('Upload PowerPoint (.ppt or .pptx) or a presentation video (.mp4, .mov, .m4v, .webm, .avi, or .mkv).');
  const ext=fileType.extension;
  if(!/^[a-f0-9]{64}$/.test(String(payload.fingerprint||''))) throw new Error('File verification is missing. Please choose the file again.');
  const presenter=String(payload.presenterName||'').trim(),last=String(payload.presenterLastName||'').trim();
  const isBook=normalizeTrack_(c.sub.Track)==='Book Forum';
  if(!presenter||presenter.length>160||(!isBook&&!last)||last.length>80) throw new Error('Enter the actual presenter’s name'+(isBook?'':' and family/last name')+'.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const props=PropertiesService.getScriptProperties();
    presentationPruneReceipts_();
    const pendingId=props.getProperty(PRES_.ACTIVE+c.session.paperId);
    const old=pendingId?presentationReadJson_(PRES_.UPLOAD+pendingId):null;
    if(old&&!old.completed&&!old.abandoned&&old.expiresAt>Date.now()) {
      if(old.fingerprint===payload.fingerprint&&old.size===size) return presentationUploadClient_(old);
      throw new Error('Another upload is pending. Resume it or discard that upload before choosing a different file.');
    }
    const ctx=presentationContext_(c.session.paperId,c.book),folderId=presentationTarget_(c.book,ctx);
    const uploadId=Utilities.getUuid(),title=String(c.sub['Final Title']||c.sub['Original Title']||'');
    const ids=JSON.parse(driveApiFetch_('https://www.googleapis.com/drive/v3/files/generateIds?count=1&space=drive&type=files',{method:'get'}).getContentText());
    const mime=fileType.mime;
    const r={uploadId:uploadId,paperId:c.session.paperId,fileId:ids.ids[0],size:size,fingerprint:payload.fingerprint,
      originalName:String(payload.originalName).slice(0,220),presenterName:presenter,presenterLastName:last,title:title,
      fileName:presentationFilename_(c.session.paperId,last,title,ext,c.sub.Track),parentId:folderId,sessionId:ctx.session?ctx.session['Session ID']:'',
      mime:mime,fileKind:fileType.kind,expiresAt:Date.now()+PRES_.TTL,completed:false};
    const response=driveApiFetch_('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,size,parents,appProperties',{
      method:'post',contentType:'application/json; charset=UTF-8',headers:{'X-Upload-Content-Type':mime,'X-Upload-Content-Length':String(size)},
      payload:JSON.stringify({id:r.fileId,name:r.fileName,mimeType:mime,parents:[folderId],appProperties:{acadiaPresentationUpload:uploadId,acadiaPaperId:r.paperId}})});
    const headers=response.getAllHeaders();const locationKey=Object.keys(headers).find(function(k){return k.toLowerCase()==='location';});
    r.uploadUrl=locationKey?String(headers[locationKey]):'';
    if(!/^https:\/\/www\.googleapis\.com\/upload\/drive\/v3\/files\?/.test(r.uploadUrl)) throw new Error('Google Drive did not return an upload session.');
    props.setProperty(PRES_.UPLOAD+uploadId,JSON.stringify(r));props.setProperty(PRES_.ACTIVE+r.paperId,uploadId);
    return presentationUploadClient_(r);
  } finally {lock.releaseLock();}
}

function presentationUploadClient_(r) {
  return {uploadId:r.uploadId,uploadUrl:r.completed?'':r.uploadUrl,size:r.size,fingerprint:r.fingerprint,fileName:r.fileName,
    mime:r.mime,expiresAt:r.expiresAt,completed:Boolean(r.completed),result:r.result||null};
}

function resumePresentationUpload(sessionToken,uploadId,fingerprint) {
  const c=presentationAssertUpload_(sessionToken),r=presentationReceipt_(c.session,uploadId);
  if(!r.completed&&r.fingerprint!==fingerprint) throw new Error('Select the same unchanged presentation file to resume.');
  return presentationUploadClient_(r);
}

/** Queries upload progress without relaying any file bytes. Also works if CORS hides Range. */
function getPresentationUploadStatus(sessionToken,uploadId) {
  const session=requireAuthorSession_(sessionToken),r=presentationReceipt_(session,uploadId);
  if(r.completed) return {complete:true,offset:r.size};
  const response=UrlFetchApp.fetch(r.uploadUrl,{method:'put',headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken(),'Content-Range':'bytes */'+r.size},payload:'',muteHttpExceptions:true,followRedirects:false});
  const code=response.getResponseCode();
  if(code===200||code===201) return {complete:true,offset:r.size};
  if(code===308) {
    const headers=response.getAllHeaders(),key=Object.keys(headers).find(function(k){return k.toLowerCase()==='range';});
    const match=key?String(headers[key]).match(/bytes=0-(\d+)/):null;
    return {complete:false,offset:match?Number(match[1])+1:0};
  }
  if(code===404||code===410) {
    try {const meta=driveGetMetadata_(r.fileId,'id,size,appProperties,trashed');
      if(!meta.trashed&&Number(meta.size)===r.size&&meta.appProperties&&meta.appProperties.acadiaPresentationUpload===r.uploadId) return {complete:true,offset:r.size};
    } catch(ignore) {}
    throw new Error('The Drive upload session expired. Discard the pending upload and start again.');
  }
  throw new Error('Unable to check upload progress (HTTP '+code+'). Please retry.');
}

function abandonPresentationUpload(sessionToken,uploadId) {
  const c=presentationAssertUpload_(sessionToken),lock=LockService.getScriptLock();lock.waitLock(10000);
  try {const r=presentationReceipt_(c.session,uploadId);if(r.completed) return {completed:true};
    const props=PropertiesService.getScriptProperties();props.deleteProperty(PRES_.UPLOAD+uploadId);
    if(props.getProperty(PRES_.ACTIVE+r.paperId)===uploadId) props.deleteProperty(PRES_.ACTIVE+r.paperId);
    return {abandoned:true};
  } finally {lock.releaseLock();}
}

function finishPresentationUpload(sessionToken,uploadId) {
  const c=presentationAssertUpload_(sessionToken),lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const r=presentationReceipt_(c.session,uploadId),props=PropertiesService.getScriptProperties();
    if(r.completed) return r.result;
    const meta=driveGetMetadata_(r.fileId,'id,name,size,parents,trashed,appProperties');
    if(meta.trashed||meta.id!==r.fileId||Number(meta.size)!==r.size||meta.name!==r.fileName||!meta.appProperties||meta.appProperties.acadiaPresentationUpload!==r.uploadId||meta.appProperties.acadiaPaperId!==r.paperId) {
      throw new Error('The uploaded file could not be verified. No file was deleted. Please contact the organizers.');
    }
    const rows=presentationRows_(c.book,'Uploads'),existing=rows.find(function(x){return x['Upload ID']===r.uploadId;});
    const ctx=presentationContext_(r.paperId,c.book),destination=presentationTarget_(c.book,ctx);
    // A changed session assignment is resolved on the server, never from a caller-supplied file/folder ID.
    if(!existing&&(meta.parents||[]).indexOf(r.parentId)<0) throw new Error('The upload folder could not be verified. No file was deleted.');
    if((meta.parents||[]).indexOf(destination)<0) driveMoveFile_(r.fileId,destination);
    const fileKind=presentationFileKind_(r.fileName);
    if(!fileKind)throw new Error('The presentation file type could not be verified. Existing uploads were kept.');
    const version=existing?Number(existing.Version):1+rows.filter(function(x){return x['Paper ID']===r.paperId&&presentationFileKind_(x['File Name'])===fileKind;}).reduce(function(n,x){return Math.max(n,Number(x.Version)||0);},0);
    const uploadedAt=existing?existing['Uploaded At']:new Date().toISOString();
    const late=presentationUploadIsLate_(uploadedAt,presentationRequirements_(ctx));
    if(!existing) presentationAppend_(c.book,'Uploads',{'Upload ID':r.uploadId,'Paper ID':r.paperId,'Session ID':ctx.session?ctx.session['Session ID']:'',
      'Presenter Name':r.presenterName,'Presenter Last Name':r.presenterLastName,'Title':r.title,'File ID':r.fileId,'File Name':r.fileName,'Bytes':r.size,
      'Version':version,'Active':true,'Uploaded At':uploadedAt,'Late':late,'Folder ID':destination,'Original File Name':r.originalName});
    const result={uploadId:r.uploadId,fileId:r.fileId,fileName:r.fileName,fileKind:fileKind,size:r.size,version:version,uploadedAt:uploadedAt,late:late,
      sessionId:ctx.session?ctx.session['Session ID']:'',presenterName:r.presenterName,presenterLastName:r.presenterLastName};
    props.setProperty((fileKind==='video'?PRES_.VIDEO_CURRENT:PRES_.CURRENT)+r.paperId,JSON.stringify(result));
    // Slides and video remain separate active files; retain every earlier version in the archive.
    rows.filter(function(x){return x['Paper ID']===r.paperId&&x['Upload ID']!==r.uploadId&&parseBoolean_(x.Active,false)&&presentationFileKind_(x['File Name'])===fileKind;}).forEach(function(old){
      const archive=driveEnsureFolder_(destination,'_Previous versions');
      const oldMeta=driveGetMetadata_(old['File ID'],'id,parents,trashed,appProperties');
      if(oldMeta.trashed) {c.book.getSheetByName('Uploads').getRange(old.__row,11).setValue(false);return;}
      if(!oldMeta.appProperties||oldMeta.appProperties.acadiaPaperId!==r.paperId||oldMeta.appProperties.acadiaPresentationUpload!==old['Upload ID']) throw new Error('Previous presentation ownership could not be verified. Please contact the organizers.');
      driveMoveFile_(old['File ID'],archive.id);
      driveRenameFile_(old['File ID'],old['File Name'].replace(/(\.[^.]+)$/,'_v'+String(old.Version).padStart(2,'0')+'$1'));
      c.book.getSheetByName('Uploads').getRange(old.__row,11).setValue(false);
      c.book.getSheetByName('Uploads').getRange(old.__row,14).setValue(archive.id);
    });
    if(ctx.assignment) c.book.getSheetByName('Assignments').getRange(ctx.assignment.__row,8,1,2).setValues([[presentationText_(r.presenterName),presentationText_(r.presenterLastName)]]);
    // Completed results are recovered from the durable ledger; do not fill the 500 KB property store with history.
    props.deleteProperty(PRES_.UPLOAD+r.uploadId);
    if(props.getProperty(PRES_.ACTIVE+r.paperId)===r.uploadId) props.deleteProperty(PRES_.ACTIVE+r.paperId);
    return result;
  } finally {lock.releaseLock();}
}

function presentationPruneReceipts_() {
  const props=PropertiesService.getScriptProperties(),all=props.getProperties();
  Object.keys(all).filter(function(k){return k.indexOf(PRES_.UPLOAD)===0;}).forEach(function(k){
    try {const r=JSON.parse(all[k]);if(r.expiresAt<Date.now()) {props.deleteProperty(k);if(all[PRES_.ACTIVE+r.paperId]===r.uploadId) props.deleteProperty(PRES_.ACTIVE+r.paperId);}} catch(ignore) {}
  });
}

/** MANUAL INSTALLER. Creates a NEW private admin workbook and folders; does not rewrite Master. */
function RUN_INSTALL_PRESENTATION_MODULE() {
  assertChairEditorRun_();const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const props=PropertiesService.getScriptProperties();
    if(props.getProperty(PRES_.ADMIN)) {console.log('Already installed: '+presentationBook_().getUrl());return {alreadyInstalled:true,adminUrl:presentationBook_().getUrl()};}
    const root=driveCreateFolder_(DriveApp.getRootFolder().getId(),"__ACADIA_TEXT_t0067__");
    // A newly created workbook in the owner's private root avoids inheriting the public Master permission.
    const book=SpreadsheetApp.create("__ACADIA_TEXT_t0068__");
    driveMoveFile_(book.getId(),root.id);
    Object.keys(PRES_.HEADERS).forEach(function(name,i){
      const sheet=i===0?book.getSheets()[0].setName(name):book.insertSheet(name),heads=PRES_.HEADERS[name];
      sheet.getRange(1,1,1,heads.length).setValues([heads]).setFontWeight('bold').setBackground('#17324d').setFontColor('#ffffff');
      sheet.setFrozenRows(1);sheet.getRange(1,1,sheet.getMaxRows(),heads.length).setVerticalAlignment('top');
      sheet.setColumnWidths(1,heads.length,150);
    });
    props.setProperty(PRES_.ROOT,root.id);
    const seed=presentationSeed_();
    book.getSheetByName('Sessions').getRange('E:G').setNumberFormat('@');
    book.getSheetByName('Assignments').getRange('A:B').setNumberFormat('@');
    book.getSheetByName('Assignments').getRange('D:E').setNumberFormat('@');
    ['Sessions','Assignments'].forEach(function(name){
      const rows=name==='Sessions'?seed.sessions:seed.assignments;
      if(rows.length) book.getSheetByName(name).getRange(2,1,rows.length,PRES_.HEADERS[name].length).setValues(rows.map(function(row){return PRES_.HEADERS[name].map(function(h){const v=row[h];return typeof v==='string'?presentationText_(v):v==null?'':v;});}));
    });
    [
      ['TEMPLATE_FILE_ID',PRES_.TEMPLATE,"__ACADIA_TEXT_t0069__"],
      ['DEADLINE_UTC',"__ACADIA_TEXT_t0065__","__ACADIA_TEXT_t0070__"],
      ['DEADLINE_LABEL',"__ACADIA_TEXT_t0066__",'Author-facing date; keep aligned with DEADLINE_UTC.'],
      ['MAX_BYTES',String(3*1024*1024*1024),'Maximum presentation file size: 3 GiB (approximately 3.22 GB).'],
      ['UPLOADS_ENABLED','TRUE','Set FALSE to pause only presentation uploads.'],
      ['PROJECT_MINUTES','8','Project presentation duration in minutes.'],
      ['FIELD_NOTE_INSTRUCTIONS','Please prepare an 8-minute presentation. We will be strict with time.','Approved Field Note presentation instructions.']
    ].forEach(function(r){presentationAppend_(book,'Settings',{Key:r[0],Value:r[1],Notes:r[2]});});
    presentationRows_(book,'Sessions').forEach(function(s){presentationTarget_(book,{session:s});});
    driveEnsureFolder_(root.id,'_Unassigned');
    ['Sessions','Assignments','Uploads','Settings'].forEach(function(name){const s=book.getSheetByName(name);s.getRange(1,1,s.getLastRow(),PRES_.HEADERS[name].length).createFilter();});
    book.getSheetByName('Assignments').setColumnWidth(6,440);book.getSheetByName('Assignments').setColumnWidth(7,360);
    props.setProperty(PRES_.ADMIN,book.getId());
    console.log('Presentation admin: '+book.getUrl());console.log('Presentation folders: '+root.id);
    return {adminUrl:book.getUrl(),folderId:root.id,sessions:seed.sessions.length,assignments:seed.assignments.length};
  } finally {lock.releaseLock();}
}

/** After editing session assignments, move this module's verified files to their new session folder. */
function RUN_RECONCILE_PRESENTATION_FOLDERS() {
  assertChairEditorRun_();presentationSyncSchedule_(presentationBook_());return presentationReconcileFolders_();
}

function presentationReconcileFolders_() {
  const book=presentationBook_(),lock=LockService.getScriptLock();if(!lock.tryLock(15000))return {busy:true};
  try {
    const rows=presentationRows_(book,'Uploads');let moved=0,remaining=0;
    const loaded={assignments:presentationRows_(book,'Assignments'),sessions:presentationRows_(book,'Sessions')},archives={};
    rows.forEach(function(r){
      const ctx=presentationContext_(r['Paper ID'],book,loaded);let target=presentationTarget_(book,ctx);
      if(!parseBoolean_(r.Active,false)) {
        if(!archives[target]) archives[target]=driveEnsureFolder_(target,'_Previous versions').id;
        target=archives[target];
      }
      if(target===r['Folder ID']) return;
      if(moved>=20) {remaining++;return;}
      const meta=driveGetMetadata_(r['File ID'],'id,parents,trashed,appProperties');
      if(meta.trashed||!meta.appProperties||meta.appProperties.acadiaPresentationUpload!==r['Upload ID']||meta.appProperties.acadiaPaperId!==r['Paper ID']) throw new Error('Cannot verify presentation file for '+r['Paper ID']);
      if((meta.parents||[]).indexOf(target)<0) driveMoveFile_(r['File ID'],target);
      book.getSheetByName('Uploads').getRange(r.__row,3).setValue(ctx.session?ctx.session['Session ID']:'');
      book.getSheetByName('Uploads').getRange(r.__row,14).setValue(target);moved++;
    });
    console.log(JSON.stringify({moved:moved,remaining:remaining,runAgain:remaining>0}));return {moved:moved,remaining:remaining,runAgain:remaining>0};
  } finally {lock.releaseLock();}
}

/** Read-only deployment check: no uploads, messages, schedule writes, or invitations. */
function RUN_CHECK_PRESENTATION_UPLOAD_REQUIREMENTS() {
  assertChairEditorRun_();
  const book=presentationBook_();
  const loaded={assignments:presentationRows_(book,'Assignments'),sessions:presentationRows_(book,'Sessions')};
  const counts={},examples=[],own=[];
  loaded.assignments.forEach(function(a){
    const r=presentationRequirements_(presentationContext_(a['Paper ID'],book,loaded));
    const key=r.confirmed?r.date:'unassigned';counts[key]=(counts[key]||0)+1;
    if(r.confirmed&&!examples.some(function(x){return x.date===r.date;}))examples.push({date:r.date,deadline:r.deadlineLabel,venue:r.venue,paperId:a['Paper ID'],title:a.Title});
    if(/teng/i.test(a.Authors||''))own.push({paperId:a['Paper ID'],title:a.Title,date:r.date});
  });
  console.log(JSON.stringify({assignmentCounts:counts,examples:examples,ownPresentations:own}));
}

/** Read-only preservation audit; never opens, moves, renames, or deletes uploaded files. */
function RUN_AUDIT_PRESENTATION_UPLOAD_PRESERVATION() {
  assertChairEditorRun_();
  const rows=presentationRows_(presentationBook_(),'Uploads');
  const entries=rows.map(function(r){return [r['Upload ID'],r['File ID'],r['File Name'],r.Bytes,r.Version,r.Active,r['Folder ID'],r['Uploaded At']];})
    .sort(function(a,b){return String(a[0]).localeCompare(String(b[0]));});
  const all=PropertiesService.getScriptProperties().getProperties();
  const pointers=Object.keys(all).filter(function(k){return k.indexOf(PRES_.CURRENT)===0;}).sort().map(function(k){return [k,all[k]];});
  const digest=function(value){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(value)));};
  console.log(JSON.stringify({uploadRecords:rows.length,distinctFiles:new Set(rows.map(function(r){return r['File ID'];})).size,
    activeSlides:rows.filter(function(r){return parseBoolean_(r.Active,false)&&presentationFileKind_(r['File Name'])==='slides';}).length,
    activeVideos:rows.filter(function(r){return parseBoolean_(r.Active,false)&&presentationFileKind_(r['File Name'])==='video';}).length,
    ledgerFingerprint:digest(entries),currentPointersFingerprint:digest(pointers)}));
}
