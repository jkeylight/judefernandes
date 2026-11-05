(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Intro loader
  const loader = $('.loader');
  const loaderCount = $('.loader-count');
  const loaderLine = $('.loader-line i');
  let progress = 0;
  const tick = setInterval(() => {
    progress = Math.min(progress + Math.ceil(Math.random() * 13), 100);
    if (loaderCount) loaderCount.textContent = String(progress).padStart(2, '0');
    if (loaderLine) loaderLine.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader?.classList.add('is-done');
        document.body.classList.remove('is-loading');
        initMotion();
      }, 250);
    }
  }, 55);

  // Lenis smooth scroll
  let lenis;
  function initSmoothScroll() {
    if (!window.Lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.25 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = $(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -8 });
      });
    });
  }

  // GSAP motion
  function initMotion() {
    initSmoothScroll();
    if (!window.gsap) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-title > span', {
      yPercent: 115, opacity: 0, duration: 1.25, stagger: 0.12,
      ease: 'power4.out', delay: 0.08
    });
    gsap.from('.hero-meta, .hero .eyebrow, .hero-foot, .hero-bottom-line', {
      y: 18, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out', delay: .25
    });
    gsap.from('.hero-image-wrap', { scale: 1.08, opacity: 0, duration: 1.5, ease: 'power3.out', delay: .25 });
    $$('.reveal-up').forEach(el => {
      gsap.fromTo(el, { y: 45, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    $$('.project-card').forEach((card, i) => {
      gsap.from(card, {
        y: 35, opacity: 0, duration: .8, delay: (i % 2) * .08, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
      });
    });
    gsap.to('.hero-image-fallback', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    ScrollTrigger.refresh();
  }

  // Project filters
  const cards = $$('.project-card');
  const filterButtons = $$('.filter-btn');
  const visibleCount = $('#visible-count');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach(b => b.classList.toggle('is-active', b === btn));
      let count = 0;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
        if (show) count++;
      });
      if (visibleCount) visibleCount.textContent = String(count).padStart(2, '0');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  // YouTube modal player
  const modal = $('.video-modal');
  const iframe = $('.modal-video iframe');
  const closeBtn = $('.modal-close');
  function openVideo(card) {
    const id = card.dataset.video;
    if (!id || !modal || !iframe) return;
    $('.modal-title').textContent = card.dataset.title || 'Selected project';
    $('.modal-credit').textContent = card.dataset.credit || '';
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
  }
  function closeVideo() {
    if (!modal || !iframe) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    iframe.src = '';
    document.body.classList.remove('modal-open');
    if (lenis) lenis.start();
  }
  cards.forEach(card => {
    const media = $('.project-media', card);
    media?.addEventListener('click', () => openVideo(card));
  });
  closeBtn?.addEventListener('click', closeVideo);
  modal?.addEventListener('click', e => { if (e.target === modal) closeVideo(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideo(); });

  // Mobile navigation
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  function closeMenu() {
    menuToggle?.classList.remove('is-active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('is-open');
  }
  menuToggle?.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('is-open');
    menuToggle.classList.toggle('is-active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));

  // Fallback if external animation libraries fail
  window.addEventListener('load', () => {
    if (!window.gsap) {
      $$('.reveal-up').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    }
  });
})();
