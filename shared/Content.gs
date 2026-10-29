/** Shared read-only content support. Public portal projects have no publishing endpoints. */
function acmsContentSchema_() { return /*ACMS_CONTENT_SCHEMA*/{}; }
function acmsContentJSON_(value) {return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
function acmsEmptyContent_() {
  return {schema:1,year:conferenceEdition_().year,writerScriptId:'',revision:0,draft:{},published:{},history:[],publishedAt:'',publishedVersion:''};
}
function acmsValidatePages_(input) {
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid page content.');
  const schema=acmsContentSchema_(),out={};
  Object.keys(input).forEach(page=>{
    if(!Object.prototype.hasOwnProperty.call(schema,page))throw Error('Unknown page.');
    const values=input[page];if(!values||typeof values!=='object'||Array.isArray(values))throw Error('Invalid page fields.');
    const definitions={};schema[page].fields.forEach(f=>definitions[f.key]=f);out[page]={};
    Object.keys(values).forEach(key=>{
      const value=values[key];if(typeof value!=='string')throw Error('Content fields must be text.');
      if(Object.prototype.hasOwnProperty.call(definitions,key)){
        if(value.length>definitions[key].max)throw Error(definitions[key].label+' is too long.');
      }else if(['accentColor','backgroundColor'].includes(key)){
        if(!/^#[0-9a-f]{6}$/i.test(value))throw Error('Choose a six-digit color.');
      }else if(key==='bannerUrl'){
        if(value.length>2000||(value&&!/^https:\/\/[a-z0-9.-]+(?::443)?(?:[/?#][^\s<>"'\\]*)?$/i.test(value)))throw Error('Banner must use a public HTTPS image URL without credentials.');
      }else if(key==='bannerAlt'){
        if(value.length>300)throw Error('Banner description is too long.');
      }else throw Error('This field cannot be edited.');
      out[page][key]=value;
    });
    if(out[page].bannerUrl&&!String(out[page].bannerAlt||'').trim())throw Error('Add a description for the banner image.');
  });
  if(JSON.stringify(out).length>50000)throw Error('Page content is too large.');
  return out;
}
function acmsReadContentStore_() {
  const id=conferenceEdition_().resources.contentStoreId;
  if(!id)throw Error('Create the content templates and configure Content Store Id first.');
  const file=DriveApp.getFileById(id);
  if(file.getSize()>1000000)throw Error('Content store is too large.');
  const state=JSON.parse(file.getBlob().getDataAsString('UTF-8'));
  if(state.schema!==1||state.year!==conferenceEdition_().year||!Number.isInteger(state.revision)||state.revision<0||!Array.isArray(state.history))throw Error('Content store does not match this edition.');
  state.draft=acmsValidatePages_(state.draft);state.published=acmsValidatePages_(state.published);
  return state;
}
function acmsDecorateOutput_(output,page) {
  if(!conferenceEdition_().resources.contentStoreId)return output;
  try {
    const state=acmsReadContentStore_();
    const payload={page:page,schema:acmsContentSchema_()[page],values:state.published[page]||{},version:state.publishedVersion||''};
    const script='<script>window.__ACMS_PAGE_CONTENT__='+acmsContentJSON_(payload)+';</script>'+HtmlService.createHtmlOutputFromFile('ContentRenderer').getContent();
    output.setContent(output.getContent().replace(/<\/body>/i,()=>script+'</body>'));
  }catch(error){console.warn('ACMS published page content is unavailable; showing the installed page.');}
  return output;
}
