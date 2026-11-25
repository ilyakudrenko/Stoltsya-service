import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { company, sections, catalogs, inquiryTopics } from '../src/content.mjs';

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const e = escape;
const sitePath = new URL(company.url).pathname;
const assetUrls = Object.fromEntries(await Promise.all(['style.css', 'catalog.js'].map(async (file) => {
  const revision = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
  return [file, `${file}?v=${revision}`];
})));
const phone = () => `<a class="phone" href="${company.tel}">${company.phone}</a>`;
const button = (url, label, type = '') => `<a class="button ${type}" href="${e(url)}">${e(label)}</a>`;
const contact = (topic, item = '') => `contacts/?topic=${encodeURIComponent(topic)}${item ? '&item=' + encodeURIComponent(item) : ''}#inquiry`;
const brand = `<a class="brand" href="./"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>СТОЛИЦЯ <b>&amp;</b> СЕРВІС<small>БУДІВЕЛЬНІ МАТЕРІАЛИ</small></span></a>`;
const responsiveWidths = {truck:1200, aggregate:1200, delivery:1200, yard:1200, loader:960};
function photo(file, alt, priority = false, thumbnail = false) {
  const width = responsiveWidths[file];
  const src = `assets/${file}${thumbnail ? '-480' : ''}.webp`;
  const responsive = width && !thumbnail
    ? ` srcset="assets/${file}-480.webp 480w, assets/${file}-760.webp 760w, ${src} ${width}w" sizes="(max-width: 760px) 100vw, (min-width: 1540px) 780px, 52vw"`
    : '';
  return `<img src="${src}"${responsive} alt="${e(alt)}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}
const imageFor = (item, priority = false, thumbnail = false) => photo(item.image, item.alt, priority, thumbnail);
const pageTitle = (title, intro, parent = '') => `<header class="page-title"><div class="wrap">${parent ? `<a class="crumb" href="${parent}/">${sections[parent].title}</a>` : ''}<h1>${e(title)}</h1><p>${e(intro)}</p></div></header>`;
const band = (title, text, topic, item) => `<section class="call-band"><div class="wrap"><div><h2>${e(title)}</h2><p>${e(text)}</p></div>${button(contact(topic,item),'Підготувати запит','accent')}</div></section>`;
const footerLinks = [['materials/','Матеріали'],['services/','Послуги'],['equipment/','Техніка'],['projects/','Проєкти'],['about/','Про компанію'],['careers/','Кар’єра'],['contacts/','Контакти'],['privacy/','Конфіденційність']];
const navLink = (url, label) => `<a href="${url}">${label}</a>`;
const menu = (key) => `<details class="dropdown"><summary>${sections[key].nav}</summary><div class="submenu">${navLink(key+'/', 'Увесь розділ')}${catalogs[key].map((item) => navLink(key+'/'+item.slug+'/',item.title)).join('')}</div></details>`;

function shell({route, title, description, body, image = 'truck', noindex = false}) {
  const canonical = company.url + route;
  const schema = route ? '' : `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Organization',name:company.name,url:company.url,telephone:'+380505110506',image:company.url+'assets/truck.webp'})}</script>`;
  return `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base href="${sitePath}"><title>${e(title)} | ${e(company.name)}</title>
<meta name="description" content="${e(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website"><meta property="og:locale" content="uk_UA">
<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${canonical}"><meta property="og:image" content="${company.url}assets/${image}.webp">
<link rel="icon" href="assets/favicon.png" type="image/png"><link rel="stylesheet" href="${assetUrls['style.css']}"><script src="${assetUrls['catalog.js']}" defer></script>${schema}
<noscript><style>@media(max-width:760px){#main-nav{display:grid}.menu-toggle{display:none}}</style></noscript></head><body>
<a class="skip" href="${canonical}#main">До основного вмісту</a>
<header class="site-header"><div class="wrap head-inner">${brand}
<a class="mobile-call" href="${company.tel}">Дзвінок</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Меню</button>
<nav id="main-nav" aria-label="Основна навігація">${['materials','services','equipment'].map(menu).join('')}${navLink('projects/','Проєкти')}${navLink('about/','Компанія')}${navLink('contacts/','Контакти')}</nav>
<div class="head-actions">${phone()}${button('contacts/#inquiry','Запит','accent')}</div>
</div></header>
<main id="main" tabindex="-1">${body}</main>
<footer class="site-footer"><div class="wrap footer-grid"><div>${brand}<p>Продаж будівельних матеріалів.<br>Доставка та самовивіз.</p></div>
<nav aria-label="Навігація в підвалі">${footerLinks.map(([url,label])=>navLink(url,label)).join('')}</nav>
<div><p>Замовлення та консультації</p>${phone()}</div></div></footer>
</body></html>\n`;
}

function list(key, items = catalogs[key], level = 3) {
  return `<div class="entry-list" ${key === 'materials' ? 'id="material-list"' : ''}>${items.map((item) => `<article class="entry" ${['services','equipment','projects'].includes(key) ? 'data-reveal' : ''} data-group="${item.group || ''}">
${item.image ? `<a class="entry-image ${['sand','asphalt','screenings'].includes(item.image) ? 'packaging' : ''}" href="${key}/${item.slug}/" tabindex="-1" aria-hidden="true">${imageFor(item,false,true)}</a>` : ''}
<div class="entry-text"><h${level}><a href="${key}/${item.slug}/">${item.title}</a></h${level}><p>${item.short}</p></div><a class="text-link" href="${key}/${item.slug}/" aria-label="${e('Детальніше: '+item.title)}">Детальніше</a>
</article>`).join('')}</div>`;
}

function materialCatalog(withSearch = false) {
  const items = catalogs.materials;
  const clay = items.find((item) => item.slug === 'expanded-clay');
  const heading = withSearch ? 2 : 3;
  return `<div class="material-catalog" data-catalog>
  <div class="catalog-controls" hidden>
    <div class="catalog-filters" role="group" aria-label="Категорії матеріалів">
      <button type="button" data-filter="" aria-pressed="true">Всі матеріали</button>
      <button type="button" data-filter="bulk" aria-pressed="false">Сипучі матеріали</button>
      <button type="button" data-filter="road" aria-pressed="false">Дорожні матеріали</button>
    </div>
${withSearch ? '    <label class="catalog-search">Пошук матеріалів<input type="search" placeholder="Наприклад, щебінь"></label>' : ''}
  </div>
  <div class="material-grid">${items.filter((item) => item !== clay).map((item) => `
    <article class="material-card" data-group="${item.group}" data-reveal>
      <div class="material-image ${item.slug === 'crushed-stone' ? 'material-image-cover' : ''}">${imageFor(item,false,true)}</div>
      <div class="material-body">
        <h${heading}><a href="materials/${item.slug}/">${item.title}</a></h${heading}>
        <p>${item.short}</p>
        <a class="material-quote" href="${e(contact('quote',item.title))}" aria-label="${e('Уточнити ціну: '+item.title)}">Уточнити ціну</a>
      </div>
    </article>`).join('')}</div>
  ${clay ? `<p class="catalog-note" data-group="${clay.group}"><a href="materials/${clay.slug}/">${clay.title}</a> також в асортименті. <a class="material-quote" href="${e(contact('quote',clay.title))}">Уточнити фасування</a></p>` : ''}
  <p class="catalog-status" role="status"></p>
</div>`;
}

const hero = `<section class="hero"><div class="wrap hero-layout">
<div class="hero-content"><p class="hero-kicker">ПРОДАЖ І ПОСТАЧАННЯ</p>
<h1>Будівельні матеріали з доставкою<span>.</span></h1>
<p>Пісок, щебінь, відсів, керамзит і холодний асфальт. У мішках і навалом, з доставкою або самовивозом.</p>
<div class="actions">${button('materials/','Переглянути матеріали','accent')}${button('services/delivery/','Умови доставки','outline')}</div></div>
<figure>${photo('truck','Вантажівка з краном-маніпулятором на майданчику',true)}</figure>
</div></section>`;

const directions = `<section class="wrap block"><div class="section-heading" data-reveal><h2>Напрями роботи</h2><p>Матеріали, постачання та техніка для вашого об’єкта.</p></div>
<div class="directions">${['materials','services','equipment'].map((key,index)=>`<a href="${key}/">${imageFor(sections[key])}<div><h3>${['Будівельні матеріали','Послуги','Спецтехніка'][index]}</h3><p>${['Сипучі матеріали та холодний асфальт','Доставка на об’єкт і самовивіз','Техніка для перевезення та завантаження'][index]}</p></div></a>`).join('')}</div></section>`;

const home = hero + directions + `<section class="overview"><div class="wrap editorial"><figure data-reveal="photo">${photo('yard','Навантажувач біля лінії фасування')}</figure><div><h2>Від фасування до відвантаження</h2><p>«Столиця &amp; Сервіс» продає будівельні матеріали у мішках і навалом. Можна замовити доставку або забрати погоджений обсяг самостійно.</p>${navLink('about/','Про компанію')}</div></div></section>
<section class="wrap block material-section"><div class="section-heading" data-reveal><h2>Каталог матеріалів</h2><p>Оберіть матеріал і зателефонуйте, щоб уточнити ціну та наявність.</p></div>${materialCatalog()}${button('materials/','Увесь каталог','line')}</section>
<section class="fleet"><div class="wrap editorial"><div><h2>Техніка для матеріалів</h2><p>Вантажівка з маніпулятором, самоскид і фронтальний навантажувач. Обговоріть задачу й уточніть можливість залучення техніки.</p>${button('equipment/','Переглянути техніку','outline')}</div><figure data-reveal="photo">${photo('delivery','Вантажівка з маніпулятором, вигляд збоку')}</figure></div></section>
<section class="wrap block"><div class="section-heading" data-reveal><h2>Доставка та самовивіз</h2><p>Заздалегідь погодьте обсяг і спосіб отримання.</p></div>${list('services')}</section>
<section class="overview"><div class="wrap editorial"><figure data-reveal="photo">${photo('loader','Ківш навантажувача над бункером')}</figure><div><h2>На майданчику</h2><p>Фото завантаження матеріалів і підготовки фасованого щебеню до відвантаження.</p>${navLink('projects/','Фото та портфоліо')}</div></div></section>
${band('Уточніть ціну та умови постачання','Вкажіть матеріал, потрібний обсяг і населений пункт.','quote')}`;

const topicBySection = {materials:'quote',services:'delivery',equipment:'equipment',projects:'construction'};

function detail(key,item) {
  const specs = item.specs ? `<dl class="specs">${item.specs.map(([name,value])=>`<div><dt>${name}</dt><dd>${value}</dd></div>`).join('')}</dl>` : '';
  const gallery = item.gallery ? `<section class="wrap block gallery-section"><h2>Фотографії</h2><div class="gallery">${item.gallery.map(([file,alt])=>`<a href="assets/${file}.webp" data-reveal="photo" aria-label="${e('Відкрити фото: '+alt)}">${photo(file,alt)}</a>`).join('')}</div></section>` : '';
  const notice = {materials:'Ціну, наявність і спосіб отримання уточнюйте перед замовленням.',equipment:'Умови залучення техніки узгоджуються окремо.',projects:'Фоторепортаж з майданчика.'}[key];
  const related = catalogs[key].filter((other)=>other.slug !== item.slug).slice(0,2);
  return pageTitle(item.title,item.short,key) + `<section class="wrap block detail-layout ${!item.image ? 'text-only' : ''}">${item.image ? `<figure class="${['sand','asphalt','screenings'].includes(item.image) ? 'packaging' : ''}">${imageFor(item,true)}</figure>` : ''}
<div><h2>${key === 'materials' ? 'Характеристики' : 'Опис'}</h2><p>${item.text}</p>${specs}${notice ? `<p class="notice">${notice}</p>` : ''}${button(contact(topicBySection[key],item.title),'Підготувати запит','accent')}</div></section>` + gallery + (related.length ? `<section class="wrap block"><h2>Також у розділі</h2>${list(key,related)}</section>` : '');
}

const contacts = pageTitle('Контакти','Зателефонуйте щодо матеріалів, доставки й самовивозу або підготуйте текст запиту.') + `<section class="wrap block contact-grid" id="inquiry">
<div><h2>Телефон</h2>${phone()}<p>Для розрахунку повідомте матеріал, кількість і адресу доставки. Адресу та час самовивозу погодьте телефоном.</p><p>${navLink('privacy/','Як обробляються дані')}</p></div>
<div><h2>Підготувати запит</h2><p>Сайт підготує текст. Надіслати його можна зі свого застосунку SMS або скопіювати для розмови.</p>
<noscript><p>Для підготовки тексту потрібен JavaScript. Ви також можете зателефонувати за номером, наведеним на цій сторінці.</p></noscript>
<form id="inquiry-form" hidden>
<label for="topic">Тема<select id="topic" name="topic">${Object.entries(inquiryTopics).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></label>
<div class="form-row"><label for="name">Ім’я<input id="name" name="name" required maxlength="80" autocomplete="name"></label>
<label for="phone">Ваш телефон<input id="phone" name="phone" type="tel" required maxlength="24" autocomplete="tel" inputmode="tel" placeholder="Наприклад, +380 50 123 45 67"></label></div>
<label for="message">Деталі запиту<textarea id="message" name="message" rows="4" maxlength="500"></textarea></label>
<button class="button accent" type="submit">Підготувати текст</button>
<p id="form-status" role="status"></p>
<div id="message-preview" hidden><label for="message-output">Текст повідомлення<textarea id="message-output" readonly rows="6"></textarea></label><div class="actions"><a class="button accent" id="open-sms" href="${company.sms}">Відкрити SMS</a><button class="button line" id="copy-text" type="button">Скопіювати текст</button></div></div>
</form></div></section>`;

const pages = [
  {route:'',title:'Будівельні матеріали з доставкою',description:'Річковий пісок, щебінь, відсів, керамзит і холодний асфальт. Доставка та самовивіз.',body:home},
  ...Object.entries(sections).flatMap(([key,section])=>[
    {route:key+'/',title:section.title,description:section.intro,image:section.image,body:pageTitle(section.title,section.intro)+`<section class="wrap block">${key === 'materials' ? materialCatalog(true) : list(key,catalogs[key],2)}</section>`+band('Обговорімо ваш запит','Підготуйте деталі або зателефонуйте, щоб уточнити умови.',topicBySection[key])},
    ...catalogs[key].map((item)=>({route:key+'/'+item.slug+'/',title:item.title,description:item.text,image:item.image,body:detail(key,item)})),
  ]),
  {route:'about/',title:'Про компанію',description:'Продаж сипучих матеріалів і холодного асфальту. Доставка та самовивіз.',body:pageTitle('Про компанію','«Столиця & Сервіс» продає будівельні матеріали в мішках і навалом.')+`<section class="wrap block editorial"><figure>${photo('yard','Майданчик завантаження матеріалів',true)}</figure><div><h2>Матеріали й отримання</h2><p>В асортименті — річковий пісок, щебінь, відсів, керамзит і холодний асфальт. Фракції та фасування, вказані на упаковках, наведено в каталозі.</p><p>Перед замовленням можна обговорити потрібний обсяг, доставку на об’єкт або самовивіз.</p>${button('materials/','Переглянути матеріали','line')}</div></section>`},
  {route:'careers/',title:'Кар’єра',description:'Контакти для запитів щодо працевлаштування.',body:pageTitle('Кар’єра','Запити щодо працевлаштування можна обговорити телефоном.')+`<section class="wrap block prose"><h2>Вакансії</h2><p>Наразі на сайті немає опублікованих вакансій. Якщо хочете уточнити можливості працевлаштування, підготуйте короткий запит із вашим досвідом і напрямом роботи.</p>${button(contact('career'),'Підготувати запит','accent')}</section>`},
  {route:'contacts/',title:'Контакти',description:'Телефон Столиця & Сервіс для замовлень та консультацій. Підготуйте запит щодо матеріалів, доставки або техніки.',body:contacts},
  {route:'privacy/',title:'Політика конфіденційності',description:'Як сайт працює з даними під час підготовки запиту.',body:pageTitle('Політика конфіденційності','Інформація про роботу форми й зовнішніх застосунків.')+`<section class="wrap block prose"><h2>Дані у формі</h2><p>Ім’я, телефон і деталі, які ви вводите, використовуються у вашому браузері для підготовки тексту. Форма не передає ці поля на сервер. Ви самі вирішуєте, чи копіювати текст і чи надсилати його через SMS.</p><h2>Зв’язок і хостинг</h2><p>Під час дзвінка чи надсилання SMS застосовуються умови вашого оператора або застосунку. Вебсайт розміщено на GitHub Pages. Інформацію про роботу хостингу з даними дивіться у <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">заяві GitHub про конфіденційність</a>.</p><h2>Запитання про дані</h2><p>Щодо даних, переданих під час спілкування з компанією, звертайтеся за номером ${phone()}.</p></section>`},
  {route:'404.html',title:'Сторінку не знайдено',description:'Поверніться на головну або перегляньте каталог будівельних матеріалів.',noindex:true,body:pageTitle('Сторінку не знайдено','Перевірте адресу або перейдіть до каталогу матеріалів.')+`<div class="wrap block actions">${button('./','На головну','accent')}${button('materials/','До каталогу','line')}</div>`},
];

for (const page of pages) {
  const file = page.route.endsWith('.html') ? page.route : page.route+'index.html';
  await mkdir(dirname(file), {recursive:true});
  await writeFile(file,shell(page));
}
await writeFile('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter(({noindex})=>!noindex).map(({route})=>`  <url><loc>${company.url+route}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('robots.txt',`User-agent: *\nAllow: /\nSitemap: ${company.url}sitemap.xml\n`);
console.log(`Built ${pages.length} pages.`);
