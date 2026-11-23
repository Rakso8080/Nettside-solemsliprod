/* ============================================
   SHARED.JS — Solemsli Productions
   Én scroll-lytter, ett sett animasjoner.
   ============================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  var supportsHover = window.matchMedia('(hover: hover)').matches;
  var mqMobile = window.matchMedia('(max-width: 820px)');

  /* ---------------- TEKST ---------------- */

  var UI = {
    no: {
      light: '☀ Lys', dark: '☾ Mørk',
      toLight: 'Bytt til lyst tema', toDark: 'Bytt til mørkt tema',
      lang: 'Bytt språk', menu: 'Meny', toTop: 'Tilbake til toppen',
      copied: 'Kopiert', copyFail: 'Kunne ikke kopiere',
      required: 'Fyll ut navn, e-post og melding.',
      invalidEmail: 'Skriv inn en gyldig e-postadresse.',
      mailtoOpened: 'E-postklienten åpnes med meldingen ferdig utfylt.',
      newsletterOpened: 'E-postklienten åpnes – send e-posten for å melde deg på.',
      hoodieOpened: 'E-postklienten åpnes med størrelse {value}. Send meldingen for å fullføre.',
      quoteOpened: 'E-postklienten åpnes med forespørselen din.',
      interestOpened: 'E-postklienten åpnes med emnet «Interesse: {value}».',
      photoOpened: 'E-postklienten åpnes med motivet forhåndsutfylt.',
      motifChosen: 'Valgt motiv: {value}',
      inclVat: 'Inkl. MVA: {value}',
      quoteRequired: 'Fyll ut alle feltene med gyldig e-post.'
    },
    en: {
      light: '☀ Light', dark: '☾ Dark',
      toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
      lang: 'Change language', menu: 'Menu', toTop: 'Back to top',
      copied: 'Copied', copyFail: 'Could not copy',
      required: 'Please fill in name, email and message.',
      invalidEmail: 'Please enter a valid email address.',
      mailtoOpened: 'Your email client opens with the message pre-filled.',
      newsletterOpened: 'Your email client opens – send the email to subscribe.',
      hoodieOpened: 'Your email client opens with size {value}. Send the message to complete.',
      quoteOpened: 'Your email client opens with your request.',
      interestOpened: 'Your email client opens with the subject “Interest: {value}”.',
      photoOpened: 'Your email client opens with the motif pre-filled.',
      motifChosen: 'Selected motif: {value}',
      inclVat: 'Incl. VAT: {value}',
      quoteRequired: 'Please fill in all fields with a valid email.'
    },
    de: {
      light: '☀ Hell', dark: '☾ Dunkel',
      toLight: 'Zum hellen Design wechseln', toDark: 'Zum dunklen Design wechseln',
      lang: 'Sprache wechseln', menu: 'Menü', toTop: 'Zurück nach oben',
      copied: 'Kopiert', copyFail: 'Kopieren fehlgeschlagen',
      required: 'Bitte Name, E-Mail und Nachricht ausfüllen.',
      invalidEmail: 'Bitte eine gültige E-Mail-Adresse eingeben.',
      mailtoOpened: 'Ihr E-Mail-Client öffnet sich mit der vorausgefüllten Nachricht.',
      newsletterOpened: 'Ihr E-Mail-Client öffnet sich – senden Sie die E-Mail zum Abonnieren.',
      hoodieOpened: 'Ihr E-Mail-Client öffnet sich mit Größe {value}. Senden Sie die Nachricht zum Abschließen.',
      quoteOpened: 'Ihr E-Mail-Client öffnet sich mit Ihrer Anfrage.',
      interestOpened: 'Ihr E-Mail-Client öffnet sich mit dem Betreff „Interesse: {value}“.',
      photoOpened: 'Ihr E-Mail-Client öffnet sich mit dem vorausgefüllten Motiv.',
      motifChosen: 'Gewähltes Motiv: {value}',
      inclVat: 'Inkl. MwSt.: {value}',
      quoteRequired: 'Bitte alle Felder mit gültiger E-Mail ausfüllen.'
    }
  };

  var langCycle = ['no', 'en', 'de'];
  var currentLang = localStorage.getItem('lang') || root.lang || 'no';
  if (langCycle.indexOf(currentLang) === -1) currentLang = 'no';

  function t(key, extra) {
    var text = (UI[currentLang] && UI[currentLang][key]) || UI.no[key] || key;
    return extra ? text.replace('{' + extra.name + '}', extra.value) : text;
  }

  function paintStatus(el) {
    if (!el || !el.dataset.statusKey) return;
    el.textContent = t(el.dataset.statusKey, {
      name: 'value', value: el.dataset.statusValue || ''
    });
  }

  window.SP = {
    t: t,
    lang: function () { return currentLang; },
    status: function (el, key, value, isError) {
      if (!el) return;
      el.dataset.statusKey = key;
      el.dataset.statusValue = value || '';
      el.dataset.state = isError ? 'error' : '';
      paintStatus(el);
    }
  };

  /* ---------------- TEMA ---------------- */

  var themeToggle = document.getElementById('theme-toggle');
  var currentTheme = root.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark';
  if (currentTheme !== 'light' && currentTheme !== 'dark') currentTheme = 'dark';
  root.setAttribute('data-theme', currentTheme);

  function paintThemeButton() {
    if (!themeToggle) return;
    themeToggle.textContent = currentTheme === 'dark' ? t('light') : t('dark');
    themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? t('toLight') : t('toDark'));
  }

  function setThemeMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', currentTheme === 'dark' ? '#0a0b0d' : '#f6f6f4');
  }

  paintThemeButton();
  setThemeMeta();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
      paintThemeButton();
      setThemeMeta();
    });
  }

  /* ---------------- SPRÅK ---------------- */

  var langToggle = document.getElementById('lang-toggle');
  var langLabels = { no: 'EN', en: 'DE', de: 'NO' };

  function applyLang(lang) {
    currentLang = lang;
    root.lang = lang;

    document.querySelectorAll('[data-no][data-en]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (!text) return;

      // data-html lar oss beholde markering inne i teksten
      if (el.hasAttribute('data-html')) {
        el.innerHTML = text;
        return;
      }
      // Tekst med barn (f.eks. <span>) skal ikke miste barnas markup
      if (el.children.length > 0) return;
      el.textContent = text;
    });

    document.querySelectorAll('[data-aria-no]').forEach(function (el) {
      var label = el.getAttribute('data-aria-' + lang);
      if (label) el.setAttribute('aria-label', label);
    });

    document.querySelectorAll('[data-status-key]').forEach(paintStatus);

    if (langToggle) {
      langToggle.textContent = langLabels[lang];
      langToggle.setAttribute('aria-label', t('lang'));
    }
    paintThemeButton();
    if (menuToggle) menuToggle.setAttribute('aria-label', t('menu'));
    var topBtn = document.querySelector('.scroll-top');
    if (topBtn) topBtn.setAttribute('aria-label', t('toTop'));

    // Åpne FAQ-svar kan trenge ny høyde etter språkbytte
    document.querySelectorAll('.faq-item.open .faq-answer').forEach(function (ans) {
      ans.style.maxHeight = 'none';
    });
  }

  if (langToggle) {
    langToggle.addEventListener('click', function () {
      var idx = langCycle.indexOf(currentLang);
      var next = langCycle[(idx + 1) % langCycle.length];
      localStorage.setItem('lang', next);
      applyLang(next);
    });
  }

  /* ---------------- MENY ---------------- */

  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav') || document.querySelector('nav');

  function menuIsOpen() {
    return !!nav && nav.classList.contains('active');
  }

  function setMenu(open) {
    if (!menuToggle || !nav) return;
    menuToggle.classList.toggle('active', open);
    nav.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
    if (mqMobile.matches) nav.inert = !open;
    else nav.inert = false;
  }

  if (menuToggle && nav) {
    if (!nav.id) nav.id = 'site-nav';
    menuToggle.setAttribute('aria-controls', nav.id);
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.inert = mqMobile.matches;

    menuToggle.addEventListener('click', function () {
      var open = !menuIsOpen();
      setMenu(open);
      if (open) {
        var first = nav.querySelector('a, button');
        if (first) first.focus();
      }
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('click', function (e) {
      if (!menuIsOpen()) return;
      if (nav.contains(e.target) || menuToggle.contains(e.target)) return;
      setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (!menuIsOpen()) return;

      if (e.key === 'Escape') {
        setMenu(false);
        menuToggle.focus();
        return;
      }

      if (e.key !== 'Tab') return;
      var focusables = [menuToggle].concat(Array.prototype.slice.call(nav.querySelectorAll('a, button')));
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var onMenuModeChange = function () {
      if (!mqMobile.matches) setMenu(false);
      else if (!menuIsOpen()) nav.inert = true;
    };
    if (mqMobile.addEventListener) mqMobile.addEventListener('change', onMenuModeChange);
    else if (mqMobile.addListener) mqMobile.addListener(onMenuModeChange);
  }

  /* ---------------- FAQ ---------------- */

  function faqParts(item) {
    return {
      button: item.querySelector('.faq-question'),
      answer: item.querySelector('.faq-answer')
    };
  }

  function openFaq(item) {
    var parts = faqParts(item);
    if (!parts.answer) return;
    item.classList.add('open');
    parts.answer.style.maxHeight = parts.answer.scrollHeight + 'px';
    parts.answer.setAttribute('aria-hidden', 'false');
    if (parts.button) parts.button.setAttribute('aria-expanded', 'true');
    parts.answer.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'max-height') return;
      parts.answer.removeEventListener('transitionend', onEnd);
      if (item.classList.contains('open')) parts.answer.style.maxHeight = 'none';
    });
  }

  function closeFaq(item) {
    var parts = faqParts(item);
    if (!parts.answer) return;
    if (parts.answer.style.maxHeight === 'none') parts.answer.style.maxHeight = parts.answer.scrollHeight + 'px';
    void parts.answer.offsetHeight;
    item.classList.remove('open');
    parts.answer.style.maxHeight = '0px';
    parts.answer.setAttribute('aria-hidden', 'true');
    if (parts.button) parts.button.setAttribute('aria-expanded', 'false');
  }

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var parts = faqParts(item);
    if (!parts.answer) return;
    if (!item.classList.contains('open')) {
      parts.answer.style.maxHeight = '0px';
      parts.answer.setAttribute('aria-hidden', 'true');
    }
    if (parts.button && !parts.button.hasAttribute('aria-expanded')) {
      parts.button.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      if (!item) return;
      var parent = item.closest('.faq');
      var wasOpen = item.classList.contains('open');
      if (parent && parent.hasAttribute('data-accordion')) {
        parent.querySelectorAll('.faq-item.open').forEach(closeFaq);
      }
      if (wasOpen) closeFaq(item);
      else openFaq(item);
    });
  });

  /* ---------------- VIDEOFASADE ---------------- */

  document.addEventListener('click', function (e) {
    var facade = e.target.closest('.video-facade');
    if (!facade) return;
    var id = facade.getAttribute('data-video');
    if (!id) return;

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    iframe.title = facade.getAttribute('data-title') || 'YouTube-video';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    facade.replaceWith(iframe);
  });

  /* ---------------- KOPIER ---------------- */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var value = btn.getAttribute('data-copy');
    var fallback = btn.getAttribute('data-' + currentLang) || btn.getAttribute('data-no') || 'Kopier';

    function show(text) {
      btn.textContent = text;
      window.setTimeout(function () { btn.textContent = fallback; }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { show(t('copied')); }, function () { show(t('copyFail')); });
    } else {
      show(t('copyFail'));
    }
  });

  /* ---------------- SIDETRANSISJON ---------------- */

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var link = e.target.closest('a[href]');
    if (!link) return;
    if (link.target === '_blank' || link.hasAttribute('download') || link.dataset.noTransition !== undefined) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^(mailto|tel|sms|javascript):/i.test(href)) return;
    if (!/\.html(\?|#|$)/i.test(href)) return;
    if (href === window.location.pathname.split('/').pop() + window.location.search) return;

    e.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(function () { window.location.href = href; }, reduced ? 0 : 250);
  });

  window.addEventListener('pageshow', function () {
    document.body.classList.remove('is-leaving');
  });

  /* ---------------- ÉN SCROLL-LYTTER ---------------- */

  var header = document.getElementById('header');
  var progressBar = document.getElementById('progress-bar');
  var hero = document.querySelector('.hero');
  var heroContent = hero ? hero.querySelector('.hero-content') : null;
  var heroImage = hero ? hero.querySelector('.hero-bg img') : null;

  var scrollButton = document.createElement('button');
  scrollButton.className = 'scroll-top';
  scrollButton.type = 'button';
  scrollButton.innerHTML = '↑';
  scrollButton.setAttribute('aria-label', t('toTop'));
  document.body.appendChild(scrollButton);

  var lastScroll = -1;
  var queued = false;

  function onScrollFrame() {
    queued = false;
    var y = window.scrollY || document.documentElement.scrollTop;
    if (y === lastScroll) return;
    lastScroll = y;

    if (header) header.classList.toggle('scrolled', y > 24);

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }

    scrollButton.classList.toggle('visible', y > 600);

    if (hero && heroContent && !reduced && !isTouch) {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0) {
        var shift = Math.min(y, hero.offsetHeight);
        heroContent.style.transform = 'translate3d(0,' + (shift * 0.08) + 'px,0)';
        heroContent.style.opacity = String(Math.max(0, 1 - shift / (hero.offsetHeight * 1.1)));
        if (heroImage) heroImage.style.transform = 'scale(' + (1 + Math.min(shift, 600) * 0.00012) + ')';
      }
    }
  }

  function requestScrollFrame() {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  onScrollFrame();

  scrollButton.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------------- AVSLØRING ---------------- */

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal:not(.active)').forEach(function (el) {
    revealObserver.observe(el);
  });

  var staggerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      staggerObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.stagger').forEach(function (el) {
    staggerObserver.observe(el);
  });

  // Overskrifter får én felles avsløring
  document.querySelectorAll('.section-title').forEach(function (el) {
    if (!el.classList.contains('reveal-title')) el.classList.add('reveal-title');
  });

  var titleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      titleObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.reveal-title').forEach(function (el) {
    titleObserver.observe(el);
  });

  // Bilder i galleri/portefølje avdekkes rolig
  var imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      imageObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '120px 0px' });

  document.querySelectorAll('.reveal-img').forEach(function (el) {
    imageObserver.observe(el);
  });

  /* ---------------- KORT-HOVER (subtil peker) ---------------- */

  if (supportsHover && !reduced) {
    document.querySelectorAll('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      });
    });
  }

  /* ---------------- KONAMI ---------------- */

  var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var konamiIndex = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === konami[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        showKonami();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function showKonami() {
    if (document.getElementById('konami-overlay')) return;
    var overlay = document.createElement('div');
    overlay.id = 'konami-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(5,6,8,.94);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:24px;cursor:pointer;animation:pageIn .3s ease both';
    overlay.innerHTML =
      '<img src="gallery/biler/untitled-9223-960.webp" alt="Behind the scenes" width="960" height="640" style="max-width:460px;width:100%;max-height:60vh;object-fit:cover;border-radius:12px">' +
      '<div style="text-align:center;color:#fff;font-family:Inter,sans-serif">' +
      '<h2 style="font-size:1.2rem;font-weight:600;margin-bottom:6px">Du fant easter egget</h2>' +
      '<p style="font-size:.8rem;color:rgba(255,255,255,.55)">— Oskar</p>' +
      '</div>';
    overlay.addEventListener('click', function () { overlay.remove(); });
    document.body.appendChild(overlay);
  }

  applyLang(currentLang);
})();
