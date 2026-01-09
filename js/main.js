/* main.js */
document.addEventListener('DOMContentLoaded', () => {
  // NAVBAR shadow on scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Masonry reveal animation
  const items = document.querySelectorAll('.masonry-item');
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });

  items.forEach(i => revealObserver.observe(i));

  // LIGHTBOX
  const masonry = document.getElementById('masonry');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose = document.querySelector('.lb-close');
  const lbPrev = document.querySelector('.lb-prev');
  const lbNext = document.querySelector('.lb-next');

  let galleryImages = [];
  function refreshGallery() {
    galleryImages = Array.from(document.querySelectorAll('.masonry-item img'));
  }
  refreshGallery();

  let currentIndex = -1;
  function openLightbox(index) {
    if (index < 0 || index >= galleryImages.length) return;
    const img = galleryImages[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = img.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    currentIndex = index;
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    currentIndex = -1;
  }

  masonry.addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    refreshGallery();
    const index = galleryImages.indexOf(img);
    openLightbox(index);
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => openLightbox((currentIndex-1+galleryImages.length)%galleryImages.length));
  lbNext.addEventListener('click', () => openLightbox((currentIndex+1)%galleryImages.length));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && currentIndex > -1) openLightbox((currentIndex-1+galleryImages.length)%galleryImages.length);
    if (e.key === 'ArrowRight' && currentIndex > -1) openLightbox((currentIndex+1)%galleryImages.length);
  });

  // LOAD MORE - demo: duplicate items
  const loadBtn = document.getElementById('loadMore');
  if (loadBtn){
    loadBtn.addEventListener('click', () => {
      loadBtn.disabled = true;
      loadBtn.textContent = 'Laster...';
      setTimeout(()=> {
        // clone 4 items as demo
        const imgs = ['images/img2.jpg','images/img3.jpg','images/img4.jpg','images/img5.jpg'];
        imgs.forEach((src, i) => {
          const fig = document.createElement('figure');
          fig.className = 'masonry-item';
          const image = document.createElement('img');
          image.src = src;
          image.alt = 'Ekstra bilde ' + (i+1);
          image.loading = 'lazy';
          fig.appendChild(image);
          masonry.appendChild(fig);
          revealObserver.observe(fig);
        });
        refreshGallery();
        loadBtn.disabled = false;
        loadBtn.textContent = 'Last flere';
      }, 800);
    });
  }

  // Contact form (demo)
  const contactForm = document.getElementById('contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = document.getElementById('formMsg');
      msg.textContent = 'Melding sendt! Jeg svarer snart. (Demo)';
      contactForm.reset();
    });
  }

  // Page transitions for anchor links (simple)
  const links = document.querySelectorAll('a[href$=".html"], a[href="/"]');
  links.forEach(a => {
    // ignore external links / anchors
    if(a.target === "_blank" || a.href.indexOf(location.origin) === -1) return;
    a.addEventListener('click', (ev) => {
      // Allow normal if same-page anchor
      if (a.hash) return;
      ev.preventDefault();
      document.documentElement.classList.add('page-transition');
      document.body.classList.add('fade-out');
      setTimeout(()=>{ window.location = a.href; }, 280);
    });
  });

  // Accessibility: focus trap for lightbox (simple)
  // Not full trap, but set focus to close button when opened
  const observerLB = new MutationObserver(() => {
    if (lightbox.classList.contains('open')) lbClose.focus();
  });
  observerLB.observe(lightbox, { attributes:true, attributeFilter: ['class'] });

});
