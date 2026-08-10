/* ==========================================================================
   MEN 201 · TYPE ZOOM
   One knob for the size of every word in the module.

   Every type size in the decks, the notes, the handbook and the field sheets
   is written as  calc(<n>px * var(--tz,1)).  This file does three things:

     1. remembers a lecturer's own zoom setting across documents and sessions
        (+ / - / 0 while a deck or a page is open);

     2. on a deck, guards the fixed 1920x1080 canvas. Slides are absolutely
        positioned inside a frame that cannot grow, so larger type has to come
        out of the layout's own space. Any slide that would end up worse off
        than it is at --tz:1 gets its own smaller --tz, stepped down until it
        sits inside the frame again. A slide is never made tighter than the
        day it was written;

     3. measures the slides ahead during idle time, so turning a page never
        shows the fitting happen.

   Loaded with defer from every document; harmless on a page with no stage.
   ========================================================================== */
(function () {
  'use strict';

  var KEY   = 'men201-type-zoom';   // the lecturer's factor, on top of the doc default
  var USER_MIN = 0.85, FIT_MIN = 0.70, MAX = 1.60, STEP = 0.05;
  var AUTHORED = 1.0;               // the size at which the fixed layouts were composed

  // A slide that does not use its whole safe zone is read from the back of a
  // classroom at whatever size it happens to have been written. Rather than
  // leave that space empty, the fitter grows such a slide's type until the band
  // is full, up to this ceiling. Title and section slides are excluded: their
  // type is already display-scale and their frames are positioned by hand.
  var GROW_TO = 1.40, GROW_STEP = 0.03;
  var root  = document.documentElement;

  /* --- the document's own default, as authored in its stylesheet --------- */
  var base = parseFloat(getComputedStyle(root).getPropertyValue('--tz')) || 1;

  // Storage is unavailable on file:// in some browsers and in private windows;
  // the zoom then simply lasts as long as the page does.
  var memory = null;
  function remembered() {
    try { return localStorage.getItem(KEY); } catch (e) { return memory; }
  }
  function remember(v) {
    memory = v;
    try { localStorage.setItem(KEY, v); } catch (e) { /* not fatal */ }
  }

  function userFactor() {
    var v = parseFloat(remembered());
    return isFinite(v) ? Math.min(MAX, Math.max(USER_MIN, v)) : 1;
  }

  function target() { return base * userFactor(); }

  function applyZoom() {
    root.style.setProperty('--tz', target().toFixed(3));
  }

  applyZoom();

  /* --- 1. the keyboard control ------------------------------------------ */

  function toast(msg) {
    var el = document.getElementById('tz-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tz-toast';
      el.setAttribute('role', 'status');
      el.style.cssText =
        'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:200;' +
        'background:rgba(10,14,11,.88);color:#f2efe6;border:1px solid rgba(255,255,255,.14);' +
        'padding:10px 16px;border-radius:100px;backdrop-filter:blur(6px);pointer-events:none;' +
        'font:500 13px/1 ui-monospace,monospace;letter-spacing:.12em;opacity:0;' +
        'transition:opacity .2s ease';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.style.opacity = '0'; }, 1400);
  }

  function setFactor(f) {
    f = Math.min(MAX, Math.max(USER_MIN, Math.round(f * 100) / 100));
    remember(String(f));
    applyZoom();
    remeasure();
    toast('TEXT ' + Math.round(f * 100) + '%');
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;            // leave browser zoom alone
    if (document.body.classList.contains('editing')) return;   // deck edit mode owns the keys
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;

    if (e.key === '+' || e.key === '=') { e.preventDefault(); setFactor(userFactor() + STEP); }
    else if (e.key === '-' || e.key === '_') { e.preventDefault(); setFactor(userFactor() - STEP); }
    else if (e.key === '0') { e.preventDefault(); setFactor(1); }
  });

  /* --- 2. the deck guard ------------------------------------------------- */

  var stage = document.querySelector('.stage');
  var slides = stage ? Array.prototype.slice.call(stage.querySelectorAll('.slide')) : [];
  if (!slides.length) return;

  // How far a slide's content reaches outside the frames that hold it: the
  // safe zone (.body) and the 1920x1080 page itself. Measured from bounding
  // rectangles rather than scrollHeight, because a line box drawn tighter than
  // its glyphs - .eyebrow and .pageno are set at line-height 1 - reports two or
  // three pixels of scroll overflow on every slide without anything being cut.
  // .scroll and .table-wrap are meant to hold more than they show.
  var TOL = 4;   // canvas pixels of slack before it counts as spilling

  function scale() {
    var s = parseFloat(getComputedStyle(stage).getPropertyValue('--s'));
    return s > 0 ? s : 1;
  }

  // Every box on the slide that cuts off what does not fit inside it: the page,
  // the safe zone, and each figure plate. Which boxes clip does not change with
  // the type size, so the list is worked out once per slide.
  var framesCache = new WeakMap();

  function framesOf(slide) {
    var found = framesCache.get(slide);
    if (found) return found;
    found = [slide];
    var body = slide.querySelector('.body');
    if (body) found.push(body);
    var els = slide.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!(el instanceof HTMLElement) || el === body) continue;
      if (el.classList.contains('scroll') || el.classList.contains('table-wrap')) continue;
      var cs = getComputedStyle(el);
      if (/hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY)) found.push(el);
    }
    framesCache.set(slide, found);
    return found;
  }

  function spill(slide) {
    var s = scale();
    var tol = TOL * s;
    var total = 0;
    var frames = framesOf(slide);

    for (var f = 0; f < frames.length; f++) {
      var frame = frames[f];
      var fr = frame.getBoundingClientRect();
      var els = frame.querySelectorAll('*');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('.scroll,.table-wrap')) continue;
        var r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        total += Math.max(0, r.bottom - fr.bottom - tol);
        total += Math.max(0, r.right - fr.right - tol);
        total += Math.max(0, fr.top - r.top - tol);
        total += Math.max(0, fr.left - r.left - tol);
      }
    }
    return total / s;   // back into canvas pixels, so the number means the same
  }                     // whatever the projector is doing

  // Clipping is only half of fitting. Larger type can also make two separate
  // layout zones occupy the same pixels while both remain inside the slide.
  // Measure text line boxes across zones (title/body, card/callout,
  // content/footer, closing metadata/cards). Text inside the same zone is
  // allowed to flow normally, and diagrams are handled by their own geometry.
  function collision(slide) {
    var s = scale();
    var boxes = [];
    var walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
    var zoneSelector = '.head,.runhead,.card,.callout,.formula,.answer,.q,.step,.numrow,table,.cmeta,.src,.pageno,.sectext,.fig,.diagram,.plate';

    while (walker.nextNode()) {
      var node = walker.currentNode;
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      var parent = node.parentElement;
      if (!parent || parent.closest('.scroll,.table-wrap')) continue;
      var cs = getComputedStyle(parent);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      var zone = parent.closest(zoneSelector) || parent;
      var range = document.createRange();
      range.selectNodeContents(node);
      var rects = range.getClientRects();
      var fontSize = parseFloat(cs.fontSize) || 16;
      var glyphHeight = Math.min(fontSize * .92 * s, fontSize * 1.08 * s);

      for (var r = 0; r < rects.length; r++) {
        var rr = rects[r];
        if (rr.width < 1 || rr.height < 1) continue;
        var middle = (rr.top + rr.bottom) / 2;
        boxes.push({
          zone: zone,
          left: rr.left + 1 * s,
          right: rr.right - 1 * s,
          top: middle - glyphHeight / 2,
          bottom: middle + glyphHeight / 2,
        });
      }
    }

    boxes.sort(function (a, b) { return a.top - b.top; });
    var total = 0;
    for (var i = 0; i < boxes.length; i++) {
      var a = boxes[i];
      for (var j = i + 1; j < boxes.length && boxes[j].top < a.bottom; j++) {
        var b = boxes[j];
        if (a.zone === b.zone || a.zone.contains(b.zone) || b.zone.contains(a.zone)) continue;
        var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        var h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 2 * s && h > 2 * s) total += w * h / (s * s);
      }
    }
    return total;
  }

  var fitted = new WeakMap();   // slide -> the --tz it was last fitted at
  var fitting = false;          // re-entrancy guard: fitting mutates classes

  /* Density: how much of the slide's air is spent on padding rather than
     words. 0 is the authored spacing, 1 is .fit, 2 is .fit2. The stylesheet
     already defines both steps; the fitter is what decides when a slide needs
     one, so that a crowded slide pays for its size out of padding first and
     only shrinks its type once there is no padding left to spend. A slide is
     never loosened below the density its author wrote. */
  var authoredDensity = new WeakMap();
  function baseDensity(slide) {
    if (!authoredDensity.has(slide)) {
      authoredDensity.set(slide,
        slide.classList.contains('fit2') ? 2 : slide.classList.contains('fit') ? 1 : 0);
    }
    return authoredDensity.get(slide);
  }
  function setDensity(slide, d) {
    slide.classList.toggle('fit', d >= 1);
    slide.classList.toggle('fit2', d >= 2);
  }

  function fitSlide(slide) {
    var want = target();
    var cap = parseFloat(slide.getAttribute('data-fit-max'));
    var cssCap = parseFloat(getComputedStyle(slide).getPropertyValue('--fit-max'));
    if (isFinite(cssCap)) cap = isFinite(cap) ? Math.min(cap, cssCap) : cssCap;
    if (isFinite(cap)) want = Math.min(want, Math.max(FIT_MIN, cap));
    if (fitted.get(slide) === want) return;

    fitting = true;
    var d0 = baseDensity(slide);

    // A slide waiting its turn is visibility:hidden, and every word on it
    // inherits that. collision() skips hidden text, so measuring a slide in
    // that state reports no collision whatever the type size - the check was
    // silently passing for every slide fitted ahead of time. Reveal the slide
    // for the duration of the measurement and put it back before yielding, so
    // the browser never gets a frame in which to paint it.
    var keepVis = slide.style.visibility, keepOp = slide.style.opacity;
    slide.style.visibility = 'visible';
    slide.style.opacity = '1';

    // Baseline: the authored layout's existing edge behaviour, measured at the
    // authored spacing. Unlike edge spill, collisions are never accepted as a
    // baseline; a slide may step below 1.0 when that is necessary to separate
    // independent text zones.
    setDensity(slide, d0);
    slide.style.setProperty('--tz', String(AUTHORED));
    var baseline = spill(slide);

    function fits(tz, d) {
      setDensity(slide, d);
      slide.style.setProperty('--tz', tz.toFixed(3));
      return spill(slide) <= baseline + 1 && collision(slide) === 0;
    }

    var display = slide.classList.contains('cover') || slide.classList.contains('sect');
    var ceiling = display ? want : Math.max(want, Math.min(GROW_TO, isFinite(cap) ? cap : GROW_TO));

    // Sizes to try, largest first: coarse steps down through the growth range,
    // then the authored size, then the existing fine steps below it.
    var steps = [], t;
    for (t = ceiling; t > want + 0.001; t = Math.round((t - GROW_STEP) * 1000) / 1000) steps.push(t);
    for (t = want; t > FIT_MIN + 0.001; t = Math.round((t - 0.02) * 1000) / 1000) steps.push(t);
    steps.push(FIT_MIN);

    var ok = false;
    for (var i = 0; i < steps.length && !ok; i++) {
      // Above the authored size a slide is being grown for its own sake, so it
      // is never also squeezed; padding is only spent to defend a size the
      // document actually asked for.
      var tightest = steps[i] > want + 0.001 ? d0 : 2;
      for (var d = d0; d <= tightest; d++) {
        if (fits(steps[i], d)) { ok = true; break; }
      }
    }
    if (!ok) { setDensity(slide, 2); slide.style.setProperty('--tz', String(FIT_MIN)); }
    slide.style.visibility = keepVis;
    slide.style.opacity = keepOp;
    fitted.set(slide, want);
    fitting = false;
  }

  function remeasure() {
    if (!stage) return;
    fitted = new WeakMap();
    var active = stage.querySelector('.slide.active');
    if (active) fitSlide(active);
    queueIdle();
  }

  /* --- 3. fit the slide on screen, then the rest during idle time -------- */

  var queue = null;
  function queueIdle() {
    queue = slides.slice();
    var idle = window.requestIdleCallback || function (fn) { return setTimeout(function () { fn({ timeRemaining: function () { return 8; } }); }, 60); };
    (function step(deadline) {
      while (queue.length && (!deadline || deadline.timeRemaining() > 4)) fitSlide(queue.shift());
      if (queue.length) idle(step);
    })(null);
  }

  // The entrance animation slides .rv elements up from 18px below their resting
  // place, which would read as spill. Inactive slides never animate, so only
  // the one on screen at load has to be waited out.
  function settled(slide) {
    if (!slide.getAnimations) return Promise.resolve();
    var running = slide.getAnimations({ subtree: true }).map(function (a) { return a.finished; });
    return Promise.race([
      Promise.all(running).catch(function () {}),
      new Promise(function (r) { setTimeout(r, 1200); }),
    ]);
  }

  function start() {
    var active = stage.querySelector('.slide.active') || slides[0];
    settled(active).then(function () { fitSlide(active); });

    // The deck runtimes switch slides by toggling .active; watch for it rather
    // than reaching into each deck's own script.
    new MutationObserver(function (records) {
      if (fitting) return;   // the density classes the fitter itself toggles
      for (var i = 0; i < records.length; i++) {
        var el = records[i].target;
        if (!el.classList || !el.classList.contains('active')) continue;
        if (fitted.get(el) === target()) continue;   // already measured during idle
        settled(el).then(fitSlide.bind(null, el));
      }
    }).observe(stage, { subtree: true, attributes: true, attributeFilter: ['class'] });

    queueIdle();
  }

  // Fonts change every measurement, so wait for them before believing one.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else window.addEventListener('load', start);
})();
