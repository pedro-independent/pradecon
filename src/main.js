/* CONFIG */
const page = document.body.dataset.page;

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText, CustomEase);

/* GLOBAL CODE */

/* Loading Animation*/
CustomEase.create("slideshow-wipe", "0.625, 0.05, 0, 1");
function initCrispLoadingAnimation() {

  const container = document.querySelector(".crisp-header");
  const heading = container.querySelectorAll('[data-loader="text"]');
  const revealImages = container.querySelectorAll(".crisp-loader__group > *");
  const isScaleUp = container.querySelectorAll(".crisp-loader__media");
  const isScaleDown = container.querySelectorAll(".crisp-loader__media .is--scale-down");
  const isRadius = container.querySelectorAll(".crisp-loader__media.is--scaling.is--radius");
  const smallElements = container.querySelectorAll(".crisp-header__top, .crisp-header__p");
  const sliderNav = document.querySelector(".navbar");
  
  /* GSAP Timeline */
  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove('is--hidden');
    }
  });
  
  /* GSAP SplitText */
  let split;
  if (heading.length) {
    split = new SplitText(heading, {
      type: "words",
      mask: "words"
    });

    gsap.set(split.words, {
      yPercent: 110,
    });
  }
  
  /* Start of Timeline */
  if (revealImages.length) {
    tl.fromTo(revealImages, {
      xPercent: 500
    }, {
      xPercent: -500,
      duration: 2.5,
      stagger: 0.05
    });
  }
  
  if (isScaleDown.length) {
    tl.to(isScaleDown, {
      scale: 0.5,
      duration: 2,
      stagger: {
        each: 0.05,
        from: "edges",
        ease: "none"
      },
      onComplete: () => {
        if (isRadius) {
          isRadius.forEach(el => el.classList.remove('is--radius'));
        }
      }
    }, "-=0.1");
  }
  
  if (isScaleUp.length) {
    tl.fromTo(isScaleUp, {
      width: "10em",
      height: "10em"
    }, {
      width: "100vw",
      height: "100dvh",
      duration: 2
    }, "< 0.5");
    tl.addLabel("scaleDone");
  }

  if (sliderNav) {
    tl.from(sliderNav, {
      yPercent: -100,
      ease: "expo.out",
      duration: 1
    }, "scaleDone-=0.7");
  }

  if (split && split.words.length) {
    tl.to(split.words, {
      yPercent: 0,
      stagger: 0.04,
      ease: "expo.out",
      duration: 1
    }, "scaleDone-=0.5");
  }
  
  if (smallElements.length) {
    tl.from(smallElements, {
      opacity: 0,
      ease: "power1.inOut",
      duration: 0.2
    }, "< 0.15");
  }
  
  tl.call(function () {
    container.classList.remove('is--loading');
  }, null, "+=0.45");
}

document.fonts.ready.then(() => {
  initCrispLoadingAnimation();
});

/* Text Reveals */
const splitConfig = {
  lines: { duration: 1, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 }
}

function initMaskTextScrollReveal() {
  document.querySelectorAll('[data-split="heading"]').forEach(heading => {
    const type = heading.dataset.splitReveal || 'lines'
    const typesToSplit =
      type === 'lines' ? ['lines'] :
      type === 'words' ? ['lines','words'] :
      ['lines','words','chars']
    
    SplitText.create(heading, {
      type: typesToSplit.join(', '),
      mask: 'lines',
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
      onSplit: function(instance) {
        const targets = instance[type]
        const config = splitConfig[type]
        
        return gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: heading,
            start: 'clamp(top 80%)',
            once: true
          }
        });
      }
    })
  })
}

  let headings = document.querySelectorAll('[data-split="heading"]')
  
  headings.forEach(heading => {
    gsap.set(heading, { autoAlpha: 1 })
  });

initMaskTextScrollReveal()

/* Scramble Eyebrow */
function initScrambleOnScrollLoop() {
  let targets = document.querySelectorAll('[data-scramble="scroll"]');
  
  targets.forEach((target) => {
    let isAlternative = target.hasAttribute("data-scramble-alt");

    // Split the text once
    let split = new SplitText(target, {
      type: "words, chars",
      wordsClass: "word",
      charsClass: "char"
    });

    function playScramble() {
      gsap.to(split.words, {
        duration: 1.4,
        stagger: 0.015,
        scrambleText: {
          text: "{original}", 
          chars: isAlternative ? '▯|' : 'upperCase',
          speed: 0.95
        },
        ease: "none",
      });
    }

    ScrollTrigger.create({
      trigger: target,
      start: 'clamp(top 80%)',
      onEnter: () => {
        playScramble();
        target.scrambleInterval = setInterval(playScramble, 3000);
      },
      onLeaveBack: () => {
        if (target.scrambleInterval) {
          clearInterval(target.scrambleInterval);
          target.scrambleInterval = null;
        }
      }
    });
  });
}

initScrambleOnScrollLoop();

/* Blinking Eyebrow */
function initBlinkOnScrollLoop() {
  let targets = document.querySelectorAll('.dot');

  targets.forEach((target) => {
    const blinkTL = gsap.timeline({
      repeat: -1,
      yoyo: true,
      paused: true
    });

    blinkTL.to(target, {
      opacity: 0,
      duration: 0.4,
      ease: "expo.inOut"
    });

    // Create the ScrollTrigger
    ScrollTrigger.create({
      trigger: target,
      start: 'clamp(top 80%)',
      onEnter: () => blinkTL.play(),
      onLeave: () => blinkTL.pause(),
      onEnterBack: () => blinkTL.play(),
      onLeaveBack: () => blinkTL.pause()
    });
  });
}

initBlinkOnScrollLoop();

/* Check section for navbar color change */
function initCheckSectionThemeScroll() {
  const navBarHeight = document.querySelector("[data-nav-bar-height]");
  const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

  function checkThemeSection() {
    const themeSections = document.querySelectorAll("[data-theme-section]");

    themeSections.forEach(function (themeSection) {
      const rect = themeSection.getBoundingClientRect();
      const themeSectionTop = rect.top;
      const themeSectionBottom = rect.bottom;

      if (
        themeSectionTop <= themeObserverOffset &&
        themeSectionBottom >= themeObserverOffset
      ) {
        const themeSectionActive =
          themeSection.getAttribute("data-theme-section");
        document.querySelectorAll("[data-theme-nav]").forEach(function (elem) {
          if (elem.getAttribute("data-theme-nav") !== themeSectionActive) {
            elem.setAttribute("data-theme-nav", themeSectionActive);
          }
        });

        const bgSectionActive = themeSection.getAttribute("data-bg-section");
        document.querySelectorAll("[data-bg-nav]").forEach(function (elem) {
          if (elem.getAttribute("data-bg-nav") !== bgSectionActive) {
            elem.setAttribute("data-bg-nav", bgSectionActive);
          }
        });
      }
    });
  }

  function startThemeCheck() {
    document.addEventListener("scroll", checkThemeSection);
  }

  checkThemeSection();
  startThemeCheck();
}

initCheckSectionThemeScroll();


/* Global Parallax */
function initGlobalParallax() {
  const mm = gsap.matchMedia()

  mm.add(
    {
      isMobile: "(max-width:479px)",
      isMobileLandscape: "(max-width:767px)",
      isTablet: "(max-width:991px)",
      isDesktop: "(min-width:992px)"
    },
    (context) => {
      const { isMobile, isMobileLandscape, isTablet } = context.conditions

      const ctx = gsap.context(() => {
        document.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
            // Check if this trigger has to be disabled on smaller breakpoints
            const disable = trigger.getAttribute("data-parallax-disable")
            if (
              (disable === "mobile" && isMobile) ||
              (disable === "mobileLandscape" && isMobileLandscape) ||
              (disable === "tablet" && isTablet)
            ) {
              return
            }
            
            // Optional: you can target an element inside a trigger if necessary 
            const target = trigger.querySelector('[data-parallax="target"]') || trigger

            // Get the direction value to decide between xPercent or yPercent tween
            const direction = trigger.getAttribute("data-parallax-direction") || "vertical"
            const prop = direction === "horizontal" ? "xPercent" : "yPercent"
            
            // Get the scrub value, our default is 'true' because that feels nice with Lenis
            const scrubAttr = trigger.getAttribute("data-parallax-scrub")
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true
            
            // Get the start position in % 
            const startAttr = trigger.getAttribute("data-parallax-start")
            const startVal = startAttr !== null ? parseFloat(startAttr) : 20
            
            // Get the end position in %
            const endAttr = trigger.getAttribute("data-parallax-end")
            const endVal = endAttr !== null ? parseFloat(endAttr) : -20
            
            // Get the start value of the ScrollTrigger
            const scrollStartRaw = trigger.getAttribute("data-parallax-scroll-start") || "top bottom"
            const scrollStart = `clamp(${scrollStartRaw})`
            
           // Get the end value of the ScrollTrigger  
            const scrollEndRaw = trigger.getAttribute("data-parallax-scroll-end") || "bottom top"
            const scrollEnd = `clamp(${scrollEndRaw})`

            gsap.fromTo(
              target,
              { [prop]: startVal },
              {
                [prop]: endVal,
                ease: "none",
                scrollTrigger: {
                  trigger,
                  start: scrollStart,
                  end: scrollEnd,
                  scrub,
                },
              }
            )
          })
      })

      return () => ctx.revert()
    }
  )
}

initGlobalParallax()

/* Mouse Move Spotlight */
// function initSpotlightEffect() {
//   const trigger = document.querySelector('[data-spotlight="trigger"]');
//   const target = document.querySelector('[data-spotlight="target"]');

//   if (!trigger || !target) return;

//   let isHovering = false;

//   gsap.set(target, { xPercent: 0, pointerEvents: 'none' });

//   const moveSpotlight = (e) => {
//     if (!isHovering) return;

//     gsap.to(target, {
//       x: e.clientX,
//       duration: 1,
//       ease: 'expo.out'
//     });
//   };

//   trigger.addEventListener('mouseenter', () => {
//     isHovering = true;
//     //gsap.to(target, { autoAlpha: 1, scale: 1, duration: 1, ease: 'expo.out' });
//     document.addEventListener('mousemove', moveSpotlight);
//   });

//   trigger.addEventListener('mouseleave', () => {
//     isHovering = false;
//     //gsap.to(target, { autoAlpha: 0, scale: 0.8, duration: 1, ease: 'expo.in' });
//     document.removeEventListener('mousemove', moveSpotlight);
//   });
// }

// initSpotlightEffect();



/* HOMEPAGE */
if (page === "home") {

/* Product Reveal Animation */
const productRevealConfig = {
  duration: 1.5,
  stagger: 0.1,
  ease: 'expo.out'
}

function initScaleReveal() {
  const products = document.querySelectorAll('[data-scale-reveal]')

  products.forEach(product => {
    gsap.set(product, {
      scale: 0,
      transformOrigin: 'center center'
    })

    gsap.to(product, {
      scale: 1,
      duration: productRevealConfig.duration,
      stagger: productRevealConfig.stagger,
      ease: productRevealConfig.ease,
      scrollTrigger: {
        trigger: product,
        start: 'top 80%',
        //markers: true,
        once: true
      }
    })
  })
}

initScaleReveal()

/* Sticky services overview */
function initStickyFeatures(root){
  const wraps = Array.from((root || document).querySelectorAll("[data-sticky-feature-wrap]"));
  if(!wraps.length) return;

  wraps.forEach(w => {
    const visualWraps = Array.from(w.querySelectorAll("[data-sticky-feature-visual-wrap]"));
    const items = Array.from(w.querySelectorAll("[data-sticky-feature-item]"));
    const progressBar = w.querySelector("[data-sticky-feature-progress]");
    
    if (visualWraps.length !== items.length) {
      console.warn("[initStickyFeatures] visualWraps and items count do not match:", {
        visualWraps: visualWraps.length,
        items: items.length,
        wrap: w
      });
    }
    
    const count = Math.min(visualWraps.length, items.length);
    if(count < 1) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = rm ? 0.01 : 0.75; // If user prefers reduced motion, reduce duration
    const EASE = "power4.inOut";
    const SCROLL_AMOUNT = 0.9; // % of scroll used for step transitions

    const getTexts = el => Array.from(el.querySelectorAll("[data-sticky-feature-text]"));

    if(visualWraps[0]) gsap.set(visualWraps[0], { clipPath: "inset(0% round 0.75em)" });
    gsap.set(items[0], { autoAlpha: 1 });

    let currentIndex = 0;

    // Transition Function
    function transition(fromIndex, toIndex){
      if(fromIndex === toIndex) return;
      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });
      
      if(fromIndex < toIndex){
        tl.to(visualWraps[toIndex], { 
          clipPath: "inset(0% round 0.75em)",
          duration: DURATION,
          ease: EASE
        }, 0);
      } else {
        tl.to(visualWraps[fromIndex], { 
          clipPath: "inset(50% round 0.75em)",
          duration: DURATION,
          ease: EASE
        }, 0);
      }
      animateOut(items[fromIndex]);
      animateIn(items[toIndex]);
    }

    // Fade out text content items
    function animateOut(itemEl){
      const texts = getTexts(itemEl);
      gsap.to(texts, {
        autoAlpha: 0,
        y: -30,
        ease: "power4.out",
        duration: 0.4,
        onComplete: () => gsap.set(itemEl, { autoAlpha: 0 })
      });
    }

    // Reveal incoming text content items
    function animateIn(itemEl){
      const texts = getTexts(itemEl);
      gsap.set(itemEl, { autoAlpha: 1 });
      gsap.fromTo(texts, {
        autoAlpha: 0, 
        y: 30
      }, {
        autoAlpha: 1,
        y: 0,
        ease: "power4.out",
        duration: DURATION,
        stagger: 0.1
      });
    }

    const steps = Math.max(1, count - 1);

    ScrollTrigger.create({
      trigger: w,
      start: "center center",
      end: () => `+=${steps * 100}%`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: self => {
        const p = Math.min(self.progress, SCROLL_AMOUNT) / SCROLL_AMOUNT;
        let idx = Math.floor(p * steps + 1e-6);
        idx = Math.max(0, Math.min(steps, idx));
        
        gsap.to(progressBar,{
          scaleX: p,
          ease: "none"
        })
        
        if (idx !== currentIndex) {
          transition(currentIndex, idx);
          currentIndex = idx;
        }
      }
    });
  });
}

initStickyFeatures();


/* Magnetic Effect */
function initMagneticEffect() {
  const magnets = document.querySelectorAll('[data-magnetic-strength]');
  if (window.innerWidth <= 991) return;
  
  // Helper to kill tweens and reset an element.
  const resetEl = (el, immediate) => {
    if (!el) return;
    gsap.killTweensOf(el);
    (immediate ? gsap.set : gsap.to)(el, {
      x: "0em",
      y: "0em",
      rotate: "0deg",
      clearProps: "all",
      ...(!immediate && { ease: "elastic.out(1, 0.3)", duration: 1.6 })
    });
  };

  const resetOnEnter = e => {
    const m = e.currentTarget;
    resetEl(m, true);
    resetEl(m.querySelector('[data-magnetic-inner-target]'), true);
  };

  const moveMagnet = e => {
    const m = e.currentTarget,
      b = m.getBoundingClientRect(),
      strength = parseFloat(m.getAttribute('data-magnetic-strength')) || 25,
      inner = m.querySelector('[data-magnetic-inner-target]'),
      innerStrength = parseFloat(m.getAttribute('data-magnetic-strength-inner')) || strength,
      offsetX = ((e.clientX - b.left) / m.offsetWidth - 0.5) * (strength / 16),
      offsetY = ((e.clientY - b.top) / m.offsetHeight - 0.5) * (strength / 16);
    
    gsap.to(m, { x: offsetX + "em", y: offsetY + "em", rotate: "0.001deg", ease: "power4.out", duration: 1.6 });
    
    if (inner) {
      const innerOffsetX = ((e.clientX - b.left) / m.offsetWidth - 0.5) * (innerStrength / 16),
        innerOffsetY = ((e.clientY - b.top) / m.offsetHeight - 0.5) * (innerStrength / 16);
      gsap.to(inner, { x: innerOffsetX + "em", y: innerOffsetY + "em", rotate: "0.001deg", ease: "power4.out", duration: 2 });
    }
  };

  const resetMagnet = e => {
    const m = e.currentTarget,
      inner = m.querySelector('[data-magnetic-inner-target]');
    gsap.to(m, { x: "0em", y: "0em", ease: "elastic.out(1, 0.3)", duration: 1.6, clearProps: "all" });
    if (inner) {
      gsap.to(inner, { x: "0em", y: "0em", ease: "elastic.out(1, 0.3)", duration: 2, clearProps: "all" });
    }
  };

  magnets.forEach(m => {
    m.addEventListener('mouseenter', resetOnEnter);
    m.addEventListener('mousemove', moveMagnet);
    m.addEventListener('mouseleave', resetMagnet);
  });
}

initMagneticEffect();



}