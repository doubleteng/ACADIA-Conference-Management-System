/* Dependency-free configuration compiler; runs in Node and an offline browser. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(input){
 const c=clone(input); c.year=Number(c.year);c.nextYear=c.year+1;
 c.resources=c.resources||{};c.texts=c.texts||{};
 for(const key of Object.keys(c.resources)){
  let v=String(c.resources[key]||'').trim();
  if(v.startsWith('https://')){const u=new URL(v);v=(u.pathname.match(/\/d\/([^/]+)/)||u.pathname.match(/\/folders\/([^/]+)/)||[])[1]||u.searchParams.get('id')||v;}
  c.resources[key]=v;
 }
 c.websiteOrigin=c.websiteUrl?new URL(c.websiteUrl).origin:'';
 c.themeSlug=String(c.theme||'').replace(/[^A-Za-z0-9]+/g,'');
 return c;
}
function validate(input,modules=[]){
 const errors=[];let c;
 try{c=normalize(input);}catch(e){return ['Website URL must be a complete https:// URL.'];}
 if(!Number.isInteger(c.year)||c.year<2027||c.year>2200)errors.push('Choose a conference year between 2027 and 2200.');
 try{new Intl.DateTimeFormat('en',{timeZone:c.timezone}).format();}catch(e){errors.push('Use an IANA time zone, for example America/New_York.');}
 const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!validDate(c.conferenceStart)||Number(c.conferenceStart.slice(0,4))!==c.year)errors.push('Conference start must be a real ISO date in the selected year.');
 for(const key of ['websiteUrl','registrationUrl','authorPortalUrl','programUrl','recognitionUrl','indexingUrl','calendarUrl'])if(c[key]){
  try{const u=new URL(c[key]);if(u.protocol!=='https:'||u.username||u.password)throw Error();}catch(e){errors.push(key+': use a public HTTPS URL without embedded credentials.');}
 }
 for(const key of ['authorPortalUrl','programUrl','recognitionUrl'])if(c[key]&&!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?|$)/.test(c[key]))errors.push(key+': use the deployed /exec URL, not the editor or /dev URL.');
 for(const key of ['cameraReadyDeadlineUtc','phdDeadlineUtc','registrationDeadlineUtc','presentationDeadlineUtc'])if(c[key]&&(!/Z$/.test(c[key])||!Number.isFinite(Date.parse(c[key]))))errors.push(key+': provide a UTC ISO timestamp ending in Z, or leave it blank.');
 const req={
  'author-portal':['rootId','submissionRootId','papersFolderId','projectsFolderId','fieldNotesFolderId','authorMasterId','acceptedId'],
  'conference-program':['authorMasterId','scheduleId'],
  'recognition-portal':['recognitionId','certificateOutputId'],
  'presentation-reminders':['authorMasterId','presentationId','scheduleId'],
  'calendar-sync':['scheduleId']
 };
 for(const m of modules)for(const k of req[m]||[])if(!c.resources[k])errors.push(m+': missing '+k+' (create/import the template kit or enter its URL).');
 if(modules.includes('presentation-reminders')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.senderEmail||''))errors.push('Reminders require the actual sending Google account email.');
 for(const [k,v] of Object.entries(c.resources))if(v&&!/^[A-Za-z0-9_-]{10,200}$/.test(v))errors.push(k+': enter a Google file/folder ID or URL.');
 if(!Array.isArray(c.presentationDays))errors.push('Presentation day rules must be an array.');
 else {const seen=new Set();for(const r of c.presentationDays){if(!r||!validDate(r.date)||Number(r.date.slice(0,4))!==c.year||seen.has(r.date))errors.push('Each presentation rule needs a unique real ISO date in this edition.');if(!r)continue;seen.add(r.date);if(r.deadlineUtc&&(!/Z$/.test(r.deadlineUtc)||!Number.isFinite(Date.parse(r.deadlineUtc))))errors.push('Invalid UTC presentation deadline for '+r.date);if(!Array.isArray(r.restrictions||[]))errors.push('Presentation restrictions must be a list.');}}
 for(const k of ['guideSources','excludedPaperIds','fullPaperFallbackIds','volunteerSlots','excludedImageNames','attendanceFaq'])if(!Array.isArray(c[k]))errors.push(k+' must be a list.');
 for(const k of ['webPdfPreviews','imageFallbacks','adminInputs'])if(!c[k]||typeof c[k]!=='object'||Array.isArray(c[k]))errors.push(k+' must be an object.');
 if(Array.isArray(c.attendanceFaq)&&c.attendanceFaq.some(r=>!r||typeof r.question!=='string'||typeof r.answer!=='string'))errors.push('FAQ entries require a question and an answer.');
 if(!Number.isInteger(c.minimumPresentationSessions)||c.minimumPresentationSessions<1)errors.push('Minimum presentation sessions must be a positive integer.');
 if(typeof c.maximumMissingAssignmentFraction!=='number'||c.maximumMissingAssignmentFraction<0||c.maximumMissingAssignmentFraction>=1)errors.push('Missing-assignment tolerance must be between 0 and less than 1.');
 return errors;
}
function renderText(template,c){return String(template).replace(/\{\{([A-Za-z0-9_]+)\}\}/g,(_,k)=>String(c[k]??c.resources[k]??''));}
function safeJSON(value){return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
function compileSource(source,input,catalog){
 const c=normalize(input);let s=source.replace(/"__ACADIA_(RESOURCE|VALUE|TEXT)_([A-Za-z0-9_]+)__"/g,(_,type,key)=>{
  let value;
  if(type==='RESOURCE')value=c.resources[key]||'';
  else if(type==='TEXT'){if(!catalog.texts[key])throw Error('Unknown text '+key);value=renderText(Object.hasOwn(c.texts,key)?c.texts[key]:catalog.texts[key].template,c);}
  else if(key==='attendanceFaq')value=c.attendanceFaq.map(r=>({question:renderText(r.question,c),answer:renderText(r.answer,c)}));
  else value=key==='edition'?c:c[key];
  if(value===undefined)throw Error('Missing configuration '+key);
  return safeJSON(value);
 });
 s=s.replace(/%%ACADIA_HTML_([A-Za-z0-9_]+)%%/g,(_,key)=>html(renderText(Object.hasOwn(c.texts,key)?c.texts[key]:catalog.texts[key].template,c)));
 if(/__ACADIA_(?:RESOURCE|VALUE|TEXT)_|%%ACADIA_HTML_/.test(s))throw Error('Unresolved configuration token.');
 return s;
}
function compile(sources,input,catalog,selected){
 const files={};for(const m of selected||Object.keys(sources))for(const [name,source]of Object.entries(sources[m]))files[m+'/'+name]=compileSource(source,input,catalog);
 return files;
}
function embed(input,key,title){
 const c=normalize(input),url=c[key];if(!url)return '<!-- Deploy '+title+' and enter its /exec URL first. -->';
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?|$)/.test(url))throw Error('Use an Apps Script /exec URL.');
 return '<section aria-label="'+html(title)+'">\n  <p><a href="'+html(url)+'" target="_blank" rel="noopener">Open '+html(title)+' in a new tab</a></p>\n  <iframe src="'+html(url)+'" title="'+html(title)+'"\n    style="display:block;width:100%;height:85vh;min-height:760px;border:0"\n    loading="lazy" allow="fullscreen"></iframe>\n  <p style="font:12px/1.6 system-ui,sans-serif">ACMS · Developed by <a href="https://github.com/doubleteng" target="_blank" rel="noopener noreferrer">Teng Teng</a></p>\n</section>';
}
// ZIP store mode: portable downloads with no third-party JavaScript or network requests.
function zip(files){
 const encoder=new TextEncoder(),local=[],central=[];let offset=0;
 const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 const crc=bytes=>{let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0;};
 const u16=(v,o,x)=>v.setUint16(o,x,true),u32=(v,o,x)=>v.setUint32(o,x,true);
 for(const [name,text]of Object.entries(files)){
  const n=encoder.encode(name),b=encoder.encode(text),sum=crc(b),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
  u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,0x800);u32(v,14,sum);u32(v,18,b.length);u32(v,22,b.length);u16(v,26,n.length);h.set(n,30);local.push(h,b);
  const ch=new Uint8Array(46+n.length),cv=new DataView(ch.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x800);u32(cv,16,sum);u32(cv,20,b.length);u32(cv,24,b.length);u16(cv,28,n.length);u32(cv,42,offset);ch.set(n,46);central.push(ch);offset+=h.length+b.length;
 }
 const centralSize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,8,central.length);u16(ev,10,central.length);u32(ev,12,centralSize);u32(ev,16,offset);
 const result=new Uint8Array(offset+centralSize+22);let p=0;for(const b of [...local,...central,end]){result.set(b,p);p+=b.length;}return result;
}
const api={normalize,validate,renderText,compileSource,compile,embed,zip,html,safeJSON};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ACMS=api;
})(typeof globalThis!=='undefined'?globalThis:this);
