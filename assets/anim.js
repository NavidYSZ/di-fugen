/* =====================================================================
   DI Fugentechnik – Scroll-Reveal (site-weit, Startseite + Unterseiten)
   Progressive Enhancement: ohne JS bleibt alles sichtbar. Bei reduzierter
   Bewegung oder fehlendem IntersectionObserver wird alles sofort gezeigt.
   ===================================================================== */
(function () {
  'use strict';

  var docEl = document.documentElement;
  // Muss zum Selektor in anim.css passen (gleiche Liste!)
  var SEL = [
    '.card', '.contact-card', '.testimonial', '.gallery-item', '.media-figure',
    '.media-duo', '.team-card', '.trust-item', '.stat', '.ba-card', '.ba',
    '.cta-box', '.faq-block', '.final-cta-inner', '.rcard', '.why-media',
    '.reviews', '.section-title', '.content-narrow', '.lead'
  ].map(function (s) { return 'main ' + s; }).join(',');

  function collect() {
    var els = [].slice.call(document.querySelectorAll(SEL));
    // Hero-/LCP-Inhalte + Trust-Leiste nicht animieren (in CSS ohnehin
    // sichtbar gehalten – muss mit der Schutz-Regel in anim.css synchron sein)
    return els.filter(function (e) {
      return !e.closest('.hero, .page-hero, .stage, .trust');
    });
  }

  function revealAll(els) {
    els.forEach(function (e) { e.classList.add('is-visible'); });
  }

  function run() {
    // js-Klasse setzen (aktiviert den Versteckzustand in anim.css). Falls das
    // inline-Snippet im <head> fehlt, greift es spätestens jetzt.
    docEl.classList.add('js');

    var els = collect();
    if (!els.length) return;

    var reduce = window.matchMedia &&
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || !('IntersectionObserver' in window)) {
      revealAll(els);
      return;
    }

    // Gestaffelte Verzögerung: Geschwister-Elemente nacheinander aufblenden
    els.forEach(function (e) {
      var parent = e.parentNode;
      if (!parent) return;
      var sibs = [].slice.call(parent.children).filter(function (c) {
        return els.indexOf(c) > -1;
      });
      var idx = sibs.indexOf(e);
      if (idx > 0) {
        e.style.setProperty('--reveal-delay', Math.min(idx, 6) * 80 + 'ms');
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    els.forEach(function (e) { io.observe(e); });

    // Sicherheitsnetz: was nach dem vollständigen Laden im Viewport liegt,
    // aber (z. B. wegen Browser-Eigenheiten) nicht ausgelöst hat, sichtbar machen.
    window.addEventListener('load', function () {
      var vh = window.innerHeight || docEl.clientHeight;
      els.forEach(function (e) {
        if (e.classList.contains('is-visible')) return;
        var r = e.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          e.classList.add('is-visible');
          io.unobserve(e);
        }
      });
    });
  }

  if (document.readyState !== 'loading') {
    run();
  } else {
    document.addEventListener('DOMContentLoaded', run);
  }
})();
