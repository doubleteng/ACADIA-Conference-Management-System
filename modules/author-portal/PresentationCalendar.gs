/** Author-requested calendar invitations. Uses only a calendar created by this app. */
const PRES_CAL_ = Object.freeze({
  ID: 'PRES_CALENDAR_ID', ENABLED: 'PRES_CALENDAR_ENABLED', SHEET: 'CalendarInvitations',
  CURSOR: 'PRES_CALENDAR_CURSOR', HEADERS: ['Key','Paper ID','Email','Event ID','Fingerprint','State','Requested At','Last Synced At','Last Error'],
  API: 'https://www.googleapis.com/calendar/v3',
  PORTAL: "__ACADIA_VALUE_authorPortalUrl__"
});

function presentationCalendarEnabled_() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(PRES_CAL_.ENABLED) === 'true' && Boolean(props.getProperty(PRES_CAL_.ID));
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
      '',
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

function presentationCalendarInfo_(paperId, ctx) {
  const enabled = presentationCalendarEnabled_();
  if (!enabled) return {enabled:false,available:false};
  try {
    const spec = presentationCalendarSpec_(paperId,ctx);
    return {enabled:true,available:Boolean(spec),precision:spec ? spec.precision : '',
      date:spec ? spec.date : '',start:spec ? spec.start : '',end:spec ? spec.end : ''};
  } catch (err) { return {enabled:true,available:false}; }
}

function presentationCalendarApi_(method, path, body, allowMissing) {
  const options = {method:method,headers:{Authorization:'Bearer ' + ScriptApp.getOAuthToken()},muteHttpExceptions:true};
  if (body) { options.contentType='application/json; charset=UTF-8'; options.payload=JSON.stringify(body); }
  const response=UrlFetchApp.fetch(PRES_CAL_.API + path,options), status=response.getResponseCode();
  if (allowMissing && status === 404) return null;
  if (status >= 200 && status < 300) return response.getContentText() ? JSON.parse(response.getContentText()) : {};
  const error = new Error(status === 429 || status >= 500
    ? 'The calendar service is temporarily busy. Please try again shortly.'
    : 'The calendar invitation could not be completed. Please contact the organizers if this continues.');
  error.calendarStatus=status;
  throw error;
}

function presentationCalendarSheet_(book) {
  const sheet=book.getSheetByName(PRES_CAL_.SHEET);
  if(!sheet) throw new Error('Calendar invitations are awaiting organizer setup.');
  return sheet;
}

function presentationCalendarRows_(book) {
  const values=presentationCalendarSheet_(book).getDataRange().getDisplayValues();
  const heads=values.shift() || [];
  if(JSON.stringify(heads)!==JSON.stringify(PRES_CAL_.HEADERS)) throw new Error('The calendar invitation registry needs organizer verification.');
  return values.map(function(row,i){const item={__row:i+2};heads.forEach(function(h,j){item[h]=row[j]||'';});return item;})
    .filter(function(row){return row.Key;});
}

function presentationCalendarWrite_(book, row) {
  const sheet=presentationCalendarSheet_(book);
  if(!row.__row) row.__row=sheet.getLastRow()+1;
  sheet.getRange(row.__row,1,1,PRES_CAL_.HEADERS.length).setNumberFormat('@').setValues([
    PRES_CAL_.HEADERS.map(function(h){return presentationText_(row[h] || '');})
  ]);
  SpreadsheetApp.flush();
}

function presentationCalendarUpsert_(book, row, spec) {
  const calendarId=PropertiesService.getScriptProperties().getProperty(PRES_CAL_.ID);
  if(!calendarId)throw new Error('Calendar invitations are awaiting organizer setup.');
  if(row.State==='ACTIVE' && spec && row.Fingerprint===spec.fingerprint) return {changed:false};
  if(row.State==='WAITING' && !spec) return {changed:false};
  if(!spec && !row['Event ID']) return {changed:false};
  // The deterministic ID lets a retry discover an already-created event after a network timeout.
  const eventId=row['Event ID'] || 'a26' + row.Key;
  const base='/calendars/' + encodeURIComponent(calendarId) + '/events';
  const path=base + '/' + encodeURIComponent(eventId);
  let existing=presentationCalendarApi_('get',path,null,true);
  if(existing && existing.status==='cancelled') {
    throw new Error('This calendar invitation was cancelled by the organizer. Please contact the Technical Chairs.');
  }
  let event, fingerprint;
  if(!spec) {
    if(!existing) return {changed:false};
    event={summary:"__ACADIA_TEXT_t0077__" + row['Paper ID'],
      description:'This presentation no longer has a confirmed slot in the published conference schedule. The time shown is the previous slot and is not confirmed. This event will update when a new slot is assigned.\nAuthor Portal: ' + PRES_CAL_.PORTAL,
      status:'tentative',transparency:'transparent'};
    fingerprint=presentationCalendarHash_(JSON.stringify(event));
  } else { event=Object.assign({},spec.event); fingerprint=spec.fingerprint; }
  const previousFingerprint=existing && existing.extendedProperties && existing.extendedProperties.private && existing.extendedProperties.private.acadiaScheduleHash;
  if(previousFingerprint!==fingerprint) {
    event.extendedProperties={private:{acadiaScheduleHash:fingerprint,acadiaInvitationKey:row.Key}};
    if(existing) {
      // Do not rewrite attendees; accepted/declined responses and the stable event UID survive updates.
      presentationCalendarApi_('patch',path + '?sendUpdates=all',event);
    } else {
      if(!spec) return {changed:false};
      event.id=eventId;
      event.attendees=[{email:row.Email}];
      presentationCalendarApi_('post',base + '?sendUpdates=all',event);
    }
  }
  row['Event ID']=eventId;row.Fingerprint=fingerprint;row.State=spec?'ACTIVE':'WAITING';
  row['Last Synced At']=new Date().toISOString();row['Last Error']='';
  presentationCalendarWrite_(book,row);
  return {changed:previousFingerprint!==fingerprint};
}

function sendPresentationCalendarInvite(sessionToken, emailValue) {
  return withSheetObjectsRuntimeCache_(function(){
    const session=requireAuthorSession_(sessionToken),paperId=normalizePaperId_(session.paperId);
    const submission=requireSubmission_(paperId);
    if(!presentationSupported_(submission.Track))throw new Error('Calendar invitations are not available for this track.');
    if(!parseBoolean_(getConfig_().PORTAL_ENABLED,true))throw new Error('The Author Portal is currently disabled.');
    if(!presentationCalendarEnabled_())throw new Error('Calendar invitations are awaiting organizer setup.');
    const email=presentationCalendarEmail_(emailValue),book=presentationBook_();
    presentationSyncSchedule_(book);
    if(presentationScheduleStatus_().stale)throw new Error('The conference schedule could not be refreshed. Please try again shortly.');
    const lock=LockService.getScriptLock();
    if(!lock.tryLock(10000))throw new Error('The schedule is being updated. Please try again shortly.');
    try {
      const spec=presentationCalendarSpec_(paperId,presentationContext_(paperId,book));
      if(!spec)throw new Error('Your presentation session has not been announced yet.');
      const key=presentationCalendarHash_(ScriptApp.getScriptId() + '\n' + paperId + '\n' + email);
      const rows=presentationCalendarRows_(book);
      let row=rows.filter(function(r){return r.Key===key;})[0];
      const alreadyInvited=Boolean(row && row.State==='ACTIVE' && row.Fingerprint===spec.fingerprint);
      if(!row) {
        const recent=rows.filter(function(r){return r['Paper ID']===paperId && Date.parse(r['Requested At'])>Date.now()-3600000;});
        if(recent.length>=30)throw new Error('Several invitations were requested for this submission. Please try again later.');
        row={Key:key,'Paper ID':paperId,Email:email,'Event ID':'a26'+key,State:'PENDING','Requested At':new Date().toISOString()};
        presentationCalendarWrite_(book,row);
      }
      try { presentationCalendarUpsert_(book,row,spec); }
      catch(err) {
        row.State='RETRY';row['Last Error']='Calendar request failed' + (err.calendarStatus?' (HTTP '+err.calendarStatus+')':'') + '.';
        presentationCalendarWrite_(book,row);
        throw err;
      }
      return {ok:true,alreadyInvited:alreadyInvited,email:email,precision:spec.precision,
        message:alreadyInvited?'An invitation has already been sent to this address. Accept it in your calendar to receive schedule updates.':
          'Calendar invitation sent. Accept it in Google Calendar or Microsoft Outlook. Schedule changes will update the same event; your calendar may ask you to accept an update.'};
    } finally {lock.releaseLock();}
  });
}

function presentationCalendarSync_(book) {
  if(!presentationCalendarEnabled_() || presentationScheduleStatus_().stale)return;
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  const props=PropertiesService.getScriptProperties(),started=Date.now();
  try {
    const rows=presentationCalendarRows_(book);
    if(!rows.length)return;
    const loaded={sessions:presentationRows_(book,'Sessions'),assignments:presentationRows_(book,'Assignments')};
    let cursor=Number(props.getProperty(PRES_CAL_.CURSOR)||0)%rows.length,processed=0;
    while(processed<rows.length && Date.now()-started<25000) {
      const row=rows[cursor];
      try {
        const spec=presentationCalendarSpec_(row['Paper ID'],presentationContext_(row['Paper ID'],book,loaded));
        presentationCalendarUpsert_(book,row,spec);
      } catch(err) {
        const status=err.calendarStatus || '';
        row.State='RETRY';row['Last Error']='Calendar sync failed' + (status?' (HTTP '+status+')':'') + '.';
        presentationCalendarWrite_(book,row);
        if(status===401 || status===403 || status===429 || status>=500)break;
      }
      cursor=(cursor+1)%rows.length;processed++;
    }
    props.setProperty(PRES_CAL_.CURSOR,String(cursor));
    props.setProperty('PRES_CALENDAR_CHECKED',new Date().toISOString());
  } finally {lock.releaseLock();}
}

function RUN_ENABLE_PRESENTATION_CALENDAR() {
  assertChairEditorRun_();
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const props=PropertiesService.getScriptProperties();
    let calendarId=props.getProperty(PRES_CAL_.ID);
    if(!calendarId) {
      const calendar=presentationCalendarApi_('post','/calendars',{
        summary:"__ACADIA_TEXT_t0028__",timeZone:"__ACADIA_TEXT_t0023__",
        description:"__ACADIA_TEXT_t0078__"
      });
      calendarId=calendar.id;
      if(!calendarId)throw new Error('Calendar setup did not return a calendar ID.');
      props.setProperty(PRES_CAL_.ID,calendarId);
    }
    const book=presentationBook_();
    if(!book.getSheetByName(PRES_CAL_.SHEET)) {
      const sheet=book.insertSheet(PRES_CAL_.SHEET);
      sheet.getRange(1,1,1,PRES_CAL_.HEADERS.length).setValues([PRES_CAL_.HEADERS]);
      sheet.setFrozenRows(1);
    }
    presentationCalendarRows_(book);
    const handlers=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='presentationScheduleTick_';});
    if(!handlers.some(function(t){return t.getEventType()===ScriptApp.EventType.CLOCK;}))
      ScriptApp.newTrigger('presentationScheduleTick_').timeBased().everyMinutes(5).create();
    if(!handlers.some(function(t){return t.getEventType()===ScriptApp.EventType.ON_EDIT;}))
      ScriptApp.newTrigger('presentationScheduleTick_').forSpreadsheet(PRES_SCHEDULE_).onEdit().create();
    props.setProperty(PRES_CAL_.ENABLED,'true');
    console.log('Presentation calendar invitations enabled. Private calendar and registry ready; source-edit and five-minute synchronization enabled. No invitations were sent by setup.');
  } finally {lock.releaseLock();}
}

/** Read-only validation: reports counts, never author data or email addresses. */
function RUN_VALIDATE_PRESENTATION_CALENDAR() {
  assertChairEditorRun_();
  const book=presentationBook_();
  const loaded={sessions:presentationRows_(book,'Sessions'),assignments:presentationRows_(book,'Assignments')};
  const result={assignments:loaded.assignments.length,presentationSlots:0,sessionSlots:0,unassigned:0,invalid:0,
    sourceStale:presentationScheduleStatus_().stale,calendarEnabled:presentationCalendarEnabled_()};
  loaded.assignments.forEach(function(a){
    try {
      const spec=presentationCalendarSpec_(a['Paper ID'],presentationContext_(a['Paper ID'],book,loaded));
      if(!spec)result.unassigned++;
      else if(spec.precision==='presentation')result.presentationSlots++;
      else result.sessionSlots++;
    } catch(err){result.invalid++;}
  });
  console.log(JSON.stringify(result));
  return result;
}

/** Uses the previously authorized app-created calendar. Sends no event invitation. */
function RUN_CONFIGURE_ACADIA_GMAIL_CALENDAR() {
  assertChairEditorRun_();
  const sender=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();
  if(sender!=="__ACADIA_TEXT_t0079__")throw new Error("__ACADIA_TEXT_t0080__");
  const props=PropertiesService.getScriptProperties(),id=props.getProperty(PRES_CAL_.ID);
  if(!id||!presentationCalendarEnabled_())throw new Error('Existing calendar is not enabled.');
  const path='/calendars/'+encodeURIComponent(id);
  const calendar=presentationCalendarApi_('get',path);
  if(calendar.summary!=="__ACADIA_TEXT_t0028__")presentationCalendarApi_('patch',path,{summary:"__ACADIA_TEXT_t0028__"});
  const verified=presentationCalendarApi_('get',path);
  if(verified.summary!=="__ACADIA_TEXT_t0028__")throw new Error('Calendar display name was not confirmed.');
  props.deleteProperty("__ACADIA_TEXT_t0081__");
  const triggers=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='presentationScheduleTick_';});
  const rows=presentationCalendarRows_(presentationBook_());
  const sample=rows.length?presentationCalendarApi_('get',path+'/events/'+encodeURIComponent(rows[0]['Event ID'])):null;
  console.log(JSON.stringify({sender:sender,calendarName:verified.summary,calendarEnabled:true,
    eventOrganizerName:sample&&sample.organizer?sample.organizer.displayName||'':'',
    eventCreatedBySelectedSender:sample&&sample.creator?String(sample.creator.email||'').toLowerCase()===sender:null,
    minuteSyncTriggers:triggers.filter(function(t){return t.getEventType()===ScriptApp.EventType.CLOCK;}).length,
    sourceEditTriggers:triggers.filter(function(t){return t.getEventType()===ScriptApp.EventType.ON_EDIT;}).length,
    invitationRecords:rows.length,setupSentInvitations:0}));
}
