// script.js — consolidated, HTML-aware site interactions: menu, hero heart nav, smooth scroll,
// thumbnails toggle, carousel, newsletter/contact handling, reduced-motion & a11y safeguards
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded', function(){
    // Avoid running twice
    if(document.documentElement.dataset.hhhScriptInitialized) return;
    document.documentElement.dataset.hhhScriptInitialized = '1';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Helper to mark an element so we don't attach duplicate listeners
    const markInit = (el, key='hhhInited') => { if(!el) return false; if(el.dataset[key]) return false; el.dataset[key] = '1'; return true; };

    // Mobile menu (matches your HTML: #menu-button, #mobile-menu)
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if(menuButton && mobileMenu && markInit(menuButton, 'menu')){
      const setOpen = (isOpen) => {
        mobileMenu.classList.toggle('is-open', isOpen);
        menuButton.setAttribute('aria-expanded', String(!!isOpen));
      };

      menuButton.addEventListener('click', function(){
        const isOpen = mobileMenu.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(isOpen));
      });

      // Close when a mobile link is activated
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
      });

      // Close on Escape
      document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setOpen(false);
      });
    }

    // Hero heart nav (hover/focus and touch-safe)
    const heroHeart = document.getElementById('hero-heart');
    const heartNav = document.getElementById('heart-nav');
    if(heroHeart && heartNav && markInit(heroHeart, 'heart')){
      const setHeartNav = (visible) => heartNav.classList.toggle('is-visible', visible);

      // Pointer/keyboard interactions
      heroHeart.addEventListener('mouseenter', ()=> setHeartNav(true));
      heroHeart.addEventListener('mouseleave', ()=> setHeartNav(false));
      heroHeart.addEventListener('focus', ()=> setHeartNav(true));
      heroHeart.addEventListener('blur', ()=> setHeartNav(false));

      heartNav.addEventListener('mouseenter', ()=> setHeartNav(true));
      heartNav.addEventListener('mouseleave', ()=> setHeartNav(false));

      // For touch devices, toggle on click (ignore clicks that come from interactive children)
      const isTouch = matchMedia('(hover: none)').matches;
      if(isTouch){
        heroHeart.addEventListener('click', (e)=>{
          if(e.target && (e.target.tagName.toLowerCase() === 'a' || e.target.closest('button'))) return;
          setHeartNav(!heartNav.classList.contains('is-visible'));
        });
      }
    }

    // Smooth scroll for same-page anchors (respect prefers-reduced-motion)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      // avoid attaching many times
      if(!markInit(anchor, 'smoothScroll')) return;
      anchor.addEventListener('click', function(e){
        const href = anchor.getAttribute('href');
        if(!href || href === '#') return; // allow empty anchors to behave normally
        if(href.length > 1){
          const target = document.querySelector(href);
          if(target){
            e.preventDefault();
            if(prefersReduced){ target.scrollIntoView(); }
            else { target.scrollIntoView({behavior:'smooth', block:'start'}); }
            // close mobile menu if open
            if(mobileMenu && mobileMenu.classList.contains('is-open')){
              mobileMenu.classList.remove('is-open');
              if(menuButton) menuButton.setAttribute('aria-expanded','false');
            }
            // move focus for accessibility
            target.setAttribute('tabindex','-1');
            target.focus({preventScroll: true});
            // remove the tabindex if it wasn't focusable before
            window.setTimeout(()=>{ if(target.getAttribute('tabindex') === '-1') target.removeAttribute('tabindex'); }, 1200);
          }
        }
      });
    });

    // Thumbnails toggle (optional, no-op if missing)
    const thumbsToggle = document.getElementById('thumbsToggle');
    const heroArt = document.querySelector('.hero__art');
    if(thumbsToggle && heroArt && markInit(thumbsToggle, 'thumbs')){
      thumbsToggle.addEventListener('click', function(){
        const active = heroArt.classList.toggle('thumbs-active');
        thumbsToggle.setAttribute('aria-pressed', String(active));
      });

      // touch tapping on heroArt toggles
      const touchCapable = matchMedia('(hover: none)').matches;
      if(touchCapable){
        heroArt.addEventListener('click', function(e){
          if(e.target.tagName.toLowerCase() === 'a' || e.target.closest('button')) return;
          const active = heroArt.classList.toggle('thumbs-active');
          if(thumbsToggle) thumbsToggle.setAttribute('aria-pressed', String(active));
        });
      }
    }

    // Carousel (optional)
    (function initCarousel(){
      const carousel = document.querySelector('[data-carousel]');
      if(!carousel || !markInit(carousel, 'carousel')) return;

      const track = carousel.querySelector('[data-carousel-track]');
      if(!track) return;
      const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      const pauseBtn = carousel.querySelector('[data-carousel-pause]');
      const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
      let current = 0; let paused = false; let timer = null;
      const advanceInterval = 12000;

      function update(){
        const offset = -current * 100;
        track.style.transform = `translateX(${offset}%)`;
        dots.forEach((d,i)=> d.setAttribute('aria-selected', String(i===current)) );
      }
      function go(n){ current = (n + slides.length) % slides.length; update(); }
      function nextSlide(){ go(current+1); }
      function prevSlide(){ go(current-1); }

      if(next) next.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
      if(prev) prev.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });
      if(dots.length) dots.forEach((dot,i)=> dot.addEventListener('click', ()=>{ go(i); resetTimer(); }));

      function startTimer(){ if(prefersReduced) return; stopTimer(); timer = setInterval(()=>{ if(!paused) nextSlide(); }, advanceInterval); }
      function stopTimer(){ if(timer) clearInterval(timer); timer = null; }
      function resetTimer(){ stopTimer(); startTimer(); }

      if(pauseBtn){
        pauseBtn.addEventListener('click', ()=>{
          paused = !paused;
          pauseBtn.textContent = paused ? '▶' : '❚❚';
        });
      }

      carousel.addEventListener('mouseenter', ()=>{ paused = true; });
      carousel.addEventListener('mouseleave', ()=>{ paused = false; });
      carousel.addEventListener('focusin', ()=>{ paused = true; });
      carousel.addEventListener('focusout', ()=>{ paused = false; });

      carousel.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowLeft'){ prevSlide(); resetTimer(); }
        if(e.key === 'ArrowRight'){ nextSlide(); resetTimer(); }
        if(e.key === 'Home'){ go(0); resetTimer(); }
        if(e.key === 'End'){ go(slides.length-1); resetTimer(); }
      });

      update(); startTimer();
    })();

    // Newsletter form (matches #newsletter-form)
    const newsletterForm = document.getElementById('newsletter-form');
    if(newsletterForm && markInit(newsletterForm, 'newsletter')){
      const input = document.getElementById('newsletter-email');
      const feedback = document.getElementById('newsletter-feedback');
      newsletterForm.addEventListener('submit', (event)=>{
        event.preventDefault();
        if(feedback) feedback.classList.add('is-visible');
        if(!input || !input.checkValidity()){
          if(feedback) { feedback.textContent = 'Please enter a valid email address.'; feedback.style.color = '#7a160a'; }
          if(input) input.focus();
          return;
        }
        newsletterForm.reset();
        if(feedback) { feedback.textContent = "Thank you — you\u2019re on the list."; feedback.style.color = '#111111'; }
      });
    }

    // Generic contact form fallback (.contact-form) to match original script
    const contactForm = document.querySelector('.contact-form');
    if(contactForm && markInit(contactForm, 'contact')){
      contactForm.addEventListener('submit', function(e){
        e.preventDefault();
        const invalid = contactForm.querySelector(':invalid');
        if(invalid){ invalid.focus(); return; }
        contactForm.reset();
        const note = document.getElementById('contact-note');
        if(note) note.textContent = 'Thank you — we received your message and will be in touch within 48 hours.';
      });
    }

    // Done
  });
})();
