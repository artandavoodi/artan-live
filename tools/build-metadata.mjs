/* Generate homepage metadata from the same approved JSON as the visible profile. */
import {readFile,writeFile} from 'node:fs/promises';
const docs=new URL('../docs/',import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,docs),'utf8'));
const [profile,contact,links,languages]=await Promise.all(['assets/data/cv/profile.json','assets/data/cv/contact.json','assets/data/cv/links.json','assets/data/cv/languages.json'].map(json));
const origin=`https://${profile.identity.domain}/`;
const title=`${profile.identity.displayName} · ${profile.headline}`;
const portrait=new URL(profile.portrait.src,origin).href;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
