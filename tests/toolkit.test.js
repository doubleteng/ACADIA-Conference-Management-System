const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),E=require('../tools/engine.js');
const defaults=JSON.parse(read('configuration.example.json')),catalog=JSON.parse(read('configuration-catalog.json')),schemas=JSON.parse(read('templates/schemas.json'));
const sources={};for(const m of fs.readdirSync(path.join(root,'modules'))){sources[m]={};for(const n of fs.readdirSync(path.join(root,'modules',m)))sources[m][n]=read('modules/'+m+'/'+n);}
const fixture={...defaults,year:2028,conferenceStart:'2028-05-11',timezone:'Europe/Berlin',theme:'A "quoted" theme <script> & O\'Brien',websiteUrl:'https://2028.acadia.org/',senderEmail:'organizer@example.org',contactEmail:'committee@example.org',city:'Berlin',location:'Berlin, Germany',mainVenue:'Example Hall',hostInstitution:'Example University',resources:{...defaults.resources}};
for(const k of Object.keys(fixture.resources))fixture.resources[k]='EXAMPLE_'+k+'_123456789';
const compiled=E.compile(sources,fixture,catalog);
function context(module){const c=vm.createContext({console,URL,Intl});let source='';for(const [key,text]of Object.entries(compiled))if(key.startsWith(module+'/')&&key.endsWith('.gs'))source+=text+'\n';vm.runInContext(source,c);return c;}
function call(c,expression){return vm.runInContext(expression,c);}
function materialize(book){return Object.fromEntries(book.tabs.map(t=>[E.renderText(t.name,E.normalize(fixture)),[t.headers,...t.examples].map(row=>row.map(v=>typeof v==='string'?E.renderText(v,E.normalize(fixture)):v))]));}
test('all generated server files and embedded client scripts parse, including quote/HTML escaping',()=>{
 for(const [file,text]of Object.entries(compiled)){
  if(file.endsWith('.gs'))new vm.Script(text,{filename:file});
  if(file.endsWith('.json'))JSON.parse(text);
  if(file.endsWith('.html'))for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/application\/json/.test(match[1]))JSON.parse(match[2]);else new vm.Script(match[2].replace(/<\?[!=]?[\s\S]*?\?>/g,'0'),{filename:file});
  }
  assert(!/__ACADIA_(RESOURCE|VALUE|TEXT)_|%%ACADIA_HTML_/.test(text),file);
 }
 for(const module of Object.keys(sources))context(module);
});
test('new editions accept arbitrary month and configured year, rejecting impossible dates',()=>{
 const c=context('calendar-sync');assert.equal(call(c,"conferenceDate_('DAY 1 | 2028-05-11 @ Main Hall')"),'2028-05-11');
 assert.equal(call(c,"conferenceDate_('DAY 1 MAY 11 @ Main Hall')"),'2028-05-11');
 assert.equal(call(c,"conferenceDate_('DAY 1 | 2028-02-29 @ Hall')"),'2028-02-29');
 assert.equal(call(c,"conferenceDate_('DAY 1 | 2027-02-29 @ Hall')"),null);
 assert.equal(call(c,"conferenceDate_('DAY 1 | 2028-02-30 @ Hall')"),null);
});
test('the same schedule template feeds Program, presentation synchronization and calendar parsers',()=>{
 const schedule=materialize(schemas.books.find(b=>b.key==='scheduleId'));
 const program=context('conference-program');program.raw={Conference:schedule.Conference,Workshops:schedule.Workshops,Submissions:[{'Paper ID':'1001','Original Title':'Example contribution 1','Track':'Full Paper'}],Authors:[]};
 const p=call(program,'AcadiaProgram.build(raw)');assert.equal(p.timezone,fixture.timezone);assert(p.events.length>=4);assert(p.events.every(e=>e.date==='2028-05-11'));
 const pres=context('author-portal');pres.rows=schedule.Conference;
 const parsed=call(pres,'presentationScheduleParse_(rows,{sessions:[],assignments:[]})');assert.equal(parsed.sessions.length,4);assert.equal(parsed.assignments.length,4);assert.equal(parsed.sessions[0]['Time Zone'],fixture.timezone);
 const calendar=context('calendar-sync');calendar.rows=schedule;
 const events=call(calendar,'acadiaBuild_(rows.Conference,rows.Workshops)');assert(events.length>=4);assert(events.every(e=>e.date==='2028-05-11'));assert.equal(new Set(events.map(e=>e.key)).size,events.length);
});
test('roster and master templates match the actual reader contracts',()=>{
 const author=context('author-portal'),heads=JSON.parse(call(author,'JSON.stringify(SHEET_HEADERS)'));
 const master=schemas.books.find(b=>b.key==='authorMasterId');for(const [name,h]of Object.entries(heads))assert.deepEqual(master.tabs.find(t=>t.name===name).headers,h);
 const pres=JSON.parse(call(author,'JSON.stringify(PRES_.HEADERS)')),book=schemas.books.find(b=>b.key==='presentationId');for(const [name,h]of Object.entries(pres))assert.deepEqual(book.tabs.find(t=>t.name===name).headers,h);
 const rec=context('recognition-portal'),tables=materialize(schemas.books.find(b=>b.key==='recognitionId'));
 tables.Workshop_Registrations[1][4]=true;tables.Workshop_Instructors[1][4]=true;tables.Volunteers[1][4]=true;
 rec.tables=tables;call(rec,"masterSpreadsheet_=()=>({getSheetByName:name=>tables[name]?{getDataRange:()=>({getValues:()=>tables[name]})}:null})");
 assert.equal(call(rec,"workshopMatches_('Example Attendee','attendee@example.org').length"),1);
 assert.equal(call(rec,"instructorMatches_('Example Alias').length"),1);
 assert.equal(call(rec,'volunteerRoster_()[0].enabled'),true);
 assert(tables[call(rec,'SESSION_CHAIR_PORTAL.LOG')]);
});
test('calendar handler names still resolve after edition branding changes',()=>{
 const c=context('calendar-sync'),handlers=call(c,'ACADIA.handlers');for(const name of handlers)assert.equal(typeof c[name],'function',name);
});
test('configuration validation rejects wrong deployment URLs and missing data',()=>{
 assert.deepEqual(E.validate(fixture,Object.keys(sources)),[]);
 assert(E.validate({...fixture,authorPortalUrl:'https://script.google.com/home/projects/abc/edit'}).length);
 assert(E.validate({...fixture,timezone:'Made/Up'}).length);
 assert(E.validate({...defaults},['author-portal']).some(s=>s.includes('rootId')));
 const c=E.normalize({...fixture,resources:{...fixture.resources,scheduleId:'https://docs.google.com/spreadsheets/d/EXAMPLE_scheduleId_123456789/edit#gid=0'}});assert.equal(c.resources.scheduleId,'EXAMPLE_scheduleId_123456789');
});
test('generated ZIP is a standard archive and contains correctly escaped embedded strings',()=>{
 const b=E.zip({'file.txt':'Hello 世界','Code.gs':'const x="ok";'});assert.equal(new DataView(b.buffer).getUint32(0,true),0x04034b50);
 const out=path.join(root,'.test-output');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'fixture.zip'),b);
 assert(compiled['conference-program/Index.html'].includes('\\u003cscript\\u003e')||compiled['conference-program/Index.html'].includes('&lt;script&gt;'));
});
test('FAQ, administration inputs and short-program thresholds compile from form values',()=>{
 const custom={...fixture,adminInputs:{...fixture.adminInputs,proofPaperId:'1001'},minimumPresentationSessions:1,maximumMissingAssignmentFraction:0.1,attendanceFaq:[{question:'Where in {{year}}?',answer:'Meet at {{mainVenue}}.'}]};
 const html=E.compileSource(sources['author-portal']['ClientJS.html'],custom,catalog);assert(html.includes('Where in 2028?'));assert(html.includes('Meet at Example Hall.'));assert(!html.includes('{{mainVenue}}'));
 const code=E.compileSource(sources['author-portal']['Code.gs'],custom,catalog);assert(code.includes('"proofPaperId":"1001"'));
 assert(E.validate({...fixture,conferenceStart:'2028-02-30'}).length);
 assert(E.validate({...fixture,presentationDays:[{date:'2028-02-30'}]}).length);
 assert(E.validate({...fixture,attendanceFaq:'invalid'}).length);
 assert(E.validate({...fixture,maximumMissingAssignmentFraction:1}).length);
});
test('every manifest supports the editor-only initialization guard and shared source stays synchronized',()=>{
 for(const [module,files]of Object.entries(sources)){
  assert.equal(files['Edition.gs'],read('shared/Edition.gs'),module);
  const manifest=JSON.parse(compiled[module+'/appsscript.json']);assert(manifest.oauthScopes.includes('https://www.googleapis.com/auth/userinfo.email'),module);
 }
});
