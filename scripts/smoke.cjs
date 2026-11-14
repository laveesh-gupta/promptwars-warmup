/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS hooks compile app TypeScript in memory. */
// Opt-in live check. Uses only fictional built-in readings; never prints credentials.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname,'..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name,...args) { return resolve.call(this,name.startsWith('@/')?path.join(root,'src',name.slice(2)):name,...args); };
require.extensions['.ts'] = (module,filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
process.loadEnvFile(path.join(root,'.env.local'));
const { POST } = require('../src/app/api/generate/route.ts');
const { DEFAULT_CONTEXT: context } = require('../src/lib/air/types.ts');
const { SAMPLE_ONE } = require('../src/lib/air/sample.ts');
(async()=>{
 const call=body=>POST(new Request('http://localhost/api/generate',{method:'POST',body:JSON.stringify(body)}));
 const normalized=await call({operation:'normalize',context,text:SAMPLE_ONE,label:'Fictional smoke test'});
 const data=await normalized.json();
 if(!normalized.ok){console.log('Normalization:',data.error.code,data.error.message);process.exitCode=1;return;}
 console.log('Live normalization: OK;',data.dataset.observations.length,'observations');
 const response=await call({operation:'brief',context,dataset:data.dataset});
 const result=await response.json();
 if(!response.ok){console.log('Brief:',result.error.code,result.error.message);process.exitCode=1;return;}
 console.log('Live briefing: OK;',result.metrics.length,'metrics;',result.narrative.actions.length,'validated actions');
})().catch(()=>{console.error('Live smoke test failed. Check network and environment.');process.exitCode=1;});
