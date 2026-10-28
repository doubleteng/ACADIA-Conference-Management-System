/** Presentation certificates. Source workbooks are read-only; certificates and logs belong to this portal. */
const PRESENTER_PORTAL = Object.freeze({
  LOG: 'Presentation_Certificate_Log', CONFIRMATIONS: 'Presentation_Confirmations', SESSION_PREFIX: 'presenter-session:', SESSION_SECONDS: 1800,
  TRACKS: Object.freeze({papers:'Papers',projects:'Projects','field-notes':'Field Notes','book-forum':'Book Forum'})
});

function presenterSettings_() {
  const s = getSettings_();
  if (!toBoolean_(s.PORTAL_ENABLED, true) || !toBoolean_(s.PRESENTER_ENABLED, false))
    throw new Error('Presentation certificates are temporarily unavailable. Please try again later.');
  if (!s.PRESENTER_TEMPLATE_FILE_ID || !s.PRESENTER_OUTPUT_FOLDER_ID || !s.PRESENTER_SOURCE_SPREADSHEET_ID || !s.PRESENTER_AUTHOR_SPREADSHEET_ID)
    throw new Error("__ACADIA_TEXT_t0126__");
  return s;
}

function presenterId_(value) {
  return String(value == null ? '' : value).trim().replace(/^(\d+)\.0+$/, '$1').toUpperCase();
}
function presenterName_(value) { return normalizeName_(value).replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-'); }
function presenterAuthorKey_(value) { return presenterName_(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/-/g,' ').replace(/\s+/g,' ').trim(); }
function presenterAuthorNames_(value) {
  return String(value || '')
    .replace(/\b(?:edited\s+by|list\s+of\s+authors\s+and\s+participants|with\s+contributions\s+by)\s*:?\s*/gi,';')
    .replace(/\((?:remote|editors?|eds?\.?)\)\.?/gi,'')
    .split(/\s+(?:and|&)\s+|[,;\n]/i)
    .map(name=>name.replace(/^\s*and\s+/i,'').replace(/\.$/,'').trim()).filter(Boolean);
}
/** Resolve people before aggregating works. Equal names alone never merge identities. */
function presenterResolveIdentities_(source,issues) {
  const records=[],parent=[],orcids=[],keys={},identities={};
  const affiliation=value=>presenterAuthorKey_(value).replace(/univeristy/g,'university').replace(/[^a-z0-9]+/g,' ').trim();
  const orcid=value=>(String(value || '').toUpperCase().match(/\d{4}-\d{4}-\d{4}-\d{3}[\dX]/) || [''])[0];
  function addRecord(id,name,email,aff,oid) {
    id=presenterId_(id);name=String(name || '').normalize('NFKC').trim().replace(/\s+/g,' ');email=normalizeEmail_(email);
    if(!id || !name || name.length>200 || /[,;\n]|\s(?:and|&)\s/i.test(name))return -1;
    if(!isValidEmail_(email) || email.length>254)email='';
    const n=records.length;records.push({id,name,email,key:presenterAuthorKey_(name),aff:affiliation(aff),orcid:orcid(oid)});
    parent.push(n);orcids.push(new Set(records[n].orcid?[records[n].orcid]:[]));return n;
  }
  function root(n){while(parent[n]!==n){parent[n]=parent[parent[n]];n=parent[n]}return n}
  function merge(a,b){a=root(a);b=root(b);if(a===b)return true;const ids=new Set([...orcids[a],...orcids[b]]);if(ids.size>1)return false;parent[b]=a;orcids[a]=ids;return true}
  source.authors.forEach(r=>addRecord(r['Paper ID'],r['Full Name'],r.Email,r.Affiliation,r.ORCID));
  const authorCount=records.length;
  for(let i=0;i<authorCount;i++)for(let j=0;j<i;j++){
    const a=records[i],b=records[j];
    const sameOrcid=a.orcid && a.orcid===b.orcid;
    const sameEmail=a.key===b.key && a.email && a.email===b.email;
    const sameAffiliation=a.key===b.key && a.aff && a.aff===b.aff;
    if(sameOrcid || sameEmail || sameAffiliation)merge(i,j);
  }
  function addLogin(id,name,email){
    const n=addRecord(id,name,email,'','');if(n<0)return;
    const a=records[n];if(!a.email)return;
    let matches=new Set();
    for(let i=0;i<n;i++){const b=records[i];if(a.key===b.key && a.email===b.email)matches.add(root(i))}
    // Registration/attendance can establish an alternate email for the one
    // explicitly listed author with that name on the same work.
    if(!matches.size)for(let i=0;i<authorCount;i++){const b=records[i];if(a.key===b.key && a.id===b.id)matches.add(root(i))}
    if(matches.size===1)merge(n,[...matches][0]);
    else if(matches.size>1)issues.push({id:a.id,issue:'Ambiguous name/email identity requires organizer review.'});
  }
  source.registration.forEach(r=>addLogin(r['Paper ID'],r['Registered Author'],r['Registered Email']));
  source.submissions.forEach(r=>{addLogin(r['Paper ID'],r['Corresponding Author'],r['Corresponding Email']);addLogin(r['Paper ID'],r['Presenting Author'],r['Presenting Email'])});
  source.attendance.forEach(r=>addLogin(r['Paper ID'],r['Presenter Name'],r['Presenter Email']));
  const people={},nameIndex={};
  records.forEach((r,i)=>{
    const id=root(i);if(!people[id])people[id]={ids:new Set(),names:new Set()};people[id].ids.add(r.id);people[id].names.add(r.key);
    if(r.email){const key=presenterName_(r.name)+'\u0000'+r.email;if(!keys[key])keys[key]={name:r.name,email:r.email,people:new Set()};keys[key].people.add(id)}
  });
  Object.keys(people).forEach(id=>people[id].names.forEach(name=>{if(!nameIndex[name])nameIndex[name]=new Set();nameIndex[name].add(id)}));
  // Names in the complete program roster supplement author records only when
  // they resolve to one person. Homonyms retain their explicit work links.
  source.assignments.forEach(r=>presenterAuthorNames_(r.Authors).forEach(name=>{
    const candidates=nameIndex[presenterAuthorKey_(name)];if(!candidates)return;
    const id=presenterId_(r['Paper ID']);
    if(candidates.size===1)people[[...candidates][0]].ids.add(id);
    else if(![...candidates].some(p=>people[p].ids.has(id)))issues.push({id,issue:'A shared author name in the program could not be assigned to one verified identity.'});
  }));
  Object.keys(keys).forEach(key=>{const entry=keys[key];if(entry.people.size===1)identities[key]={name:entry.name,email:entry.email,ids:[...people[[...entry.people][0]].ids]};else issues.push({id:'',issue:'Conflicting author identities share a name/email pair; login is excluded pending review.'})});
  return identities;
}
function presenterTrack_(value) {
  const s=String(value || '').toLowerCase().replace(/[^a-z]/g,'');
  return ({paper:'papers',papers:'papers',fullpaper:'papers',fullpapers:'papers',project:'projects',projects:'projects',fieldnote:'field-notes',fieldnotes:'field-notes',bookforum:'book-forum'})[s] || '';
}
function presenterTable_(book,name,required) {
  const sheet=book.getSheetByName(name);
  if(!sheet) throw new Error("__ACADIA_TEXT_t0127__");
  const values=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),sheet.getLastColumn()).getDisplayValues();
  const headers=values.shift().map(value=>String(value).trim());
  if(required.some(h=>headers.indexOf(h)===-1)) throw new Error("__ACADIA_TEXT_t0128__");
  return values.filter(row=>row.some(String)).map(row=>{const item={};headers.forEach((h,i)=>{if(h)item[h]=row[i] || ''});return item});
}
function presenterReadSources_(settings) {
  const presentation=SpreadsheetApp.openById(String(settings.PRESENTER_SOURCE_SPREADSHEET_ID));
  const authors=SpreadsheetApp.openById(String(settings.PRESENTER_AUTHOR_SPREADSHEET_ID));
  return {
    confirmations:presenterTable_(masterSpreadsheet_(),PRESENTER_PORTAL.CONFIRMATIONS,['Paper ID','Status','Confirmed Presenter','Confirmed By','Confirmed At','Notes']),
    sessions:presenterTable_(presentation,'Sessions',['Session ID','Track','Session Title','Date']),
    assignments:presenterTable_(presentation,'Assignments',['Paper ID','Session ID','Title','Authors']),
    uploads:presenterTable_(presentation,'Uploads',['Upload ID','Paper ID','Session ID','File ID']),
    authors:presenterTable_(authors,'Authors',['Paper ID','Full Name','Email']),
    registration:presenterTable_(authors,'Registration',['Paper ID','Registered Author','Registered Email']),
    attendance:presenterTable_(authors,'Attendance',['Paper ID','Presenter Name','Presenter Email']),
    submissions:presenterTable_(authors,'Submissions',['Paper ID','Original Title','Final Title','Track','Corresponding Author','Corresponding Email','Presenting Author','Presenting Email'])
  };
}

/** Manual attendance decisions override upload evidence; source upload records remain unchanged. */
function presenterBuildData_(source) {
  const submissions={},sessions={},assignments={},uploaded={},works={},identities={},issues=[],decisions={};
  source.submissions.forEach(r=>{const id=presenterId_(r['Paper ID']);if(id)submissions[id]=r});
  source.sessions.forEach(r=>{const id=presenterId_(r['Session ID']);if(id)sessions[id]=r});
  source.assignments.forEach(r=>{const id=presenterId_(r['Paper ID']);if(id)(assignments[id] || (assignments[id]=[])).push(r)});
  source.uploads.forEach(r=>{const id=presenterId_(r['Paper ID']);if(id && String(r['File ID'] || '').trim())(uploaded[id] || (uploaded[id]=[])).push(r)});
  // The last explicit decision for an ID is current; earlier rows can be retained as history.
  (source.confirmations || []).forEach(r=>{
    const id=presenterId_(r['Paper ID']),status=String(r.Status || '').trim().toUpperCase();
    if(!id)return;
    decisions[id]=status;
    if(!['PRESENTED','NOT_PRESENTED'].includes(status))issues.push({id,issue:'Invalid manual presentation status; this work is excluded until corrected.'});
  });
  const manualIds=Object.keys(decisions).filter(id=>decisions[id]==='PRESENTED');
  [...new Set(Object.keys(uploaded).concat(manualIds))].sort().forEach(id=>{
    if(Object.prototype.hasOwnProperty.call(decisions,id) && decisions[id]!=='PRESENTED')return;
    const submission=submissions[id];
    if(!submission){issues.push({id,issue:'Eligible work is missing from Author Hub Submissions.'});return}
    const rows=assignments[id] || [], sessionIds=[...new Set(rows.map(r=>presenterId_(r['Session ID'])).filter(Boolean))];
    if(!sessionIds.length) (uploaded[id] || []).forEach(r=>{const sid=presenterId_(r['Session ID']);if(sid && !sessionIds.includes(sid))sessionIds.push(sid)});
    const linked=sessionIds.map(sid=>sessions[sid]).filter(Boolean);
    if(!linked.length || linked.length!==sessionIds.length){issues.push({id,issue:'Eligible work has no complete session assignment.'});return}
    const track=presenterTrack_(submission.Track), sessionTracks=[...new Set(linked.map(r=>presenterTrack_(r.Track)))];
    if(!track || sessionTracks.some(t=>t!==track)){issues.push({id,issue:'Track is missing or conflicts between the two source workbooks.'});return}
    const title=String(submission['Final Title'] || (rows[0] || {}).Title || submission['Original Title'] || ((uploaded[id] || [])[0] || {}).Title || '').trim();
    if(!title){issues.push({id,issue:'Presentation title is missing.'});return}
    works[id]={id,track,title,sessions:linked.map(r=>({id:presenterId_(r['Session ID']),title:String(r['Session Title']).trim(),date:String(r.Date).trim()})).sort((a,b)=>(a.date+a.id).localeCompare(b.date+b.id))};
  });
  Object.assign(identities,presenterResolveIdentities_(source,issues));
  const identified=new Set();Object.keys(identities).forEach(k=>identities[k].ids.forEach(id=>identified.add(id)));
  Object.keys(works).forEach(id=>{if(!identified.has(id))issues.push({id,issue:'Eligible work has no individual author name/email record.'})});
  return {works,identities,issues,uploadedCount:Object.keys(uploaded).length,
    manuallyConfirmedCount:manualIds.length,manualOnlyCount:manualIds.filter(id=>works[id] && !uploaded[id]).length,
    notPresentedCount:Object.keys(decisions).filter(id=>decisions[id]==='NOT_PRESENTED').length};
}

function presenterMatches_(name,email,settings) {
  const data=presenterBuildData_(presenterReadSources_(settings));
  const identity=data.identities[presenterName_(name)+'\u0000'+normalizeEmail_(email)];
  if(!identity)return null;
  const tracks={};
  identity.ids.forEach(id=>{const work=data.works[id];if(work)(tracks[work.track] || (tracks[work.track]=[])).push(work)});
  const groups=Object.keys(PRESENTER_PORTAL.TRACKS).filter(track=>tracks[track]).map(track=>({track,label:PRESENTER_PORTAL.TRACKS[track],presentations:tracks[track].sort((a,b)=>(a.sessions[0].date+a.sessions[0].id).localeCompare(b.sessions[0].date+b.sessions[0].id) || a.id.localeCompare(b.id,undefined,{numeric:true}))}));
  return groups.length?{name:identity.name,email:identity.email,groups}:null;
}

function loginConferencePresenter(name,email) {
  const s=presenterSettings_(), raw=String(name == null?'':name), clean=cleanText_(raw,200), mail=normalizeEmail_(email);
  const mismatch="__ACADIA_TEXT_t0129__";
  if(!clean || raw.length>200 || mail.length>254 || !isValidEmail_(mail))throw new Error(mismatch);
  const cache=CacheService.getScriptCache(), key='presenter-'+loginFailureKey_(mail), failures=Number(cache.get(key) || 0);
  if(failures>=8)throw new Error('Too many unsuccessful attempts. Please wait ten minutes and try again.');
  const match=presenterMatches_(clean,mail,s);
  if(!match){cache.put(key,String(failures+1),600);throw new Error(mismatch)}
  cache.remove(key);
  const token=Utilities.getUuid()+Utilities.getUuid().replace(/-/g,'');
  cache.put(PRESENTER_PORTAL.SESSION_PREFIX+token,JSON.stringify({name:match.name,email:match.email}),PRESENTER_PORTAL.SESSION_SECONDS);
  const awardCatalog=awardCatalogForPresenter_(match.groups,s);
  return {ok:true,token,presenter:{name:match.name},groups:match.groups,awards:awardCatalog.awards,awardNotice:awardCatalog.awardNotice};
}
function logoutConferencePresenter(token) {
  const clean=cleanToken_(token);if(clean)CacheService.getScriptCache().remove(PRESENTER_PORTAL.SESSION_PREFIX+clean);return {ok:true};
}
function presenterGroupFromSession_(token,track,settings) {
  const clean=cleanToken_(token), value=clean && CacheService.getScriptCache().get(PRESENTER_PORTAL.SESSION_PREFIX+clean);
  if(!value)throw new Error('Your session has expired. Please sign in again.');
  const identity=JSON.parse(value),match=presenterMatches_(identity.name,identity.email,settings);
  const group=match && match.groups.find(g=>g.track===String(track));
  if(!group)throw new Error("__ACADIA_TEXT_t0130__");
  return {name:match.name,email:match.email,group};
}
function presenterDigest_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
}
function presenterFingerprint_(record,template) {return presenterDigest_(JSON.stringify([record,template.getId(),template.getLastUpdated().getTime(),'presenter-track-wording-v1']))}
function presenterLogRows_() {
  const sheet=masterSpreadsheet_().getSheetByName(PRESENTER_PORTAL.LOG);
  if(!sheet)throw new Error('The presentation certificate log is unavailable.');return sheet.getDataRange().getValues().slice(1);
}
function existingPresenterCertificate_(identityKey,track,fingerprint) {
  const rows=presenterLogRows_();
  for(let i=rows.length-1;i>=0;i--){if(String(rows[i][2])!==identityKey || String(rows[i][5])!==track || String(rows[i][11])!==fingerprint)continue;
    try{const file=DriveApp.getFileById(String(rows[i][8]));if(!file.isTrashed())return certificateDownloadPayload_(file,true)}catch(ignored){}}
  return null;
}
function presenterSessionText_(work) {return work.sessions.map(s=>'in '+s.title+' on '+s.date).join('; ')}
function presenterItemNoun_(track,count) {
  const nouns={papers:['paper','papers'],projects:['project','projects'],'field-notes':['field note','field notes'],'book-forum':['book','books']};
  if(!nouns[track])throw new Error('The certificate track is unavailable.');
  return nouns[track][count===1?0:1];
}
function presenterStatement_(track,count) {
  return 'presented the following '+presenterItemNoun_(track,count)+' in the '+PRESENTER_PORTAL.TRACKS[track]+' track at';
}
function presenterExhibitionText_(track,count) {
  if(!['projects','field-notes','book-forum'].includes(track))return '';
  return 'The '+presenterItemNoun_(track,count)+' listed in this certificate '+(count===1?'was':'were')+"__ACADIA_TEXT_t0131__";
}

function generatePresentationCertificate(token,track) {
  const s=presenterSettings_(),template=DriveApp.getFileById(String(s.PRESENTER_TEMPLATE_FILE_ID));
  if(template.getMimeType()!==MimeType.GOOGLE_DOCS)throw new Error('The presentation certificate template is unavailable.');
  let record=presenterGroupFromSession_(token,track,s);
  const identityKey=presenterDigest_(presenterName_(record.name)+'|'+record.email);
  const existing=existingPresenterCertificate_(identityKey,record.group.track,presenterFingerprint_(record,template));if(existing)return existing;
  const lock=LockService.getScriptLock();lock.waitLock(30000);let working=null;
  try {
    record=presenterGroupFromSession_(token,track,s);
    const fingerprint=presenterFingerprint_(record,template),cached=existingPresenterCertificate_(identityKey,record.group.track,fingerprint);if(cached)return cached;
    const folder=DriveApp.getFolderById(String(s.PRESENTER_OUTPUT_FOLDER_ID));
    const fileName="__ACADIA_TEXT_t0132__"+record.group.track+'_'+filenameSafe_(record.name)+'_Certificate';
    working=template.makeCopy(fileName+'_working',folder);
    const doc=DocumentApp.openById(working.getId());
    presenterPopulateDocument_(doc,record);
    if(/\{\{[A-Z_]+\}\}/.test(collectDocumentText_(doc)))throw new Error('The certificate template contains an unfilled field.');
    doc.saveAndClose();
    const pdf=folder.createFile(working.getAs(MimeType.PDF).setName(fileName+'.pdf'));
    masterSpreadsheet_().getSheetByName(PRESENTER_PORTAL.LOG).appendRow([Utilities.getUuid(),new Date(),identityKey,record.name,record.email,record.group.track,record.group.presentations.map(p=>p.id).join(', '),record.group.presentations.map(p=>p.sessions.map(s=>s.id).join('/')).join(', '),pdf.getId(),pdf.getName(),template.getId(),fingerprint]);
    return certificateDownloadPayload_(pdf,false);
  }finally{if(working){try{working.setTrashed(true)}catch(ignored){}}lock.releaseLock()}
}

function presenterPopulateDocument_(doc,record) {
  const body=doc.getBody(), works=record.group.presentations;
  const statement=presenterStatement_(record.group.track,works.length);
  workshopTokenFontSize_(body,'{{PRESENTER_NAME}}',record.name.length>35?21:26);
  const entries=works.map((work,i)=>(i+1)+'. '+work.title+'\n'+presenterSessionText_(work));
  const exhibition=presenterExhibitionText_(record.group.track,works.length);
  // Full lists stay in one PDF. Longer lists use a continuation after the signed certificate.
  const inline=works.length<=2 && entries.join('\n').length+exhibition.length<=650;
  const presentationText=inline?entries.join('\n\n'):works.length+' '+presenterItemNoun_(record.group.track,works.length)+' in the '+record.group.label+' track\nThe complete list of titles and sessions follows on the next page.';
  replaceDocumentPlaceholders_(doc,{'{{PRESENTER_NAME}}':record.name,'{{TRACK_LABEL}}':record.group.label,
    '{{PRESENTATION_STATEMENT}}':statement,'presented the work listed below at':statement,
    '{{PRESENTATIONS}}':presentationText+(exhibition?'\n\n'+exhibition:''),
    '{{ISSUED_DATE}}':Utilities.formatDate(new Date(),"__ACADIA_TEXT_t0023__",'MMMM d, yyyy')});
  if(!inline){
    body.appendPageBreak();
    const heading=body.appendParagraph('PRESENTATION RECORD · '+record.group.label.toUpperCase());
    heading.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(14).editAsText().setFontFamily('Montserrat').setFontSize(16).setBold(false);
    const name=body.appendParagraph(record.name+"__ACADIA_TEXT_t0133__");
    name.setAlignment(DocumentApp.HorizontalAlignment.CENTER).setSpacingAfter(20).editAsText().setFontFamily('Montserrat').setFontSize(11).setBold(false);
    works.forEach((work,i)=>{
      const title=body.appendParagraph((i+1)+'. '+work.title);
      title.setSpacingBefore(i?10:0).setSpacingAfter(4).editAsText().setFontFamily('Montserrat').setFontSize(11).setBold(false);
      const session=body.appendParagraph(presenterSessionText_(work));
      session.setSpacingAfter(12).editAsText().setFontFamily('Montserrat').setFontSize(9).setBold(false);
    });
  }
}

function RUN_VERIFY_PRESENTER_SETUP() {
  const s=getSettings_(),data=presenterBuildData_(presenterReadSources_(s));
  const text=collectDocumentText_(DocumentApp.openById(String(s.PRESENTER_TEMPLATE_FILE_ID)));
  const missing=['PRESENTER_NAME','TRACK_LABEL','PRESENTATIONS','ISSUED_DATE'].filter(k=>!text.includes('{{'+k+'}}'));
  if(!text.includes('{{PRESENTATION_STATEMENT}}')&&!text.includes('presented the work listed below at'))missing.push('PRESENTATION_STATEMENT');
  if(missing.length)throw new Error('Missing template fields: '+missing.join(', '));
  const tracks={};Object.values(data.works).forEach(w=>tracks[w.track]=(tracks[w.track]||0)+1);
  const result={ok:true,uploadedWorks:data.uploadedCount,manuallyConfirmedWorks:data.manuallyConfirmedCount,manualOnlyWorks:data.manualOnlyCount,notPresentedWorks:data.notPresentedCount,eligibleWorks:Object.keys(data.works).length,tracks,issues:data.issues};console.log(JSON.stringify(result));return result;
}
