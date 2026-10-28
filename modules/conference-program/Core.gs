/* Shared by the preview builder and the Google Apps Script adapter. */
var AcadiaProgram = (function () {
  function str(v) { return v == null ? '' : String(v).trim(); }
  function id(v) { var s=str(v); return /^\d+(\.0+)?$/.test(s) ? String(Number(s)) : s.toUpperCase(); }
  function yes(v) { return v === true || /^(true|yes|1)$/i.test(str(v)); }
  function norm(v) { return str(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,''); }
  function slug(v) { return str(v).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function email(v) { var s=str(v); return /^[A-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}$/i.test(s) && s.length<=254 ? s : ''; }
  function track(v) { var s=str(v); return s === 'Projects' ? 'Project' : s === 'Full Paper' ? 'Paper' : s; }
  function clock(s, inherited) {
    var m=str(s).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
    if (!m) return null;
    var h=Number(m[1]),mer=(m[3] || inherited || '').toUpperCase();
    if (mer) h=h%12+(mer==='PM'?12:0);
    return h*60+Number(m[2]);
  }
  function timeRange(s) {
    s=str(s).replace(/\*/g,'').trim(); var parts=s.split(/\s*[-–—]\s*/);
    var end=parts.length>1?clock(parts[1]):null;
    var mer=parts.length>1?(parts[1].match(/(AM|PM)/i)||[])[1]:null;
    var start=clock(parts[0],mer);
    if (start!=null && end!=null && start>=end && !/(AM|PM)/i.test(parts[0])) start-=720;
    return {label:s,start:start,end:end};
  }
  function day(s) { return conferenceDate_(str(s)); }
  function eventTrack(s) {
    if (/^Paper Session/i.test(s)) return 'Paper';
    if (/^Project Session/i.test(s)) return 'Project';
    if (/^Field Notes/i.test(s)) return 'Field Note';
    if (/^Book Forum/i.test(s)) return 'Book Forum';
    if (/keynote/i.test(s)) return 'Keynote';
    return 'Event';
  }
  function build(raw) {
    var issues=[], items={}, events=[], current=null, date=null,venue='',lastPaper=null;
    var originalTitles={}; (raw.Submissions||[]).forEach(function(r){originalTitles[id(r['Paper ID'])]=str(r['Original Title']);});
    var materials={}; (raw.Website_Materials||[]).forEach(function(r){materials[id(r['Paper ID'])]=r;});
    (raw.Submissions||[]).forEach(function(r){
      var pid=id(r['Paper ID']); if (!pid || /\btest\b/i.test(str(r['Original Title'])) || conferenceEdition_().excludedPaperIds.indexOf(pid)>=0) return;
      var m=materials[pid]||{};
      items[pid]={id:pid,title:str(m['Final Title']||r['Final Title']||r['Original Title']),track:track(r.Track),abstract:str(m.Abstract),keywords:str(m.Keywords),authors:[],correspondingAuthor:{name:str(r['Corresponding Author']),email:email(r['Corresponding Email'])},images:[],pdf:null,sessions:[]};
    });
    (raw.Authors||[]).forEach(function(r){var p=items[id(r['Paper ID'])];if(p && str(r['Full Name']))p.authors.push({name:str(r['Full Name']),affiliation:str(r.Affiliation),position:Number(r.Position)||0});});
    Object.keys(items).forEach(function(k){items[k].authors.sort(function(a,b){return a.position-b.position;});});
    (raw.Website_Images||[]).forEach(function(r){var p=items[id(r['Paper ID'])];if(p && yes(r.Active)&&str(r['Drive File ID'])&&conferenceEdition_().excludedImageNames.indexOf(str(r['File Name']).split(/[\\/]/).pop())<0)p.images.push({slot:Number(r['Image Slot'])||1,fileId:str(r['Drive File ID']),caption:str(r.Caption),credit:str(r.Credit),alt:str(r['Alt Text'])});});
    Object.keys(items).forEach(function(k){items[k].images.sort(function(a,b){return a.slot-b.slot;});});
    // Paper previews are resolved only from camera-ready by the server.
    // Copyediting and author proofs must never be published by this app.
    (raw.File_Registry||[]).forEach(function(r){
      var p=items[id(r['Paper ID'])];if(!p||!yes(r.Active)||str(r['MIME Type'])!=='application/pdf')return;
      if(p.track==='Paper'||p.track==='Project'||p.track==='Field Note')return;
      var rank={BOOK_FORUM_PROCEEDING:3,phd_workshop_poster_pdf:4,BOOK_FORUM_POSTER:5}[r.Role];
      if(!rank)return;
      var f={fileId:str(r['Drive File ID']),name:str(r['File Name']),role:r.Role,rank:rank,version:Number(r.Version)||0};
      if(!p.pdf||f.rank<p.pdf.rank||(f.rank===p.pdf.rank&&f.version>p.pdf.version))p.pdf=f;
    });
    // Offline preview only: these are verified unique ORIG PDFs from Copyediting.
    (raw.ApprovedPublicationPDFs||[]).forEach(function(r){var p=items[id(r.id)];if(p&&['Project','Field Note'].indexOf(p.track)>=0&&/ORIG\.pdf$/i.test(r.name))p.pdf={fileId:r.fileId,name:r.name,role:'copyediting_orig',rank:1,version:0};});
    var bookAliases=[];
    (raw.Conference||[]).forEach(function(r){
      var a=str(r[0]),b=str(r[1]),c=str(r[2]),d=str(r[3]);
      if (/^DAY\s+\d/i.test(a)) {date=day(a);venue=a.split('@').slice(1).join('@').trim();current=null;lastPaper=null;return;}
      if (/^END OF DAY/i.test(a)){current=null;lastPaper=null;return;}
      var t=timeRange(a);
      if(date && t.start!=null && c){
        var code=c.match(/^(Paper Session|Project Session|Field Notes|Book Forum)\s*(\d+)/i);
        current={id:code?slug(code[0]):slug(date+' '+t.start+' '+c+' '+b),date:date,start:t.start,end:t.end,time:t.label,title:c,room:b,venue:venue,track:eventTrack(c),chair:'',papers:[],notes:[],declaredCount:d};
        events.push(current);lastPaper=null;return;
      }
      if(!current)return;
      if(/^Session Chair\s*:/i.test(c)){current.chair=c.replace(/^Session Chair\s*:\s*/i,'').trim();return;}
      if(b && c && (/^\d+(\.0+)?$/.test(b)||/^BF[- ]?\d+$/i.test(b))){
        var pid=id(b);
        if(/^BF/i.test(pid)){
          var matches=Object.keys(items).filter(function(k){return items[k].track==='Book Forum'&&(norm(items[k].title)===norm(c)||norm(originalTitles[k])===norm(c));});
          if(matches.length===1){bookAliases.push({scheduleId:b,submissionId:matches[0],title:c});pid=matches[0];}
          else {issues.push({type:'Unmatched Book Forum title',scheduleId:b,title:c});pid='schedule-'+pid;}
        }
        if(!items[pid]){items[pid]={id:pid,title:c,track:current.track,abstract:'',keywords:'',authors:[],images:[],pdf:null,sessions:[]};issues.push({type:'Missing master record',id:pid,title:c});}
        current.papers.push(pid);items[pid].sessions.push(current.id);lastPaper=pid;return;
      }
      if(c && !a && !b){
        if(lastPaper){if(!items[lastPaper].authors.length)items[lastPaper].authors=[{name:c,affiliation:'',position:0}];lastPaper=null;}
        else if(!/^Session Chair/i.test(c))current.notes.push(c);
      }
    });
    var wd=null,rooms={};var workshopRows=raw.Workshops||[];
    function workshopStart(label){return /\bworkshops?\b.*\b(?:begins?|continues?|starts?|resumes?)\s*$/i.test(label);}
    function workshopEnd(label){return /\bworkshops?\b.*\b(?:adjourn(?:s|ed)?|ends?|finishes?|concludes?)\s*$/i.test(label);}
    function onlineVenue(label){return /\bonline\b|\bzoom\b|\bvirtual\b/i.test(label);}
    function onlineOnly(label){return onlineVenue(label)&&(workshopStart(label)||workshopEnd(label));}
    function workshopNames(value){return str(value).split(/\r?\n/).map(str).filter(Boolean);}
    function workshopEndTime(rowIndex,start,col,title){
      var online=onlineVenue(rooms[col]);
      for(var j=rowIndex+1;j<workshopRows.length;j++){
        var row=workshopRows[j],label=str(row[1]);
        if(/^DAY\s+\d|^END OF DAY/i.test(str(row[0])))break;
        var next=timeRange(row[0]);if(next.start==null||next.start<=start)continue;
        if(onlineOnly(label)&&!online)continue;
        if(workshopStart(label)){
          // A new slot at another venue does not end this workshop.
          if(workshopNames(row[col]).length)return next.start;
          continue;
        }
        if(workshopEnd(label)){
          var names=workshopNames(row[col]);
          // Unqualified adjournment is the in-person boundary; online rows
          // may close a named workshop later in the evening.
          if(online&&!onlineOnly(label)&&!names.length)continue;
          if(names.length&&!names.some(function(name){return norm(name)===norm(title);}))continue;
          return next.start;
        }
        // Shared timetable breaks/outcomes retain their existing boundary role.
        if(label)return next.start;
      }
      return null;
    }
    workshopRows.forEach(function(r,n){
      var a=str(r[0]),b=str(r[1]);
      if(/^DAY\s+\d/i.test(a)){wd=day(a);rooms={};for(var k=2;k<8;k++)if(str(r[k]))rooms[k]=str(r[k]);return;}
      if(/^END OF DAY/i.test(a)){wd=null;rooms={};return;}
      var t=timeRange(a);if(!wd||t.start==null)return;
      if(workshopStart(b)){
        Object.keys(rooms).forEach(function(col){
          if(onlineOnly(b)&&!onlineVenue(rooms[col]))return;
          workshopNames(r[col]).forEach(function(title){
          var phd=/^PhD Workshop/i.test(title),pids=phd?Object.keys(items).filter(function(id){return items[id].track==='PhD Workshop';}):[];
          var end=t.end!=null?t.end:workshopEndTime(n,t.start,col,title);
          var e={id:slug(wd+' '+t.start+' '+title),date:wd,start:t.start,end:end,time:t.label,title:title,room:phd?(conferenceEdition_().phdRoom||rooms[col]):rooms[col],venue:rooms[col],track:phd?'PhD Workshop':'Workshop',chair:'',papers:pids,notes:[],declaredCount:''};
          events.push(e);pids.forEach(function(pid){items[pid].sessions.push(e.id);});
        });});
      } else if(onlineOnly(b)){
        Object.keys(rooms).filter(function(col){return onlineVenue(rooms[col]);}).forEach(function(col){
          events.push({id:slug(wd+' '+t.start+' '+b+' '+rooms[col]),date:wd,start:t.start,end:t.end,time:t.label,title:b,room:rooms[col],venue:rooms[col],track:'Event',chair:'',papers:[],notes:workshopNames(r[col]),declaredCount:''});
        });
      } else {
        events.push({id:slug(wd+' '+t.start+' '+b),date:wd,start:t.start,end:t.end,time:t.label,title:b,room:str(r[2]),venue:rooms[2]||"__ACADIA_TEXT_t0172__",track:'Event',chair:'',papers:[],notes:[],declaredCount:''});
      }
    });
    events.sort(function(a,b){return a.date.localeCompare(b.date)||a.start-b.start||a.room.localeCompare(b.room);});
    events.forEach(function(e){var count=Number((e.declaredCount.match(/^\d+/)||[])[0]);if(count && count!==e.papers.length)issues.push({type:'Session count mismatch',session:e.id,declared:count,actual:e.papers.length});});
    var all=Object.keys(items).map(function(k){return items[k];});
    all.forEach(function(p){if(!p.abstract)issues.push({type:'Missing abstract',id:p.id,title:p.title});if(!p.pdf)issues.push({type:'PDF requires resolution',id:p.id,title:p.title});});
    return {schemaVersion:1,timezone:"__ACADIA_TEXT_t0023__",sourceLabel:raw.snapshotLabel||'Live Google Sheets',events:events,items:all,issues:issues,bookAliases:bookAliases};
  }
  return {build:build,id:id,norm:norm,timeRange:timeRange,yes:yes};
})();
if (typeof module !== 'undefined') module.exports=AcadiaProgram;
