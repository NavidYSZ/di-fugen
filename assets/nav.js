/* DI Fugentechnik – Mobiles Navigations-Drawer (gemeinsam für Startseite + Unterseiten)
   Steuert: Öffnen/Schließen, Backdrop, ESC, Scroll-Lock, Fokus, Leistungen-Akkordeon,
   Schließen beim Klick auf einen Link sowie die ARIA-Zustände.
   Defensiv: bricht still ab, wenn Elemente fehlen. */
(function () {
  'use strict';

  function init() {
    var burger = document.getElementById('navtoggle');
    var drawer = document.getElementById('navmenu') || document.getElementById('navlinks');
    if (!burger || !drawer) return;

    var header = burger.closest('header') || document.querySelector('header');
    var backdrop = (header || document).querySelector('.nav-backdrop');
    var closeBtn = drawer.querySelector('.nav-close');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    drawer.setAttribute('aria-hidden', 'true');

    function isOpen() {
      return document.body.classList.contains('nav-open');
    }

    function setOpen(open) {
      document.body.classList.toggle('nav-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (backdrop) backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');

      if (open) {
        // Fokus in den Drawer verlagern (Close-Button, sonst erster Link).
        var target = closeBtn || drawer.querySelector('a, button');
        if (target) {
          if (reduce) {
            target.focus();
          } else {
            window.setTimeout(function () { target.focus(); }, 60);
          }
        }
      } else {
        // Akkordeon einklappen, Fokus zurück zum Burger.
        drawer.querySelectorAll('.has-dropdown.is-expanded').forEach(function (g) {
          g.classList.remove('is-expanded');
          var t = g.querySelector('.nav-acc-toggle');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (header && header.contains(document.activeElement) === false) {
          burger.focus();
        } else {
          burger.focus();
        }
      }
    }

    function open() { setOpen(true); }
    function close() { setOpen(false); }
    function toggle() { setOpen(!isOpen()); }

    burger.addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        close();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
        e.preventDefault();
        close();
      }
    });

    // "Leistungen"-Untermenü als Tap-Akkordeon (statt Hover) auf Mobil.
    var group = drawer.querySelector('.has-dropdown');
    if (group) {
      var trigger = group.querySelector('.nav-acc-toggle') || group.querySelector(':scope > a');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          // Nur im mobilen Drawer abfangen; Desktop nutzt Hover + direkte Navigation.
          if (window.matchMedia('(max-width: 980px)').matches) {
            e.preventDefault();
            var expanded = group.classList.toggle('is-expanded');
            trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          }
        });
      }
    }

    // Klick auf einen echten Navigations-Link schließt den Drawer.
    drawer.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', function () {
        // Akkordeon-Toggle nicht als Schließen werten (hat kein echtes Ziel-href bzw. wird oben abgefangen).
        if (a.classList.contains('nav-acc-toggle')) return;
        close();
      });
    });

    // Wenn auf Desktop-Breite gewechselt wird, Drawer-Zustand zurücksetzen.
    var mq = window.matchMedia('(min-width: 981px)');
    var onChange = function () { if (mq.matches && isOpen()) close(); };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else if (mq.addListener) {
      mq.addListener(onChange);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
