const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sources={};for(const mod of fs.readdirSync(path.join(root,'modules'))){sources[mod]={};for(const file of fs.readdirSync(path.join(root,'modules',mod)))sources[mod][file]=read('modules/'+mod+'/'+file);}
const data={defaults:JSON.parse(read('configuration.example.json')),catalog:JSON.parse(read('configuration-catalog.json')),schemas:JSON.parse(read('templates/schemas.json')),sources,builder:read('templates/CreateTemplates.gs'),deployGuide:read('docs/DEPLOYMENT.md')};
const html=read('tools/configurator-shell.html').replace('/*ENGINE*/',()=>read('tools/engine.js')).replace('/*BUNDLE*/',()=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'));
fs.writeFileSync(path.join(root,'configure.html'),html);
fs.writeFileSync(path.join(root,'sources.json'),JSON.stringify(sources)+'\n');
console.log('Built offline configure.html ('+Buffer.byteLength(html)+' bytes).');
