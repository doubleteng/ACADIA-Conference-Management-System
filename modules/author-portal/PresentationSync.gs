/** Live schedule is read-only. Administration retains only overrides and upload bookkeeping. */
const PRES_SCHEDULE_ = "__ACADIA_RESOURCE_scheduleId__";

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

function presentationSyncSchedule_(book) {
  const lock=LockService.getScriptLock();if(!lock.tryLock(15000))return;
  const props=PropertiesService.getScriptProperties();
  try {
    const sheet=SpreadsheetApp.openById(PRES_SCHEDULE_).getSheetByName('Conference');
    if(!sheet||sheet.getLastRow()>2000)throw new Error('Schedule tab is unavailable or exceeds the supported 2,000-row layout.');
    const values=sheet.getRange(1,1,Math.max(1,sheet.getLastRow()),4).getDisplayValues();
    const hash=Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(values)));
    if(props.getProperty('PRES_SCHEDULE_HASH')!==hash) {
      const previous={sessions:presentationRows_(book,'Sessions'),assignments:presentationRows_(book,'Assignments')};
      const parsed=presentationScheduleParse_(values,previous),oldSessions={};previous.sessions.forEach(function(s){oldSessions[s['Session ID']]=s;});
      parsed.sessions.forEach(function(s){const old=oldSessions[s['Session ID']];if(old){s['Chair Override']=old['Chair Override']||'';if(old.Subtheme===s.Subtheme&&old['Session Title']===s['Session Title'])s['Folder ID']=old['Folder ID'];}});
      ['Sessions','Assignments'].forEach(function(name){
        const rows=name==='Sessions'?parsed.sessions:parsed.assignments,heads=PRES_.HEADERS[name],target=book.getSheetByName(name);
        if(target.getMaxRows()<rows.length+1)target.insertRowsAfter(target.getMaxRows(),rows.length+1-target.getMaxRows());
        if(target.getFilter())target.getFilter().remove();
        if(target.getLastRow()>1)target.getRange(2,1,target.getLastRow()-1,heads.length).clearContent();
        target.getRange(2,1,rows.length,heads.length).setValues(rows.map(function(r){return heads.map(function(h){return presentationText_(r[h]||'');});}));
        target.getRange(1,1,rows.length+1,heads.length).createFilter();
      });
      SpreadsheetApp.flush();props.setProperty('PRES_SCHEDULE_HASH',hash);props.setProperty('PRES_SCHEDULE_UPDATED',new Date().toISOString());
    }
    props.setProperty('PRES_SCHEDULE_CHECKED',new Date().toISOString());props.deleteProperty('PRES_SCHEDULE_ERROR');
  } catch(error) {props.setProperty('PRES_SCHEDULE_ERROR',String(error.message||error).slice(0,800));console.error('Presentation schedule sync: '+error);}
  finally {lock.releaseLock();}
}

function presentationScheduleStatus_() {
  const props=PropertiesService.getScriptProperties();
  return {checkedAt:props.getProperty('PRES_SCHEDULE_CHECKED')||'',updatedAt:props.getProperty('PRES_SCHEDULE_UPDATED')||'',stale:Boolean(props.getProperty('PRES_SCHEDULE_ERROR'))};
}

/** Installable triggers execute as owner and only touch module-created private records/files. */
function presentationScheduleTick_(event) {
  if(event&&event.range&&event.range.getSheet().getName()!=='Conference')return;
  const book=presentationBook_();presentationSyncSchedule_(book);
  if(PropertiesService.getScriptProperties().getProperty('PRES_SCHEDULE_ERROR'))return;
  try { presentationCalendarSync_(book); } catch(error) {
    console.error('Presentation calendar synchronization failed; it will retry on the next scheduled run.');
  }
  try { presentationReminderWake_(book); } catch(error) {
    console.error('Presentation reminder planning will retry on the next schedule check.');
  }
  presentationReconcileFolders_();
}

function RUN_ENABLE_PRESENTATION_SYNC() {
  assertChairEditorRun_();
  const handlers=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='presentationScheduleTick_';});
  if(!handlers.some(function(t){return t.getEventType()===ScriptApp.EventType.CLOCK;}))ScriptApp.newTrigger('presentationScheduleTick_').timeBased().everyMinutes(5).create();
  if(!handlers.some(function(t){return t.getEventType()===ScriptApp.EventType.ON_EDIT;}))ScriptApp.newTrigger('presentationScheduleTick_').forSpreadsheet(PRES_SCHEDULE_).onEdit().create();
  presentationScheduleTick_();console.log('Schedule sync enabled; read on open/refresh, source edit trigger, and five-minute background reconciliation.');
}
