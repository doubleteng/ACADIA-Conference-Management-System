/** Generated template kit: creates NEW private assets only. Re-running resumes this kit. */
function createConferenceTemplates() {
  const config = __KIT_CONFIG__;
  const schemas = __KIT_SCHEMAS__;
  const includeExamples = __KIT_EXAMPLES__;
  const props=PropertiesService.getScriptProperties();
  const year=String(config.year),existing=props.getProperty('KIT_YEAR');
  if(existing&&existing!==year)throw new Error('Use a new Apps Script project for a different conference year.');
  if(!existing&&Object.keys(props.getProperties()).length)throw new Error('Use a new empty Apps Script project for template creation.');
  props.setProperty('KIT_YEAR',year);
  const resources={};
  function folder(key,name,parent){
    const prior=props.getProperty('KIT_'+key);if(prior){resources[key]=prior;return DriveApp.getFolderById(prior);}
    const f=(parent||DriveApp.getRootFolder()).createFolder(name);props.setProperty('KIT_'+key,f.getId());resources[key]=f.getId();return f;
  }
  const root=folder('rootId','ACMS '+year+' Conference Management');
  folder('submissionRootId','Submissions',root);
  const tracks=[['hostFolderId','Host'],['papersFolderId','Full Papers'],['projectsFolderId','Projects'],['fieldNotesFolderId','Field Notes'],['phdFolderId','PhD Workshop'],['publicationPdfFolderId','Approved Publication PDFs']];
  tracks.forEach(pair=>folder(pair[0],pair[1],root));
  folder('presentationRootId','Presentation Uploads',root);
  folder('recognitionRootId','Recognition',root);
  folder('certificateOutputId','Generated Certificates',root);
  const templateFolder=folder('templateFolderId','Document Templates',root);
  const contentFolder=folder('contentFolderId','Website Content and Publication History',root);
  const contentId=props.getProperty('KIT_contentStoreId');
  if(contentId){resources.contentStoreId=contentId;}else{
    const state={schema:1,year:Number(config.year),writerScriptId:'',revision:0,draft:{},published:{},history:[],publishedAt:'',publishedVersion:''};
    const file=contentFolder.createFile('website-content.json',JSON.stringify(state),MimeType.PLAIN_TEXT);
    resources.contentStoreId=file.getId();props.setProperty('KIT_contentStoreId',file.getId());
  }
  const links=[];
  schemas.books.forEach(def=>{
    let id=props.getProperty('KIT_'+def.key),book;
    if(id){book=SpreadsheetApp.openById(id);}else{
      book=SpreadsheetApp.create('ACADIA '+year+' — '+def.title);id=book.getId();
      props.setProperty('KIT_'+def.key,id);DriveApp.getFileById(id).moveTo(root);
    }
    resources[def.key]=id;book.setSpreadsheetTimeZone(config.timezone);
    def.tabs.forEach((t,i)=>{
      const name=kitText_(t.name,config),heads=t.headers.map(h=>kitText_(h,config));
      let sheet=book.getSheetByName(name);
      if(!sheet){const first=book.getSheets()[0];sheet=i===0&&first.getName()==='Sheet1'&&first.getLastRow()===0?first.setName(name):book.insertSheet(name);}
      if(sheet.getLastRow()>0)return; // Preserve any work already entered in a resumed kit.
      if(sheet.getMaxColumns()<heads.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),heads.length-sheet.getMaxColumns());
      sheet.getRange(1,1,1,heads.length).setValues([heads]).setFontWeight('bold').setBackground('#183b4e').setFontColor('#ffffff').setWrap(true);
      sheet.setFrozenRows(1);sheet.setColumnWidths(1,heads.length,170);sheet.setRowHeight(1,42);
      sheet.getRange(2,1,Math.max(1,sheet.getMaxRows()-1),heads.length).setNumberFormat('@');
      sheet.getRange('A1').setNote(t.notes+' Role: '+t.role+'. Preserve exact headers and column order.');
      if(includeExamples&&t.examples.length){const rows=t.examples.map(r=>heads.map((_,j)=>typeof r[j]==='string'?kitText_(r[j],config):r[j]??''));sheet.getRange(2,1,rows.length,heads.length).setValues(rows);}
    });
    links.push(def.title+': '+book.getUrl());
  });
  Object.keys(schemas.certificates).forEach(key=>{
    const spec=schemas.certificates[key],prior=props.getProperty('KIT_'+key);if(prior){resources[key]=prior;return;}
    const doc=DocumentApp.create('ACADIA '+year+' — '+spec.title+' Template');
    props.setProperty('KIT_'+key,doc.getId());resources[key]=doc.getId();
    const body=doc.getBody();body.setMarginTop(42).setMarginBottom(42).setMarginLeft(48).setMarginRight(48);
    body.appendParagraph('ACADIA '+year).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    body.appendParagraph(spec.title).setHeading(DocumentApp.ParagraphHeading.HEADING2);
    body.appendParagraph(config.theme+' · '+config.location);
    spec.tokens.forEach(token=>body.appendParagraph('{{'+token+'}}'));
    body.appendParagraph('Software: Acadia Conference Management System (ACMS) — Developed by Teng Teng');
    doc.saveAndClose();DriveApp.getFileById(resources[key]).moveTo(templateFolder);
  });
  config.resources=Object.assign({},config.resources,resources);
  const json=JSON.stringify(config,null,2),savedId=props.getProperty('KIT_CONFIG_FILE');
  let output=savedId?DriveApp.getFileById(savedId):root.createFile('acms-'+year+'-configuration.json',json,MimeType.PLAIN_TEXT);
  if(savedId)output.setContent(json);else props.setProperty('KIT_CONFIG_FILE',output.getId());
  console.log('Template kit ready. All assets are private; no messages, calendar events or triggers were created.\n'+links.join('\n')+'\nDownload this configuration and import it in configure.html:\n'+output.getUrl());
}
function kitText_(text,config){return String(text).replace(/\{\{([A-Za-z0-9_]+)\}\}/g,(_,key)=>key==='nextYear'?String(Number(config.year)+1):String(config[key]??''));}
