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

  // ===== UNIQUE 3D SCROLL EFFECTS =====

  // 3D TILT ON CARDS (desktop only)
  if (!isTouch) {
    document.querySelectorAll('.product-card, .price-card, .equip-card, .proof-card, .wyg-item, .info-item').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 0.4s cubic-bezier(.23,1,.32,1)';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(10px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
      });
    });
  }

  // PARALLAX DEPTH LAYERS — elements with data-parallax scroll at different speeds
  document.querySelectorAll('[data-parallax]').forEach(el => {
    const speed = parseFloat(el.dataset.parallax) || 0.3;
    window.addEventListener('scroll', () => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const offset = (window.scrollY - el.offsetTop) * speed;
      el.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  });

  // TEXT CHARACTER REVEAL — elements with .char-reveal get characters animated on scroll
  const charRevealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      el.textContent = '';
      el.style.visibility = 'visible';
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00a0' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px) rotateX(-40deg)';
        span.style.transition = `all 0.5s cubic-bezier(.23,1,.32,1) ${i * 0.025}s`;
        el.appendChild(span);
      });
      requestAnimationFrame(() => {
        el.querySelectorAll('span').forEach(s => { s.style.opacity = '1'; s.style.transform = 'translateY(0) rotateX(0)'; });
      });
      charRevealObs.unobserve(el);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.char-reveal').forEach(el => {
    el.style.visibility = 'hidden';
    charRevealObs.observe(el);
  });

  // SCROLL SCALE — elements with .scroll-scale grow/shrink slightly based on scroll
  const scrollScaleObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const update = () => {
        const rect = entry.target.getBoundingClientRect();
        const progress = 1 - (rect.top / window.innerHeight);
        const scale = 0.92 + Math.min(Math.max(progress, 0), 1) * 0.08;
        const opacity = 0.4 + Math.min(Math.max(progress, 0), 1) * 0.6;
        entry.target.style.transform = `scale(${scale})`;
        entry.target.style.opacity = opacity;
        if (rect.bottom > 0 && rect.top < window.innerHeight) requestAnimationFrame(update);
      };
      update();
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-scale').forEach(el => scrollScaleObs.observe(el));

  // 3D PERSPECTIVE SECTIONS — sections tilt slightly as you scroll through them
  const perspObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const update = () => {
        const rect = entry.target.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const rotateX = (progress - 0.5) * 4;
        entry.target.style.transform = `perspective(1200px) rotateX(${rotateX}deg)`;
        entry.target.style.transformOrigin = 'center center';
        if (rect.bottom > 0 && rect.top < window.innerHeight) requestAnimationFrame(update);
      };
      update();
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.perspective-section').forEach(el => perspObs.observe(el));

  // STAGGERED REVEAL — children of .stagger-reveal animate in sequence
  const staggerObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
        child.style.transition = `all 0.6s cubic-bezier(.23,1,.32,1) ${i * 0.1}s`;
        requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        });
      });
      staggerObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.stagger-reveal').forEach(el => staggerObs.observe(el));

  // GLOW ON SCROLL — elements with .glow-scroll get a blue glow when in view
  const glowObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.boxShadow = '0 0 40px rgba(1,128,255,0.15), 0 20px 60px rgba(0,0,0,0.1)';
      } else {
        entry.target.style.boxShadow = '';
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.glow-scroll').forEach(el => glowObs.observe(el));

})();
