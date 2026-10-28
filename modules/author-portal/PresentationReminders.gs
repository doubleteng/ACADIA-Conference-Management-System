/** Independent session reminders. Recipient data never comes from calendar subscriptions. */
const PRES_REM_ = Object.freeze({
  ENABLED:'PRES_REMINDERS_ENABLED', NEXT:'PRES_REMINDERS_NEXT_CHECK',
  CONTACTS:'SessionContacts', LOG:'PresentationReminders', REPORT:'ReminderReadiness',
  CONTACT_HEADERS:['Session ID','Session Title','Chair Name','Chair Email'],
  LOG_HEADERS:['Key','Session ID','Session Start UTC','Paper IDs','Presenter Email','State','Attempted At','Sent At','Issue'],
  REPORT_HEADERS:['Paper ID','Session ID',"__ACADIA_TEXT_t0082__",'Presenting Author','Presenting Email','Recipient Status','Chair Status','Action Needed'],
  LEAD_MS:30*60000, RETRY_MS:5*60000
});

function presentationReminderEmail_(value) {
  try {return presentationCalendarEmail_(value);} catch(error) {return '';}
}

function presentationReminderName_(value) {
  return String(value||'').normalize('NFC').trim().toLowerCase().replace(/\s+/g,' ');
}

function presentationReminderIndex_(rows) {
  const map=Object.create(null);
  rows.forEach(function(r){const id=normalizePaperId_(r['Paper ID']);if(id)(map[id]||(map[id]=[])).push(r);});
  return map;
}

function presentationReminderLoad_(book) {
  return {sessions:presentationRows_(book,'Sessions'),assignments:presentationRows_(book,'Assignments'),
    contacts:book.getSheetByName(PRES_REM_.CONTACTS)?presentationRows_(book,PRES_REM_.CONTACTS):[],
    submissions:presentationReminderIndex_(sheetObjects_(SHEETS.SUBMISSIONS)),
    attendance:presentationReminderIndex_(sheetObjects_(SHEETS.ATTENDANCE)),
    authors:presentationReminderIndex_(sheetObjects_(SHEETS.AUTHORS))};
}

function presentationReminderRecipient_(assignment, data) {
  const id=normalizePaperId_(assignment['Paper ID']),subs=data.submissions[id]||[];
  if(subs.length!==1)return {issue:'Submission record missing or duplicated'};
  const sub=subs[0];
  if(!presentationSupported_(sub.Track)||!parseBoolean_(sub['Portal Enabled'],true))return {issue:'Submission is not active for presentations'};
  const selectedName=String(assignment['Presenter Name']||sub['Presenting Author']||'').trim();
  const selectedKey=presentationReminderName_(selectedName),subKey=presentationReminderName_(sub['Presenting Author']);
  const subEmail=presentationReminderEmail_(sub['Presenting Email']);
  // A current explicit presenting-author pair is authoritative, never the corresponding author.
  if(selectedKey && selectedKey===subKey && subEmail)return {name:selectedName,email:subEmail,source:'Current presenting author'};
  const authors=(data.authors[id]||[]).filter(function(a){return selectedKey
    ? presentationReminderName_(a['Full Name'])===selectedKey : parseBoolean_(a.Presenting,false);});
  const candidates=Object.create(null);
  authors.forEach(function(a){const email=presentationReminderEmail_(a.Email);if(email)candidates[email]={name:String(a['Full Name']||'').trim(),email:email,source:'Same-submission author record'};});
  const resolved=Object.keys(candidates);
  if(resolved.length===1)return candidates[resolved[0]];
  if(resolved.length>1)return {issue:'Presenter name matches multiple author emails; confirm the presenting author'};
  const attendance=(data.attendance[id]||[]).filter(function(a){return parseBoolean_(a['Attendance Confirmed'],false);});
  if(attendance.length===1 && (!selectedKey||presentationReminderName_(attendance[0]['Presenter Name'])===selectedKey)) {
    const email=presentationReminderEmail_(attendance[0]['Presenter Email']);
    if(email)return {name:String(attendance[0]['Presenter Name']||selectedName),email:email,source:'Confirmed attendance'};
  }
  return {issue:'Confirm the presenting author name and email in the Author Portal'};
}

function presentationReminderChair_(session, contacts) {
  const label=String(session['Chair Override']||session.Chair||'').trim();
  const known=label&&!/^(tbd|tba|to be announced)$/i.test(label);
  const rows=contacts.filter(function(r){return r['Session ID']===session['Session ID'];});
  const valid=rows.filter(function(r){return String(r['Chair Name']||'').trim() && presentationReminderEmail_(r['Chair Email']);});
  const names=valid.map(function(r){return presentationReminderName_(r['Chair Name']);});
  const key=presentationReminderName_(label);
  const nameMatches=!known||names.indexOf(key)!==-1||[names.join(' & '),names.join(' and '),names.join('; '),names.join(', ')].indexOf(key)!==-1;
  if(valid.length && valid.length===rows.length && nameMatches) {
    return {complete:true,lines:valid.map(function(r){return String(r['Chair Name']).trim()+' <'+presentationReminderEmail_(r['Chair Email'])+'>';})};
  }
  return {complete:false,lines:[known?label:'To be announced'],issue:known&&valid.length&&!nameMatches
    ?'Chair changed; verify SessionContacts name/email':'Fill Chair Name and Chair Email in SessionContacts'};
}

function presentationReminderStart_(session) {
  // Validate the full SESSION interval, even when an individual talk time is available.
  const spec=presentationCalendarSpec_('',{session:session,assignment:{Title:''}});
  const text=spec.date+' '+spec.start;
  const date=Utilities.parseDate(text,"__ACADIA_TEXT_t0023__",'yyyy-MM-dd HH:mm');
  if(Utilities.formatDate(date,"__ACADIA_TEXT_t0023__",'yyyy-MM-dd HH:mm')!==text)throw new Error("__ACADIA_TEXT_t0083__");
  return date.getTime();
}

function presentationReminderBuild_(data) {
  const groups=Object.create(null),report=[],resolved=Object.create(null);
  data.assignments.forEach(function(a){resolved[a['Paper ID']]=presentationReminderRecipient_(a,data);});
  data.assignments.forEach(function(a){
    const id=a['Paper ID'],recipient=resolved[id],line={'Paper ID':id,'Session ID':a['Session ID'],
      'Presenting Author':recipient.name||a['Presenter Name']||'', 'Presenting Email':recipient.email||'',
      'Recipient Status':recipient.email?'Ready':'Needs confirmation'};
    try {
      const ctx=presentationContext_(id,null,data);
      if(!ctx.session) {line['Action Needed']='Session not assigned';line['Chair Status']='Not assigned';report.push(line);return;}
      const start=presentationReminderStart_(ctx.session),chair=presentationReminderChair_(ctx.session,data.contacts);
      line["__ACADIA_TEXT_t0082__"]=ctx.session.Date+' '+ctx.session['Start Time'];
      line['Chair Status']=chair.complete?'Ready':'Incomplete';
      line['Action Needed']=[recipient.issue,chair.issue].filter(Boolean).join('; ');
      report.push(line);
      if(!recipient.email)return;
      const key=presentationCalendarHash_('session-reminder\n'+ctx.session['Session ID']+'\n'+start+'\n'+recipient.email);
      if(!groups[key])groups[key]={key:key,start:start,due:start-PRES_REM_.LEAD_MS,session:ctx.session,
        chair:chair,email:recipient.email,name:recipient.name,papers:[],peers:ctx.peers.map(function(p){
          return {id:p['Paper ID'],order:p.Order,title:p.Title,presenter:(resolved[p['Paper ID']]||{}).name||p['Presenter Name']||'',authors:p.Authors||''};
        })};
      groups[key].papers.push({id:id,title:a.Title,order:a.Order,start:a['Presentation Start']||'',end:a['Presentation End']||''});
    } catch(error) {line['Action Needed']="__ACADIA_TEXT_t0084__";line['Chair Status']='Needs verification';report.push(line);}
  });
  return {jobs:Object.keys(groups).map(function(k){return groups[k];}).sort(function(a,b){return a.start-b.start||a.key.localeCompare(b.key);}),report:report};
}

function presentationReminderMessage_(job, now) {
  const session=job.session,remaining=Math.max(1,Math.ceil((job.start-now)/60000));
  const date=Utilities.formatDate(new Date(job.start),"__ACADIA_TEXT_t0023__",'EEEE, MMMM d, yyyy');
  const clock=Utilities.formatDate(new Date(job.start),"__ACADIA_TEXT_t0023__",'h:mm a z');
  const body=['Hello '+(job.name||'presenting author')+',','',
    "__ACADIA_TEXT_t0085__"+remaining+' minutes. Please make your way to the session room.',
    '', 'Session: '+session['Session Title'],'Date: '+date,
    'Session time: '+session['Start Time']+'–'+session['End Time']+"__ACADIA_TEXT_t0086__"+clock+')',
    'Venue: '+String(session.Venue||'Not yet announced'),'Room: '+String(session.Room||'Not yet announced'),'',
    'Session chair: '+job.chair.lines.join('; '),
    job.chair.complete?'':'Chair contact email: Not yet provided by the organizers.','',
    job.papers.length>1?'Your presentations:':'Your presentation:',
    job.papers.map(function(p){return (p.order?'#'+p.order+' — ':'')+p.title+' (ID '+p.id+')';}).join('\n'),'',
    'Presentations in this session (scheduled order):',
    job.peers.map(function(p){return (p.order?p.order+'. ':'')+p.title+' (ID '+p.id+')\n  '+
      (p.presenter?'Presenter: '+p.presenter:'Authors: '+String(p.authors).replace(/\s*\n\s*/g,'; ')+' — presenter not yet confirmed');}).join('\n'),'',
    'The reminder is based on the latest confirmed session schedule. Check the Author Portal for any last-minute changes.',
    'Author Portal: '+PRES_CAL_.PORTAL,'',
    'This session reminder is sent to the recorded presenting author, whether or not you saved a calendar invitation.',
    "__ACADIA_TEXT_t0087__"].filter(function(v){return v!==null;}).join('\n');
  const esc=presentationCalendarEscape_;
  return {to:job.email,name:"__ACADIA_TEXT_t0088__",
    subject:("__ACADIA_TEXT_t0089__"+clock+' ('+session['Session ID']+')').replace(/[\r\n]/g,' ').slice(0,220),
    body:body,htmlBody:'<div style="font:15px/1.65 Arial,sans-serif;color:#222;max-width:720px"><h2 style="color:#255ea8">Your session starts soon</h2><div style="white-space:pre-wrap">'+esc(body)+'</div></div>'};
}

function presentationReminderEnsureSheet_(book,name,heads) {
  let sheet=book.getSheetByName(name);
  if(!sheet){sheet=book.insertSheet(name);sheet.getRange(1,1,1,heads.length).setValues([heads]);sheet.setFrozenRows(1);sheet.getRange(1,1,1,heads.length).setFontWeight('bold').setBackground('#e8eff9');}
  const actual=sheet.getRange(1,1,1,heads.length).getDisplayValues()[0];
  if(JSON.stringify(actual)!==JSON.stringify(heads))throw new Error('Unexpected '+name+' headers; existing data was preserved.');
  return sheet;
}

function presentationReminderWrite_(book,row) {
  const sheet=book.getSheetByName(PRES_REM_.LOG);
  if(!row.__row)row.__row=sheet.getLastRow()+1;
  sheet.getRange(row.__row,1,1,PRES_REM_.LOG_HEADERS.length).setNumberFormat('@').setValues([
    PRES_REM_.LOG_HEADERS.map(function(h){return presentationText_(row[h]||'');})]);
  SpreadsheetApp.flush();
}

function presentationReminderWake_(book) {
  const props=PropertiesService.getScriptProperties();
  if(props.getProperty(PRES_REM_.ENABLED)!=='true')return;
  const now=Date.now();let next=now+86400000;
  presentationRows_(book,'Sessions').forEach(function(s){try{const start=presentationReminderStart_(s);if(start>now)next=Math.min(next,Math.max(now,start-PRES_REM_.LEAD_MS));}catch(error){}});
  const old=Number(props.getProperty(PRES_REM_.NEXT)||0);
  props.setProperty(PRES_REM_.NEXT,String(old?Math.min(old,next):next));
}

function presentationReminderDeliver_(book,jobs,now) {
  const records=Object.create(null);
  presentationRows_(book,PRES_REM_.LOG).forEach(function(r){if(records[r.Key])throw new Error('Duplicate reminder delivery records');records[r.Key]=r;});
  let next=now+86400000,sent=0,uncertain=0,quota=null;const began=Date.now();
  jobs.forEach(function(job){
    const currentNow=Math.max(now,Date.now());
    const row=records[job.key];
    // MailApp has no idempotency key. A recorded in-flight/uncertain send needs manual review, not a blind resend.
    if(row && ['SENT','SENDING','UNCERTAIN'].indexOf(row.State)!==-1)return;
    if(job.start<=currentNow)return; // Never send a stale reminder after a session has started.
    if(job.due>currentNow){next=Math.min(next,job.due);return;}
    if(Date.now()-began>40000){next=Math.min(next,now+60000);return;}
    if(quota===null)quota=MailApp.getRemainingDailyQuota();
    if(quota<1){next=Math.min(next,now+PRES_REM_.RETRY_MS);return;}
    const message=presentationReminderMessage_(job,currentNow);
    const record=row||{Key:job.key,'Session ID':job.session['Session ID'],'Session Start UTC':new Date(job.start).toISOString(),
      'Paper IDs':job.papers.map(function(p){return p.id;}).join(', '),'Presenter Email':job.email};
    record.State='SENDING';record['Attempted At']=new Date().toISOString();record.Issue='';
    presentationReminderWrite_(book,record); // Durable claim precedes the only outbound operation.
    try {
      MailApp.sendEmail(message);quota--;sent++;record.State='SENT';record['Sent At']=new Date().toISOString();
      record.Issue=job.chair.complete?'':'Chair contact was not supplied; email explicitly marked it unavailable.';
    } catch(error) {record.State='UNCERTAIN';record.Issue='Mail service returned an error; verify delivery before manually retrying.';uncertain++;}
    presentationReminderWrite_(book,record);
  });
  return {next:next,sent:sent,uncertain:uncertain};
}

function presentationReminderTick_() {
  const props=PropertiesService.getScriptProperties(),now=Date.now();
  if(props.getProperty(PRES_REM_.ENABLED)!=='true'||Number(props.getProperty(PRES_REM_.NEXT)||0)>now)return;
  const book=presentationBook_();presentationSyncSchedule_(book);
  const status=presentationScheduleStatus_();
  if(status.stale||!status.checkedAt||now-Date.parse(status.checkedAt)>120000){props.setProperty(PRES_REM_.NEXT,String(now+60000));return;}
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  try {
    const data=withSheetObjectsRuntimeCache_(function(){return presentationReminderLoad_(book);});
    const planned=presentationReminderBuild_(data),result=presentationReminderDeliver_(book,planned.jobs,Date.now());
    // Missing presenters can be completed at any point before their session. Retry during that window.
    data.sessions.forEach(function(s){try{const start=presentationReminderStart_(s);if(start>now && start-now<=PRES_REM_.LEAD_MS)result.next=Math.min(result.next,now+PRES_REM_.RETRY_MS);}catch(error){}});
    props.setProperty(PRES_REM_.NEXT,String(result.next));props.setProperty('PRES_REMINDERS_CHECKED',new Date().toISOString());
    console.log(JSON.stringify({sessionRemindersSent:result.sent,uncertain:result.uncertain}));
  } finally {lock.releaseLock();}
}

function presentationReminderSummary_(planned) {
  const byDay={},starts=planned.jobs.map(function(j){return j.start;}).sort(function(a,b){return a-b;});let peak24h=0;
  planned.jobs.forEach(function(j){byDay[j.session.Date]=(byDay[j.session.Date]||0)+1;});
  starts.forEach(function(t){peak24h=Math.max(peak24h,starts.filter(function(s){return s>=t&&s<t+86400000;}).length);});
  return {assignments:planned.report.length,recipientReady:planned.report.filter(function(r){return r['Recipient Status']==='Ready';}).length,
    missingRecipients:planned.report.filter(function(r){return r['Recipient Status']!=='Ready';}).length,
    sessionsMissingChairContact:Array.from(new Set(planned.report.filter(function(r){return r['Chair Status']==='Incomplete';}).map(function(r){return r['Session ID'];}))).length,
    plannedEmails:planned.jobs.length,emailsByDay:byDay,peakRolling24Hours:peak24h,
    enabled:PropertiesService.getScriptProperties().getProperty(PRES_REM_.ENABLED)==='true'};
}

/** Prepares contact fields/readiness report only. Does not send mail or install triggers. */
function RUN_PREPARE_PRESENTATION_REMINDERS() {
  assertChairEditorRun_();const book=presentationBook_(),lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const contacts=presentationReminderEnsureSheet_(book,PRES_REM_.CONTACTS,PRES_REM_.CONTACT_HEADERS);
    const log=presentationReminderEnsureSheet_(book,PRES_REM_.LOG,PRES_REM_.LOG_HEADERS);
    log.setColumnWidth(1,170);log.setColumnWidth(2,110);log.setColumnWidth(3,210);log.setColumnWidth(4,130);
    log.setColumnWidth(5,260);log.setColumnWidth(6,120);log.setColumnWidths(7,2,210);log.setColumnWidth(9,470);
    const report=presentationReminderEnsureSheet_(book,PRES_REM_.REPORT,PRES_REM_.REPORT_HEADERS);
    const existing=presentationRows_(book,PRES_REM_.CONTACTS).map(function(r){return r['Session ID'];});
    const missing=presentationRows_(book,'Sessions').filter(function(s){return existing.indexOf(s['Session ID'])===-1;});
    if(missing.length)contacts.getRange(contacts.getLastRow()+1,1,missing.length,4).setValues(missing.map(function(s){
      const name=s['Chair Override']||s.Chair||'';return [s['Session ID'],s['Session Title'],/^(tbd|tba)$/i.test(name)?'':name,''];}));
    contacts.setColumnWidth(1,110);contacts.setColumnWidth(2,430);contacts.setColumnWidth(3,220);contacts.setColumnWidth(4,290);
    const planned=withSheetObjectsRuntimeCache_(function(){return presentationReminderBuild_(presentationReminderLoad_(book));});
    if(report.getLastRow()>1)report.getRange(2,1,report.getLastRow()-1,PRES_REM_.REPORT_HEADERS.length).clearContent();
    if(planned.report.length)report.getRange(2,1,planned.report.length,PRES_REM_.REPORT_HEADERS.length).setNumberFormat('@').setValues(planned.report.map(function(r){return PRES_REM_.REPORT_HEADERS.map(function(h){return presentationText_(r[h]||'');});}));
    report.setColumnWidths(1,2,105);report.setColumnWidth(3,190);report.setColumnWidths(4,2,230);report.setColumnWidths(6,2,170);report.setColumnWidth(8,480);
    console.log(JSON.stringify(presentationReminderSummary_(planned)));console.log('Prepared SessionContacts and ReminderReadiness. No emails sent; reminders not enabled by this function.');
  } finally {lock.releaseLock();}
}

function RUN_VALIDATE_PRESENTATION_REMINDERS() {
  assertChairEditorRun_();const book=presentationBook_();
  const planned=withSheetObjectsRuntimeCache_(function(){return presentationReminderBuild_(presentationReminderLoad_(book));});
  console.log(JSON.stringify(presentationReminderSummary_(planned)));
}

/** Requires separately approved send-only mail permission. Setup itself sends no mail. */
function RUN_ENABLE_PRESENTATION_REMINDERS() {
  assertChairEditorRun_();const remaining=MailApp.getRemainingDailyQuota();
  RUN_PREPARE_PRESENTATION_REMINDERS();
  const triggers=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='presentationReminderTick_';});
  if(!triggers.some(function(t){return t.getEventType()===ScriptApp.EventType.CLOCK;}))ScriptApp.newTrigger('presentationReminderTick_').timeBased().everyMinutes(1).create();
  PropertiesService.getScriptProperties().setProperty(PRES_REM_.ENABLED,'true');
  presentationReminderWake_(presentationBook_());
  console.log('Independent session reminders enabled; checked each minute, due 30 minutes before session start. Remaining daily mail recipients: '+remaining+'. Setup sent no mail.');
}
