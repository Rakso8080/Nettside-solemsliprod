/* ============================================
   SHARED.JS — Solemsli Productions
   Felles funksjonalitet for alle sider
   ============================================ */

(function() {
  'use strict';

  // THEME
  const themeToggle = document.getElementById('theme-toggle');
  let currentTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (themeToggle) {
    themeToggle.textContent = currentTheme === 'dark' ? '☀️ Lys' : '🌙 Mørk';
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
      themeToggle.textContent = currentTheme === 'dark' ? '☀️ Lys' : '🌙 Mørk';
    });
  }

  // LANGUAGE (NO → EN → DE cycle)
  const langToggle = document.getElementById('lang-toggle');
  const langCycle = ['no', 'en', 'de'];
  const langLabels = { no: 'EN', en: 'DE', de: 'NO' };
  let currentLang = localStorage.getItem('lang') || 'no';
  if (!langCycle.includes(currentLang)) currentLang = 'no';
  if (langToggle) langToggle.textContent = langLabels[currentLang];

  const applyLang = (lang) => {
    document.querySelectorAll('[data-no][data-en]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text) el.textContent = text;
    });
  };
  applyLang(currentLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const idx = langCycle.indexOf(currentLang);
      currentLang = langCycle[(idx + 1) % langCycle.length];
      localStorage.setItem('lang', currentLang);
      langToggle.textContent = langLabels[currentLang];
      applyLang(currentLang);
      if (typeof splitHeroText === 'function') splitHeroText();
    });
  }

  // HEADER SCROLL
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // PROGRESS BAR
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (document.documentElement.scrollTop / h) * 100 + '%';
    });
  }

  // SCROLL REVEAL
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // CUSTOM CURSOR (desktop only)
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouch) {
    const cursorEl = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursor-dot');
    if (cursorEl && cursorDot) {
      let cx = 0, cy = 0, dx = 0, dy = 0;
      document.addEventListener('mousemove', e => { dx = e.clientX; dy = e.clientY; });
      (function animCursor() {
        cx += (dx - cx) * 0.12;
        cy += (dy - cy) * 0.12;
        cursorEl.style.left = cx + 'px';
        cursorEl.style.top = cy + 'px';
        cursorDot.style.left = dx + 'px';
        cursorDot.style.top = dy + 'px';
        requestAnimationFrame(animCursor);
      })();
      document.querySelectorAll('a,button').forEach(el => {
        el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
      });
    }
  }

  // MOBILE MENU
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (menuToggle && nav) {
    nav.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      nav.classList.remove('active');
    }));
  }

  // SMOOTH PAGE TRANSITIONS
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 0.3s';
      setTimeout(() => window.location.href = href, 300);
    });
  });
  document.body.style.opacity = '1';
  document.body.style.transition = 'opacity 0.3s';

  // SMOOTH SCROLL (anchor links)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const t = document.querySelector(href);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // SCROLL TO TOP
  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.className = 'scroll-top';
  scrollTopBtn.innerHTML = '↑';
  scrollTopBtn.setAttribute('aria-label', 'Tilbake til toppen');
  scrollTopBtn.setAttribute('data-no', 'Tilbake til toppen');
  scrollTopBtn.setAttribute('data-en', 'Back to top');
  scrollTopBtn.setAttribute('data-de', 'Nach oben');
  document.body.appendChild(scrollTopBtn);

  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // MAGNETIC BUTTONS (desktop only)
  if (!isTouch) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0, 0)');
    });
  }

})();
