/* ==========================================================================
   MEN 201 · SUPPLEMENTARY DECK RUNTIME (Units VIII–XI)
   The runtime carried by Units I–VII, factored into one shared file.

     1. Stage fitting — uniform scale, never a reflow
     2. Navigation — keys, click, swipe, hash routing
     3. Inline editing — press E, edits persisted in localStorage
     4. Return to contents — the way out, docked in the deck's own HUD

   Each deck names itself with data-unit on <body>, so the four decks keep
   separate edit stores.
   ========================================================================== */
(function () {
  'use strict';

  const stage   = document.getElementById('stage');
  const slides  = Array.from(document.querySelectorAll('.slide'));
  const prog    = document.getElementById('prog');
  const curEl   = document.getElementById('cur');
  const totEl   = document.getElementById('tot');
  const toastEl = document.getElementById('toast');
  const editbtn = document.getElementById('editbtn');
  if (!stage || !slides.length) return;

  const unit  = document.body.dataset.unit
             || (location.pathname.match(/Unit_([IVX]+)_/) || [, 'supp'])[1];
  const STORE = 'men201-unit' + unit + '-edits';
  let i = 0;

  if (totEl) totEl.textContent = slides.length;

  /* --- 1. STAGE FITTING ------------------------------------------------- */
  function fit() {
    // Set only the scale factor; the centring translate lives in the stylesheet
    // so that a JS failure still leaves the stage centred rather than offset.
    stage.style.setProperty('--s', Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  /* --- 2. NAVIGATION ---------------------------------------------------- */
  function show(n, push) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    if (curEl) curEl.textContent = i + 1;
    if (prog) prog.style.width = ((i + 1) / slides.length * 100) + '%';
    if (push !== false) history.replaceState(null, '', '#' + (i + 1));
    slides[i].setAttribute('tabindex', '-1');
    syncExit();
  }
  const next = () => show(i + 1);
  const prev = () => show(i - 1);

  document.getElementById('next').addEventListener('click', next);
  document.getElementById('prev').addEventListener('click', prev);

  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('editing')) {
      // In edit mode only Escape and Ctrl+S are deck shortcuts.
      if (e.key === 'Escape') { toggleEdit(false); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveEdits(); }
      return;
    }
    // A calculator field owns its own keys; do not turn the page under it.
    const typing = e.target.closest && e.target.closest('input,select,textarea,button,a');
    if (typing && [' ', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;

    switch (e.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter': e.preventDefault(); next(); break;
      case 'ArrowLeft':  case 'PageUp':   case 'Backspace': e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); show(0); break;
      case 'End':  e.preventDefault(); show(slides.length - 1); break;
      case 'e': case 'E': toggleEdit(true); break;
      case 'Escape': case 'c': case 'C':
        // In script-requested fullscreen the first Esc should only exit
        // fullscreen; a second press then leaves the deck.
        if (e.key === 'Escape' && document.fullscreenElement) return;
        e.preventDefault(); location.href = 'index.html'; break;
    }
  });

  // Click the right or left third of the screen to advance or go back.
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('editing')) return;
    if (e.target.closest('.hud') || e.target.closest('.editbtn')) return;
    if (e.target.closest('a,button,input,select,textarea,label')) return;
    const x = e.clientX / window.innerWidth;
    if (x > 0.72) next(); else if (x < 0.28) prev();
  });

  // Touch swipe.
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', (e) => {
    tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (e.target.closest('input,select,button,a')) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  /* --- 3. INLINE EDITING ------------------------------------------------ */
  function editableNodes() {
    return Array.from(document.querySelectorAll(
      '.slide h1, .slide h2, .slide h3, .slide p, .slide li, .slide td, .slide th, ' +
      '.slide .ch, .slide .label, .slide .eyebrow, .slide .sv, .slide .sl, .slide .chip, ' +
      '.slide .qt, .slide .mn, .slide .formula, .slide .txt, .slide .txt-sm'
    ));
  }

  function toggleEdit(force) {
    const on = force === undefined ? !document.body.classList.contains('editing')
                                   : (force && !document.body.classList.contains('editing'));
    document.body.classList.toggle('editing', on);
    editableNodes().forEach(n => on ? n.setAttribute('contenteditable', 'true')
                                    : n.removeAttribute('contenteditable'));
    if (editbtn) editbtn.textContent = on ? 'EDITING · CTRL+S TO SAVE · ESC' : 'EDIT · E';
    if (!on) saveEdits();
  }
  if (editbtn) editbtn.addEventListener('click', () => toggleEdit());

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    setTimeout(() => toastEl.classList.remove('on'), 1600);
  }

  function saveEdits() {
    try {
      const data = {};
      slides.forEach((s, k) => { data[k] = s.innerHTML; });
      /* Stored with the slide count: edits are keyed by position, so they may
         only be replayed onto a deck of the same length. */
      localStorage.setItem(STORE, JSON.stringify({ n: slides.length, d: data }));
      toast('Edits saved to this browser');
    } catch (err) { toast('Could not save — storage unavailable'); }
  }

  function restoreEdits() {
    try {
      const raw = localStorage.getItem(STORE);
      if (!raw) return;
      const saved = JSON.parse(raw);
      /* Only replay edits captured against a deck of the same length -
         otherwise an added slide would be overwritten by its predecessor. */
      if (!saved || saved.n !== slides.length || !saved.d) return;
      slides.forEach((s, k) => { if (saved.d[k]) s.innerHTML = saved.d[k]; });
    } catch (err) { /* corrupt store — ignore and show the original deck */ }
  }
  restoreEdits();

  /* Page numbers are generated from the running order, and only after saved
     edits have been restored, so inserting or removing a slide never leaves a
     stale "24 / 30" behind. Section dividers carry .spage instead of .pageno. */
  slides.forEach((s, k) => {
    const p = s.querySelector('.pageno,.spage');
    if (p) p.textContent = (k + 1) + ' / ' + slides.length;
  });

  /* --- 4. RETURN TO CONTENTS -------------------------------------------- */
  /* The link docks into the deck's own HUD rather than floating over the
     slide. A fixed corner does not work: at exactly 16:9 — the projector
     case — the stage fills the viewport and a top-right badge lands on top
     of the running head. On the last slide the link goes solid, because a
     deck that has run out should say where to go next. */
  const hud  = document.querySelector('.hud');
  const exit = document.createElement('a');
  exit.className = 'tocback';
  exit.href = 'index.html';
  exit.title = 'Leave this deck and go back to the MEN 201 contents (Esc)';
  exit.innerHTML = '<span class="toclabel">&larr;&nbsp;Contents</span><kbd>Esc</kbd>';
  exit.addEventListener('click', (e) => e.stopPropagation());

  if (hud) {
    const sep = document.createElement('span');
    sep.className = 'tocsep';
    hud.insertBefore(sep, hud.firstChild);
    hud.insertBefore(exit, hud.firstChild);
  }
  const exitLabel = exit.querySelector('.toclabel');
  function syncExit() {
    const atEnd = i === slides.length - 1;
    exit.classList.toggle('end', atEnd);
    exitLabel.innerHTML = atEnd ? '&larr;&nbsp;End &middot; contents' : '&larr;&nbsp;Contents';
  }

  /* --- BOOT ------------------------------------------------------------- */
  const fromHash = parseInt((location.hash || '').replace('#', ''), 10);
  show(Number.isFinite(fromHash) && fromHash > 0 ? fromHash - 1 : 0, false);
})();
