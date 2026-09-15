/* ============================================
   SHARED.JS — Solemsli Productions
   Felles funksjonalitet for alle sider
   ============================================ */

(function() {
  'use strict';

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // LIVING BACKGROUND — inject orbs and bokeh
  // ============================================

  // MESH GRADIENT ORBS — 3 floating color blobs (desktop only)
  if (!isTouch) {
    const meshContainer = document.createElement('div');
    meshContainer.className = 'mesh-orbs';
    meshContainer.innerHTML = '<div class="mesh-orb"></div><div class="mesh-orb"></div><div class="mesh-orb"></div>';
    document.body.appendChild(meshContainer);
  }

  // BOKEH LIGHTS — soft drifting circles (desktop only)
  if (!prefersReduced && !isTouch) {
    const bokehContainer = document.createElement('div');
    bokehContainer.className = 'bokeh-container';
    const bokehCount = window.innerWidth < 768 ? 4 : 8;
    for (let i = 0; i < bokehCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'bokeh-dot';
      const size = 4 + Math.random() * 12;
      const left = Math.random() * 100;
      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * -30;
      const drift = (Math.random() - 0.5) * 200;
      dot.style.cssText = `width:${size}px;height:${size}px;left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;--drift:${drift}px`;
      bokehContainer.appendChild(dot);
    }
    document.body.appendChild(bokehContainer);
  }

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

  // Helper: split text into character spans for magnetic-text / text-wave
  const splitChars = (el) => {
    const text = el.textContent;
    el.innerHTML = '';
    [...text].forEach(ch => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(s);
    });
  };

  const applyLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-no][data-en]').forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text) {
        if (el.hasAttribute('data-html')) el.innerHTML = text;
        else el.textContent = text;
        if (el.classList.contains('magnetic-text') || el.classList.contains('text-wave')) {
          splitChars(el);
        }
      }
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

  // PROGRESS BAR — smooth interpolated (desktop: rAF loop, mobile: direct set)
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    let progressTarget = 0;
    let progressCurrent = 0;
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressTarget = h > 0 ? (document.documentElement.scrollTop / h) * 100 : 0;
      if (isTouch) progressBar.style.width = progressTarget + '%';
    }, { passive: true });
    if (!isTouch) {
      (function animProgress() {
        progressCurrent += (progressTarget - progressCurrent) * 0.12;
        progressBar.style.width = progressCurrent + '%';
        if (Math.abs(progressTarget - progressCurrent) > 0.01 || progressTarget > 0) {
          requestAnimationFrame(animProgress);
        } else {
          progressBar.style.width = progressTarget + '%';
        }
      })();
    }
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

  // CUSTOM CURSOR (desktop only, skip if reduced motion preferred)
  if (!isTouch && !prefersReduced) {
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
      // CURSOR MORPH — shape changes based on hover target
      document.querySelectorAll('img,.latest-item,.insta-item,.ba-slider').forEach(el => {
        el.addEventListener('mouseenter', () => cursorEl.classList.add('cursor-crosshair'));
        el.addEventListener('mouseleave', () => cursorEl.classList.remove('cursor-crosshair'));
      });
      document.querySelectorAll('h1,h2,h3,p,.faq-question').forEach(el => {
        el.addEventListener('mouseenter', () => cursorEl.classList.add('cursor-text'));
        el.addEventListener('mouseleave', () => cursorEl.classList.remove('cursor-text'));
      });
      document.querySelectorAll('.product-card,.equip-card,.price-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursorEl.classList.add('cursor-expand'));
        el.addEventListener('mouseleave', () => cursorEl.classList.remove('cursor-expand'));
      });
      document.querySelectorAll('.ba-slider').forEach(el => {
        el.addEventListener('mouseenter', () => cursorEl.classList.add('cursor-drag'));
        el.addEventListener('mouseleave', () => cursorEl.classList.remove('cursor-drag'));
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

  // SMOOTH PAGE TRANSITIONS — diagonal wipe (skip Cmd+click, Ctrl+click, right-click, middle-click)
  const wipeOverlay = document.createElement('div');
  wipeOverlay.id = 'wipe-overlay';
  document.body.appendChild(wipeOverlay);
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const href = link.getAttribute('href');
      wipeOverlay.classList.add('wiping-in');
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    });
  });
  // Wipe out on page load
  requestAnimationFrame(() => {
    wipeOverlay.classList.add('wiping-out');
    setTimeout(() => { wipeOverlay.classList.remove('wiping-out'); }, 400);
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

  // MAGNETIC BUTTONS (desktop only, skip if reduced motion)
  if (!isTouch && !prefersReduced) {
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

  // 3D TILT ON CARDS (desktop only, skip if reduced motion)
  if (!isTouch && !prefersReduced) {
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



  // 3D PERSPECTIVE SECTIONS — sections tilt slightly as you scroll through them (desktop only)
  if (!isTouch && !prefersReduced) {
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
  }

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

  // GLOW ON SCROLL — elements with .glow-scroll or .glow-border get glow when in view
  const glowObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        if (entry.target.classList.contains('glow-scroll')) {
          entry.target.style.boxShadow = '0 0 40px rgba(1,128,255,0.15), 0 20px 60px rgba(0,0,0,0.1)';
        }
      } else {
        entry.target.classList.remove('in-view');
        if (entry.target.classList.contains('glow-scroll')) {
          entry.target.style.boxShadow = '';
        }
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.glow-scroll, .glow-border').forEach(el => glowObs.observe(el));

  // ===== ADVANCED CREATIVE EFFECTS =====

  // SMOOTH COUNTER — numbers count up when in viewport
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent.trim();
      const match = text.match(/^(\d+)(\+?)$/);
      if (!match) return;
      const target = parseInt(match[1]);
      const suffix = match[2] || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current + suffix;
      }, 30);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter-num').forEach(el => counterObs.observe(el));

  // IMAGE REVEAL FROM DIRECTION — elements with .reveal-left/.reveal-right/.reveal-up slide in
  const dirRevealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const dir = el.dataset.revealDir || 'up';
      const transforms = { up: 'translateY(60px)', down: 'translateY(-60px)', left: 'translateX(60px)', right: 'translateX(-60px)' };
      el.style.opacity = '0';
      el.style.transform = transforms[dir] || transforms.up;
      el.style.transition = 'all 0.8s cubic-bezier(.23,1,.32,1)';
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
      dirRevealObs.unobserve(el);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-reveal-dir]').forEach(el => dirRevealObs.observe(el));

  // TILT ON SCROLL — elements tilt based on scroll direction
  let lastScrollY = window.scrollY;
  let scrollDir = 0;
  window.addEventListener('scroll', () => {
    scrollDir = window.scrollY > lastScrollY ? 1 : -1;
    lastScrollY = window.scrollY;
  }, { passive: true });

  const tiltScrollObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const update = () => {
        const rect = entry.target.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) / window.innerHeight;
        entry.target.style.transform = `perspective(800px) rotateX(${offset * 5}deg)`;
        if (rect.bottom > -100 && rect.top < window.innerHeight + 100) requestAnimationFrame(update);
      };
      update();
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.tilt-scroll').forEach(el => {
    if (isTouch) { el.style.transform = 'none'; return; }
    tiltScrollObs.observe(el);
  });

  // MOUSE GLOW — elements with .mouse-glow follow cursor with radial gradient
  if (!isTouch) {
    document.querySelectorAll('.mouse-glow').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        el.style.setProperty('--mx', x + 'px');
        el.style.setProperty('--my', y + 'px');
      });
    });
  }

  // HORIZONTAL SCROLL REVEAL — elements with .hscroll-reveal slide in horizontally on scroll
  const hscrollEls = [];
  const hScrollObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const direction = el.dataset.hscroll === 'right' ? 1 : -1;
      el.style.opacity = '0';
      el.style.transform = `translateX(${direction * 100}px)`;
      el.style.transition = 'all 0.8s cubic-bezier(.23,1,.32,1)';
      hscrollEls.push({ el, direction, revealed: false });
      hScrollObs.unobserve(el);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.hscroll-reveal').forEach(el => hScrollObs.observe(el));
  if (hscrollEls.length) {
    window.addEventListener('scroll', () => {
      hscrollEls.forEach(item => {
        if (item.revealed) return;
        const rect = item.el.getBoundingClientRect();
        const progress = 1 - Math.max(0, Math.min(1, rect.left / window.innerWidth));
        if (progress > 0.1) {
          item.el.style.opacity = String(Math.min(1, progress * 2));
          item.el.style.transform = `translateX(${item.direction * 100 * (1 - progress)}px)`;
        }
      });
    }, { passive: true });
  }

  // SMOOTH PARALLAX IMAGES — elements with .parallax-img move at different rate (desktop only)
  if (!isTouch && !prefersReduced) {
    const parallaxImgObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const speed = parseFloat(el.dataset.parallaxImg) || 0.15;
        const update = () => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -200 || rect.top > window.innerHeight + 200) {
            el.style.willChange = 'auto';
            return;
          }
          const offset = (rect.top - window.innerHeight / 2) * speed;
          el.style.transform = `translateY(${offset}px) scale(1.05)`;
          if (rect.bottom > -200 && rect.top < window.innerHeight + 200) requestAnimationFrame(update);
        };
        update();
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.parallax-img').forEach(el => {
      el.style.willChange = 'transform';
      parallaxImgObs.observe(el);
    });
  }

  // IMAGE SKELETON LOADING — mark images as loaded when decoded
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); return; }
    img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
    img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
  });

  // FLOATING PARTICLES — elements with .floating-particles get random floating children
  document.querySelectorAll('.floating-particles').forEach(el => {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;background:var(--main-blue);border-radius:50%;opacity:${0.05+Math.random()*0.1};left:${Math.random()*100}%;top:${Math.random()*100}%;animation:particleFloat ${6+Math.random()*8}s ease-in-out infinite ${Math.random()*5}s;pointer-events:none`;
      el.appendChild(p);
    }
  });
  if (document.querySelector('.floating-particles')) {
    const style = document.createElement('style');
    style.textContent = '@keyframes particleFloat{0%,100%{transform:translate(0,0)}25%{transform:translate(10px,-20px)}50%{transform:translate(-5px,-35px)}75%{transform:translate(15px,-15px)}}';
    document.head.appendChild(style);
  }

  // ===== NEW ANIMATIONS & 3D EFFECTS =====

  // TEXT SCRAMBLE / DECODE — elements with .scramble-text
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  const scrambleObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const finalText = el.dataset.scramble || el.textContent;
      el.dataset.scramble = finalText;
      const length = finalText.length;
      const iterations = 12;
      let count = 0;
      const interval = setInterval(() => {
        el.textContent = finalText.split('').map((char, i) => {
          if (i < count) return char;
          if (char === ' ') return ' ';
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
        count += Math.ceil(length / iterations);
        if (count >= length) {
          el.textContent = finalText;
          clearInterval(interval);
        }
      }, 40);
      scrambleObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.scramble-text').forEach(el => scrambleObs.observe(el));

  // SCROLL BORDER — animated top line on scroll
  const scrollBorderObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.scroll-border').forEach(el => scrollBorderObs.observe(el));

  // STAGGER CHILDREN — auto-animated stagger on scroll
  const staggerChildObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        staggerChildObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.stagger-children').forEach(el => staggerChildObs.observe(el));

  // CLIP REVEAL — images clip in from bottom
  const clipRevealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        clipRevealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.clip-reveal').forEach(el => clipRevealObs.observe(el));

  // TILT GLOW — radial gradient follows cursor on .tilt-glow elements
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.tilt-glow').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--glow-x', (e.clientX - r.left) + 'px');
        el.style.setProperty('--glow-y', (e.clientY - r.top) + 'px');
      });
    });
    // Inject tilt-glow positioning style
    const tgStyle = document.createElement('style');
    tgStyle.textContent = '.tilt-glow::after{left:var(--glow-x,50%);top:var(--glow-y,50%)}';
    document.head.appendChild(tgStyle);
  }









  // ============================================
  // SPECIAL EFFECTS — unique animations
  // ============================================

  // MAGNETIC TEXT — hero h1 characters follow cursor
  document.querySelectorAll('.magnetic-text').forEach(el => {
    splitChars(el);
    if (!isTouch) {
      el.addEventListener('mousemove', e => {
        const chars = el.querySelectorAll('span');
        const rect = el.getBoundingClientRect();
        chars.forEach((ch) => {
          const dist = Math.sqrt(Math.pow(e.clientX - (rect.left + ch.offsetLeft + ch.offsetWidth / 2), 2) + Math.pow(e.clientY - (rect.top + ch.offsetTop + ch.offsetHeight / 2), 2));
          const maxDist = 150;
          const force = Math.max(0, 1 - dist / maxDist);
          const angle = Math.atan2(
            (rect.top + ch.offsetTop + ch.offsetHeight / 2) - e.clientY,
            (rect.left + ch.offsetLeft + ch.offsetWidth / 2) - e.clientX
          );
          const moveX = Math.cos(angle) * force * 20;
          const moveY = Math.sin(angle) * force * 20;
          ch.style.transform = `translate(${moveX}px,${moveY}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.querySelectorAll('span').forEach(ch => { ch.style.transform = 'translate(0,0)'; });
      });
    }
  });

  // TEXT WAVE — characters undulate based on mouse Y
  document.querySelectorAll('.text-wave').forEach(el => {
    splitChars(el);
    let waveActive = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { waveActive = e.isIntersecting; });
    }, { threshold: 0.1 });
    observer.observe(el);
    if (!isTouch) {
      document.addEventListener('mousemove', e => {
        if (!waveActive) return;
        const chars = el.querySelectorAll('span');
        if (!chars.length) return;
        const rect = el.getBoundingClientRect();
        const normalizedY = (e.clientY - rect.top) / rect.height;
        chars.forEach((ch, i) => {
          const offset = Math.sin((i / chars.length) * Math.PI * 4 + normalizedY * Math.PI * 2) * 8;
          ch.style.transform = `translateY(${offset}px)`;
        });
      });
      el.addEventListener('mouseleave', () => {
        el.querySelectorAll('span').forEach(ch => { ch.style.transform = 'translateY(0)'; });
      });
    }
  });

  // SCROLL-SCRUB — rotate/scale driven by scroll position
  const scrubEls = document.querySelectorAll('.scroll-scrub');
  if (scrubEls.length) {
    const scrubObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) scrubActive.add(e.target);
        else scrubActive.delete(e.target);
      });
    }, { threshold: 0 });
    const scrubActive = new Set();
    scrubEls.forEach(el => scrubObserver.observe(el));
    window.addEventListener('scroll', () => {
      scrubActive.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        const clamped = Math.max(0, Math.min(1, progress));
        const rotate = (clamped - 0.5) * 15;
        const scale = 0.9 + clamped * 0.1;
        const translateY = (clamped - 0.5) * 40;
        el.style.transform = `rotate(${rotate}deg) scale(${scale}) translateY(${translateY}px)`;
      });
    }, { passive: true });
  }

  // PARTICLE BURST — spawn particles on click
  document.querySelectorAll('.particle-burst').forEach(el => {
    el.addEventListener('click', e => {
      const rect = el.getBoundingClientRect();
      const colors = ['var(--main-blue)', 'var(--accent)', '#a855f7', '#ec4899', '#facc15'];
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'burst-particle';
        const angle = (i / 12) * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        p.style.cssText = `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;background:${colors[i % colors.length]};--bx:${Math.cos(angle) * dist}px;--by:${Math.sin(angle) * dist}px;`;
        el.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    });
  });

  // NAV COLOR SHIFT — add blue accent on scroll
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 300) header.classList.add('nav-accent');
      else header.classList.remove('nav-accent');
      lastScroll = scrollY;
    }, { passive: true });
  }

  // ============================================
  // CREATIVITY PACK — 5 new effects
  // ============================================

  // 1. CLICK RIPPLE — expanding circle wherever you click
  document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  // 2. MORPHING BLOB — inject SVG blob into hero sections
  document.querySelectorAll('.hero').forEach(hero => {
    const blob = document.createElement('div');
    blob.className = 'hero-blob';
    blob.innerHTML = `<svg viewBox="0 0 600 600">
      <path d="M420,300Q380,420,300,440Q220,460,180,380Q140,300,180,220Q220,140,300,160Q380,180,420,300Z">
        <animate attributeName="d" dur="12s" repeatCount="indefinite" values="
          M420,300Q380,420,300,440Q220,460,180,380Q140,300,180,220Q220,140,300,160Q380,180,420,300Z;
          M400,340Q340,440,240,420Q140,400,160,300Q180,200,260,160Q340,120,400,220Q460,320,400,340Z;
          M440,280Q400,380,300,420Q200,460,160,360Q120,260,200,180Q280,100,360,160Q440,220,440,280Z;
          M380,360Q320,460,220,400Q120,340,160,240Q200,140,300,120Q400,100,420,200Q440,300,380,360Z;
          M420,300Q380,420,300,440Q220,460,180,380Q140,300,180,220Q220,140,300,160Q380,180,420,300Z"
        />
      </path>
    </svg>`;
    hero.style.position = 'relative';
    hero.insertBefore(blob, hero.firstChild);
  });

  // 4. HERO GRADIENT TEXT — add shimmer class to hero h1 spans
  document.querySelectorAll('.hero h1 span, .hero h1').forEach(el => {
    if (el.closest('.hero')) el.classList.add('hero-gradient-text');
  });

  // 5. PORTFOLIO HOVER TILT — 3D tilt toward cursor on latest/insta items
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.latest-item, .insta-item').forEach(item => {
      item.classList.add('portfolio-tilt');
      item.addEventListener('mousemove', e => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = y * -12;
        const rotateY = x * 12;
        item.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
      });
    });
  }

  // ============================================
  // CREATIVITY PACK VOL 2 — more effects
  // ============================================

  // 6. HERO PARALLAX DEPTH — bg image moves slower than content
  // Consolidated: handles parallax + tilt + morph in ONE scroll listener
  document.querySelectorAll('.hero').forEach(hero => {
    const bg = hero.querySelector('.hero-bg');
    const bgImg = hero.querySelector('.hero-bg img');
    const content = hero.querySelector('.hero-content');
    if (!bg) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = hero.getBoundingClientRect();
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const progress = -rect.top / hero.offsetHeight;
            const clamped = Math.max(0, Math.min(1, progress));
            bg.style.transform = `translateY(${progress * 80}px) scale(1.15) rotateX(${clamped * 3}deg)`;
            if (bgImg) bgImg.style.borderRadius = (12 + clamped * 38) + 'px';
            if (content) content.style.transform = `translateY(${progress * 30}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  });

  // 7. WAVE DIVIDERS — inject SVG waves between major sections
  const waveColors = {
    dark: { from: '#0a0a0a', to: '#0a0a0a' },
    light: { from: '#f8f9fa', to: '#f8f9fa' }
  };
  document.querySelectorAll('.section + .section, .faq + .section, .equipment + .section').forEach((section, i) => {
    const divider = document.createElement('div');
    divider.className = 'wave-divider' + (i % 2 === 0 ? '' : ' flip');
    const color = 'var(--bg)';
    divider.innerHTML = `<svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path fill="${color}" d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"/></svg>`;
    section.parentNode.insertBefore(divider, section);
  });

  // 8. SCROLL VELOCITY — elements move based on scroll speed
  const velocityEls = document.querySelectorAll('.scroll-velocity');
  if (velocityEls.length) {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    window.addEventListener('scroll', () => {
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity = (window.scrollY - lastScrollY) / dt * 16;
        lastScrollY = window.scrollY;
        lastTime = now;
        velocityEls.forEach(el => {
          const speed = parseFloat(el.dataset.speed) || 0.5;
          el.style.transform = `translateY(${velocity * speed}px)`;
        });
      }
    }, { passive: true });
  }

  // ============================================
  // SMOOTHNESS PACK — buttery animations
  // ============================================

  // 10. STAGGER REVEAL — already handled by staggerObs above (line 301)

  // 11. SMOOTH SCROLL PROGRESS — already handled by progressBar above (line 73)

  // 12. SMOOTH ANCHOR SCROLL — lerp-based smooth scroll for # links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const targetY = target.getBoundingClientRect().top + window.scrollY - 80;
      let currentY = window.scrollY;
      const diff = targetY - currentY;
      const duration = Math.min(Math.abs(diff) * 0.5, 800);
      const start = performance.now();
      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
      function smoothScroll(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, currentY + diff * easeOutCubic(progress));
        if (progress < 1) requestAnimationFrame(smoothScroll);
      }
      requestAnimationFrame(smoothScroll);
    });
  });

  // ============================================
  // VISUAL IMPACT PACK — wow-factor effects
  // ============================================

  // 13. AURORA GLOW — inject 3 conic-gradient beams into hero sections (desktop only)
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.hero').forEach(hero => {
      const aurora = document.createElement('div');
      aurora.className = 'aurora';
      aurora.innerHTML = '<div class="aurora-beam"></div><div class="aurora-beam"></div><div class="aurora-beam"></div>';
      hero.appendChild(aurora);
    });
  }

  // 14. FLOATING GEOMETRY — random shapes drifting upward
  if (!prefersReduced) {
    const geoContainer = document.createElement('div');
    geoContainer.className = 'geo-container';
    const shapes = ['circle', 'circle', 'circle', 'square', 'diamond', 'triangle'];
    const geoCount = window.innerWidth < 768 ? 4 : 8;
    for (let i = 0; i < geoCount; i++) {
      const shape = document.createElement('div');
      const type = shapes[Math.floor(Math.random() * shapes.length)];
      shape.className = 'geo-shape ' + type;
      const size = type === 'triangle' ? 0 : (8 + Math.random() * 20);
      if (type !== 'triangle') {
        shape.style.width = size + 'px';
        shape.style.height = size + 'px';
      }
      shape.style.left = Math.random() * 100 + '%';
      const duration = 20 + Math.random() * 30;
      const delay = Math.random() * -40;
      const driftX = (Math.random() - 0.5) * 300;
      const rot = Math.random() * 720 - 360;
      shape.style.animationDuration = duration + 's';
      shape.style.animationDelay = delay + 's';
      shape.style.setProperty('--drift-x', driftX + 'px');
      shape.style.setProperty('--rot', rot + 'deg');
      geoContainer.appendChild(shape);
    }
    document.body.appendChild(geoContainer);
  }

  // 16. GLOW BORDER — already handled by glowObs above (line 356)

  // 17. GRADIENT SEPARATOR — inject animated line after hero sections (desktop only)
  if (!isTouch) {
    document.querySelectorAll('.hero').forEach(hero => {
      const sep = document.createElement('div');
      sep.className = 'gradient-separator';
      hero.parentNode.insertBefore(sep, hero.nextSibling);
    });
  }

  // ============================================
  // CLEAN SCROLL EFFECTS — new animations
  // ============================================

  // 18. SCROLL REVEAL — observe .scroll-reveal elements
  const scrollRevealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); scrollRevealObs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.scroll-reveal').forEach(el => scrollRevealObs.observe(el));

  // 19. SCROLL STAGGER — observe .scroll-stagger containers
  const scrollStaggerObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); scrollStaggerObs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.scroll-stagger').forEach(el => scrollStaggerObs.observe(el));

  // 20. STAT GLOW — observe stat items
  const statGlowObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); statGlowObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-glow').forEach(el => statGlowObs.observe(el));

  // 21. SCALE-IN — observe .scale-in elements
  const scaleInObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); scaleInObs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.scale-in').forEach(el => scaleInObs.observe(el));

  // 22. LINE REVEAL — observe .line-reveal elements
  const lineRevealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); lineRevealObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.line-reveal').forEach(el => lineRevealObs.observe(el));

  // 23. PROGRESS RING — inject into hero sections
  document.querySelectorAll('.hero').forEach(hero => {
    const ring = document.createElement('div');
    ring.className = 'progress-ring';
    const r = 20, c = 2 * Math.PI * r;
    ring.innerHTML = `<svg viewBox="0 0 50 50"><circle cx="25" cy="25" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c}"/></svg>`;
    hero.appendChild(ring);
    const circle = ring.querySelector('circle');
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const progress = h > 0 ? window.scrollY / h : 0;
      circle.style.strokeDashoffset = c - (progress * c);
    }, { passive: true });
  });

  // ============================================
  // NEW ANIMATION EFFECTS — elegant & flowing
  // ============================================

  // BLUR-FADE — sections blur in when entering viewport
  const blurFadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); blurFadeObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.blur-fade').forEach(el => blurFadeObs.observe(el));

  // HORIZONTAL STAGGER — grid items slide in from alternating sides
  const hStaggerObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); hStaggerObs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.h-stagger').forEach(el => hStaggerObs.observe(el));

  // MAGNETIC DRAG — elements follow mouse when grabbed
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.magnetic-drag').forEach(el => {
      let isDragging = false, startX, startY, currentX = 0, currentY = 0;
      el.addEventListener('mousedown', e => {
        isDragging = true;
        el.classList.add('dragging');
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
      });
      window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        currentX = Math.max(-60, Math.min(60, currentX));
        currentY = Math.max(-60, Math.min(60, currentY));
        el.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentX * 0.05}deg)`;
      }, { passive: true });
      window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        el.classList.remove('dragging');
        currentX = 0; currentY = 0;
        el.style.transform = '';
      });
    });
  }

  // SECTION PARALLAX — background image moves slower than content
  document.querySelectorAll('.section-parallax-bg').forEach(bg => {
    window.addEventListener('scroll', () => {
      const rect = bg.parentElement.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewH) return;
      const progress = (rect.top + rect.height) / (viewH + rect.height);
      const offset = (progress - 0.5) * 40;
      bg.style.transform = `translateY(${offset}px) scale(1.1)`;
    }, { passive: true });
  });

  // KONAMI CODE EASTER EGG
  const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIndex = 0;
  document.addEventListener('keydown', e => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;animation:fadeIn .4s ease;cursor:pointer';
        overlay.innerHTML = `
          <img src="gallery/biler/untitled-9223.jpg" alt="Behind the scenes" style="max-width:500px;width:90%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.5)">
          <div style="text-align:center;color:white">
            <h2 style="font-size:1.5rem;margin-bottom:8px">Hey! Du fant easter egget 🥚</h2>
            <p style="color:rgba(255,255,255,.6);font-size:.9rem">– Oskar</p>
          </div>
        `;
        overlay.addEventListener('click', () => overlay.remove());
        document.body.appendChild(overlay);
      }
    } else {
      konamiIndex = 0;
    }
  });

  // ============================================
  // CREATIVE EFFECTS PACK
  // ============================================

  // GRADIENT SHIFT — background color shifts based on scroll position
  (function() {
    const root = document.documentElement;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const p = h > 0 ? document.documentElement.scrollTop / h : 0;
          const hue = 210 + p * 30;
          const sat = 70 + p * 15;
          root.style.setProperty('--gradient-hue', hue);
          root.style.setProperty('--gradient-sat', sat + '%');
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  // SLICE REVEAL — clip-path wipe-in on scroll
  const sliceObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('sliced');
      sliceObs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.slice-reveal').forEach(el => sliceObs.observe(el));

  // LIQUID CURSOR — trailing dots follow cursor (desktop only)
  if (!isTouch && !prefersReduced) {
    const dotCount = 5;
    const dots = [];
    const positions = [];
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'liquid-dot';
      const size = 12 - i * 2;
      dot.style.cssText = `width:${size}px;height:${size}px;opacity:${0.5 - i * 0.08}`;
      document.body.appendChild(dot);
      dots.push(dot);
      positions.push({ x: 0, y: 0 });
    }
    let mx = 0, my = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    function animateLiquid() {
      positions[0].x += (mx - positions[0].x) * 0.15;
      positions[0].y += (my - positions[0].y) * 0.15;
      for (let i = 1; i < dotCount; i++) {
        positions[i].x += (positions[i-1].x - positions[i].x) * (0.12 - i * 0.015);
        positions[i].y += (positions[i-1].y - positions[i].y) * (0.12 - i * 0.015);
      }
      for (let i = 0; i < dotCount; i++) {
        dots[i].style.transform = `translate(${positions[i].x}px,${positions[i].y}px)`;
      }
      requestAnimationFrame(animateLiquid);
    }
    animateLiquid();
  }

})();
