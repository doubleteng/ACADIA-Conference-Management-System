'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const E=require('../tools/engine.js'),{createGoogleServices}=require('./helpers/google-services.js'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),defaults=JSON.parse(read('configuration.example.json')),catalog=JSON.parse(read('configuration-catalog.json'));
const now=Date.parse('2028-05-11T08:00:00Z');
function fixture({fail=false,quota=10}={}){
 const f=createGoogleServices(),messages=[];class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const cfg={...defaults,senderEmail:'organizer@example.org',authorPortalUrl:'https://script.google.com/macros/s/EXAMPLE/exec'};
 const c=vm.createContext({...f.globals,Date:Clock,Utilities:{formatDate:date=>date.toISOString()},MailApp:{getRemainingDailyQuota:()=>quota,sendEmail(message){messages.push(message);if(fail)throw Error('Simulated ambiguous service response');}}});
 vm.runInContext(E.compileSource(read('modules/presentation-reminders/Code.gs'),cfg,catalog)+'\n'+E.compileSource(read('shared/Edition.gs'),cfg,catalog)+'\n'+read('shared/Attribution.gs'),c);
 const book=f.globals.SpreadsheetApp.create('Test reminders');const heads=vm.runInContext('PRES_REM_.LOG_HEADERS',c);const sheet=book.getSheets()[0].setName('PresentationReminders');sheet.getRange(1,1,1,heads.length).setValues([heads]);
 const job={key:'test-key',start:now+20*60000,due:now-10*60000,email:'test-recipient@example.org',name:'Example <Author>',session:{'Session ID':'P01','Session Title':'Example Session','Start Time':'10:20','End Time':'11:20',Venue:'Example Hall',Room:'1'},chair:{complete:true,lines:['Example Chair']},papers:[{id:'1001',title:'Example paper',order:1}],peers:[]};
 return {c,f,book,sheet,messages,job};
}
test('reminder delivery records SENT and a repeated invocation does not duplicate the message',()=>{
 const x=fixture();assert.equal(x.c.presentationReminderDeliver_(x.book,[x.job],now).sent,1);assert.equal(x.sheet.rows[1][5],'SENT');assert.equal(x.c.presentationReminderDeliver_(x.book,[x.job],now).sent,0);assert.equal(x.messages.length,1);assert(x.messages[0].body.includes('Developed by Teng Teng'));assert(x.messages[0].htmlBody.includes('Developed by Teng Teng'));assert(x.messages[0].htmlBody.includes('Example &lt;Author&gt;'));
});
test('an ambiguous mail response is recorded UNCERTAIN and is never blindly retried',()=>{
 const x=fixture({fail:true});assert.equal(x.c.presentationReminderDeliver_(x.book,[x.job],now).uncertain,1);assert.equal(x.sheet.rows[1][5],'UNCERTAIN');x.c.presentationReminderDeliver_(x.book,[x.job],now);assert.equal(x.messages.length,1);
});
test('reminders skip past/future sessions and exhausted quota without claiming a send',()=>{
 for(const options of [{quota:0},{past:true},{future:true}]){const x=fixture(options);if(options.past)x.job.start=now-1;if(options.future)x.job.due=now+60000;const r=x.c.presentationReminderDeliver_(x.book,[x.job],now);assert.equal(r.sent,0);assert.equal(x.messages.length,0);assert.equal(x.sheet.rows.length,1);}
});
