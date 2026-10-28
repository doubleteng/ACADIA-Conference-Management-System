'use strict';
// In-memory Google service doubles. No network, credentials, email or Calendar calls.
function createGoogleServices(initialProperties={}) {
 let sequence=0;const properties={...initialProperties},files=new Map(),books=new Map(),docs=new Map(),logs=[];
 const next=prefix=>prefix+'_'+(++sequence);
 const propStore={getProperty:k=>properties[k]??null,getProperties:()=>({...properties}),setProperty(k,v){properties[k]=String(v);return this;},setProperties(values){Object.assign(properties,values);return this;},deleteProperty(k){delete properties[k];return this;}};
 function makeFile(name,type,content='',id=next(type)) {
  const f={id,name,type,content,parent:null,getId(){return id;},getName(){return name;},getUrl(){return 'https://example.invalid/'+id;},moveTo(parent){this.parent=parent.getId();return this;},setContent(value){this.content=value;return this;}};files.set(id,f);return f;
 }
 function folder(name,parent=null){const f=makeFile(name,'folder');f.parent=parent?.getId()||null;f.createFolder=n=>folder(n,f);f.createFile=(n,c,t)=>{const file=makeFile(n,t,c);file.parent=f.id;return file;};return f;}
 const driveRoot=folder('My Drive');
 function range(sheet,row,column,rowCount=1,columnCount=1) {
  if(row==='A1'){row=1;column=1;}
  const r={setValues(values){if(values.length!==rowCount||values.some(x=>x.length!==columnCount))throw Error('Invalid range dimensions');values.forEach((cells,i)=>cells.forEach((v,j)=>{sheet.rows[row-1+i]||=[];sheet.rows[row-1+i][column-1+j]=v;}));return this;},getValues(){return Array.from({length:rowCount},(_,i)=>Array.from({length:columnCount},(_,j)=>sheet.rows[row-1+i]?.[column-1+j]??''));},getDisplayValues(){return this.getValues().map(a=>a.map(v=>typeof v==='boolean'?String(v).toUpperCase():String(v)));},setNote(v){sheet.notes[row+':'+column]=v;return this;}};
  for(const name of ['setFontWeight','setBackground','setFontColor','setWrap','setNumberFormat'])r[name]=()=>r;
  return r;
 }
 function sheet(name){return {name,rows:[],notes:{},maxColumns:26,maxRows:1000,appendRow(row){this.rows.push(row);return this;},getName(){return this.name;},setName(n){this.name=n;return this;},getLastRow(){return this.rows.length;},getLastColumn(){return Math.max(0,...this.rows.map(r=>r.length));},getMaxColumns(){return this.maxColumns;},getMaxRows(){return this.maxRows;},insertColumnsAfter(_,n){this.maxColumns+=n;return this;},getRange(...args){return range(this,...args);},getDataRange(){return range(this,1,1,Math.max(1,this.getLastRow()),Math.max(1,this.getLastColumn()));},setFrozenRows(){return this;},setColumnWidths(){return this;},setRowHeight(){return this;}};}
 const SpreadsheetApp={create(name){const f=makeFile(name,'sheet'),b={id:f.id,sheets:[sheet('Sheet1')],getId(){return this.id;},getUrl(){return f.getUrl();},getSheets(){return this.sheets;},getSheetByName(n){return this.sheets.find(x=>x.name===n)||null;},insertSheet(n){if(this.getSheetByName(n))throw Error('Duplicate tab');const s=sheet(n);this.sheets.push(s);return s;},setSpreadsheetTimeZone(tz){this.timezone=tz;return this;}};books.set(b.id,b);return b;},openById(id){if(!books.has(id))throw Error('No workbook '+id);return books.get(id);},flush(){}};
 const DocumentApp={ParagraphHeading:{HEADING1:'HEADING1',HEADING2:'HEADING2'},create(name){const f=makeFile(name,'document'),d={id:f.id,paragraphs:[],getId(){return this.id;},getBody(){return body;},saveAndClose(){this.saved=true;}};const body={appendParagraph(text){d.paragraphs.push(text);return {setHeading(){}};}};for(const n of ['setMarginTop','setMarginBottom','setMarginLeft','setMarginRight'])body[n]=()=>body;docs.set(d.id,d);return d;}};
 const DriveApp={getRootFolder:()=>driveRoot,getFolderById(id){const f=files.get(id);if(!f||f.type!=='folder')throw Error('No folder');return f;},getFileById(id){if(!files.has(id))throw Error('No file');return files.get(id);}};
 return {files,books,docs,properties,logs,propStore,globals:{PropertiesService:{getScriptProperties:()=>propStore},SpreadsheetApp,DocumentApp,DriveApp,MimeType:{PLAIN_TEXT:'text/plain'},console:{log:x=>logs.push(x)},Session:{getActiveUser:()=>({getEmail:()=> 'owner@example.org'}),getEffectiveUser:()=>({getEmail:()=> 'owner@example.org'})}}};
}
module.exports={createGoogleServices};
