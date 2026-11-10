import fs from 'node:fs';
import assert from 'node:assert/strict';

const p=JSON.parse(fs.readFileSync('PROOFS.json','utf8'));
assert(p.verified&&p.source.source_match);
assert.equal(p.transactions.length,4);
assert.equal(p.transactions.filter(t=>t.receipt.committed).length,3);
const repo='https://github.com/Al1ranger/semantic-minimax-mixer';
const explorer='https://explorer-studio.genlayer.com';
const contract=explorer+'/address/'+p.address;
const title='SemanticMinimaxMixer — Exact Mixed Strategy Bounds from Text';
const description='SemanticMinimaxMixer analyzes a simultaneous 2×2 game with written matchups. The leader and each validator independently fetch the full commit-pinned scenario, verify its SHA-256, and judge all four outcomes against the same criterion. The complete report must match exactly.\n\nUnknown outcomes become 0 in the pessimistic matrix and 1 in the optimistic matrix. The contract computes both minimax values with exact half-unit arithmetic. Each bound includes row and column mixtures and their payoffs against both pure choices. Public reads bind the report root.\n\nIn StudioNet, the balanced scenario achieved an exact worst-case value of 1/2 through equal mixing. With one outcome unspecified, the interval widened to [0, 1/2] and the target decision became UNRESOLVED. These results apply to the hypothetical matchup model.';
assert(title.length<=80&&description.length<=1000);
const tx=t=>explorer+'/tx/'+t.hash;
const lines=['# StudioNet proofs','',
 '[Contract and deployed source]('+contract+')','',
 'Normalized source SHA-256 `'+p.source.sha256+'`','',
 '[Pinned source and fixtures]('+repo+'/tree/'+p.source_commit+')','',
 '| Step | Finality | Execution | Consensus | Agree / disagree / idle |',
 '|---|---|---|---|---|',
 ...p.transactions.map(t=>'| ['+t.step+']('+tx(t)+') | '+t.receipt.status+' | '+t.receipt.execution+' | '+t.receipt.consensus+' | '+t.receipt.agree_votes+' / '+t.receipt.disagree_votes+' / '+t.receipt.idle_votes+' |'),'',
 '| Scenario | Labels (row-major) | Lower / upper value | Lower row mix | Upper row mix | Target decision |',
 '|---|---|---|---|---|---|',
 ...Object.entries(p.cases).map(([name,r])=>'| ['+name+']('+repo+'/blob/'+p.source_commit+'/examples/'+name+'.json) | '+r.labels.join(', ')+' | '+r.lower.value_numerator+'/2, '+r.upper.value_numerator+'/2 | '+r.lower.row_mix.join(':')+' | '+r.upper.row_mix.join(':')+' | '+r.status+' |'),'',
 'The verifier checked exact fixture bytes and report roots, both strategies and their payoff inequalities, two bound decisions, two mismatched root rejections, and the full contract transaction history. [Machine-readable results](PROOFS.json).',''];
fs.writeFileSync('LIVE_PROOFS.md',lines.join('\n'));
const evidence=[['GitHub repository',repo],['Pinned contract source',repo+'/blob/'+p.source_commit+'/contracts/SemanticMinimaxMixer.py'],
 ['StudioNet contract',contract],['Proof matrix',repo+'/blob/main/LIVE_PROOFS.md'],
 ...p.transactions.map(t=>[t.step,tx(t)])];
fs.writeFileSync('SUBMISSION.md',['Contribution type **Builder → Intelligent Contracts**','',title,'',description,'','Evidence','',...evidence.map(([label,url])=>'- ['+label+']('+url+')'),''].join('\n'));
