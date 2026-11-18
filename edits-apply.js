// Applies the saved editor changes to the page. Each element has its own values for the desktop and the phone layout.
(function () {
  var stackQ = matchMedia('(max-width:860px)'); // the same width where the page switches to its phone layout
  function mode() { return stackQ.matches ? 'mobile' : 'desktop'; }

  // headings keep only emphasis and line breaks; anything else becomes plain text
  function clean(html) {
    var t = document.createElement('template'); t.innerHTML = html == null ? '' : String(html);
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 8) { c.remove(); return; }
        if (c.nodeType !== 1) return;
        if (['EM', 'BR', 'B'].indexOf(c.tagName) < 0) { c.replaceWith(document.createTextNode(c.textContent)); return; }
        [].slice.call(c.attributes).forEach(function (a) { c.removeAttribute(a.name); });
        walk(c);
      });
    })(t.content);
    return t.innerHTML;
  }
  function textTarget(el) { return el.querySelector('[data-edit-text]') || el; }
  // a box that holds other editable parts (like a stats card) is moved and sized, but its text is edited through its parts
  function hasParts(el) { return !!el.querySelector('[data-edit]'); }
  function imgOf(el) { return el.tagName === 'IMG' ? el : el.querySelector('img'); }


  /* every text and image on the page becomes editable: elements without their own editor id get a stable one,
     made from their section and their original text (or image file), so saved changes find them again */
  (function autoTag() {
    var TEXT = 'h1,h2,h3,h4,h5,p,li,a,button,label,summary,small,figcaption,blockquote,dt,dd,span,b,strong,em,div,time,s';
    var skip = 'svg,script,template,dialog,noscript,.loader,.gal-wall,#ve-panel,.sr,.vinyl-label';
    function hash(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0; return h.toString(36); }
    function own(el) { // the element's own words, not words that belong to a child block
      var t = ''; el.childNodes.forEach(function (c) { if (c.nodeType === 3) t += c.textContent; else if (c.nodeType === 1 && /^(EM|B|BR|STRONG)$/.test(c.tagName)) t += c.textContent; });
      return t.replace(/s+/g, ' ').trim();
    }
    var used = {};
    [].forEach.call(document.querySelectorAll('[data-edit]'), function (e) { used[e.dataset.edit] = 1; });
    function tag(el, base, name) {
      var sec = el.closest('section[id],header,footer'), sid = sec ? (sec.id || sec.tagName.toLowerCase()) : 'page';
      var key = 'a-' + sid + '-' + hash(base), k = key, n = 2;
      while (used[k]) k = key + '-' + n++;
      used[k] = 1; el.dataset.edit = k; el.dataset.name = name; el.dataset.auto = '1';
    }
    [].forEach.call(document.querySelectorAll('main ' + 'img, header img, footer img'), function (im) {
      if (im.closest(skip) || im.closest('[data-edit]')) return;
      tag(im, 'img:' + (im.getAttribute('src') || ''), 'תמונה · ' + (im.getAttribute('alt') || (im.getAttribute('src') || '').split('/').pop()).slice(0, 30));
    });
    [].forEach.call(document.querySelectorAll('main, header, footer'), function (root) {
      [].forEach.call(root.querySelectorAll(TEXT), function (el) {
        if (el.closest(skip) || el.closest('[data-edit]') || el.querySelector('[data-edit]')) return;
        var t = own(el); if (t.length < 2) return;
        // only the innermost block that holds words: skip a box whose words live in its children
        if ([].some.call(el.children, function (c) { return !/^(EM|B|BR|STRONG)$/.test(c.tagName) && own(c).length > 1 && c.matches(TEXT); })) return;
        tag(el, el.tagName + ':' + t, t.slice(0, 34));
      });
    });
  })();

  function apply(data) {
    data = data || window.RIVKA_EDITS || { vars: {}, items: {} };
    var m = mode(), root = document.documentElement;
    (apply.varsSet || []).forEach(function (k) { root.style.removeProperty(k); });
    apply.varsSet = Object.keys(data.vars || {});
    apply.varsSet.forEach(function (k) { root.style.setProperty(k, data.vars[k]); });

    [].forEach.call(document.querySelectorAll('[data-edit]'), function (el) {
      var it = (data.items || {})[el.dataset.edit] || {}, v = it[m] || {}, tt = textTarget(el), im = imgOf(el);
      if (el.__origHtml == null) el.__origHtml = tt.innerHTML;
      if (im && el.__origSrc == null) el.__origSrc = im.getAttribute('src');
      var html = it.text != null ? clean(it.text) : el.__origHtml;
      if (!hasParts(el) && document.activeElement !== tt && tt.innerHTML !== html) tt.innerHTML = html;
      if (im) { var src = it.src || el.__origSrc; if (im.getAttribute('src') !== src) im.setAttribute('src', src); }
      el.style.translate = (v.x || v.y) ? (v.x || 0) + 'px ' + (v.y || 0) + 'px' : '';
      el.style.rotate = v.r ? v.r + 'deg' : '';
      el.style.scale = v.s && v.s !== 1 ? String(v.s) : '';
      el.style.fontSize = v.fs ? v.fs + 'px' : '';
      el.style.width = v.w ? v.w + 'px' : '';
      el.style.color = it.color || '';
      el.style.display = v.hidden ? 'none' : '';
    });
  }
  window.RivkaEdits = { apply: apply, mode: mode, clean: clean, textTarget: textTarget, imgOf: imgOf, hasParts: hasParts };
  apply();
  stackQ.addEventListener('change', function () { apply(window.RivkaEdits.current); });
})();
