import {execFileSync} from 'node:child_process';import {readFileSync} from 'node:fs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
if(git('remote','get-url','origin')!=='https://github.com/ThoBustos/smalldesign.git')throw Error('Use the canonical smalldesign repository.');
if(git('branch','--show-current')!=='main')throw Error('Production releases must use main.');
if(git('status','--porcelain','--untracked-files=no'))throw Error('Commit tracked source before releasing.');
const project=JSON.parse(readFileSync('.vercel/project.json','utf8'));if(project.projectId!=='prj_PY2GzBbVB3htDTijq5XheFo2bHhY')throw Error('Unexpected production project.');
execFileSync('npm',['run','build'],{stdio:'inherit'});execFileSync('npx',['--yes','vercel','deploy','--prod','--yes'],{stdio:'inherit'});
