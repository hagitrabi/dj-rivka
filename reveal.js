/* Gentle entrance animations: each section's heading block and content rise softly into place the first time
   they come into view, one after the other. Sections with their own scroll animation (hero, mess, how it works) are left alone.
   Nothing is hidden when JavaScript is off or the visitor prefers less motion. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var css = document.createElement('style');
  css.textContent = '.rv{opacity:0;translate:0 26px;transition:opacity .8s cubic-bezier(.22,1,.36,1),translate .9s cubic-bezier(.22,1,.36,1)}.rv.rv-in{opacity:1;translate:0 0}';
  document.head.appendChild(css);
  var skip = '.hero,.mess,.how';
  var targets = [];
  [].forEach.call(document.querySelectorAll('main section, main > .page'), function (sec) {
    if (sec.matches(skip)) return;
    var wraps = sec.querySelectorAll(':scope > .wrap, :scope > .page, :scope > div.wrap');
    var groups = wraps.length ? wraps : [sec];
    [].forEach.call(groups, function (w) {
      [].forEach.call(w.children, function (el, i) {
        if (el.matches('dialog, script, template, .progress')) return;
        el.classList.add('rv'); el.style.transitionDelay = Math.min(i, 4) * 0.08 + 's'; targets.push(el);
      });
    });
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target);
      setTimeout(function () { e.target.style.transitionDelay = ''; }, 1400); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (t) { io.observe(t); });
})();
