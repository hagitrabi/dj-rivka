/* Fills the articles pages from RIVKA_ARTICLES (articles-data.js).
   article.html?a=a1 shows one article: the contents list is built from its headings, follows the reading
   and jumps to a heading on click; share and back buttons; a reading bar under the header.
   articles.html shows every article as a card. */
(function () {
  var list = window.RIVKA_ARTICLES || [];
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6"/></svg>';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var card = function (a) {
    return '<a class="acard" href="article.html?a=' + a.id + '"><span class="pic"><img src="' + a.img + '" alt="" loading="lazy" style="object-position:' + (a.pos || '50% 30%') + '"></span>' +
      '<span class="row"><span class="t">' + esc(a.title) + '</span><span class="ar">' + ARROW + '</span></span></a>';
  };

  /* all-articles page */
  var grid = document.getElementById('all-cards');
  if (grid) { grid.innerHTML = list.map(card).join(''); return; }

  /* one article */
  var root = document.getElementById('article'); if (!root) return;
  var id = new URLSearchParams(location.search).get('a');
  var art = list.filter(function (x) { return x.id === id; })[0];
  if (!art) { location.replace('articles.html'); return; }
  document.title = art.title + ' · DJ Rivka';
  var md = document.querySelector('meta[name=description]'); if (md) md.content = art.teaser;

  document.getElementById('a-title').textContent = art.title;
  document.getElementById('a-sub').textContent = art.teaser;
  var hero = document.getElementById('a-img'); hero.src = art.img; hero.style.objectPosition = art.pos || '50% 30%';
  document.getElementById('a-now').textContent = art.title;
  document.getElementById('a-crumb').textContent = art.title;
  /* the next article (after the last one it goes back to the first) */
  var idx = list.indexOf(art), nx = list[(idx + 1) % list.length], nextA = document.getElementById('a-next');
  if (list.length > 1) { nextA.href = 'article.html?a=' + nx.id; document.getElementById('a-next-t').textContent = nx.title; var ni = document.getElementById('a-next-img'); ni.src = nx.img; ni.style.objectPosition = nx.pos || '50% 30%'; } else nextA.remove();

  var body = document.getElementById('a-body'), toc = document.getElementById('a-toc');
  body.innerHTML = (art.intro ? '<p class="lead">' + esc(art.intro) + '</p>' : '') + art.sections.map(function (s, i) {
    return '<section id="s' + (i + 1) + '" aria-labelledby="h' + (i + 1) + '"><h2 id="h' + (i + 1) + '"><span class="num">' + (i + 1) + '.</span>' + esc(s.h) + '</h2>' +
      s.p.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</section>';
  }).join('');
  toc.innerHTML = art.sections.map(function (s, i) { return '<li><a href="#s' + (i + 1) + '">' + esc(s.h) + '</a></li>'; }).join('');

  /* share */
  var url = location.href.split('#')[0], text = art.title + '\n' + url;
  document.getElementById('sh-wa').href = 'https://wa.me/?text=' + encodeURIComponent(text);
  document.getElementById('sh-fb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
  var note = document.getElementById('sh-note');
  document.getElementById('sh-copy').addEventListener('click', function () {
    var done = function () { note.textContent = 'הקישור הועתק'; setTimeout(function () { note.textContent = ''; }, 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  /* more articles: every other article */
  var more = document.getElementById('a-more'), others = list.filter(function (x) { return x.id !== art.id; });
  if (others.length) { more.querySelector('.cards').innerHTML = others.slice(0, 3).map(card).join(''); if (others.length >= 3) more.querySelector('.cards').classList.add('three'); }
  else more.remove();

  /* the contents list follows the reading; the bar under the header shows how far she has read */
  var links = [].slice.call(toc.querySelectorAll('a')), secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var bar = document.querySelector('.progress'), ticking = false;
  function update() {
    ticking = false;
    var line = innerHeight * 0.35, cur = 0;
    secs.forEach(function (s, i) { if (s.getBoundingClientRect().top - line <= 0) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    var r = body.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  links.forEach(function (a) { a.addEventListener('click', function () { history.replaceState(null, '', a.getAttribute('href')); }); });
  update();
})();
