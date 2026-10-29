'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const tick=()=>new Promise(r=>setImmediate(r));
async function workspace(){
 const errors=[],frames=[];let lastHTML='',child=null,outer,sourceWindow;
 const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 outer=new JSDOM(fs.readFileSync(root+'/editor-demo.html','utf8'),{url:'https://editor.example.org/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.HTMLElement.prototype.scrollIntoView=function(){};w.confirm=()=>true;
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  Object.defineProperty(w.HTMLIFrameElement.prototype,'srcdoc',{set(value){lastHTML=value;},get(){return lastHTML;}});
 }});
 await tick();const w=outer.window,frame=w.document.getElementById('preview');sourceWindow=frame.contentWindow;
 const parentBridge={postMessage(data){w.dispatchEvent(new w.MessageEvent('message',{data,source:sourceWindow}));}};
 function loadFrame(){
  if(child)child.window.close();
  sourceWindow.postMessage=data=>{if(child)child.window.dispatchEvent(new child.window.MessageEvent('message',{data,source:parentBridge}));};
  child=new JSDOM(lastHTML,{url:'https://preview.example.invalid/',runScripts:'dangerously',virtualConsole:vc,beforeParse(c){Object.defineProperty(c,'parent',{value:parentBridge});c.HTMLElement.prototype.scrollIntoView=function(){};}});frames.push(child);
 }
 loadFrame();await tick();
 return {w,errors,get child(){return child.window;},loadFrame,close(){frames.forEach(x=>x.window.close());w.close();}};
}
test('English editor supports inline edits, responsive preview, save, review, publish and restore',async()=>{
 const app=await workspace(),w=app.w,d=w.document;try{
  assert.equal(d.getElementById('workspace').hidden,false);assert.equal(d.querySelectorAll('#pages button').length,3);
  assert.equal(d.querySelectorAll('#fields textarea').length,7);
  const heading=app.child.document.querySelector('.home-intro h1');heading.textContent='Welcome, future authors';heading.dispatchEvent(new app.child.Event('input',{bubbles:true}));
  assert.equal(d.getElementById('edit-heading').value,'Welcome, future authors');assert.equal(d.getElementById('save').disabled,false);
  d.getElementById('mobile').click();assert(d.getElementById('frame-wrap').classList.contains('mobile'));
  d.getElementById('preview-mode').click();assert.equal(heading.contentEditable,'false');d.getElementById('edit-mode').click();
  d.getElementById('save').click();await tick();let stored=JSON.parse(w.localStorage.getItem('acms-visual-editor-demo-v1'));assert.equal(stored.state.draft['author-portal'].heading,'Welcome, future authors');assert.deepEqual(stored.state.published,{});
  d.getElementById('publish').click();await tick();assert.equal(d.getElementById('review').open,true);assert.match(d.getElementById('changes').textContent,/Welcome, future authors/);
  d.getElementById('confirm-publish').click();await tick();stored=JSON.parse(w.localStorage.getItem('acms-visual-editor-demo-v1'));assert.equal(stored.state.published['author-portal'].heading,'Welcome, future authors');assert.match(d.getElementById('notice').textContent,/No live conference/);
  const oldVersion=stored.state.publishedVersion;
  d.getElementById('edit-heading').value='Second version';d.getElementById('edit-heading').dispatchEvent(new w.Event('input'));assert.equal(heading.textContent,'Second version');
  d.getElementById('publish').click();await tick();d.getElementById('confirm-publish').click();await tick();
  d.getElementById('versions').value=oldVersion;d.getElementById('restore').click();await tick();app.loadFrame();
  stored=JSON.parse(w.localStorage.getItem('acms-visual-editor-demo-v1'));assert.equal(stored.state.draft['author-portal'].heading,'Welcome, future authors');assert.equal(stored.state.published['author-portal'].heading,'Second version');
  assert.equal(app.child.document.querySelector('.home-intro h1').textContent,'Welcome, future authors');
  for(const key of ['conference-program','recognition-portal']){d.querySelector('[data-page="'+key+'"]').click();app.loadFrame();assert(d.querySelector('#edit-heading'));assert.equal(app.child.document.querySelectorAll('script').length,3);}
  assert.deepEqual(app.errors,[]);
 }finally{app.close();}
});
test('preview messages from unrelated windows cannot change a draft',async()=>{
 const app=await workspace();try{const w=app.w;w.dispatchEvent(new w.MessageEvent('message',{source:w,data:{acmsEditor:true,type:'change',channel:'fake',key:'heading',value:'Injected'}}));assert.notEqual(w.document.getElementById('edit-heading').value,'Injected');assert.equal(w.document.getElementById('save').disabled,true);}finally{app.close();}
});
