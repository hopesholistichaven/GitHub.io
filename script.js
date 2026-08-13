// script.js — site interactions: nav toggle, carousel, smooth scroll, thumbnails toggle
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Nav toggle
    const navToggle = document.querySelector('.nav__toggle');
    const navList = document.querySelector('.nav__list');
    if(navToggle && navList){
      navToggle.addEventListener('click', function(){
        const open = navList.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(open));
      });
    }

    // Smooth scroll for same-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor =>{
      anchor.addEventListener('click', function(e){
        const href = anchor.getAttribute('href');
        if(href.length>1){
          const target = document.querySelector(href);
          if(target){
            e.preventDefault();
            if(prefersReduced){ target.scrollIntoView(); }
            else { target.scrollIntoView({behavior:'smooth',block:'start'}); }
            // close mobile nav if open
            if(navList && navList.classList.contains('is-open')){
              navList.classList.remove('is-open');
              if(navToggle) navToggle.setAttribute('aria-expanded','false');
            }
          }
        }
      });
    });

    // Thumbnails toggle (for touch/keyboard users)
    const thumbsToggle = document.getElementById('thumbsToggle');
    const heroArt = document.querySelector('.hero__art');
    if(thumbsToggle && heroArt){
      thumbsToggle.addEventListener('click', function(){
        const active = heroArt.classList.toggle('thumbs-active');
        thumbsToggle.setAttribute('aria-pressed', String(active));
      });

      // also allow tapping the heart on touch devices to toggle
      let touchCapable = matchMedia('(hover: none)').matches;
      if(touchCapable){
        heroArt.addEventListener('click', function(e){
          // ignore if the click originated from interactive elements
          if(e.target.tagName.toLowerCase() === 'a' || e.target.closest('button')) return;
          const active = heroArt.classList.toggle('thumbs-active');
          if(thumbsToggle) thumbsToggle.setAttribute('aria-pressed', String(active));
        });
      }
    }

    // Carousel (testimonials)
    const carousel = document.querySelector('[data-carousel]');
    if(carousel){
      const track = carousel.querySelector('[data-carousel-track]');
      const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      const pauseBtn = carousel.querySelector('[data-carousel-pause]');
      const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
      let current = 0;
      let paused = false;
      let timer = null;
      const advanceInterval = 12000; // 12s

      function update(){
        const offset = -current * 100;
        track.style.transform = `translateX(${offset}%)`;
        dots.forEach((d,i)=>{
          d.setAttribute('aria-selected', String(i===current));
        });
      }

      function go(n){
        current = (n + slides.length) % slides.length;
        update();
      }

      function nextSlide(){ go(current+1); }
      function prevSlide(){ go(current-1); }

      // controls
      if(next) next.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
      if(prev) prev.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });
      if(dots.length){ dots.forEach((dot, i)=>{ dot.addEventListener('click', ()=>{ go(i); resetTimer(); }); }); }

      function startTimer(){ if(prefersReduced) return; timer = setInterval(()=>{ if(!paused) nextSlide(); }, advanceInterval); }
      function stopTimer(){ if(timer) clearInterval(timer); timer = null; }
      function resetTimer(){ stopTimer(); startTimer(); }

      if(pauseBtn){
        pauseBtn.addEventListener('click', ()=>{
          paused = !paused;
          pauseBtn.textContent = paused ? '▶' : '❚❚';
        });
      }

      // pause on hover/focus
      carousel.addEventListener('mouseenter', ()=>{ paused = true; });
      carousel.addEventListener('mouseleave', ()=>{ paused = false; });
      carousel.addEventListener('focusin', ()=>{ paused = true; });
      carousel.addEventListener('focusout', ()=>{ paused = false; });

      // keyboard navigation
      carousel.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowLeft') { prevSlide(); resetTimer(); }
        if(e.key === 'ArrowRight') { nextSlide(); resetTimer(); }
        if(e.key === 'Home') { go(0); resetTimer(); }
        if(e.key === 'End') { go(slides.length-1); resetTimer(); }
      });

      update(); startTimer();
    }

    // Form: simple client-side validation feedback
    const contactForm = document.querySelector('.contact-form');
    if(contactForm){
      contactForm.addEventListener('submit', function(e){
        e.preventDefault();
        const invalid = contactForm.querySelector(':invalid');
        if(invalid){ invalid.focus(); return; }
        // fake submit
        contactForm.reset();
        const note = document.getElementById('contact-note');
        if(note) note.textContent = 'Thank you — we received your message and will be in touch within 48 hours.';
      });
    }

  });
})();
