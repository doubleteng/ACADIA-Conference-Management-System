'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createGoogleServices}=require('./helpers/google-services.js'),E=require('../tools/engine.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const defaults=JSON.parse(read('configuration.example.json')),catalog=JSON.parse(read('configuration-catalog.json')),schemas=JSON.parse(read('templates/schemas.json'));
function builder(config,examples){return read('templates/CreateTemplates.gs').replace('__KIT_CONFIG__',E.safeJSON(config)).replace('__KIT_SCHEMAS__',E.safeJSON(schemas)).replace('__KIT_EXAMPLES__',String(examples));}
function runBuilder(fake,config=defaults,examples=false){const c=vm.createContext({...fake.globals});vm.runInContext(builder(config,examples),c);c.createConferenceTemplates();return c;}
test('template builder creates complete new resources and preserves edited records on rerun',()=>{
 const f=createGoogleServices();runBuilder(f);
 assert.equal(f.books.size,7);assert.equal([...f.books.values()].reduce((n,b)=>n+b.sheets.length,0),52);assert.equal(f.docs.size,8);
 for(const spec of schemas.books){const b=f.books.get(f.properties['KIT_'+spec.key]);assert.equal(b.timezone,defaults.timezone);for(const tab of spec.tabs){const s=b.getSheetByName(E.renderText(tab.name,E.normalize(defaults)));assert.deepEqual(Array.from(s.rows[0]),tab.headers.map(h=>E.renderText(h,E.normalize(defaults))));assert.equal(s.getLastRow(),1);}}
 for(const [key,spec] of Object.entries(schemas.certificates)){const d=f.docs.get(f.properties['KIT_'+key]);assert(d.saved);assert(d.paragraphs.some(p=>p.includes("Developed by Teng Teng")));for(const token of spec.tokens)assert(d.paragraphs.includes('{{'+token+'}}'));}
 const master=f.books.get(f.properties.KIT_authorMasterId),table=master.getSheetByName('Submissions');table.rows.push(['KEEP-1001','Organizer-edited title']);
 const priorIds=JSON.stringify(f.properties),priorCount=f.files.size;runBuilder(f);
 assert.equal(f.files.size,priorCount);assert.equal(JSON.stringify(f.properties),priorIds);assert.equal(table.rows[1][1],'Organizer-edited title');
 const config=JSON.parse(f.files.get(f.properties.KIT_CONFIG_FILE).content);assert.equal(config.resources.authorMasterId,master.id);assert.equal(config.resources.scheduleId,f.properties.KIT_scheduleId);
});
test('template builder refuses another edition or an unrelated script before creating assets',()=>{
 const f=createGoogleServices({EXISTING_APPLICATION:'production'}),count=f.files.size;assert.throws(()=>runBuilder(f),/new empty/);assert.equal(f.files.size,count);
 const g=createGoogleServices();runBuilder(g);const old=g.files.size;assert.throws(()=>runBuilder(g,{...defaults,year:2028}),/different conference year/);assert.equal(g.files.size,old);
});
test('fictional examples resolve dates and leave recognition eligibility disabled',()=>{
 const f=createGoogleServices();runBuilder(f,{...defaults,year:2030,conferenceStart:'2030-04-11',city:'Example City'},true);
 const schedule=f.books.get(f.properties.KIT_scheduleId);assert(schedule.getSheetByName('Conference').rows.some(r=>String(r[0]).includes('2030-04-11')));
 const recognition=f.books.get(f.properties.KIT_recognitionId);for(const name of ['Workshop_Registrations','Workshop_Instructors','Volunteers'])assert.equal(recognition.getSheetByName(name).rows[1][4],false);
});
function editionContext(fake,extra='') {const c=vm.createContext({...fake.globals});vm.runInContext(extra+'\n'+E.compileSource(read('shared/Edition.gs'),defaults,catalog),c);return c;}
test('installation guard rejects anonymous callers, old applications and wrong editions without property writes',()=>{
 const f=createGoogleServices({LIVE_APP:'keep'});const before=JSON.stringify(f.properties);assert.throws(()=>editionContext(f).RUN_CONFIGURE_NEW_INSTALLATION(),/new empty/);assert.equal(JSON.stringify(f.properties),before);
 const g=createGoogleServices({ACADIA_TOOLKIT_INSTALLATION:'2026'});assert.throws(()=>editionContext(g).RUN_CONFIGURE_NEW_INSTALLATION(),/different edition/);
 const h=createGoogleServices();h.globals.Session.getActiveUser=()=>({getEmail:()=>''});assert.throws(()=>editionContext(h).RUN_CONFIGURE_NEW_INSTALLATION(),/project owner/);assert.deepEqual(h.properties,{});
 const j=createGoogleServices();assert.throws(()=>editionContext(j,'const DEFAULTS={};').RUN_CONFIGURE_NEW_INSTALLATION(),/template kit/);assert.deepEqual(j.properties,{});
});
test('fresh installation initializes configuration without requesting email, Calendar or triggers',()=>{
 const f=createGoogleServices();editionContext(f).RUN_CONFIGURE_NEW_INSTALLATION();assert.equal(f.properties.ACADIA_TOOLKIT_INSTALLATION,'2027');assert.equal(f.properties.GUIDE_ENABLED,'false');assert.equal(f.files.size,1);
});
function compiledContext(module,fake,config) {
 const c=vm.createContext({...fake.globals});const src=fs.readdirSync(root+'/modules/'+module).filter(n=>n.endsWith('.gs')).map(n=>E.compileSource(read('modules/'+module+'/'+n),config,catalog)).join('\n');vm.runInContext(src,c);return c;
}
test('read-only installation check accepts generated schemas and reports a renamed column without edits',()=>{
 const f=createGoogleServices();runBuilder(f);const config=JSON.parse(f.files.get(f.properties.KIT_CONFIG_FILE).content);
 const before=JSON.stringify([...f.books.values()].map(b=>b.sheets.map(s=>s.rows)));
 for(const module of ['author-portal','conference-program','recognition-portal','presentation-reminders','calendar-sync'])assert.equal(compiledContext(module,f,config).RUN_CHECK_INSTALLATION().ok,true,module);
 assert.equal(JSON.stringify([...f.books.values()].map(b=>b.sheets.map(s=>s.rows))),before);
 const sheet=f.books.get(config.resources.authorMasterId).getSheetByName('Submissions');sheet.rows[0][0]='Wrong ID Header';
 const result=compiledContext('author-portal',f,config).RUN_CHECK_INSTALLATION();assert.equal(result.ok,false);assert(result.checks.some(x=>x.tab==='Submissions'&&!x.ok));assert.equal(sheet.rows[0][0],'Wrong ID Header');
});
test('recognition initialization connects new certificates and keeps optional channels disabled',()=>{
 const f=createGoogleServices();runBuilder(f);const config=JSON.parse(f.files.get(f.properties.KIT_CONFIG_FILE).content);
 // A separate Apps Script project shares the kit files, but has its own initially empty properties.
 const properties=createGoogleServices();f.globals.PropertiesService=properties.globals.PropertiesService;
 compiledContext('recognition-portal',f,config).RUN_CONFIGURE_NEW_INSTALLATION();
 const rows=f.books.get(config.resources.recognitionId).getSheetByName('Settings').rows;
 const settings=Object.fromEntries(rows.slice(1).map(r=>[r[0],r[1]]));assert.equal(settings.CERTIFICATE_TEMPLATE_FILE_ID,config.resources.reviewerTemplateId);
 assert.equal(settings.PRESENTER_TEMPLATE_FILE_ID,config.resources.presenterCertificateTemplateId);assert.equal(settings.CHAIR_SOURCE_SPREADSHEET_ID,config.resources.chairCoordinationId);
 for(const key of ['WORKSHOP','INSTRUCTOR','PRESENTER','CHAIR','VOLUNTEER','AWARDS'])assert.equal(settings[key+'_ENABLED'],'FALSE');
});
