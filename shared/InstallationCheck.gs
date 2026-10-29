/** Read-only checks for this edition. Run from the Apps Script editor. */
function RUN_CHECK_INSTALLATION() {
  const active=Session.getActiveUser().getEmail(),effective=Session.getEffectiveUser().getEmail();
  if(!active||active!==effective)throw new Error('Run this check from the Apps Script editor as the project owner.');
  const edition=conferenceEdition_(),schemas=/*ACMS_SCHEMAS*/null;
  if(typeof ACMS_EDITOR!=='undefined'){
    try {const state=acmsReadContentStore_();DriveApp.getFolderById(edition.resources.contentFolderId);return {module:'content-editor',year:edition.year,ok:state.writerScriptId===ScriptApp.getScriptId(),revision:state.revision};}
    catch(error){return {module:'content-editor',year:edition.year,ok:false,problem:'Check content file access, edition, and editor initialization.'};}
  }
  const moduleName=typeof DEFAULTS!=='undefined'?'author-portal':typeof PROGRAM_CONFIG!=='undefined'?'conference-program':typeof REVIEWER_PORTAL!=='undefined'?'recognition-portal':typeof MAIL_SENDER_!=='undefined'?'presentation-reminders':'calendar-sync';
  const requirements={
    'author-portal':['authorMasterId','acceptedId','presentationId'],
    'conference-program':['authorMasterId','scheduleId'],
    'recognition-portal':['recognitionId'],
    'presentation-reminders':['authorMasterId','presentationId','scheduleId'],
    'calendar-sync':['scheduleId']
  };
  const render=value=>String(value).replace(/\{\{([A-Za-z0-9_]+)\}\}/g,(_,key)=>String(edition[key]??''));
  const checks=[];
  requirements[moduleName].forEach(key=>{
    const id=edition.resources[key];
    if(!id){checks.push({workbook:key,ok:false,problem:'Resource ID is missing.'});return;}
    try {
      const book=SpreadsheetApp.openById(id),spec=schemas.find(b=>b.key===key);
      spec.tabs.forEach(tab=>{
        const name=render(tab.name),sheet=book.getSheetByName(name);
        if(!sheet){checks.push({workbook:key,tab:name,ok:false,problem:'Required tab is missing.'});return;}
        const expected=tab.headers.map(render),actual=sheet.getRange(1,1,1,expected.length).getDisplayValues()[0];
        const ok=expected.every((h,i)=>h===String(actual[i]||''));
        checks.push({workbook:key,tab:name,ok:ok,dataRows:Math.max(0,sheet.getLastRow()-1),problem:ok?'':'Header names or column order differ from the generated template.'});
      });
    }catch(error){checks.push({workbook:key,ok:false,problem:'Cannot read this workbook. Check its ID and the executing account’s access.'});}
  });
  const result={module:moduleName,year:edition.year,ok:checks.every(c=>c.ok),checks:checks};
  console.log(JSON.stringify(result,null,2));return result;
}
