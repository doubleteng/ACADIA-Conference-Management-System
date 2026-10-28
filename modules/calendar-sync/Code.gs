/* Edition-configured copy. Run previewConferenceCalendar before setupConferenceCalendar. */

const ACADIA = Object.freeze({
  spreadsheetId: "__ACADIA_RESOURCE_scheduleId__",
  sourceUrl: "__ACADIA_TEXT_t0185__",
  calendarName: "__ACADIA_TEXT_t0028__", revision: '1.1',
  timezone: "__ACADIA_TEXT_t0023__", year: Number("__ACADIA_VALUE_year__"),
  prefix: "__ACADIA_TEXT_t0016__", tag: "__ACADIA_TEXT_t0186__",
  calendarMarker: "__ACADIA_TEXT_t0187__",
  maxRunMs: 210000, deletionDelayMs: 300000,
  handlers: ['acadiaSheetEdited', 'acadiaSheetChanged', 'syncACADIA2026']
});

function setupACADIA2026() {
  // Validate access and the entire source BEFORE creating a calendar.
  const source = acadiaReadSource_();
  const desired = acadiaBuild_(source.conference, source.workshops);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const p = PropertiesService.getScriptProperties();
    let id = p.getProperty(ACADIA.prefix + 'calendarId');
    let cal = id ? CalendarApp.getCalendarById(id) : null;
    if (id && !cal) throw new Error('Saved calendar is inaccessible. No replacement was created.');
    if (!cal) {
      const owned = CalendarApp.getAllOwnedCalendars();
      const matches = owned.filter(c => c.getName() === ACADIA.calendarName &&
        c.getDescription().indexOf(ACADIA.calendarMarker) >= 0);
      if (matches.length > 1) throw new Error('Multiple managed ACADIA calendars found. Resolve before setup.');
      if (matches.length === 1) cal = matches[0];
      else {
        if (owned.some(c => c.getName() === ACADIA.calendarName))
          throw new Error("__ACADIA_TEXT_t0188__");
        cal = CalendarApp.createCalendar(ACADIA.calendarName, {
          timeZone: ACADIA.timezone,
          description: "__ACADIA_TEXT_t0189__" +
            "__ACADIA_TEXT_t0190__"
        });
      }
      p.setProperty(ACADIA.prefix + 'calendarId', cal.getId());
    }
    if (!cal.isOwnedByMe() || cal.isMyPrimaryCalendar())
      throw new Error('Setup requires the dedicated owned calendar, never the primary calendar.');
    cal.setTimeZone(ACADIA.timezone);
    cal.setDescription("__ACADIA_TEXT_t0191__");
    ScriptApp.getProjectTriggers().forEach(t => {
      if (ACADIA.handlers.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
    });
    ScriptApp.newTrigger('acadiaSheetEdited').forSpreadsheet(ACADIA.spreadsheetId).onEdit().create();
    ScriptApp.newTrigger('acadiaSheetChanged').forSpreadsheet(ACADIA.spreadsheetId).onChange().create();
    ScriptApp.newTrigger('syncACADIA2026').timeBased().everyMinutes(5).create();
    p.setProperty(ACADIA.prefix + 'enabled', 'true');
    p.deleteProperty(ACADIA.prefix + 'sourceHash');
    console.log('Calendar ready: ' + cal.getName() + '\nCalendar ID: ' + cal.getId() +
      '\nSource events: ' + desired.length + '\nThree synchronization triggers installed.');
  } finally { lock.releaseLock(); }
  syncACADIA2026();
  showACADIA2026Status();
}

function acadiaSheetEdited(e) {
  if (!e || !e.range || ['Conference', 'Workshops'].indexOf(e.range.getSheet().getName()) >= 0)
    syncACADIA2026();
}
function acadiaSheetChanged(e) { syncACADIA2026(); }

function syncACADIA2026() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return; // The periodic trigger retries a concurrent edit.
  const started = Date.now();
  const p = PropertiesService.getScriptProperties();
  try {
    if (p.getProperty(ACADIA.prefix + 'enabled') !== 'true') return;
    const id = p.getProperty(ACADIA.prefix + 'calendarId');
    if (!id) throw new Error("__ACADIA_TEXT_t0192__");
    const cal = CalendarApp.getCalendarById(id);
    if (!cal || !cal.isOwnedByMe() || cal.isMyPrimaryCalendar())
      throw new Error('The dedicated managed calendar is unavailable.');
    const source = acadiaReadSource_();
    const hash = acadiaHash_(ACADIA.revision + '\n' + JSON.stringify(source));
    if (hash === p.getProperty(ACADIA.prefix + 'sourceHash') &&
        !p.getProperty(ACADIA.prefix + 'pendingRemovalHash')) return;
    const desired = acadiaBuild_(source.conference, source.workshops);
    // An interrupted first run recovers events by their key, rather than creating copies.
    const current = cal.getEvents(
      acadiaDate_(ACADIA.year+'-01-01', 0), acadiaDate_((ACADIA.year+1)+'-01-01', 0));
    const byKey = {};
    current.forEach(e => {
      const key = e.getTag(ACADIA.tag);
      if (key) {
        if (byKey[key]) throw new Error('Duplicate managed key in Calendar: ' + key);
        byKey[key] = e;
      }
    });
    const liveKeys = {}, legacyKeys = {};
    desired.forEach(d => (d.legacyKeys || []).forEach(k => { legacyKeys[k] = true; }));
    let created = 0, updated = 0, removed = 0;
    for (let i = 0; i < desired.length; i++) {
      if (Date.now() - started > ACADIA.maxRunMs) {
        console.log('Partial sync saved; remaining events continue on the next five-minute run.');
        p.deleteProperty(ACADIA.prefix + 'sourceHash');
        return;
      }
      const d = desired[i]; liveKeys[d.key] = true;
      const prop = ACADIA.prefix + 'event_' + acadiaHash_(d.key);
      let ev = byKey[d.key];
      if (!ev && d.legacyKeys) {
        const oldKey = d.legacyKeys.find(k => byKey[k]);
        if (oldKey) {
          ev = byKey[oldKey];
          ev.setTag(ACADIA.tag, d.key);
          delete byKey[oldKey]; byKey[d.key] = ev;
          p.setProperty(prop, ev.getId());
          p.deleteProperty(ACADIA.prefix + 'event_' + acadiaHash_(oldKey));
        }
      }
      if (!ev) {
        const savedId = p.getProperty(prop);
        if (savedId) {
          ev = cal.getEventById(savedId);
          if (ev && ev.getTag(ACADIA.tag) && ev.getTag(ACADIA.tag) !== d.key) ev = null;
        }
      }
      const start = acadiaDate_(d.date, d.start);
      const end = acadiaDate_(d.date, d.end);
      if (!ev) {
        // Recovery if Calendar creation succeeded before the property write.
        const candidates = current.filter(x => !x.getTag(ACADIA.tag) &&
          x.getTitle() === d.title && +x.getStartTime() === +start &&
          x.getDescription() === d.description && x.getLocation() === d.location);
        if (candidates.length > 1) throw new Error('Ambiguous recovery for ' + d.key);
        if (candidates.length === 1) ev = candidates[0];
      }
      if (!ev) {
        ev = cal.createEvent(d.title, start, end, {
          description: d.description, location: d.location, sendInvites: false
        });
        // Save the ID first: if tagging fails, retry can recover this exact event.
        p.setProperty(prop, ev.getId());
        ev.setTag(ACADIA.tag, d.key);
        ev.removeAllReminders();
        created++;
      } else {
        if (!ev.getTag(ACADIA.tag)) {
          ev.setTag(ACADIA.tag, d.key);
          ev.removeAllReminders();
          p.setProperty(prop, ev.getId());
        }
        let changed = false;
        if (ev.getTitle() !== d.title) { ev.setTitle(d.title); changed = true; }
        if (+ev.getStartTime() !== +start || +ev.getEndTime() !== +end) {
          ev.setTime(start, end); changed = true;
        }
        if (ev.getLocation() !== d.location) { ev.setLocation(d.location); changed = true; }
        if (ev.getDescription() !== d.description) { ev.setDescription(d.description); changed = true; }
        if (changed) updated++;
      }
    }
    // Retire superseded individual workshops only after all session writes succeed.
    Object.keys(byKey).filter(k => !liveKeys[k] && legacyKeys[k]).forEach(key => {
      byKey[key].deleteEvent(); delete byKey[key];
      p.deleteProperty(ACADIA.prefix + 'event_' + acadiaHash_(key));
      removed++;
    });
    const obsolete = Object.keys(byKey).filter(k => !liveKeys[k]);
    if (obsolete.length) {
      const previous = p.getProperty(ACADIA.prefix + 'pendingRemovalHash');
      const since = Number(p.getProperty(ACADIA.prefix + 'pendingRemovalSince') || 0);
      if (previous !== hash) {
        p.setProperty(ACADIA.prefix + 'pendingRemovalHash', hash);
        p.setProperty(ACADIA.prefix + 'pendingRemovalSince', String(Date.now()));
      } else if (Date.now() - since >= ACADIA.deletionDelayMs) {
        obsolete.forEach(key => {
          byKey[key].deleteEvent();
          p.deleteProperty(ACADIA.prefix + 'event_' + acadiaHash_(key));
          removed++;
        });
        p.deleteProperty(ACADIA.prefix + 'pendingRemovalHash');
        p.deleteProperty(ACADIA.prefix + 'pendingRemovalSince');
      }
    } else {
      p.deleteProperty(ACADIA.prefix + 'pendingRemovalHash');
      p.deleteProperty(ACADIA.prefix + 'pendingRemovalSince');
    }
    const status = {at: new Date().toISOString(), events: desired.length,
      created: created, updated: updated, removed: removed,
      pendingRemovals: p.getProperty(ACADIA.prefix + 'pendingRemovalHash') ? obsolete.length : 0};
    p.setProperty(ACADIA.prefix + 'sourceHash', hash);
    p.setProperty(ACADIA.prefix + 'lastSuccess', JSON.stringify(status));
    p.deleteProperty(ACADIA.prefix + 'lastError');
    console.log(JSON.stringify(status));
  } catch (error) {
    p.setProperty(ACADIA.prefix + 'lastError', new Date().toISOString() + ': ' + error.message);
    throw error; // Google reports failed installed-trigger runs to the owner.
  } finally { lock.releaseLock(); }
}

function stopACADIA2026Sync() {
  const p = PropertiesService.getScriptProperties();
  p.setProperty(ACADIA.prefix + 'enabled', 'false');
  ScriptApp.getProjectTriggers().forEach(t => {
    if (ACADIA.handlers.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });
  console.log('Synchronization stopped. Calendar events and sharing are unchanged.');
}

function showACADIA2026Status() {
  const p = PropertiesService.getScriptProperties();
  console.log(JSON.stringify({calendarId: p.getProperty(ACADIA.prefix + 'calendarId'),
    enabled: p.getProperty(ACADIA.prefix + 'enabled'),
    lastSuccess: p.getProperty(ACADIA.prefix + 'lastSuccess'),
    lastError: p.getProperty(ACADIA.prefix + 'lastError'),
    triggers: ScriptApp.getProjectTriggers().filter(t =>
      ACADIA.handlers.indexOf(t.getHandlerFunction()) >= 0).map(t => t.getHandlerFunction())}, null, 2));
}

function previewACADIA2026() {
  const s = acadiaReadSource_();
  const events = acadiaBuild_(s.conference, s.workshops);
  console.log('Preview only: ' + events.length + ' events. No calendar changes.');
  events.forEach(e => console.log(e.date + ' ' + acadiaClock_(e.start) + '–' +
    acadiaClock_(e.end) + ' | ' + e.title + ' | ' + e.location));
}

function acadiaReadSource_() {
  const ss = SpreadsheetApp.openById(ACADIA.spreadsheetId);
  const result = {};
  ['Conference', 'Workshops'].forEach(name => {
    const s = ss.getSheetByName(name);
    if (!s) throw new Error('Required source tab missing: ' + name);
    const last = s.getLastRow();
    if (last < 2 || last > 10000) throw new Error('Unexpected source size: ' + name);
    result[name.toLowerCase()] = s.getRange(1, 1, last, name === 'Conference' ? 5 : 8)
      .getDisplayValues();
  });
  return result;
}

function acadiaBuild_(conference, workshops) {
  const events = acadiaConference_(conference).concat(acadiaWorkshops_(workshops));
  const keys = {};
  events.forEach(e => {
    if (keys[e.key]) throw new Error('Duplicate source key: ' + e.key);
    if (!(e.end > e.start) || !e.title || !e.date) throw new Error('Incomplete event: ' + e.key);
    keys[e.key] = true;
  });
  if (!events.length) throw new Error('No events parsed. Calendar unchanged.');
  return events;
}

function acadiaConference_(rows) {
  let date = '', day = '', venue = '', current = null;
  const events = [], days = {}, counts = {};
  rows.forEach((r, index) => {
    const a = acadiaText_(r[0]), b = acadiaText_(r[1]), c = acadiaText_(r[2]);
    if (/^DAY\s+\d+/i.test(a)) {
      const header = acadiaHeader_(a);
      date = header.date; day = header.day; days[day] = true;
      venue = a.indexOf('@') >= 0 ? a.split('@').slice(1).join('@').trim().replace(/\s*\n\s*/g, ', ') : '';
      if (!venue) throw new Error('Missing conference venue at row ' + (index + 1));
      current = null; return;
    }
    if (/^END OF DAY/i.test(a)) { current = null; date = ''; return; }
    if (!date) return;
    if (a) {
      const time = acadiaTime_(a);
      if (!time || !c) throw new Error('Cannot parse conference row ' + (index + 1) + ': ' + a);
      const session = c.match(/^(Paper Session|Project Session|Field Notes|Book Forum)\s+(\d+)/i);
      const root = session ? 'conference|' + session[1].toLowerCase() + '|' + session[2] :
        'conference|day' + day + '|' + acadiaNorm_(c);
      counts[root] = (counts[root] || 0) + 1;
      const key = root + (session ? '' : '|' + counts[root]);
      current = {key:key, date:date, start:time.start, end:time.end == null ? time.start + 1 : time.end,
        title:c, location:b + ', ' + venue,
        detail:[acadiaText_(r[3]), time.parallel ? 'Concurrent session.' : ''].filter(Boolean),
        row:index + 1, items:0, expected:Number((acadiaText_(r[3]).match(/^\d+/) || [0])[0])};
      events.push(current); return;
    }
    if (!current) return;
    if (b && c) { current.detail.push('[' + b + '] ' + c); current.items++; }
    else if (c) current.detail.push(/^Session Chair:\s*$/i.test(c) ? 'Session Chair: TBC' : c);
    else if (b) throw new Error('Contribution title missing at Conference row ' + (index + 1));
  });
  if (Object.keys(days).length < 1) throw new Error('Expected at least one complete conference day heading.');
  events.forEach(e => {
    if (e.expected && e.expected !== e.items) e.detail.push('Contribution count: heading says ' +
      e.expected + '; ' + e.items + ' contributions are listed. All listed contributions are included.');
    e.description = (e.detail.length ? e.detail.join('\n\n') : e.title) +
      "__ACADIA_TEXT_t0193__";
    delete e.detail; delete e.expected; delete e.items; delete e.row;
  });
  return events;
}

function acadiaWorkshopItems_(rows) {
  const days = []; let current = null;
  rows.forEach((r, i) => {
    const a = acadiaText_(r[0]);
    if (/^END OF DAY/i.test(a)) {current=null;return;}
    if (/^DAY\s+\d+/i.test(a)) {
      const h = acadiaHeader_(a);
      current = {date:h.date, day:h.day, venues:r.slice(2, 8).map(acadiaText_), rows:[]};
      days.push(current);
    } else if (current && a) {
      const time = acadiaTime_(a);
      if (!time) throw new Error('Cannot parse Workshops row ' + (i + 1));
      current.rows.push({cells:r, row:i + 1, start:time.start, explicitEnd:time.end});
    }
  });
  if (days.length < 1) throw new Error('Expected at least one complete workshop day heading.');
  const events = [];
  days.forEach(day => {
    const commonCounts = {};
    day.rows.forEach(r => {
      const action = acadiaText_(r.cells[1]);
      if (!action) throw new Error('Missing workshop action at row ' + r.row);
      const next = day.rows.filter(x => x.start > r.start).sort((a,b) => a.start-b.start)[0];
      const nextEnd = r.explicitEnd != null ? r.explicitEnd : next ? next.start : null;
      if (/^Workshops? (Begin|Continue|Resume)$/i.test(action)) {
        let number = 0;
        r.cells.slice(2,8).forEach((cell, index) => {
          const names = acadiaText_(cell).split('\n').map(acadiaText_).filter(Boolean);
          names.forEach(name => {
            number++;
            const venue = day.venues[index];
            if (!venue) throw new Error('Workshop venue missing at row ' + r.row);
            const block = r.start < 720 ? 'Morning' : 'Afternoon';
            // Online milestones may precede later in-person milestones.
            // Local afternoon workshops use the next IN-PERSON outcome/reception milestone.
            let end = nextEnd;
            if (r.explicitEnd == null && block === 'Afternoon' && !/online/i.test(venue)) {
              const localNext = day.rows.filter(x => x.start > r.start &&
                !/^Online Workshop Outcomes/i.test(acadiaText_(x.cells[1]))).sort((a,b) => a.start-b.start)[0];
              end = localNext ? localNext.start : null;
            }
            const cleaned = name.replace(/:\s*$/, '').trim();
            const roomMatch = cleaned.match(/\((T\d+|A\d+)\)/);
            const location = (roomMatch ? roomMatch[1] + ', ' : '') + acadiaWorkshopVenue_(venue);
            const notes = [
              /online/i.test(venue) ? 'Online (Zoom).' : '',
              'Registered participants receive further workshop details by email.'];
            events.push({key:'workshop|day' + day.day + '|' + acadiaNorm_(venue) + '|' +
              acadiaNorm_(cleaned) + '|' + block.toLowerCase() + '|' + r.start, date:day.date, start:r.start,
              end:end == null ? r.start+1 : end, title:cleaned + ' — ' + block, location:location,
              description:notes.filter(Boolean).join('\n\n') +
                "__ACADIA_TEXT_t0193__"});
          });
        });
        if (!number) throw new Error('Empty workshop block at row ' + r.row);
      } else {
        const rawLocation = acadiaText_(r.cells[2]);
        const root = 'workshop-admin|day' + day.day + '|' + acadiaNorm_(action);
        commonCounts[root] = (commonCounts[root] || 0) + 1;
        const milestone = /adjourned/i.test(action);
        const end = milestone ? r.start+1 : nextEnd == null ? r.start+1 : nextEnd;
        const event = {key:root + '|' + commonCounts[root], date:day.date, start:r.start, end:end,
          title:action,
          location:rawLocation ? rawLocation + "__ACADIA_TEXT_t0194__" : 'All workshop venues',
          description:action + '\nLocation: ' + (rawLocation || 'All workshop venues') +
            "__ACADIA_TEXT_t0193__"};
        const existing = events.find(e => e.date === day.date && e.start === r.start &&
          e.location === event.location && /reception/i.test(e.title) && /reception/i.test(action));
        if (existing) {
          existing.title = 'Workshop Outcomes + Welcome Reception';
          existing.description = existing.title + '\nLocation: ' + rawLocation +
            "__ACADIA_TEXT_t0193__";
        } else events.push(event);
      }
    });
  });
  return events;
}

function acadiaWorkshops_(rows) {
  const items = acadiaWorkshopItems_(rows), sessions = [], byBlock = {};
  items.forEach(item => {
    if (item.key.indexOf('workshop|') !== 0) { sessions.push(item); return; }
    const label = item.start < 720 ? 'Morning' : 'Afternoon';
    const venue = item.location.replace(/^(?:T\d+|A\d+),\s*/, '');
    const shortVenue = venue.replace("__ACADIA_TEXT_t0195__",'');
    const block = item.date + '|' + item.start + '|' + venue;
    let group = byBlock[block];
    if (!group) {
      const day = item.key.split('|')[1];
      group = {key:'workshop-session|' + day + '|' + label.toLowerCase() + '|' + acadiaNorm_(shortVenue) + '|' + item.start,
        date:item.date, start:item.start, end:item.end,
        title:'Workshops: ' + shortVenue + ' — ' + label, location:venue, description:'', legacyKeys:[], items:[]};
      byBlock[block] = group; sessions.push(group);
    }
    group.end = Math.max(group.end, item.end);
    group.legacyKeys.push(item.key); group.items.push(item);
  });
  sessions.filter(g => g.items).forEach(group => {
    const venues = [], namesByVenue = {};
    group.items.forEach(item => {
      const venue = item.location.replace(/^(?:T\d+|A\d+),\s*/, '');
      if (!namesByVenue[venue]) { venues.push(venue); namesByVenue[venue] = []; }
      const name = item.title.replace(/ — (Morning|Afternoon)$/, '');
      namesByVenue[venue].push('• ' + name + ' (' + acadiaClock_(item.start) + '–' + acadiaClock_(item.end) + ')');
    });
    group.description = venues.map(v => v + '\n' + namesByVenue[v].join('\n')).join('\n\n') +
      '\n\nRegistered participants receive further workshop details by email.' +
      "__ACADIA_TEXT_t0193__";
    delete group.items;
  });
  return sessions;
}

function acadiaHeader_(text) {const m=text.match(/^DAY\s+(\d+)/i),date=conferenceDate_(text);if(!m||!date)throw new Error('Use DAY n | YYYY-MM-DD @ Venue: '+text);return {day:m[1],date:date};}

function acadiaTime_(text) {
  const raw = acadiaText_(text), clean = raw.replace(/\*/g,'').replace(/[–—]/g,'-').trim();
  const m = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?(?:\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM))?$/i);
  if (!m) return null;
  const candidates = (h,min,ap) => {
    h=Number(h); min=Number(min);
    if (h < 1 || h > 12 || min > 59) throw new Error('Invalid clock time: ' + raw);
    return ap ? [(h%12)*60+min+(ap.toUpperCase()==='PM'?720:0)] :
      [(h%12)*60+min, (h%12)*60+min+720];
  };
  if (!m[4]) {
    if (!m[3]) throw new Error('AM/PM missing: ' + raw);
    return {start:candidates(m[1],m[2],m[3])[0],end:null,parallel:raw.indexOf('**')>=0};
  }
  const end=candidates(m[4],m[5],m[6])[0];
  const starts=candidates(m[1],m[2],m[3]).filter(s => end>s && end-s<=720);
  if (!starts.length) throw new Error('Invalid or overnight range: ' + raw);
  return {start:Math.max.apply(null,starts),end:end,parallel:raw.indexOf('**')>=0};
}

function acadiaWorkshopVenue_(value) { return value; }
function acadiaText_(value) { return value == null ? '' : String(value).trim(); }
function acadiaNorm_(value) { return acadiaText_(value).toLowerCase().replace(/\s+/g,' ').replace(/:\s*$/,''); }
function acadiaClock_(minutes) { return String(Math.floor(minutes/60)).padStart(2,'0') + ':' + String(minutes%60).padStart(2,'0'); }
function acadiaDate_(date, minutes) {
  return Utilities.parseDate(date + ' ' + acadiaClock_(minutes), ACADIA.timezone, 'yyyy-MM-dd HH:mm');
}
function acadiaHash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8)
    .map(b => ('0'+((b+256)%256).toString(16)).slice(-2)).join('');
}
function previewConferenceCalendar(){return previewACADIA2026();}
function setupConferenceCalendar(){return setupACADIA2026();}
function stopConferenceCalendar(){return stopACADIA2026Sync();}
function showConferenceCalendarStatus(){return showACADIA2026Status();}
