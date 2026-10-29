const fs=require('node:fs'),path=require('node:path'),E=require('./engine.js');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const schemas=JSON.parse(read('templates/schemas.json')),contentSchema=JSON.parse(read('shared/content-schema.json'));
const checker=read('shared/InstallationCheck.gs').replace('/*ACMS_SCHEMAS*/null',JSON.stringify(schemas.books.map(b=>({key:b.key,tabs:b.tabs.map(t=>({name:t.name,headers:t.headers}))}))));
for(const mod of fs.readdirSync(path.join(root,'modules'))){
 write('modules/'+mod+'/InstallationCheck.gs',checker);write('modules/'+mod+'/Edition.gs',read('shared/Edition.gs'));write('modules/'+mod+'/Attribution.gs',read('shared/Attribution.gs'));
 if(contentSchema[mod]||mod==='content-editor'){
  write('modules/'+mod+'/Content.gs',read('shared/Content.gs').replace('/*ACMS_CONTENT_SCHEMA*/{}',JSON.stringify(contentSchema)));
  write('modules/'+mod+'/ContentRenderer.html',read('shared/ContentRenderer.html'));
 }
}
const credit=read('shared/Attribution.html').trim();
for(const file of ['modules/author-portal/Index.html','modules/recognition-portal/Index.html','modules/conference-program/Index.html','tools/configurator-shell.html']){
 const source=read(file);if(!source.includes('<!-- ACMS_CREDIT_START -->'))throw new Error('Missing attribution slot: '+file);write(file,source.replace(/<!-- ACMS_CREDIT_START -->[\s\S]*?<!-- ACMS_CREDIT_END -->/,()=>credit));
}
// Use the portals' real markup and styles, with all application scripts removed. No login or operational actions run in previews.
const previews={};for(const module of Object.keys(contentSchema)){
 let source=read('modules/'+module+'/Index.html');
 if(module==='author-portal')source=source.replace("<?!= include_('Styles'); ?>",()=>read('modules/author-portal/Styles.html'));
 source=source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<\?[\s\S]*?\?>/g,'').replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi,'');
 previews[module]=source;
}
write('modules/content-editor/Previews.html',E.safeJSON(previews));
const sources={};for(const mod of fs.readdirSync(path.join(root,'modules'))){sources[mod]={};for(const file of fs.readdirSync(path.join(root,'modules',mod)))sources[mod][file]=read('modules/'+mod+'/'+file);}
const data={defaults:JSON.parse(read('configuration.example.json')),catalog:JSON.parse(read('configuration-catalog.json')),schemas,sources,builder:read('templates/CreateTemplates.gs'),deployGuide:read('docs/DEPLOYMENT.md')};
const html=read('tools/configurator-shell.html').replace('/*ENGINE*/',()=>read('tools/engine.js')).replace('/*BUNDLE*/',()=>E.safeJSON(data));
write('configure.html',html);write('sources.json',JSON.stringify(sources)+'\n');
const demo={actor:'Demo editor',year:data.defaults.year,schema:contentSchema,previews:Object.fromEntries(Object.entries(previews).map(([m,s])=>[m,E.compileSource(s,data.defaults,data.catalog)])),renderer:read('shared/ContentRenderer.html'),demo:true};
write('editor-demo.html',read('modules/content-editor/Index.html').replace('<!-- ACMS_DEMO_DATA -->',()=>'<script>window.ACMS_DEMO='+E.safeJSON(demo)+';</script>'));
console.log('Built offline configurator, visual editor demo, and synchronized project sources.');
