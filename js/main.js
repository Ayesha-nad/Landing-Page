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
   2. STICKY NAV, SMOOTH SCROLL & ACTIVE LINK INTERSECTION OBSERVER
   ========================================================================== */
function initStickyNavAndActiveLinks() {
  const navbar = document.getElementById('main-navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Navbar Opacity on Scroll
  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
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
        const navHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight + 2;
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
}

/* ==========================================================================
   3. MOBILE HAMBURGER MENU & FULL-SCREEN GLASS OVERLAY
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!hamburger || !mobileMenu) return;

  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : !mobileMenu.classList.contains('is-open');
    if (isOpen) {
      hamburger.classList.add('is-active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
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
