'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),{createGoogleServices}=require('./helpers/google-services.js'),E=require('../tools/engine.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base=JSON.parse(read('configuration.example.json')),catalog=JSON.parse(read('configuration-catalog.json')),schemas=JSON.parse(read('templates/schemas.json'));
const source=Object.fromEntries(fs.readdirSync(root+'/modules/content-editor').map(n=>[n,read('modules/content-editor/'+n)]));
function fixture(){
 const f=createGoogleServices(),builder=vm.createContext({...f.globals});vm.runInContext(read('templates/CreateTemplates.gs').replace('__KIT_CONFIG__',E.safeJSON(base)).replace('__KIT_SCHEMAS__',E.safeJSON(schemas)).replace('__KIT_EXAMPLES__','false'),builder);builder.createConferenceTemplates();
 for(const file of f.files.values()){file.getSize=()=>Buffer.byteLength(file.content);file.getBlob=()=>({getDataAsString:()=>file.content});}
 const config=JSON.parse(f.files.get(f.properties.KIT_CONFIG_FILE).content);config.editorEmails=['editor@example.org'];
 const props=createGoogleServices();f.globals.PropertiesService=props.globals.PropertiesService;let uuid=0,locks=0,release=0;
 f.globals.ScriptApp={getScriptId:()=> 'new-editor-project'};f.globals.Utilities={getUuid:()=> 'publication-'+(++uuid)};
 f.globals.LockService={getScriptLock:()=>({waitLock(){locks++;},releaseLock(){release++;}})};
 const compiled=E.compile({'content-editor':source},config,catalog);
 f.globals.HtmlService={createHtmlOutputFromFile:n=>({getContent:()=>compiled['content-editor/'+n+'.html']})};
 const c=vm.createContext({...f.globals});vm.runInContext(Object.entries(compiled).filter(([n])=>n.endsWith('.gs')).map(([,s])=>s).join('\n'),c);
 c.RUN_CONFIGURE_NEW_INSTALLATION();
 const folder=f.files.get(config.resources.contentFolderId),create=folder.createFile;folder.createFile=(...args)=>{const file=create(...args);file.getSize=()=>Buffer.byteLength(file.content);file.getBlob=()=>({getDataAsString:()=>file.content});return file;};
 return {f,c,config,props,compiled,store:()=>JSON.parse(f.files.get(config.resources.contentStoreId).content),locks:()=>({locks,release})};
}
test('editor initialization connects private content without changing conference records',()=>{
 const {c,f,store,props}=fixture();assert.equal(props.properties.ACMS_EDITOR_OWNER,'owner@example.org');assert.equal(store().writerScriptId,'new-editor-project');
 const before=JSON.stringify([...f.books.values()].map(b=>b.sheets.map(s=>s.rows)));
 assert.equal(c.RUN_CHECK_INSTALLATION().ok,true);assert.equal(c.getEditorBootstrap().state.revision,0);
 assert.equal(JSON.stringify([...f.books.values()].map(b=>b.sheets.map(s=>s.rows))),before);
});
test('all editor endpoints reject anonymous, unlisted, and mismatched executing users before writes',()=>{
 for(const user of ['', 'other@example.org', 'editor@example.org']){
  const x=fixture(),before=JSON.stringify([...x.f.files.values()].map(f=>[f.id,f.content]));
  x.c.Session.getActiveUser=()=>({getEmail:()=>user});x.c.Session.getEffectiveUser=()=>({getEmail:()=>user==='editor@example.org'?'owner@example.org':user});
  for(const action of [()=>x.c.doGet(),()=>x.c.getEditorBootstrap(),()=>x.c.saveEditorDraft(0,{}),()=>x.c.publishEditorDraft(0),()=>x.c.restoreEditorVersion(0,'fake')])assert.throws(action,/Access denied/);
  assert.equal(JSON.stringify([...x.f.files.values()].map(f=>[f.id,f.content])),before);
 }
 const x=fixture();x.c.Session.getActiveUser=x.c.Session.getEffectiveUser=()=>({getEmail:()=> 'editor@example.org'});assert.equal(x.c.getEditorBootstrap().actor,'editor@example.org');
});
test('saving drafts is private; publication exposes a single validated version of all pages',()=>{
 const x=fixture(),draft={'author-portal':{heading:'New welcome'},'conference-program':{heading:'New program'}};
 const saved=x.c.saveEditorDraft(0,draft);assert.equal(saved.revision,1);assert.deepEqual(JSON.parse(JSON.stringify(x.store().published)),{});
 const published=x.c.publishEditorDraft(1);assert.equal(published.revision,2);assert.equal(x.store().published['author-portal'].heading,'New welcome');assert.equal(x.store().published['conference-program'].heading,'New program');assert.equal(published.history.length,1);
 const snapshot=x.f.files.get(x.store().history[0].fileId);assert.equal(JSON.parse(snapshot.content).pages['author-portal'].heading,'New welcome');assert.deepEqual(x.locks().locks,x.locks().release);
});
test('stale saves, publishes, and second editor projects cannot overwrite a newer revision',()=>{
 const x=fixture();x.c.saveEditorDraft(0,{'author-portal':{heading:'First writer'}});const before=JSON.stringify(x.store());
 for(const action of [()=>x.c.saveEditorDraft(0,{}),()=>x.c.publishEditorDraft(0),()=>x.c.restoreEditorVersion(0,'anything')])assert.throws(action,/Another editor/);
 assert.equal(JSON.stringify(x.store()),before);x.c.ScriptApp.getScriptId=()=> 'second-editor';assert.throws(()=>x.c.saveEditorDraft(1,{}),/not connected/);assert.throws(()=>x.c.acmsInitializeEditor_(),/another editor project/);
});
test('restoring history creates a draft and preserves published content and every snapshot',()=>{
 const x=fixture();x.c.saveEditorDraft(0,{'author-portal':{heading:'Version one'}});const a=x.c.publishEditorDraft(1);x.c.saveEditorDraft(2,{'author-portal':{heading:'Version two'}});x.c.publishEditorDraft(3);
 const files=x.f.files.size,restored=x.c.restoreEditorVersion(4,a.publishedVersion);assert.equal(restored.draft['author-portal'].heading,'Version one');assert.equal(restored.published['author-portal'].heading,'Version two');assert.equal(x.f.files.size,files);
 const rollback=x.c.publishEditorDraft(5);assert.equal(rollback.published['author-portal'].heading,'Version one');assert.equal(rollback.history.length,3);assert.equal(x.f.files.size,files+1);
});
test('editor accepts text but rejects executable URLs, unknown fields, oversized text and wrong editions',()=>{
 const x=fixture();for(const draft of [JSON.parse('{"__proto__":{}}'),{'author-portal':{developerName:'Other'}},{'author-portal':{heading:'x'.repeat(181)}},{'author-portal':{bannerUrl:'javascript:alert(1)',bannerAlt:'Photo'}},{'author-portal':{bannerUrl:'https://example.org/banner.png'}},{'author-portal':{accentColor:'red;display:none'}},{'author-portal':{heading:42}}])assert.throws(()=>x.c.saveEditorDraft(0,draft));
 assert.equal(x.store().revision,0);const file=x.f.files.get(x.config.resources.contentStoreId),bad=x.store();bad.year=2030;file.content=JSON.stringify(bad);assert.throws(()=>x.c.getEditorBootstrap(),/edition/);
});
test('public page output contains only published display content and never drafts or editor metadata',()=>{
 const x=fixture();x.c.saveEditorDraft(0,{'author-portal':{heading:'Published </script><script>window.BAD=1</script>'}});x.c.publishEditorDraft(1);x.c.saveEditorDraft(2,{'author-portal':{heading:'SECRET UNPUBLISHED DRAFT'}});
 let html='<html><body><h1>Installed</h1></body></html>';const output={getContent:()=>html,setContent:s=>{html=s;return output;}};x.c.acmsDecorateOutput_(output,'author-portal');
 assert(!html.includes('SECRET UNPUBLISHED'));assert(!html.includes('owner@example.org'));assert(!html.includes(x.config.resources.contentStoreId));assert(!html.includes('new-editor-project'));assert(!html.includes('</script><script>window.BAD=1'));
 assert(html.includes('Published \\u003c/script\\u003e'));
});
test('real portal previews have matching editable elements and retain developer attribution without application scripts',()=>{
 const x=fixture(),boot=x.c.getEditorBootstrap();for(const [page,html]of Object.entries(boot.previews)){
  const dom=new JSDOM(html);for(const f of boot.schema[page].fields)assert.equal(dom.window.document.querySelectorAll(f.selector).length,1,page+': '+f.key);
  assert.equal(dom.window.document.querySelectorAll('script').length,0);assert.match(dom.window.document.querySelector('.acms-developer-credit').textContent,/Developed by\s+Teng Teng/);dom.window.close();
 }
});
test('shared preview and public renderer use text nodes and preserve management controls and attribution',()=>{
 const x=fixture(),boot=x.c.getEditorBootstrap(),dom=new JSDOM(boot.previews['author-portal'],{runScripts:'outside-only'});const w=dom.window;
 w.eval(boot.renderer.replace(/^<script>\s*/,'').replace(/<\/script>\s*$/,''));
 const originalLogin=w.document.getElementById('loginPaperId'),attack='<img src=x onerror="window.BAD=1">';
 w.ACMSContent.apply(w.document,{schema:boot.schema['author-portal'],values:{heading:attack,accentColor:'#123456',bannerUrl:'https://example.org/image.png',bannerAlt:'Example image'}});
 assert.equal(w.document.querySelector('.home-intro h1').textContent,attack);assert.equal(w.document.querySelectorAll('.home-intro h1 img').length,0);assert.equal(w.BAD,undefined);assert.equal(w.document.getElementById('loginPaperId'),originalLogin);assert.equal(w.document.querySelector('#acms-content-banner img').alt,'Example image');assert.match(w.document.querySelector('.acms-developer-credit').textContent,/Developed by\s+Teng Teng/);dom.window.close();
});
test('failed publication store writes leave the previous live version intact and release the lock',()=>{
 const x=fixture();x.c.saveEditorDraft(0,{'author-portal':{heading:'Draft'}});const file=x.f.files.get(x.config.resources.contentStoreId);file.setContent=()=>{throw Error('Drive write unavailable');};assert.throws(()=>x.c.publishEditorDraft(1),/Drive write unavailable/);assert.deepEqual(x.store().published,{});assert.equal(x.store().revision,1);assert.equal(x.locks().locks,x.locks().release);
});
