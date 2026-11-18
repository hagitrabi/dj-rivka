// Publishes the latest site to GitHub, and so to https://hagitrabi.github.io/dj-rivka/.
//   node publish.js "what changed"          preview: hidden from search engines (noindex + robots.txt)
//   node publish.js "what changed" --live   real launch: open to search engines
// What it does: rebuilds the inner pages; copies only the current site files; makes the home page the site's main address
// (index.html, with dj-rivka.html sending old links there); turns share and canonical addresses into full links
// (needed for the WhatsApp/Facebook preview); writes sitemap.xml and robots.txt; stamps local file links with ?v=
// so phones load the new files; commits and pushes.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const BASE = 'https://hagitrabi.github.io/dj-rivka/';
const src = __dirname, dest = path.resolve(src, '../גרסה לאתר החי (גיטהב)');
const msg = process.argv[2] || 'Update the site', live = process.argv.includes('--live');

execSync('node build-pages.js', { cwd: src, stdio: 'inherit' });
const pages = fs.readdirSync(src).filter((f) => /^(dj-rivka|articles|gallery|article-[\w-]+)\.html$/.test(f));
const assets = ['articles-data.js', 'articles.js', 'pages.css', 'reveal.js', 'edits.js', 'edits-apply.js', 'build-pages.js', 'publish.js'];
// pages that no longer exist in the source leave the published copy too
for (const f of fs.readdirSync(dest)) if (f.endsWith('.html') && f !== 'index.html' && !pages.includes(f)) fs.unlinkSync(path.join(dest, f));
for (const f of [...pages, ...assets]) fs.copyFileSync(path.join(src, f), path.join(dest, f));
fs.rmSync(path.join(dest, 'public'), { recursive: true, force: true });
fs.cpSync(path.join(src, 'public'), path.join(dest, 'public'), { recursive: true });
fs.copyFileSync(path.join(dest, 'dj-rivka.html'), path.join(dest, 'index.html'));

const v = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
const abs = (u) => (/^https?:/.test(u) ? u : BASE + u.replace(/^\.\//, '').replace(/^dj-rivka\.html/, ''));
for (const f of fs.readdirSync(dest).filter((x) => x.endsWith('.html'))) {
  let s = fs.readFileSync(path.join(dest, f), 'utf8');
  s = s.replace(/<meta name="robots"[^>]*>\n?/g, '');
  if (!live) s = s.replace(/<meta charset="utf-8">/i, '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">');
  // links to the home page go to the site's main address
  s = s.replace(/href="dj-rivka\.html(#[^"]*)?"/g, (m, h) => `href="./${h || ''}"`);
  // full addresses for canonical, share tags and structured data
  s = s.replace(/(<link rel="canonical" href=")([^"]*)"/g, (m, a, u) => a + abs(u) + '"');
  s = s.replace(/(<meta property="og:(?:url|image)" content=")([^"]*)"/g, (m, a, u) => a + abs(u) + '"');
  s = s.replace(/<script type="application\/ld\+json">([^]*?)<\/script>/g, (m, j) => {
    const fix = (o) => { if (Array.isArray(o)) return o.map(fix); if (o && typeof o === 'object') { for (const k of Object.keys(o)) o[k] = ['url', 'image', 'logo', 'item', 'mainEntityOfPage', '@id'].includes(k) && typeof o[k] === 'string' ? (k === '@id' ? BASE + o[k] : abs(o[k])) : fix(o[k]); } return o; };
    return '<script type="application/ld+json">' + JSON.stringify(fix(JSON.parse(j))) + '</script>';
  });
  // local file links get a version so phones load the new files
  s = s.replace(/((?:src|href)=")((?!https?:|mailto:|tel:|#|data:|\.\/)[^"?#]+\.(?:js|css|png|jpg|webp|mp4|html))(?:\?v=\d+)?"/g, `$1$2?v=${v}"`);
  if (f === 'dj-rivka.html') s = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="${BASE}"><meta http-equiv="refresh" content="0; url=./"><title>DJ Rivka</title></head><body><a href="./">DJ Rivka</a></body></html>\n`;
  fs.writeFileSync(path.join(dest, f), s);
}
// sitemap and robots
const urls = ['', ...pages.filter((p) => p !== 'dj-rivka.html')];
fs.writeFileSync(path.join(dest, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${BASE}${u}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dest, 'robots.txt'), live ? `User-agent: *\nAllow: /\nSitemap: ${BASE}sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');

const run = (c) => execSync(c, { cwd: dest, stdio: 'inherit' });
run('git add -A');
try { run(`git commit -q -m "${msg.replace(/"/g, "'")}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`); } catch { console.log('nothing new to publish'); }
run('git push -q');
console.log((live ? 'LIVE' : 'preview') + ' published, version ' + v + ' → ' + BASE + '?v=' + v);
