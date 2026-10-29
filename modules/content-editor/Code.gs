/** ACMS editor is a separate, authenticated web app. It only writes website-content files. */
const ACMS_EDITOR = true;
function acmsRequireEditor_() {
  const active=String(Session.getActiveUser().getEmail()||'').toLowerCase(),effective=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();
  const props=PropertiesService.getScriptProperties(),owner=props.getProperty('ACMS_EDITOR_OWNER');
  const editors=(conferenceEdition_().editorEmails||[]).map(x=>String(x).trim().toLowerCase());
  if(!active||active!==effective||!owner||!([owner].concat(editors)).includes(active))throw Error('Access denied. Sign in with an authorized committee account.');
  return active;
}
function acmsInitializeEditor_() {
  const actor=Session.getActiveUser().getEmail();if(!actor||actor!==Session.getEffectiveUser().getEmail())throw Error('Initialize from the Apps Script editor as its owner.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const state=acmsReadContentStore_(),id=ScriptApp.getScriptId();
    if(state.writerScriptId&&state.writerScriptId!==id)throw Error('This content store already belongs to another editor project. Reuse that project.');
    state.writerScriptId=id;acmsWriteContentStore_(state);
    PropertiesService.getScriptProperties().setProperty('ACMS_EDITOR_OWNER',actor.toLowerCase());
  } finally {lock.releaseLock();}
}
function acmsWriteContentStore_(state) {
  DriveApp.getFileById(conferenceEdition_().resources.contentStoreId).setContent(JSON.stringify(state));
}
function acmsEditorState_(state) {
  return {revision:state.revision,draft:state.draft,published:state.published,publishedAt:state.publishedAt,publishedVersion:state.publishedVersion,
    history:state.history.map(h=>({version:h.version,at:h.at,by:h.by})).reverse()};
}
function acmsEditorLocked_(revision,operation) {
  const actor=acmsRequireEditor_(),lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const state=acmsReadContentStore_();
    if(state.writerScriptId!==ScriptApp.getScriptId())throw Error('This editor is not connected to the content store. Run installation setup.');
    if(!Number.isInteger(revision)||revision!==state.revision)throw Error('Another editor changed this content. Reload the latest draft before saving or publishing.');
    operation(state,actor);state.revision++;acmsWriteContentStore_(state);return acmsEditorState_(state);
  } finally {lock.releaseLock();}
}
function doGet(){
  acmsRequireEditor_();
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('ACMS · Visual Editor').addMetaTag('viewport','width=device-width, initial-scale=1');
}
function getEditorBootstrap(){
  const actor=acmsRequireEditor_(),state=acmsReadContentStore_();
  if(state.writerScriptId!==ScriptApp.getScriptId())throw Error('Initialize this editor project before opening it.');
  const previews=JSON.parse(HtmlService.createHtmlOutputFromFile('Previews').getContent());
  return {actor:actor,year:conferenceEdition_().year,schema:acmsContentSchema_(),previews:previews,
    renderer:HtmlService.createHtmlOutputFromFile('ContentRenderer').getContent(),state:acmsEditorState_(state),demo:false};
}
function saveEditorDraft(revision,pages){
  return acmsEditorLocked_(revision,state=>{state.draft=acmsValidatePages_(pages);});
}
function publishEditorDraft(revision){
  return acmsEditorLocked_(revision,(state,actor)=>{
    const pages=acmsValidatePages_(state.draft);
    if(JSON.stringify(pages)===JSON.stringify(state.published))throw Error('There are no unpublished changes.');
    if(state.history.length>=1000)throw Error('Publication history is full. Ask the maintainer to archive this edition before publishing.');
    const version=Utilities.getUuid(),at=new Date().toISOString();
    const record={schema:1,year:state.year,version:version,at:at,by:actor,pages:pages};
    const folder=DriveApp.getFolderById(conferenceEdition_().resources.contentFolderId);
    const file=folder.createFile('published-'+version+'.json',JSON.stringify(record),MimeType.PLAIN_TEXT);
    state.history.push({version:version,at:at,by:actor,fileId:file.getId()});
    state.published=pages;state.publishedAt=at;state.publishedVersion=version;
    // Published snapshots are retained; no conference data or earlier versions are deleted.
  });
}
function restoreEditorVersion(revision,version){
  return acmsEditorLocked_(revision,state=>{
    const record=state.history.find(h=>h.version===version);if(!record)throw Error('Unknown publication version.');
    const file=DriveApp.getFileById(record.fileId);if(file.getSize()>100000)throw Error('Invalid publication snapshot.');
    const snapshot=JSON.parse(file.getBlob().getDataAsString('UTF-8'));
    if(snapshot.schema!==1||snapshot.year!==state.year||snapshot.version!==version)throw Error('Publication snapshot does not match this edition.');
    state.draft=acmsValidatePages_(snapshot.pages);
  });
}
