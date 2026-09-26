/**
 * AURORA SIGNAL — MAIN JAVASCRIPT ENGINE
 * Vanilla ES6 JavaScript: Custom Cursor, Sticky Nav, Intersection Observers,
 * Pure JS Carousel with Drag/Swipe, Accordion, Dynamic Pricing & Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initStickyNavAndActiveLinks();
  initMobileMenu();
  initScrollReveal();
  initPricingSwitch();
  initTestimonialsSlider();
  initFaqAccordion();
  initContactForm();
  initNewsletterForm();
  initSoundDemoToggle();
  initAcousticSoundstageCanvas();
  initWebAudioSynthesizer();
  initSpatialSlider();
  initFrequencyModeTabs();
  initLiveTelemetryJitter();
});

/* ==========================================================================
   1. CUSTOM CURSOR (GLOWING DOT + SMOOTH TRAILING BLUR RING)
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const follower = document.querySelector('.custom-cursor-follower');
  if (!dot || !follower) return;

  // Don't initialize on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let isVisible = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      dot.style.opacity = '1';
      follower.style.opacity = '1';
      isVisible = true;
    }

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  window.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    follower.style.opacity = '0';
    isVisible = false;
  });

  // Smooth lerp for the follower ring
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Expand ring on interactive elements
  const interactiveElements = document.querySelectorAll(
    'a, button, input, select, textarea, .glass-panel-interactive, .faq-trigger, .pricing-switch-btn, .carousel-dot, .sound-toggle-btn'
  );

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('cursor-hover');
      dot.style.transform = 'translate(-50%, -50%) scale(1.6)';
    });
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('cursor-hover');
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

/* ==========================================================================
   2. STICKY NAV, SCROLL PROGRESS & KEYBOARD SHORTCUTS
   ========================================================================== */
function initStickyNavAndActiveLinks() {
  const header = document.getElementById('main-header');
  const progressLine = document.getElementById('nav-scroll-progress');
  const navLinks = document.querySelectorAll('.arch-nav-link, .nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Live Hairline Scroll Progress Bar & Header Scrolled State
  function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    if (progressLine) {
      progressLine.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
    }

    if (header) {
      if (scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight + 2;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Active Link Observer
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -50% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => sectionObserver.observe(section));

  // Keyboard Shortcuts (1-5 Jump to Sections)
  const sectionKeyMap = {
    '1': '#services',
    '2': '#experience',
    '3': '#pricing',
    '4': '#testimonials',
    '5': '#faq'
  };

  document.addEventListener('keydown', (e) => {
    // Ignore if user is typing in form inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    if (sectionKeyMap[e.key]) {
      const targetEl = document.querySelector(sectionKeyMap[e.key]);
      if (targetEl) {
        const headerHeight = header ? header.offsetHeight : 0;
        window.scrollTo({
          top: targetEl.getBoundingClientRect().top + window.scrollY - headerHeight + 2,
          behavior: 'smooth'
        });
      }
    }
  });
}

/* ==========================================================================
   3. ARCHITECTURAL INDEX DRAWER
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const menuBtnText = document.getElementById('menu-btn-text');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : !mobileMenu.classList.contains('is-open');
    if (isOpen) {
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      mobileMenu.classList.remove('pointer-events-none');
      if (menuBtnText) menuBtnText.textContent = 'INDEX [ ✕ ]';
      document.body.style.overflow = 'hidden';
    } else {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      mobileMenu.classList.add('pointer-events-none');
      if (menuBtnText) menuBtnText.textContent = 'INDEX [ + ]';
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(true);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      toggleMenu(true);
    }
  });
}

/* ==========================================================================
   4. SCROLL REVEAL (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-fade-rise');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

/* ==========================================================================
   5. PRICING SWITCH (MONTHLY / ANNUAL WITH ANIMATED NUMBERS)
   ========================================================================== */
function initPricingSwitch() {
  const switchContainer = document.querySelector('.pricing-switch-container');
  const monthlyBtn = document.getElementById('btn-monthly');
  const yearlyBtn = document.getElementById('btn-yearly');
  const priceStarter = document.getElementById('price-starter');
  const pricePro = document.getElementById('price-pro');
  const priceElite = document.getElementById('price-elite');
  const periodStarter = document.getElementById('period-starter');
  const periodPro = document.getElementById('period-pro');
  const periodElite = document.getElementById('period-elite');

  if (!switchContainer || !monthlyBtn || !yearlyBtn) return;

  const pricingData = {
    monthly: {
      starter: { price: '49', period: '/ month' },
      pro: { price: '89', period: '/ month' },
      elite: { price: '169', period: '/ month' }
    },
    yearly: {
      starter: { price: '39', period: '/ mo (billed $468/yr)' },
      pro: { price: '69', period: '/ mo (billed $828/yr)' },
      elite: { price: '139', period: '/ mo (billed $1,668/yr)' }
    }
  };

  function updatePrices(isYearly) {
    const data = isYearly ? pricingData.yearly : pricingData.monthly;

    [
      { el: priceStarter, periodEl: periodStarter, val: data.starter },
      { el: pricePro, periodEl: periodPro, val: data.pro },
      { el: priceElite, periodEl: periodElite, val: data.elite }
    ].forEach(({ el, periodEl, val }) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          el.textContent = val.price;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      }
      if (periodEl) {
        periodEl.textContent = val.period;
      }
    });

    if (isYearly) {
      switchContainer.classList.add('yearly-active');
      yearlyBtn.classList.add('active');
      monthlyBtn.classList.remove('active');
    } else {
      switchContainer.classList.remove('yearly-active');
      monthlyBtn.classList.add('active');
      yearlyBtn.classList.remove('active');
    }
  }

  monthlyBtn.addEventListener('click', () => updatePrices(false));
  yearlyBtn.addEventListener('click', () => updatePrices(true));
}

/* ==========================================================================
   6. TESTIMONIALS SLIDER (CUSTOM JS CAROUSEL WITH SWIPE & DRAG)
   ========================================================================== */
function initTestimonialsSlider() {
  const viewport = document.getElementById('testimonials-viewport');
  const track = document.getElementById('testimonials-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  const dotsContainer = document.getElementById('testimonial-dots');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  // Calculate visible items based on screen width
  function getItemsPerView() {
    if (window.innerWidth >= 1100) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    const itemsPerView = getItemsPerView();
    return Math.max(0, slides.length - itemsPerView);
  }

  // Create dot indicators
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIndex = getMaxIndex();
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    const maxIndex = getMaxIndex();
    if (index < 0) {
      currentIndex = maxIndex;
    } else if (index > maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const itemWidthPercent = 100 / getItemsPerView();
    currentTranslate = -currentIndex * itemWidthPercent;
    prevTranslate = currentTranslate;
    track.style.transform = `translateX(${currentTranslate}%)`;
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoPlay();
    });
  }

  // Auto-play feature
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5500);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  if (viewport) {
    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('mouseleave', startAutoPlay);

    // Touch & Mouse Drag Handlers
    viewport.addEventListener('touchstart', touchStart, { passive: true });
    viewport.addEventListener('touchend', touchEnd);
    viewport.addEventListener('touchmove', touchMove, { passive: true });

    viewport.addEventListener('mousedown', dragStart);
    viewport.addEventListener('mouseup', dragEnd);
    viewport.addEventListener('mouseleave', dragEnd);
    viewport.addEventListener('mousemove', dragMove);
  }

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function touchStart(event) {
    startPos = getPositionX(event);
    isDragging = true;
    stopAutoPlay();
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    // visual feedback during drag
  }

  function touchEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    const currentPosition = event.changedTouches ? event.changedTouches[0].clientX : event.pageX;
    const diff = currentPosition - startPos;
    if (diff < -45) {
      goToSlide(currentIndex + 1);
    } else if (diff > 45) {
      goToSlide(currentIndex - 1);
    }
    startAutoPlay();
  }

  function dragStart(event) {
    startPos = getPositionX(event);
    isDragging = true;
    stopAutoPlay();
    track.style.cursor = 'grabbing';
  }

  function dragMove(event) {
    if (!isDragging) return;
  }

  function dragEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    const currentPosition = getPositionX(event);
    const diff = currentPosition - startPos;
    if (diff < -45) {
      goToSlide(currentIndex + 1);
    } else if (diff > 45) {
      goToSlide(currentIndex - 1);
    }
    startAutoPlay();
  }

  window.addEventListener('resize', () => {
    createDots();
    goToSlide(Math.min(currentIndex, getMaxIndex()));
  });

  createDots();
  goToSlide(0);
  startAutoPlay();
}

/* ==========================================================================
   7. FAQ ACCORDION (SMOOTH HEIGHT TRANSITION + ONE-ITEM OPEN BEHAVIOR)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const answerWrapper = item.querySelector('.faq-answer-wrapper');

    if (!trigger || !answerWrapper) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items first (accordion rule)
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-open')) {
          otherItem.classList.remove('is-open');
          const otherWrapper = otherItem.querySelector('.faq-answer-wrapper');
          if (otherWrapper) {
            otherWrapper.style.maxHeight = '0px';
          }
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('is-open');
        answerWrapper.style.maxHeight = '0px';
      } else {
        item.classList.add('is-open');
        answerWrapper.style.maxHeight = `${answerWrapper.scrollHeight}px`;
      }
    });
  });

  // Open first item by default for preview
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstWrapper = firstItem.querySelector('.faq-answer-wrapper');
    if (firstItem && firstWrapper) {
      firstItem.classList.add('is-open');
      firstWrapper.style.maxHeight = `${firstWrapper.scrollHeight}px`;
    }
  }
}

/* ==========================================================================
   8. CONTACT FORM CLIENT-SIDE VALIDATION & INTERACTIVE TOAST
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('contact-toast');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const submitBtn = document.getElementById('contact-submit-btn');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, condition) {
    if (!condition) {
      input.classList.add('error');
      return false;
    } else {
      input.classList.remove('error');
      return true;
    }
  }

  // Clear errors on input
  [nameInput, emailInput, subjectInput, messageInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => input.classList.remove('error'));
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
    const isEmailValid = validateField(emailInput, emailRegex.test(emailInput.value.trim()));
    const isSubjectValid = validateField(subjectInput, subjectInput.value.trim() !== '');
    const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 10);

    if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
      // Simulate transmitting state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="inline-flex items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Transmitting Quantum Signal...
        </span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        showToast('Signal Received. Our acoustic master engineer will respond within 4 hours.');
      }, 1200);
    }
  });

  function showToast(message) {
    if (!toast) return;
    const toastMsg = toast.querySelector('.toast-message');
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}

/* ==========================================================================
   9. NEWSLETTER MINI FORM
   ========================================================================== */
function initNewsletterForm() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const feedback = document.getElementById('newsletter-feedback');

  if (!form || !input) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!emailRegex.test(email)) {
      input.classList.add('error');
      if (feedback) {
        feedback.textContent = 'Please enter a valid studio email address.';
        feedback.className = 'text-xs text-pink-400 mt-2 block';
      }
      return;
    }

    input.classList.remove('error');
    input.value = '';
    if (feedback) {
      feedback.textContent = 'Subscribed! You will receive exclusive acoustic whitepapers and firmware updates.';
      feedback.className = 'text-xs text-emerald-400 mt-2 block';
    }
  });
}

/* ==========================================================================
   10. INTERACTIVE SOUND SIMULATOR / ACOUSTIC VISUALIZER
   ========================================================================== */
function initSoundDemoToggle() {
  const soundToggle = document.getElementById('sound-demo-toggle');
  const soundBars = document.querySelectorAll('.sound-bar');
  const soundStatus = document.getElementById('sound-demo-status');

  if (!soundToggle || !soundBars.length) return;

  let isPlaying = true;

  soundToggle.addEventListener('click', () => {
    isPlaying = !isPlaying;
    soundBars.forEach((bar) => {
      if (isPlaying) {
        bar.style.animationPlayState = 'running';
      } else {
        bar.style.animationPlayState = 'paused';
      }
    });

    if (soundStatus) {
      soundStatus.textContent = isPlaying ? 'DSP FLUX: 96kHz Lossless Active' : 'DSP FLUX: Standby';
      soundStatus.style.color = isPlaying ? 'var(--aurora-cyan)' : 'var(--text-muted)';
    }

    soundToggle.innerHTML = isPlaying
      ? `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Mute Simulator`
      : `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Play Simulator`;
  });
}

/* ==========================================================================
   11. UNIQUE QUANTUM ACOUSTIC CANVAS ENGINE (3D PARTICLE SOUNDSTAGE)
   ========================================================================== */
let globalSpatialScale = 1.0;
let currentFreqMode = 'binaural'; // 'subbass', 'binaural', 'transient', 'quantum'

function initAcousticSoundstageCanvas() {
  const canvas = document.getElementById('hero-acoustic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;
  let width, height;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const particleCount = 120;
  const particles = [];
  const rings = [
    { radius: 110, count: 24, speed: 0.008, angle: 0 },
    { radius: 180, count: 36, speed: -0.006, angle: 0 },
    { radius: 260, count: 48, speed: 0.004, angle: 0 }
  ];

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent ? parent.offsetWidth : window.innerWidth;
    height = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    mouse.x = width / 2;
    mouse.y = height / 2;
    mouse.targetX = width / 2;
    mouse.targetY = height / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    }
  });

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(Math.random() * 2 - 1),
      baseRadius: 90 + Math.random() * 160,
      radius: 90 + Math.random() * 160,
      speed: 0.004 + Math.random() * 0.008,
      size: 1.2 + Math.random() * 2.2,
      colorMode: Math.random() > 0.5 ? 'cyan' : (Math.random() > 0.5 ? 'violet' : 'pink'),
      noiseOffset: Math.random() * 100
    });
  }

  let time = 0;

  function render() {
    time += 0.02;
    // Smooth lerp mouse
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const rotX = (mouse.y - centerY) * 0.0006;
    const rotY = (mouse.x - centerX) * 0.0006;

    // Draw Dynamic Central Acoustic Aura Core
    const gradient = ctx.createRadialGradient(
      centerX + (mouse.x - centerX) * 0.1,
      centerY + (mouse.y - centerY) * 0.1,
      10,
      centerX,
      centerY,
      280 * globalSpatialScale
    );
    
    if (currentFreqMode === 'subbass') {
      gradient.addColorStop(0, 'rgba(110, 231, 249, 0.22)');
      gradient.addColorStop(0.4, 'rgba(121, 40, 202, 0.14)');
      gradient.addColorStop(1, 'rgba(10, 11, 16, 0)');
    } else if (currentFreqMode === 'transient') {
      gradient.addColorStop(0, 'rgba(255, 122, 198, 0.25)');
      gradient.addColorStop(0.4, 'rgba(110, 231, 249, 0.16)');
      gradient.addColorStop(1, 'rgba(10, 11, 16, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(110, 231, 249, 0.18)');
      gradient.addColorStop(0.4, 'rgba(179, 136, 255, 0.12)');
      gradient.addColorStop(1, 'rgba(10, 11, 16, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 300 * globalSpatialScale, 0, Math.PI * 2);
    ctx.fill();

    // Draw Orbital Harmonic Wave Rings
    rings.forEach((ring, ringIdx) => {
      ring.angle += ring.speed * (currentFreqMode === 'transient' ? 2.2 : (currentFreqMode === 'subbass' ? 0.6 : 1.2));
      const currentRadius = ring.radius * globalSpatialScale + Math.sin(time + ringIdx) * 12;

      ctx.beginPath();
      ctx.strokeStyle = ringIdx === 0 
        ? 'rgba(110, 231, 249, 0.25)' 
        : (ringIdx === 1 ? 'rgba(179, 136, 255, 0.2)' : 'rgba(255, 122, 198, 0.18)');
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.ellipse(centerX, centerY, currentRadius, currentRadius * 0.52, rotY + ring.angle, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Render 3D Projected Particles
    const projectedParticles = [];

    particles.forEach((p) => {
      p.theta += p.speed * (currentFreqMode === 'transient' ? 1.8 : 1.0);
      const waveOffset = Math.sin(time * 2 + p.noiseOffset) * (currentFreqMode === 'subbass' ? 35 : 18);
      const r = (p.baseRadius + waveOffset) * globalSpatialScale;

      let x = r * Math.sin(p.phi) * Math.cos(p.theta);
      let y = r * Math.sin(p.phi) * Math.sin(p.theta);
      let z = r * Math.cos(p.phi);

      // Rotate around X and Y axes
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // Rotate Y
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotate X
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      // Projection
      const fov = 400;
      const scale = fov / (fov + z2);
      const projX = centerX + x1 * scale;
      const projY = centerY + y2 * scale;

      projectedParticles.push({
        x: projX,
        y: projY,
        z: z2,
        scale: scale,
        size: p.size * scale,
        colorMode: p.colorMode
      });
    });

    // Sort by Z for proper depth
    projectedParticles.sort((a, b) => a.z - b.z);

    // Draw Connecting Sound Wave Mesh Vectors
    ctx.lineWidth = 0.6;
    for (let i = 0; i < projectedParticles.length; i++) {
      for (let j = i + 1; j < projectedParticles.length; j++) {
        const dx = projectedParticles[i].x - projectedParticles[j].x;
        const dy = projectedParticles[i].y - projectedParticles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 65 * globalSpatialScale) {
          const alpha = (1 - dist / (65 * globalSpatialScale)) * 0.25;
          ctx.strokeStyle = `rgba(110, 231, 249, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(projectedParticles[i].x, projectedParticles[i].y);
          ctx.lineTo(projectedParticles[j].x, projectedParticles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Individual Nodes
    projectedParticles.forEach((p) => {
      const alpha = Math.max(0.2, (p.scale - 0.4) * 1.5);
      let colorStr = `rgba(110, 231, 249, ${alpha})`;
      if (p.colorMode === 'violet') colorStr = `rgba(179, 136, 255, ${alpha})`;
      if (p.colorMode === 'pink') colorStr = `rgba(255, 122, 198, ${alpha})`;

      ctx.fillStyle = colorStr;
      ctx.shadowColor = colorStr;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.8, p.size), 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   12. WEB AUDIO API SYNTHESIZER (HARMONIC BINAURAL DRONE ENGINE)
   ========================================================================== */
let audioCtx = null;
let masterGain = null;
let synthOscillators = [];
let synthFilter = null;
let isSynthPlaying = false;

function initWebAudioSynthesizer() {
  const toggleBtn = document.getElementById('hero-synth-toggle');
  const synthLed = document.getElementById('synth-led');
  const synthText = document.getElementById('synth-toggle-text');

  if (!toggleBtn) return;

  const modeFrequencies = {
    subbass: [55, 110, 165],        // A1, A2, E3 (Deep infrasonic harmonic)
    binaural: [216, 432, 540],      // A3, A4 (432Hz Golden Ratio)
    transient: [440, 880, 1320],    // High sparkling harmonics
    quantum: [261.63, 523.25, 784]  // C Major Cosmic Harmonic
  };

  function createAudioEngine() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

    synthFilter = audioCtx.createBiquadFilter();
    synthFilter.type = 'lowpass';
    synthFilter.frequency.setValueAtTime(650, audioCtx.currentTime);
    synthFilter.Q.setValueAtTime(4.0, audioCtx.currentTime);

    synthFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
    return true;
  }

  function startHarmonics() {
    if (!audioCtx) {
      if (!createAudioEngine()) return;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopHarmonics();

    const freqs = modeFrequencies[currentFreqMode] || modeFrequencies.binaural;

    freqs.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = idx === 0 ? 'sine' : (idx === 1 ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.18 / (idx + 1), audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(synthFilter);
      osc.start();
      synthOscillators.push({ osc, gain });
    });

    // Smooth fade in
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 1.2);

    isSynthPlaying = true;
    toggleBtn.classList.add('playing');
    if (synthLed) synthLed.className = 'w-2 h-2 rounded-full bg-emerald-400 synth-led';
    if (synthText) synthText.textContent = 'Mute Spatial Soundscape';
  }

  function stopHarmonics() {
    if (!audioCtx || !masterGain) return;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

    setTimeout(() => {
      synthOscillators.forEach(({ osc }) => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      synthOscillators = [];
    }, 650);

    isSynthPlaying = false;
    toggleBtn.classList.remove('playing');
    if (synthLed) synthLed.className = 'w-2 h-2 rounded-full bg-slate-500 synth-led';
    if (synthText) synthText.textContent = 'Engage Spatial Soundscape';
  }

  window.updateSynthPitch = function () {
    if (!isSynthPlaying || !audioCtx) return;
    const freqs = modeFrequencies[currentFreqMode] || modeFrequencies.binaural;

    synthOscillators.forEach(({ osc }, idx) => {
      if (freqs[idx]) {
        osc.frequency.cancelScheduledValues(audioCtx.currentTime);
        osc.frequency.setValueAtTime(osc.frequency.value, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freqs[idx], audioCtx.currentTime + 0.5);
      }
    });

    // Modulate filter cutoff
    if (synthFilter) {
      const cutoff = currentFreqMode === 'subbass' ? 320 : (currentFreqMode === 'transient' ? 1400 : 750);
      synthFilter.frequency.exponentialRampToValueAtTime(cutoff, audioCtx.currentTime + 0.6);
    }
  };

  const navAudioBtn = document.getElementById('nav-audio-quick-btn');

  function handleToggle() {
    if (isSynthPlaying) {
      stopHarmonics();
      if (navAudioBtn) navAudioBtn.classList.remove('border-emerald-400/80');
    } else {
      startHarmonics();
      if (navAudioBtn) navAudioBtn.classList.add('border-emerald-400/80');
    }
  }

  toggleBtn.addEventListener('click', handleToggle);
  if (navAudioBtn) {
    navAudioBtn.addEventListener('click', handleToggle);
  }
}

/* ==========================================================================
   13. SPATIAL EXPANSION SLIDER
   ========================================================================== */
function initSpatialSlider() {
  const slider = document.getElementById('hero-spatial-slider');
  const readout = document.getElementById('hero-spatial-readout');
  if (!slider) return;

  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    globalSpatialScale = val / 100;
    if (readout) {
      readout.textContent = `${val}%`;
    }
  });
}

/* ==========================================================================
   14. FREQUENCY MODE TABS (SOUNDSTAGE MORPHING)
   ========================================================================== */
function initFrequencyModeTabs() {
  const modeButtons = document.querySelectorAll('.freq-mode-btn');
  const modeDisplay = document.getElementById('hero-active-mode-tag');
  const freqHertz = document.getElementById('hero-active-hertz');

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-mode');
      currentFreqMode = mode;

      if (modeDisplay) {
        modeDisplay.textContent = btn.getAttribute('data-title') || 'BINAURAL 360°';
      }
      if (freqHertz) {
        freqHertz.textContent = btn.getAttribute('data-freq') || '432 Hz';
      }

      if (window.updateSynthPitch) {
        window.updateSynthPitch();
      }
    });
  });
}

/* ==========================================================================
   15. LIVE TELEMETRY JITTER SIMULATION
   ========================================================================== */
function initLiveTelemetryJitter() {
  const thdEl = document.getElementById('telemetry-thd');
  const fluxEl = document.getElementById('telemetry-flux');
  const radarCoords = document.getElementById('radar-coords');

  if (!thdEl && !fluxEl) return;

  setInterval(() => {
    if (thdEl) {
      const base = 0.00028 + Math.random() * 0.00005;
      thdEl.textContent = `${base.toFixed(5)}%`;
    }
    if (fluxEl) {
      const flux = 1.84 + Math.random() * 0.03;
      fluxEl.textContent = `${flux.toFixed(2)} T`;
    }
    if (radarCoords) {
      const az = (Math.sin(Date.now() * 0.001) * 35).toFixed(1);
      const el = (Math.cos(Date.now() * 0.0015) * 18).toFixed(1);
      radarCoords.textContent = `AZ: ${az}° // EL: ${el}°`;
    }
  }, 1600);
}

