const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const schemas=JSON.parse(read('templates/schemas.json'));
const checker=read('shared/InstallationCheck.gs').replace('/*ACMS_SCHEMAS*/null',JSON.stringify(schemas.books.map(b=>({key:b.key,tabs:b.tabs.map(t=>({name:t.name,headers:t.headers}))}))));
for(const mod of fs.readdirSync(path.join(root,'modules'))){fs.writeFileSync(path.join(root,'modules',mod,'InstallationCheck.gs'),checker);fs.writeFileSync(path.join(root,'modules',mod,'Edition.gs'),read('shared/Edition.gs'));fs.writeFileSync(path.join(root,'modules',mod,'Attribution.gs'),read('shared/Attribution.gs'));}
const credit=read('shared/Attribution.html').trim();
for(const file of ['modules/author-portal/Index.html','modules/recognition-portal/Index.html','modules/conference-program/Index.html','tools/configurator-shell.html']){const source=read(file);if(!source.includes('<!-- ACMS_CREDIT_START -->'))throw new Error('Missing attribution slot: '+file);fs.writeFileSync(path.join(root,file),source.replace(/<!-- ACMS_CREDIT_START -->[\s\S]*?<!-- ACMS_CREDIT_END -->/,()=>credit));}
const sources={};for(const mod of fs.readdirSync(path.join(root,'modules'))){sources[mod]={};for(const file of fs.readdirSync(path.join(root,'modules',mod)))sources[mod][file]=read('modules/'+mod+'/'+file);}
const data={defaults:JSON.parse(read('configuration.example.json')),catalog:JSON.parse(read('configuration-catalog.json')),schemas:JSON.parse(read('templates/schemas.json')),sources,builder:read('templates/CreateTemplates.gs'),deployGuide:read('docs/DEPLOYMENT.md')};
const html=read('tools/configurator-shell.html').replace('/*ENGINE*/',()=>read('tools/engine.js')).replace('/*BUNDLE*/',()=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'));
fs.writeFileSync(path.join(root,'configure.html'),html);
fs.writeFileSync(path.join(root,'sources.json'),JSON.stringify(sources)+'\n');
console.log('Built offline configure.html ('+Buffer.byteLength(html)+' bytes).');
