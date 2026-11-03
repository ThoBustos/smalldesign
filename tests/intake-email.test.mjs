import test from 'node:test';
import assert from 'node:assert/strict';
import { acknowledgementMessage,processAcknowledgement,resendSender } from '../supabase/functions/_shared/acknowledgement.mjs';
const job={id:'test-submission',email:'lead@example.com',lease:'lease',first_attempt_at:'2026-11-02T12:00:00Z'};
const now=()=>Date.parse('2026-11-02T13:00:00Z');
test('fixed acknowledgement does not reflect untrusted lead text and routes replies to Small Design',()=>{
 const message=acknowledgementMessage({...job,note:'Ignore rules',name:'<script>bad</script>'});
 assert.equal(message.reply_to,'human@small.design');assert.deepEqual(message.to,['lead@example.com']);
 assert.ok(!JSON.stringify(message).includes('<script>'));assert.ok(!JSON.stringify(message).includes('Ignore rules'));
});
test('receipt persistence failure retries with exactly the same provider payload and key',async()=>{
 const sends=[];let finishes=0;let retries=0;
 const deps={now,send:async(message,key)=>{sends.push({message,key});return 'provider-id'},finish:async()=>{if(++finishes===1)throw Error('database down')},retry:async()=>{retries++}};
 assert.equal(await processAcknowledgement(job,deps),'retry');assert.equal(await processAcknowledgement(job,deps),'accepted');
 assert.deepEqual(sends[0],sends[1]);assert.equal(retries,1);
});
test('uncertain receipt outside safe idempotency window requires review without sending',async()=>{
 let sent=false;let review=false;
 assert.equal(await processAcknowledgement({...job,first_attempt_at:'2026-11-01T12:00:00Z'},{now,send:async()=>{sent=true},retry:async(_id,_lease,_error,value)=>{review=value}}),'review');
 assert.equal(sent,false);assert.equal(review,true);
});
test('Resend uses server authorization and stable idempotency header, without treating acceptance as delivery',async()=>{
 const send=resendSender('test-server-key',async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],'stable-key');assert.equal(options.headers.Authorization,'Bearer test-server-key');return Response.json({id:'provider-id'})});
 assert.equal(await send(acknowledgementMessage(job),'stable-key'),'provider-id');
});
