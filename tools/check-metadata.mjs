import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const before=await read('docs/index.html');
execFileSync(process.execPath,['tools/build-metadata.mjs'],{cwd:root});
assert.equal(await read('docs/index.html'),before,'Homepage metadata requires regeneration');
const profile=JSON.parse(await read('docs/assets/data/cv/profile.json'));
const contact=JSON.parse(await read('docs/assets/data/cv/contact.json'));
const schema=JSON.parse(before.match(/id="cv-schema">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema.name,profile.identity.displayName);
assert.equal(schema.jobTitle,profile.headline);
assert.equal(schema.email,contact.primaryEmail.value);
const languages=JSON.parse(await read('docs/assets/data/cv/languages.json'));
assert.deepEqual(schema.knowsLanguage,languages.items.map(item=>item.language));
const renderer=await read('docs/assets/js/layers/site/cv.js');
const status=JSON.parse(await read('docs/assets/data/cv/status.json'));
assert.deepEqual(status.availability.headline,['Open to remote projects','Worldwide']);
assert.ok(status.availability.summary);
assert.match(renderer,/data\.status\.availability\.headline\.forEach/,'Availability wording must remain data-owned');
assert.match(renderer,/bindSectionReveal\('\.cv-page--availability','availabilityVisible',0\.45\)/);
const sections=[...before.matchAll(/<section class="cv-page[^\"]*" id="([^\"]+)"/g)].map(match=>match[1]);
assert.deepEqual(sections,['profile','availability','focus','work','record-label','details']);
const projects=JSON.parse(await read('docs/assets/data/cv/projects.json'));
const label=projects.items.find(project=>project.name==='Artan Records');
assert.equal(label.icon,'artan-records');
assert.ok(label.logo&&label.darkLogo,'Label wordmark must support both themes');
assert.ok(label.scope.some(item=>item.href==='https://docs.artanrecords.com/'));
const aliases=await read('docs/assets/css/core/01-tokens/source/artan-live.aliases.css');
assert.doesNotMatch(aliases,/--content-width-reading|--spacing-6xl/,'Layout aliases must use existing source tokens');
for(const name of ['Neuroartan','Artan Records']){
  assert.ok(projects.items.some(project=>project.name===name));
  assert.ok(before.includes(`data-cv-project="${name}"`));
}
assert.match(profile.subtitle,/Neuroartan and Artan Records/);
assert.doesNotMatch(renderer,/bindHeroStageReveal|addEventListener\('touchmove'/,'Touch scrolling must remain natural');
const revealSource=renderer.slice(renderer.indexOf('function bindSectionReveal('),renderer.indexOf('function bindFocusReveal('));
class Section { constructor(){this.dataset={};} }
const projectSections=[new Section(),new Section()];
const observed=[];
const revealContext=vm.createContext({HTMLElement:Section,document:{querySelectorAll:()=>projectSections},window:{IntersectionObserver:true},IntersectionObserver:class {
  constructor(callback){this.callback=callback;}
  observe(section){observed.push(section);this.callback([{isIntersecting:true}]);}
}});
vm.runInContext(revealSource+'\nbindSectionReveal(".cv-page--work","workVisible"); bindSectionReveal(".cv-page--work","workVisible");',revealContext);
assert.equal(observed.length,2,'Each project section must bind exactly once');
assert.ok(projectSections.every(section=>section.dataset.workVisible==='true'));
assert.doesNotMatch(renderer,/bindDesktopSections|addEventListener\('wheel'/,'Section scrolling must not be intercepted');
const footer=await read('docs/assets/fragments/footer.html');
assert.ok(footer.indexOf('Privacy notice')<footer.indexOf('cv-footer__copyright'),'Copyright must be last');
const experience=JSON.parse(await read('docs/assets/data/cv/experience.json'));
assert.ok(experience.items.some(item=>item.organization==='Artan Records'&&item.startDate==='2025'&&item.location.includes('Bremen')&&item.location.includes('Zagreb')));
const triggerSource=renderer.slice(renderer.indexOf('function renderDetailTriggers('),renderer.indexOf('function createRecordList('));
let visible=[];
const context={document:{querySelector:()=>({replaceChildren:(...items)=>{visible=items;}})},createDetailTrigger:trigger=>trigger.key};
vm.createContext(context);
vm.runInContext(triggerSource+'\nthis.render=renderDetailTriggers;',context);
context.render({languages});
assert.deepEqual(visible,['experience','certifications'],'Hidden language data must not become a visible detail action');
context.render({languages:{...languages,publish:true}});
assert.deepEqual(visible,['experience','certifications','languages'],'Language presentation remains available through its owning data');
assert.ok(schema.image.contentUrl.endsWith(profile.portrait.src.replace(/^\.\//,'')));
assert.ok(schema.sameAs.every(url=>url.startsWith('https://')));
console.log('PASS: initial profile metadata is deterministic and matches approved profile JSON.');
