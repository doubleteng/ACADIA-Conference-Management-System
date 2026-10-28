/** Private Gmail-owned reminder service. No public endpoint or mailbox-reading scope. */
const MAIL_SENDER_ = Object.freeze({SENDER:"__ACADIA_TEXT_t0079__", NAME:"__ACADIA_TEXT_t0028__",
 ADMIN:"__ACADIA_RESOURCE_presentationId__",
 MASTER:"__ACADIA_RESOURCE_authorMasterId__",
 SCHEDULE:"__ACADIA_RESOURCE_scheduleId__",
 ENABLED:'ACADIA_REMINDERS_ENABLED', NEXT:'ACADIA_REMINDERS_NEXT_SCAN', STATUS:'CommunicationsStatus'});
const PRES_CAL_ = Object.freeze({
  ID: 'PRES_CALENDAR_ID', ENABLED: 'PRES_CALENDAR_ENABLED', SHEET: 'CalendarInvitations',
  CURSOR: 'PRES_CALENDAR_CURSOR', HEADERS: ['Key','Paper ID','Email','Event ID','Fingerprint','State','Requested At','Last Synced At','Last Error'],
  API: 'https://www.googleapis.com/calendar/v3',
  PORTAL: "__ACADIA_VALUE_authorPortalUrl__"
});

/** Independent session reminders. Recipient data never comes from calendar subscriptions. */
const PRES_REM_ = Object.freeze({
  ENABLED:'PRES_REMINDERS_ENABLED', NEXT:'PRES_REMINDERS_NEXT_CHECK',
  CONTACTS:'SessionContacts', LOG:'PresentationReminders', REPORT:'ReminderReadiness',
  CONTACT_HEADERS:['Session ID','Session Title','Chair Name','Chair Email'],
  LOG_HEADERS:['Key','Session ID','Session Start UTC','Paper IDs','Presenter Email','State','Attempted At','Sent At','Issue'],
  REPORT_HEADERS:['Paper ID','Session ID',"__ACADIA_TEXT_t0082__",'Presenting Author','Presenting Email','Recipient Status','Chair Status','Action Needed'],
  LEAD_MS:30*60000, RETRY_MS:5*60000
});

function parseBoolean_(value, fallback) {
  if (value === true || value === false) return value;
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (['true', 'yes', '1', 'y'].indexOf(text) !== -1) return true;
  if (['false', 'no', '0', 'n'].indexOf(text) !== -1) return false;
  return fallback;
}

function normalizePaperId_(value) {
  return String(value == null ? '' : value).trim().replace(/^#/, '');
}

function normalizeTrack_(value) {
  const text = String(value == null ? '' : value).trim().toLowerCase();
  if (['paper', 'papers', 'full paper', 'full papers'].indexOf(text) !== -1) return 'Full Paper';
  if (['project', 'projects'].indexOf(text) !== -1) return 'Projects';
  if (['field note', 'field notes', 'fieldnote', 'fieldnotes'].indexOf(text) !== -1) return 'Field Note';
  if (['phd workshop', 'phd workshop participant', 'phd workshop participants', 'phd'].indexOf(text) !== -1) {
    return 'PhD Workshop';
  }
  if (['book forum', 'bookforum', 'book forums', 'book'].indexOf(text) !== -1) {
    return 'Book Forum';
  }
  if (text === 'host') return 'Host';
  return String(value == null ? '' : value).trim();
}

function presentationSupported_(track) {
  return ['Full Paper','Projects','Field Note','Book Forum'].indexOf(normalizeTrack_(track)) !== -1;
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

function presentationScheduleParse_(values, previous) {
  const sessions=[],assignments=[],byId={},bySource={},byTitle={};
  const norm=function(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');};
  previous.assignments.forEach(function(a){byId[a['Paper ID']]=a;if(a['Paper ID'].indexOf('BF-')===0){if(a['Schedule Source ID'])bySource[a['Schedule Source ID']]=a;(byTitle[norm(a.Title)]||(byTitle[norm(a.Title)]=[])).push(a);}});
  let day='',venue='',current=null,last=null;
  values.forEach(function(row,index){
    const a=String(row[0]||'').trim(),b=String(row[1]||'').trim(),c=String(row[2]||'').trim(),d=String(row[3]||'').trim();
    if(/^DAY\s+\d+/i.test(a)) {
      day=conferenceDate_(a);if(!day)throw new Error('Unrecognized conference date at row '+(index+1));venue=a.split(/@\s*/).slice(1).join('@');current=null;last=null;return;
    }
    const sm=c.match(/^(Paper Session|Project Session|Field Notes|Book Forum)\s+(\d+)/i);
    if(sm) {
      const types={'paper session':['P','Full Paper'],'project session':['PR','Projects'],'field notes':['FN','Field Note'],'book forum':['BF','Book Forum']},type=types[sm[1].toLowerCase()];
      const tm=a.replace(/\*/g,'').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if(!day||!tm)throw new Error('Unrecognized session date/time at row '+(index+1));
      const fmt=function(h,m,ap){return String(Number(h)%12+(ap.toUpperCase()==='PM'?12:0)).padStart(2,'0')+':'+m;};
      const end=fmt(tm[4],tm[5],tm[6]);let ap=tm[3]||tm[6],start=fmt(tm[1],tm[2],ap);
      if(!tm[3]&&start>=end&&tm[6].toUpperCase()==='PM')start=fmt(tm[1],tm[2],'AM');
      if(start>=end)throw new Error('Invalid session time at row '+(index+1));
      current={'Session ID':type[0]+sm[2].padStart(2,'0'),Track:type[1],Subtheme:type[0]==='FN'?'Field Notes':type[0]==='BF'?'Book Forum':c.replace(/^[^:]+:\s*/,''),'Session Title':c,Date:day,'Start Time':start,'End Time':end,'Time Zone':"__ACADIA_TEXT_t0023__",Venue:venue,Room:b,Chair:'TBD','Folder ID':'','Chair Override':''};
      sessions.push(current);last=null;return;
    }
    if(current&&/^Session Chair\s*:/i.test(c)) {current.Chair=c.replace(/^Session Chair\s*:\s*/i,'').trim()||d||'TBD';return;}
    if(a) {current=null;last=null;return;}
    if(current&&b&&c) {
      let id=b;
      if(current.Track==='Book Forum') {
        const titleHits=byTitle[norm(c)]||[];
        const hit=byId[b]|| (titleHits.length===1?titleHits[0]:null)||bySource[b];
        if(!hit||hit['Paper ID'].indexOf('BF-')!==0)throw new Error('Book Forum entry needs an explicit Hub mapping at row '+(index+1));id=hit['Paper ID'];
      } else if(!/^\d+$/.test(id)) throw new Error('Unrecognized paper ID at row '+(index+1));
      const old=byId[id]||{};
      last=Object.assign({},old,{'Paper ID':id,'Session ID':current['Session ID'],Order:assignments.filter(function(x){return x['Session ID']===current['Session ID'];}).length+1,Title:c,Authors:'','Schedule Source ID':b});
      assignments.push(last);return;
    }
    if(current&&last&&!b&&c)last.Authors+=(last.Authors?'\n':'')+c;
  });
  if(sessions.length<conferenceEdition_().minimumPresentationSessions||assignments.length<1)throw new Error('The schedule is incomplete; keeping the last valid schedule.');
  const ids={},sids={};sessions.forEach(function(s){if(sids[s['Session ID']])throw new Error('Duplicate session '+s['Session ID']);sids[s['Session ID']]=true;});
  assignments.forEach(function(a){if(ids[a['Paper ID']])throw new Error('Duplicate paper '+a['Paper ID']);ids[a['Paper ID']]=true;});
  const previousCount=previous.assignments.filter(function(x){return x['Session ID'];}).length;
  if(assignments.length<previousCount*(1-conferenceEdition_().maximumMissingAssignmentFraction))throw new Error('The configured missing-assignment limit was exceeded; keeping the last valid schedule.');
  previous.assignments.forEach(function(a){if(!ids[a['Paper ID']])assignments.push(Object.assign({},a,{'Session ID':'',Order:'','Presentation Start':'','Presentation End':''}));});
  return {sessions:sessions,assignments:assignments};
}

function presentationCalendarEmail_(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email) ||
      email.split('@')[0].length > 64 || email.indexOf('..') !== -1 || email[0] === '.' || email.indexOf('.@') !== -1) {
    throw new Error('Enter one valid email address for your calendar invitation.');
  }
  return email;
}

function presentationCalendarHash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

function presentationCalendarEscape_(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function presentationCalendarTime_(value) {
  const text = String(value || '').trim();
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)) throw new Error('A confirmed presentation time is not available yet.');
  return text;
}

function presentationCalendarSpec_(paperId, ctx) {
  if (!ctx || !ctx.session || !ctx.assignment) return null;
  const s = ctx.session, a = ctx.assignment, date = String(s.Date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date + 'T00:00:00Z')) ||
      new Date(date + 'T00:00:00Z').toISOString().slice(0,10) !== date) {
    throw new Error('The conference date is not valid. Please contact the organizers.');
  }
  const zone = String(s['Time Zone'] || "__ACADIA_TEXT_t0023__").trim();
  if (zone !== "__ACADIA_TEXT_t0023__") throw new Error('The conference time zone needs organizer verification.');
  const sessionStart = presentationCalendarTime_(s['Start Time']);
  const sessionEnd = presentationCalendarTime_(s['End Time']);
  if (sessionStart >= sessionEnd) throw new Error('The session end time must follow its start time.');
  let start = sessionStart, end = sessionEnd, precision = 'session';
  const ps = String(a['Presentation Start'] || '').trim(), pe = String(a['Presentation End'] || '').trim();
  // Incomplete or stale individual slots cannot be presented as confirmed times.
  if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(ps) && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(pe) &&
      ps >= sessionStart && pe <= sessionEnd && ps < pe) { start = ps; end = pe; precision = 'presentation'; }
  const title = String(a.Title || 'Conference presentation').trim();
  const sessionTitle = String(s['Session Title'] || '').trim();
  const e = presentationCalendarEscape_;
  const description = [
    "__ACADIA_TEXT_t0002__",
    'Submission: ' + e(paperId) + ' — ' + e(title),
    'Session: ' + e(sessionTitle),
    'Session time: ' + e(date + ' ' + sessionStart + '–' + sessionEnd) + "__ACADIA_TEXT_t0075__",
    precision === 'presentation' ? 'Your presentation: ' + e(start + '–' + end) + "__ACADIA_TEXT_t0075__" :
      'An individual presentation slot has not been confirmed. This event reserves the full session.',
    a.Order ? 'Your position in the session: ' + e(a.Order) : '',
    s.Chair ? 'Session chair: ' + e(s.Chair) : '',
    'Accept this invitation in Google Calendar or Microsoft Outlook to keep the event linked to organizer updates.',
    'Changes to the confirmed conference schedule will update this same event. Your calendar may ask you to accept an update.',
    'Author Portal: ' + PRES_CAL_.PORTAL
  ].filter(Boolean).join('\n');
  const room = String(s.Room || '').trim();
  const event = {
    summary: ("__ACADIA_TEXT_t0076__" + (precision === 'presentation' ? 'Presentation' : 'Presentation session') + ' ' + paperId + ': ' + title).slice(0,1000),
    description: description,
    location: [String(s.Venue || '').trim(), room ? 'Room: ' + room : ''].filter(Boolean).join(' · '),
    start: {dateTime:date + 'T' + start + ':00',timeZone:zone},
    end: {dateTime:date + 'T' + end + ':00',timeZone:zone},
    status:'confirmed', transparency:'opaque', visibility:'private',
    guestsCanModify:false, guestsCanInviteOthers:false, guestsCanSeeOtherGuests:false
  };
  return {event:event, fingerprint:presentationCalendarHash_(JSON.stringify(event)),
    precision:precision,date:date,start:start,end:end,timeZone:zone};
}

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
    'If you have any questions about your presentation, please contact your session chair.',
    "__ACADIA_TEXT_t0087__"].filter(function(v){return v!==null;}).join('\n');
  const esc=presentationCalendarEscape_;
  return {to:job.email,name:MAIL_SENDER_.NAME,replyTo:MAIL_SENDER_.SENDER,
    subject:("__ACADIA_TEXT_t0089__"+clock+' ('+session['Session ID']+')').replace(/[\r\n]/g,' ').slice(0,220),
    body:body,htmlBody:'<div style="font:15px/1.65 Arial,sans-serif;color:#222;max-width:720px"><h2 style="color:#255ea8;font-weight:normal">Your session starts soon</h2><div style="white-space:pre-wrap">'+esc(body)+'</div></div>'};
}

function presentationReminderEnsureSheet_(book,name,heads) {
  let sheet=book.getSheetByName(name);
  if(!sheet){sheet=book.insertSheet(name);sheet.getRange(1,1,1,heads.length).setValues([heads]);sheet.setFrozenRows(1);sheet.getRange(1,1,1,heads.length).setFontWeight('normal').setBackground('#e8eff9');}
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
function reminderAssertSender_() {
  if(String(Session.getEffectiveUser().getEmail()||'').toLowerCase()!==MAIL_SENDER_.SENDER)
    throw new Error('Run this private reminder sender as '+MAIL_SENDER_.SENDER+'.');
}
function reminderSchedule_(book) {
  const previous={sessions:presentationRows_(book,'Sessions'),assignments:presentationRows_(book,'Assignments')};
  const source=SpreadsheetApp.openById(MAIL_SENDER_.SCHEDULE).getSheetByName('Conference');
  if(!source||source.getLastRow()>2000)throw new Error('Schedule source unavailable. Sending held.');
  const parsed=presentationScheduleParse_(source.getRange(1,1,Math.max(1,source.getLastRow()),4).getDisplayValues(),previous);
  const old={};previous.sessions.forEach(function(s){old[s['Session ID']]=s;});
  parsed.sessions.forEach(function(s){s['Chair Override']=(old[s['Session ID']]||{})['Chair Override']||'';});
  return parsed; // Read the source directly, never rewrite the source or Portal schedule tables.
}
function reminderData_(book,schedule) {
  const master=SpreadsheetApp.openById(MAIL_SENDER_.MASTER);
  return {sessions:schedule.sessions,assignments:schedule.assignments,
    contacts:presentationRows_(book,PRES_REM_.CONTACTS),
    submissions:presentationReminderIndex_(presentationRows_(master,'Submissions')),
    authors:presentationReminderIndex_(presentationRows_(master,'Authors')),
    attendance:presentationReminderIndex_(presentationRows_(master,'Attendance'))};
}
function reminderStatus_(book,state,detail) {
  const sheet=presentationReminderEnsureSheet_(book,MAIL_SENDER_.STATUS,['Key','Value']);
  const rows=[['Sender',MAIL_SENDER_.SENDER],['Enabled',PropertiesService.getScriptProperties().getProperty(MAIL_SENDER_.ENABLED)||'false'],
    ['Status',state],['Last checked at',new Date().toISOString()],['Details',String(detail||'').slice(0,400)]];
  sheet.getRange(2,1,rows.length,2).setNumberFormat('@').setValues(rows);
  sheet.setColumnWidth(1,175);sheet.setColumnWidth(2,640);
}

function acadiaReminderTick_() {
  reminderAssertSender_();
  const props=PropertiesService.getScriptProperties(),now=Date.now();
  if(props.getProperty(MAIL_SENDER_.ENABLED)!=='true'||Number(props.getProperty(MAIL_SENDER_.NEXT)||0)>now)return;
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  let book;
  try {
    book=SpreadsheetApp.openById(MAIL_SENDER_.ADMIN);
    const schedule=reminderSchedule_(book),checked=Date.now();
    const starts=schedule.sessions.map(presentationReminderStart_);
    const due=starts.some(function(start){return start>checked&&start-checked<=PRES_REM_.LEAD_MS;});
    let sent={sent:0,uncertain:0};
    if(due)sent=presentationReminderDeliver_(book,presentationReminderBuild_(reminderData_(book,schedule)).jobs,Date.now());
    // Scan every five minutes while idle; every minute starting forty minutes before a session.
    let next=checked+5*60000;
    starts.forEach(function(start){if(start<=checked)return;next=Math.min(next,start-checked<=40*60000?checked+50000:start-40*60000);});
    props.setProperty(MAIL_SENDER_.NEXT,String(next));
    reminderStatus_(book,'Ready','Independent session reminders enabled. Sent this run: '+sent.sent+'. Uncertain deliveries: '+sent.uncertain+'.');
    console.log(JSON.stringify({sender:MAIL_SENDER_.SENDER,displayName:MAIL_SENDER_.NAME,sent:sent.sent,uncertain:sent.uncertain,nextCheck:new Date(next).toISOString()}));
  } catch(error) {
    props.setProperty(MAIL_SENDER_.NEXT,String(Date.now()+60000));
    if(book)reminderStatus_(book,'Attention needed','Schedule or delivery validation failed. No blind retry of uncertain sends.');
    throw error; // Installable-trigger failure notification reaches the owning Gmail account.
  } finally {lock.releaseLock();}
}

/** Read-only validation; no messages sent. */
function RUN_VALIDATE_GMAIL_REMINDERS() {
  reminderAssertSender_();
  const book=SpreadsheetApp.openById(MAIL_SENDER_.ADMIN),schedule=reminderSchedule_(book);
  const planned=presentationReminderBuild_(reminderData_(book,schedule));
  const result=presentationReminderSummary_(planned);
  result.enabled=PropertiesService.getScriptProperties().getProperty(MAIL_SENDER_.ENABLED)==='true';
  result.sender=MAIL_SENDER_.SENDER;result.displayName=MAIL_SENDER_.NAME;
  result.remainingMailQuota=MailApp.getRemainingDailyQuota();
  console.log(JSON.stringify(result));return result;
}

/** Enables the minute trigger. Setup sends no reminder. */
function RUN_ENABLE_GMAIL_REMINDERS() {
  const result=RUN_VALIDATE_GMAIL_REMINDERS();
  const book=SpreadsheetApp.openById(MAIL_SENDER_.ADMIN);
  presentationReminderEnsureSheet_(book,PRES_REM_.LOG,PRES_REM_.LOG_HEADERS);
  if(!ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='acadiaReminderTick_'&&t.getEventType()===ScriptApp.EventType.CLOCK;}))
    ScriptApp.newTrigger('acadiaReminderTick_').timeBased().everyMinutes(1).create();
  PropertiesService.getScriptProperties().setProperty(MAIL_SENDER_.ENABLED,'true').setProperty(MAIL_SENDER_.NEXT,'0');
  reminderStatus_(book,'Ready',"__ACADIA_TEXT_t0183__"+MAIL_SENDER_.SENDER+'. Setup sent no emails.');
  console.log("__ACADIA_TEXT_t0184__"+MAIL_SENDER_.SENDER+'>; session reminders do not depend on calendar subscriptions. Setup sent nothing.');
}

function RUN_DISABLE_GMAIL_REMINDERS() {
  reminderAssertSender_();PropertiesService.getScriptProperties().setProperty(MAIL_SENDER_.ENABLED,'false');
  reminderStatus_(SpreadsheetApp.openById(MAIL_SENDER_.ADMIN),'Disabled','Reminders paused; delivery history preserved.');
}
