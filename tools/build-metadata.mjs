/* Generate homepage metadata from the same approved JSON as the visible profile. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const docs=new URL('../docs/',import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,docs),'utf8'));
const [profile,contact,links,languages]=await Promise.all(['assets/data/cv/profile.json','assets/data/cv/contact.json','assets/data/cv/links.json','assets/data/cv/languages.json'].map(json));
const origin=`https://${profile.identity.domain}/`;
const title=`${profile.identity.displayName} · ${profile.headline}`;
const portrait=new URL(profile.portrait.src,origin).href;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const publicText=value=>escape(value).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,email=>`<a href="mailto:${email}">${email}</a>`);
let html=await readFile(new URL('index.html',docs),'utf8');
function meta(attribute,key,value) {
  const pattern=new RegExp(`<meta ${attribute}="${key}"[^>]*>`,'g');
  const tag=`<meta ${attribute}="${key}" content="${escape(value)}" />`;
  html=pattern.test(html)?html.replace(pattern,tag):html.replace('</head>',`    ${tag}\n  </head>`);
}
meta('name','description',profile.summary);
for(const [key,value] of Object.entries({title,description:profile.summary,type:'website',url:origin,image:portrait,'image:alt':profile.portrait.alt}))meta('property',`og:${key}`,value);
meta('name','twitter:card','summary_large_image');
meta('name','twitter:image',portrait);
html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`);
html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${origin}" />`);
const person={'@context':'https://schema.org','@type':'Person','@id':origin+'#person',name:profile.identity.displayName,alternateName:profile.identity.legalName,url:origin,image:{'@type':'ImageObject',contentUrl:portrait,caption:profile.portrait.alt},jobTitle:profile.headline,description:profile.summary,email:contact.primaryEmail.value,sameAs:links.items.map(l=>l.href).filter(h=>h?.startsWith('https:')&&h!==origin&&h!==origin.slice(0,-1))};
person.knowsLanguage=languages.items.map(item=>item.language);
html=html.replace(/(<script type="application\/ld\+json" id="cv-schema">)[\s\S]*?(<\/script>)/,`$1\n${JSON.stringify(person,null,2).replace(/</g,'\\u003c')}\n    $2`);
await writeFile(new URL('index.html',docs),html);
console.log('Generated initial profile metadata from approved JSON.');
const privacy=await json('assets/data/cv/privacy.json');
await mkdir(new URL('privacy/',docs),{recursive:true});
await writeFile(new URL('privacy/index.html',docs),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(privacy.title)} · Artan Davoodi</title><meta name="description" content="Privacy information for Artan.live and your data-protection choices."><link rel="canonical" href="${origin}privacy/"><link rel="icon" href="/assets/brand/logo/symbol-artan.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/css/core/00-orchestrator/style.css?v=public-info-1"><script src="/assets/js/core/app.js?v=3" type="module" defer></script></head>
<body class="cv-site" data-page="privacy"><div data-fragment="navigation"></div><main class="cv-main" id="main-content"><section class="cv-page cv-page--article"><article class="cv-article"><header class="cv-article__header"><h1>${escape(privacy.title)}</h1><p class="publication-meta"><span>Effective date: <time datetime="${escape(privacy.effectiveDate)}">${escape(privacy.effectiveDate)}</time></span><span>Last updated: <time datetime="${escape(privacy.lastUpdated)}">${escape(privacy.lastUpdated)}</time></span></p></header><div class="cv-article__body">${privacy.sections.map(section=>`<section><h2>${escape(section.title)}</h2><p>${publicText(section.text)}</p></section>`).join('')}</div></article></section><div data-fragment="footer"></div></main></body></html>\n`);
