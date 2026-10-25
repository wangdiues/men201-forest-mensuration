/* ==========================================================================
   MEN 201 · PRINT TO PDF
   Makes Ctrl+P / Cmd+P on a deck print every slide with its pictures.

   Slide images carry loading="lazy" and many are 2-4 MB, so a browser asked
   to print straight away lays out the pages before most of them arrive and
   the PDF comes out with empty frames. This file:

     1. catches Ctrl+P / Cmd+P, fetches and decodes every image in the deck
        (with a small "Preparing images" note while it waits), then opens the
        print dialog itself;

     2. on a print started from the browser menu instead, still switches every
        image to eager loading, so a second attempt finds them in the cache.

   Videos are not printed: assets/men201-images.css hides them on paper.
   ========================================================================== */
(function () {
  'use strict';

  var LIMIT_MS = 60000;   // never hold the dialog back longer than this
  var busy = false;

  function images() {
    return Array.prototype.slice.call(document.images);
  }

  function eager() {
    images().forEach(function (img) {
      if (img.loading === 'lazy') img.loading = 'eager';
    });
  }

  function ready(img) {
    return new Promise(function (resolve) {
      if (img.complete) return resolve();
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    }).then(function () {
      return img.decode ? img.decode().catch(function () {}) : null;
    });
  }

  function note() {
    var el = document.createElement('div');
    el.className = 'men-print-note';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    return el;
  }

  function prepareAndPrint() {
    if (busy) return;
    busy = true;
    eager();

    var all = images();
    var pending = all.filter(function (img) { return !img.complete; });
    if (!pending.length) {
      busy = false;
      window.print();
      return;
    }

    var el = note();
    var done = all.length - pending.length;
    function show() {
      el.textContent = 'Preparing images for print… ' + done + ' / ' + all.length;
    }
    show();

    var loads = pending.map(function (img) {
      return ready(img).then(function () { done++; show(); });
    });
    var timeout = new Promise(function (r) { setTimeout(r, LIMIT_MS); });

    Promise.race([Promise.all(loads), timeout]).then(function () {
      el.remove();
      busy = false;
      // Let the removed note leave the layout before the dialog snapshots it.
      requestAnimationFrame(function () { window.print(); });
    });
  }

  window.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
    if (e.key !== 'p' && e.key !== 'P') return;
    e.preventDefault();
    e.stopPropagation();
    prepareAndPrint();
  }, true);

  window.addEventListener('beforeprint', eager);
})();
