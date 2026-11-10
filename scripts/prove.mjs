import fs from 'node:fs';
import {spawn, execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {rpc, receipt, source, read, denied, digest, sha} from './check.mjs';

const main={name:'studio-proof-deployer', address:'0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42'};
const file='PROOFS.json', code='contracts/SemanticMinimaxMixer.py';
const commit=process.argv[2];
assert(/^[a-f0-9]{40}$/.test(commit??''));
const p=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{network:'StudioNet',source_commit:commit,transactions:[],cases:{}};
assert.equal(p.source_commit,commit);
const save=()=>fs.writeFileSync(file,JSON.stringify(p,null,2)+'\n');
const readOnly=process.argv.includes('--read-only');
function send(args, signer, t) {
 return new Promise((resolve,reject)=>{
  const c=spawn(process.execPath,['scripts/run-cli.cjs',...args],{windowsHide:true,env:{...process.env,MIXER_TEST_ACCOUNT:signer.name},stdio:['ignore','pipe','pipe']});
  let buf='';c.stderr.resume();
  c.stdout.on('data',b=>{
   buf+=b;const lines=buf.split(/\r?\n/);buf=lines.pop();
   for(const line of lines) if(/^BROADCAST_HASH 0x[0-9a-f]{64}$/i.test(line)){t.hash=line.split(' ')[1];save();console.log(t.step,t.hash);}
  });
  c.on('error',reject);c.on('close',resolve);
 });
}
async function transaction(step,args,signer,expected='SUCCESS',message) {
 let t=p.transactions.find(t=>t.step===step);
 if(!t){
  assert(!readOnly,'Missing journal entry in read-only verification');
  const nonce=await rpc('eth_getTransactionCount',[signer.address,'latest']);
  assert.equal(await rpc('eth_getTransactionCount',[signer.address,'pending']),nonce);
  t={step,args,nonce,signer:signer.address,expected,...(message?{message}:{})};p.transactions.push(t);save();
  await send(args,signer,t);
 }
 assert.deepEqual(t.args,args);assert.equal(t.signer,signer.address);
 assert(t.hash,'Unknown broadcast outcome. Inspect history; do not rebroadcast.');
 try { t.receipt=await receipt(t.hash,expected,message); }
 catch(e) {
  const raw=await rpc('eth_getTransactionByHash',[t.hash]);
  t.observed={status:raw.status,consensus:raw.result_name,execution:raw.consensus_data?.leader_receipt?.find(x=>x.mode==='leader')?.execution_result};save();throw e;
 }
 save();assert.equal(t.receipt.committed,expected==='SUCCESS');console.log(step,t.receipt.status,t.receipt.execution);
 const native=await rpc('eth_getTransactionByHash',[t.hash]);
 assert.equal(native.from_address.toLowerCase(),signer.address.toLowerCase());assert.equal(BigInt(native.nonce),BigInt(t.nonce));assert.equal(BigInt(native.value),0n);
 return t.receipt.address;
}
assert.equal(await rpc('eth_chainId',[]),'0xf22f');
p.address=await transaction('deploy',['deploy','--contract',code],main);
p.source=await source(p.address);save();
const policy='semantic-minimax-mixer-v1';
const cases=[
 {name:'balanced',labels:['PASS','FAIL','FAIL','PASS'],status:'GUARANTEED',lower:1,upper:1},
 {name:'uncertain',labels:['PASS','FAIL','FAIL','UNKNOWN'],status:'UNRESOLVED',lower:0,upper:1},
];

function checkCertificate(c, matrix, value) {
 assert.deepEqual(c.matrix,matrix);
 assert.equal(c.denominator,2);assert.equal(c.value_numerator,value);
 const [a,b,d,e]=matrix,[p,q]=c.row_mix,[x,y]=c.column_mix;
 for(const n of [p,q,x,y])assert(Number.isInteger(n)&&n>=0&&n<=2);
 assert.equal(p+q,2);assert.equal(x+y,2);
 assert.deepEqual(c.row_against_columns,[p*a+q*d,p*b+q*e]);
 assert.deepEqual(c.column_against_rows,[x*a+y*b,x*d+y*e]);
 assert.equal(Math.min(...c.row_against_columns),value);
 assert.equal(Math.max(...c.column_against_rows),value);
}

let first;
for(const f of cases){
 const path='examples/'+f.name+'.json';
 const bytes=execFileSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),'show',commit+':'+path]);
 const coordinate='Al1ranger/semantic-minimax-mixer/'+commit+'/'+path;
 const hash=sha(bytes),args=['write',p.address,'analyze','--args',f.name,coordinate,hash];
 first??=args;
 assert.equal(await transaction(f.name,args,main),p.address);
 const id=digest({author:main.address,contract:p.address,nonce:f.name});
 const report=await read(p.address,'get_report',[id]);p.cases[f.name]=report;save();
 assert.deepEqual(report.spec,{policy,id,author:main.address,contract:p.address,nonce:f.name,
  url:'https://raw.githubusercontent.com/'+coordinate,sha256:hash});
 assert.equal(report.body,bytes.toString('utf8'));assert.deepEqual(report.scenario,JSON.parse(report.body));
 assert.deepEqual(report.labels,f.labels,'Unexpected interpretation retained in journal');
 assert.equal(report.status,f.status);assert.equal(report.target_numerator,1);
 const {root,...preimage}=report;assert.equal(root,digest(preimage));
 checkCertificate(report.lower,f.labels.map(x=>Number(x==='PASS')),f.lower);
 checkCertificate(report.upper,f.labels.map(x=>Number(x!=='FAIL')),f.upper);
 assert.deepEqual(await read(p.address,'decision',[id,root]),{
  status:f.status,guaranteed_row_mix:report.lower.row_mix,lower:f.lower,upper:f.upper,denominator:2,root});
 assert(await denied(p.address,'decision',[id,'wrong-root']));
 console.log(f.name,report.status,'half units',f.lower,f.upper);
}
assert.equal(await transaction('replay',first,main,'ERROR','Report already published'),p.address);
const history=await rpc('sim_getTransactionsForAddress',[p.address]);
assert.deepEqual(history.map(t=>t.hash).sort(),p.transactions.map(t=>t.hash).sort());
p.verified=true;save();
console.log('Four finalized receipts, exact source, two primal/dual readbacks, and two root mismatch rejections verified.');
