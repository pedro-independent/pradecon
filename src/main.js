/* CONFIG */
const page = document.body.dataset.page;

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText);

/* GLOBAL CODE */

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
            const endVal = endAttr !== null ? parseFloat(endAttr) : -40
            
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

/* HOMEPAGE */
if (page === "home") {
/* Sticky services overview */
function initStickyServices(root){
  const wraps = Array.from((root || document).querySelectorAll("[data-sticky-service-wrap]"));
  if(!wraps.length) return;

  wraps.forEach(w => {
    const visuals = Array.from(w.querySelectorAll("[data-sticky-service-visual-wrap]"));
    const items = Array.from(w.querySelectorAll("[data-sticky-service-item]"));
    const progressBar = w.querySelector("[data-sticky-service-progress]");
    
    if (visuals.length !== items.length) {
      console.warn("[initStickyServices] visuals and items count mismatch:", { visuals: visuals.length, items: items.length, wrap: w });
    }
    
    const count = Math.min(visuals.length, items.length);
    if(count < 1) return;

    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = rm ? 0.01 : 0.75;
    const EASE = "power4.inOut";
    const SCROLL_AMOUNT = 0.9;

    const getTexts = el => Array.from(el.querySelectorAll("[data-sticky-service-text]"));

    // --- INITIAL STATE ---
    gsap.set(visuals, { autoAlpha: 0, clipPath: "inset(50% round 0.75em)" });
    gsap.set(items, { autoAlpha: 0 });

    let currentIndex = 0;

    // --- Transition logic ---
    function transition(fromIndex, toIndex){
      if(fromIndex === toIndex) return;
      const tl = gsap.timeline({ defaults: { overwrite: "auto" } });

      // Animate current visual closing and next one opening
      tl.to(visuals[fromIndex], { 
        clipPath: "inset(50% round 0.75em)",
        autoAlpha: 0,
        duration: DURATION,
        ease: EASE
      }, 0)
      .to(visuals[toIndex], { 
        clipPath: "inset(0% round 0.75em)",
        autoAlpha: 1,
        duration: DURATION,
        ease: EASE
      }, 0);

      animateOut(items[fromIndex]);
      animateIn(items[toIndex]);
    }

    // --- Fade out current text ---
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

    // --- Reveal next text ---
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

    // --- Main ScrollTrigger ---
    ScrollTrigger.create({
      trigger: w,
      start: "center center",
      end: () => `+=${steps * 100}%`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onEnter: () => {
        // Animate the FIRST visual and text when section enters
        gsap.to(visuals[0], { 
          clipPath: "inset(0% round 0.75em)",
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out"
        });
        gsap.to(items[0], { 
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out"
        });
      },
      onUpdate: self => {
        const p = Math.min(self.progress, SCROLL_AMOUNT) / SCROLL_AMOUNT;
        let idx = Math.floor(p * steps + 1e-6);
        idx = Math.max(0, Math.min(steps, idx));

        // Update progress bar
        if (progressBar) {
          gsap.to(progressBar, { scaleX: p, ease: "none" });
        }

        // Handle transitions
        if (idx !== currentIndex) {
          transition(currentIndex, idx);
          currentIndex = idx;
        }
      }
    });
  });
}

  //initStickyServices();



}