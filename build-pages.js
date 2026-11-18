// Builds the inner pages (articles.html, article.html, gallery.html) from dj-rivka.html, so they carry the same
// fonts, styles, header and footer as the home page. Run after changing the header or footer:  node build-pages.js
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const home = fs.readFileSync(path.join(dir, 'dj-rivka.html'), 'utf8');

const fonts = home.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const style = home.slice(home.indexOf('<style>'), home.indexOf('</style>') + 8);
// the header, its in-page links pointed back at the home page
const header = home.slice(home.indexOf('<header class="top"'), home.indexOf('</header>') + 9)
  .replace(/href="#main"/g, 'href="dj-rivka.html"')
  .replace(/href="#([a-z-]+)"/g, 'href="dj-rivka.html#$1"')
  .replace('<header class="top"', '<header class="top solid"');
const footer = home.slice(home.indexOf('<footer class="foot">'), home.indexOf('</footer>') + 9);
const WA = 'https://wa.me/972504126679?text=' + encodeURIComponent('היי רבקה, הגעתי מהאתר ואשמח לדבר על בת מצווה.');
const ARROW = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';
const BACK = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';

function share(title, desc, url, img, type) {
  return '<link rel="canonical" href="' + url + '">\n<meta property="og:type" content="' + (type || 'website') + '">\n<meta property="og:locale" content="he_IL">\n<meta property="og:site_name" content="DJ Rivka">\n' +
    '<meta property="og:title" content="' + title + '">\n<meta property="og:description" content="' + desc + '">\n<meta property="og:url" content="' + url + '">\n' +
    '<meta property="og:image" content="' + (img || 'public/img/dj-rivka-share.jpg') + '">\n<meta name="twitter:card" content="summary_large_image">\n';
}
function page(title, desc, body, scripts) {
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
${desc ? share(title, desc, /גלריה/.test(title) ? 'gallery.html' : 'articles.html') : ''}
<meta name="theme-color" content="#0b060e">
<link rel="icon" type="image/png" sizes="32x32" href="public/img/icon-32.png">
<link rel="icon" type="image/png" sizes="512x512" href="public/img/icon-512.png">
<link rel="apple-touch-icon" href="public/img/icon-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<!-- built by build-pages.js from dj-rivka.html: do not edit the header, footer or shared styles here -->
${style}
<link rel="stylesheet" href="pages.css">
</head>
<body class="inner">
${header.replace(/href="https:\/\/wa\.me\/972504126679"/g, `href="${WA}" target="_blank" rel="noopener"`)}
<main id="main">
${body}
</main>
${footer.replace(/href="https:\/\/wa\.me\/972504126679"/g, `href="${WA}" target="_blank" rel="noopener"`)}
<script src="edits.js"></script>
<script src="edits-apply.js"></script>
${scripts}
${formJs}
<script src="reveal.js"></script>
</body>
</html>
`;
}

// the call to action on the inner pages is the home page's contact box with its form (same look, same behaviour)
const contact = home.slice(home.indexOf('<section class="contact sec"'), home.indexOf('</section>', home.indexOf('<section class="contact sec"')) + 10);
const formJs = '<script>\n' + home.slice(home.indexOf("  var form = document.getElementById('form')"), home.indexOf('  });', home.indexOf("  var form = document.getElementById('form')")) + 6) + '\n</script>';
const cta0 = `<section class="page" style="padding-bottom:var(--sec-y)"><div class="letter" style="text-align:center">
  <p class="hi">מתכננת בת מצווה? בואי נדבר.</p>
  <p class="small" style="margin:0 auto 22px;max-width:52ch;font-size:var(--t-body)">ספרי לי קצת על האירוע שאת חולמת עליו, ואחזור אלייך לשיחה אישית, כדי שנחשוב יחד איך להפוך אותו לחגיגה שמחה.</p>
  <a class="btn btn-main" href="${WA}" target="_blank" rel="noopener">כתבי לי בוואטסאפ</a>
</div></section>`;

// ---- all articles ----
fs.writeFileSync(path.join(dir, 'articles.html'), page('מאמרים · DJ Rivka', 'טיפים, רעיונות והשראה לתכנון בת מצווה, מאת רבקה ניאזוב, DJ Rivka.', `
<div class="page">
  <nav class="crumbs" aria-label="מיקום באתר"><a href="dj-rivka.html">דף הבית</a><span aria-hidden="true">/</span><span>מאמרים</span></nav>
  <div class="arch-head">
    <h1>רגע לפני שהאירוע מתחיל...</h1>
    <p>טיפים, רעיונות והשראה שיעזרו לך לתכנן בת מצווה ואירוע בדיוק כמו שדמיינת.</p>
    <a class="btn btn-ghost" href="dj-rivka.html">${BACK}חזרה לעמוד הבית</a>
  </div>
  <div class="arch"><div class="cards" id="all-cards"></div></div>
</div>
${contact}`, '<script src="articles-data.js"></script>\n<script src="articles.js"></script>'));

// ---- one article ----
const SHARE_WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8z"/></svg>';
fs.writeFileSync(path.join(dir, 'article.html'), page('מאמר · DJ Rivka', '', `
<div class="progress" aria-hidden="true"></div>
<div class="page" id="article">
  <nav class="crumbs" aria-label="מיקום באתר"><a href="dj-rivka.html">דף הבית</a><span aria-hidden="true">/</span><a href="articles.html">מאמרים</a><span aria-hidden="true">/</span><span id="a-crumb"></span></nav>
  <div class="art-top"><h1 id="a-title"></h1><p class="sub" id="a-sub"></p></div>
  <figure class="art-hero"><img id="a-img" src="" alt="" width="1296" height="474"></figure>
  <div class="art-grid">
    <article class="art-body"><div id="a-body"></div><a class="next" id="a-next" href="#"><div><small>המאמר הבא</small><b id="a-next-t"></b><span class="go">להמשך קריאה ${ARROW}</span></div><img id="a-next-img" src="" alt=""></a></article>
    <aside class="art-side" aria-label="ניווט במאמר">
      <div class="side-in">
        <nav class="toc" aria-labelledby="toc-t"><p class="side-t" id="toc-t">תוכן עניינים:</p><ol id="a-toc"></ol></nav>
        <div class="share"><p class="side-t">לשיתוף המאמר</p><div class="row">
          <a id="sh-wa" href="#" target="_blank" rel="noopener" aria-label="שיתוף בוואטסאפ">${SHARE_WA}</a>
          <a id="sh-fb" href="#" target="_blank" rel="noopener" aria-label="שיתוף בפייסבוק"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6a22 22 0 0 0-2.4-.1C12.2 2.5 10.6 4 10.6 6.6v1.9H8V12h2.6v9.5H14V12h2.7l.4-3.5H14Z"/></svg></a>
          <button type="button" id="sh-copy" aria-label="העתקת הקישור"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg></button>
        </div><p class="note" id="sh-note" role="status" aria-live="polite"></p></div>
        <div class="side-end"><a class="btn btn-ghost" href="articles.html">${BACK}חזרה לעמוד המאמרים</a><p class="now" id="a-now"></p></div>
      </div>
    </aside>
  </div>
  <section class="more" id="a-more" aria-labelledby="more-t"><h2 id="more-t">עוד מאמרים</h2><div class="cards"></div></section>
</div>
${contact}`, '<script src="articles-data.js"></script>\n<script src="articles.js"></script>'));

// ---- full gallery ----
fs.writeFileSync(path.join(dir, 'gallery.html'), page('גלריה · DJ Rivka', 'רגעים מאירועי בת מצווה ואירועי נשים עם רבקה ניאזוב, DJ Rivka.', `
<div class="page">
  <nav class="crumbs" aria-label="מיקום באתר"><a href="dj-rivka.html">דף הבית</a><span aria-hidden="true">/</span><span>גלריה</span></nav>
  <div class="arch-head">
    <h1>רגעים שעושים את האירוע.</h1>
    <p>הצצה קטנה לאווירה, למוזיקה ולשמחה שאני מביאה איתי לכל אירוע.</p>
    <a class="btn btn-ghost" href="dj-rivka.html">${BACK}חזרה לעמוד הבית</a>
  </div>
  <div class="gal-grid" id="gal-grid"></div>
</div>
<dialog class="view-dlg" id="view-dlg" aria-label="צפייה"><button class="x" type="button" aria-label="סגירה"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div id="view-in"></div></dialog>
${contact}`, `<script>
/* the full gallery: every video and photo; a click opens it large (videos with sound) */
(function () {
  var P = 'public/gallery/', items = [];
  for (var i = 1; i <= 16; i++) { var id = 'bat-mitzvah-event-' + (i < 10 ? '0' : '') + i; items.push({ v: P + id + '.mp4', img: P + id + '.jpg', alt: 'DJ רבקה ניאזוב באירוע בת מצווה, סרטון ' + i }); }
  for (var k = 1; k <= 5; k++) items.splice(k * 3, 0, { img: P + 'bat-mitzvah-photo-' + k + '.jpg', alt: 'רחבת ריקודים באירוע בת מצווה עם DJ רבקה, תמונה ' + k });
  var grid = document.getElementById('gal-grid'), dlg = document.getElementById('view-dlg'), box = document.getElementById('view-in');
  grid.innerHTML = items.map(function (it, n) {
    return '<button class="gal-item" type="button" data-n="' + n + '" aria-label="' + it.alt + (it.v ? ', הפעלה' : ', הגדלה') + '"><img src="' + it.img + '" alt="" loading="lazy">' +
      (it.v ? '<span class="play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>' : '') + '</button>';
  }).join('');
  grid.addEventListener('click', function (e) { var b = e.target.closest('.gal-item'); if (!b) return; var it = items[+b.dataset.n];
    box.innerHTML = it.v ? '<video src="' + it.v + '" poster="' + it.img + '" controls autoplay playsinline></video>' : '<img src="' + it.img + '" alt="' + it.alt + '">';
    dlg.classList.toggle('wide', !it.v); dlg.showModal(); });
  dlg.querySelector('.x').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { box.innerHTML = ''; });
})();
</script>`));


// static article pages: article-<slug>.html with the full text in the HTML (readable without JavaScript and by search engines),
// its own title, description, share tags and Article data. The template article.html is not published.
const vm = require('vm'); const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(dir, 'articles-data.js'), 'utf8'), ctx);
const all = ctx.window.RIVKA_ARTICLES, tpl = fs.readFileSync(path.join(dir, 'article.html'), 'utf8');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
for (const a of all) {
  const url = 'article-' + a.slug + '.html', body = a.sections.map((s, i) => '<section id="s' + (i + 1) + '"><h2><span class="num">' + (i + 1) + '.</span>' + esc(s.h) + '</h2>' + s.p.map((p) => '<p>' + esc(p) + '</p>').join('') + '</section>').join('');
  const toc = a.sections.map((s, i) => '<li><a href="#s' + (i + 1) + '">' + esc(s.h) + '</a></li>').join('');
  const ld = [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, image: a.img, inLanguage: 'he', author: { '@type': 'Person', name: 'רבקה ניאזוב' }, publisher: { '@type': 'Organization', name: 'DJ Rivka', logo: { '@type': 'ImageObject', url: 'public/img/dj-rivka-logo.webp' } }, mainEntityOfPage: url },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'דף הבית', item: './' }, { '@type': 'ListItem', position: 2, name: 'מאמרים', item: 'articles.html' }, { '@type': 'ListItem', position: 3, name: a.title, item: url }] }];
  let p = tpl.replace('<title>מאמר · DJ Rivka</title>', '<title>' + esc(a.title) + ' · DJ Rivka</title>')
    .replace('<meta name="description" content="">', '<meta name="description" content="' + esc(a.desc) + '">\n' + share(a.title + ' · DJ Rivka', a.desc, url, a.img, 'article') + '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>')
    .replace('<body class="inner">', '<body class="inner" data-article="' + a.id + '">')
    .replace('<span id="a-crumb"></span>', '<span id="a-crumb">' + esc(a.title) + '</span>')
    .replace('<h1 id="a-title"></h1>', '<h1 id="a-title">' + esc(a.title) + '</h1>')
    .replace('<p class="sub" id="a-sub"></p>', '<p class="sub" id="a-sub">' + esc(a.teaser) + '</p>')
    .replace('<img id="a-img" src="" alt=""', '<img id="a-img" src="' + a.img + '" alt="' + esc(a.title) + '"')
    .replace('<div id="a-body"></div>', '<div id="a-body">' + body + '</div>')
    .replace('<ol id="a-toc"></ol>', '<ol id="a-toc">' + toc + '</ol>');
  fs.writeFileSync(path.join(dir, url), p);
}
fs.unlinkSync(path.join(dir, 'article.html'));
console.log('built articles.html, gallery.html and ' + all.length + ' article pages');
