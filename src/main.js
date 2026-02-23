// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------


gsap.registerPlugin(CustomEase, ScrollTrigger, ScrambleTextPlugin, SplitText);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches)); 

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });


// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  
  // Runs once on first load
  // if (has('[data-something]')) initSomething();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
  

}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // Runs after enter animation completes
  if (has('[data-split="heading"]')) initMaskTextScrollReveal();
  //if (has('[data-sticky-feature-wrap]')) initStickyFeatures();
  if (has('[data-scale-reveal]')) initScaleReveal();
  if (has('[data-parallax="trigger"]')) initGlobalParallax();
  if (has('[data-highlight-text]')) initHighlightText();
  if (has('[data-scramble="scroll"]')) initScrambleOnScrollLoop();
  if (has('.dot')) initBlinkOnScrollLoop();
  if (has('#scroll-video')) initVideoScrub();
  
  

  if(hasLenis){
    lenis.resize();
  }
  
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();

  tl.call(() => {
    resetPage(next);
  }, null, 0);

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionDark = transitionWrap.querySelector("[data-transition-dark]");

  const tl = gsap.timeline({
    onComplete: () => {
      current.remove(); 
    }
  })
  
  //CustomEase.create("parallax", "0.7, 0.05, 0.13, 1");
  CustomEase.create("parallax", "0.625, 0.05, 0, 1");
  
  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }
  
  tl.set(transitionWrap, {
    zIndex: 2
  });
  
  tl.fromTo(transitionDark, {
    autoAlpha: 0
  },{
    autoAlpha: 0.7,
    duration: 1.2,
    ease: "parallax"
  }, 0);
  
  tl.fromTo(current,{
    y: "0vh"
  },{
    y: "-25vh",
    duration: 1.2,
    ease: "parallax",
  }, 0);
  
  tl.set(transitionDark, {
    autoAlpha: 0,
  });

  return tl;
}

function runPageEnterAnimation(next){
  const tl = gsap.timeline();
  
  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady")
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }
  
  tl.add("startEnter", 0);
  
  tl.set(next, {
    zIndex: 3
  });
  
  tl.fromTo(next, {
    y: "100vh"
  }, {
    y: "0vh",
    duration: 1.2,
    clearProps: "all",
    ease: "parallax"
  }, "startEnter");

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });
  
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }
  
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if(hasScrollTrigger){
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
})

barba.hooks.afterEnter(data => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);
  
  // Settle
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
  
  if(hasScrollTrigger){
    ScrollTrigger.refresh(); 
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,
      
      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light"
  },
  dark: {
    nav: "light",
    transition: "dark"
  }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;
  
  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.125,
    wheelMultiplier: 1.25,
    smoothWheel: true,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container){
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}



// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

//import './styles/style.css';


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
  

  const tl = gsap.timeline({
    defaults: {
      ease: "expo.inOut",
    },
    onStart: () => {
      container.classList.remove('is--hidden');
    }
  });
  
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
  //initCrispLoadingAnimation();
  //ScrollTrigger.refresh() 
});


function initMaskTextScrollReveal() {
/* Text Reveals */
const splitConfig = {
  lines: { duration: 1, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 }
}

let headings = document.querySelectorAll('[data-split="heading"]')
  
  headings.forEach(heading => {
    gsap.set(heading, { autoAlpha: 1 })
  });


  nextPage.querySelectorAll('[data-split="heading"]').forEach(heading => {
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
        duration: .75,
        stagger: 0.015,
        scrambleText: {
          text: "{original}", 
          chars: isAlternative ? '▯|' : 'upperCase',
          speed: 1
        },
        ease: "none",
      });
    }

    ScrollTrigger.create({
      trigger: target,
      start: 'clamp(top 80%)',
      onEnter: () => {
        playScramble();
        target.scrambleInterval = setInterval(playScramble, 5000);
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


/* Check section for navbar color change */
// function initCheckSectionThemeScroll() {
//   const navBarHeight = document.querySelector("[data-nav-bar-height]");
//   const themeObserverOffset = navBarHeight ? navBarHeight.offsetHeight / 2 : 0;

//   function checkThemeSection() {
//     const themeSections = document.querySelectorAll("[data-theme-section]");

//     themeSections.forEach(function (themeSection) {
//       const rect = themeSection.getBoundingClientRect();
//       const themeSectionTop = rect.top;
//       const themeSectionBottom = rect.bottom;

//       if (
//         themeSectionTop <= themeObserverOffset &&
//         themeSectionBottom >= themeObserverOffset
//       ) {
//         const themeSectionActive =
//           themeSection.getAttribute("data-theme-section");
//         document.querySelectorAll("[data-theme-nav]").forEach(function (elem) {
//           if (elem.getAttribute("data-theme-nav") !== themeSectionActive) {
//             elem.setAttribute("data-theme-nav", themeSectionActive);
//           }
//         });

//         const bgSectionActive = themeSection.getAttribute("data-bg-section");
//         document.querySelectorAll("[data-bg-nav]").forEach(function (elem) {
//           if (elem.getAttribute("data-bg-nav") !== bgSectionActive) {
//             elem.setAttribute("data-bg-nav", bgSectionActive);
//           }
//         });
//       }
//     });
//   }

//   function startThemeCheck() {
//     document.addEventListener("scroll", checkThemeSection);
//   }

//   checkThemeSection();
//   startThemeCheck();
// }

// initCheckSectionThemeScroll();


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
        nextPage.querySelectorAll('[data-parallax="trigger"]').forEach((trigger) => {
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
                  markers: false,
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


function initScaleReveal() {
/* Product Reveal Animation */
const productRevealConfig = {
  duration: 1.5,
  stagger: 0.1,
  ease: 'expo.out'
}

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

/* Highlight Text on Scroll */  
function initHighlightText(){

  let splitHeadingTargets = nextPage.querySelectorAll("[data-highlight-text]")
  splitHeadingTargets.forEach((heading) => {
    
    const scrollStart = heading.getAttribute("data-highlight-scroll-start") || "top 90%"
    const scrollEnd = heading.getAttribute("data-highlight-scroll-end") || "center 40%"
    const fadedValue = heading.getAttribute("data-highlight-fade") || 0.2
    const staggerValue =  heading.getAttribute("data-highlight-stagger") || 0.1
    
    new SplitText(heading, {
      type: "words, chars",
      autoSplit: true,
      onSplit(self) {
        let ctx = gsap.context(() => {
          let tl = gsap.timeline({
            scrollTrigger: {
              scrub: true,
              trigger: heading, 
              start: scrollStart,
              end: scrollEnd,
            }
          })
          tl.from(self.chars,{
            autoAlpha: fadedValue,
            stagger: staggerValue,
            ease: "linear"
          })
        });
        return ctx;
      }
    });    
  });
}


/* Video on scroll  */
async function createScrollVideo(options) {
  const { videoSelector, safariSrc, chromeSrc, onSetup } = options;

  // Browser check for optimal video format
  const testVideo = document.createElement("video");
  const supportsHEVC = testVideo.canPlayType('video/mp4; codecs="hvc1"') !== "";
  const supportsVP9 = testVideo.canPlayType('video/webm; codecs="vp9"') !== "";

  // Pick the best source, fallback to whatever is provided
  const videoUrl = (supportsHEVC && safariSrc) ? safariSrc : (supportsVP9 && chromeSrc) ? chromeSrc : (chromeSrc || safariSrc);

  // Fetch as Blob for smooth scrolling (forces cache)
  const response = await fetch(videoUrl, { cache: "force-cache" });
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const video = document.querySelector(videoSelector);
  if(!video) return; // Failsafe if element doesn't exist
  
  video.src = blobUrl;
  video.load();

  const setup = () => {
    if (video.readyState >= 1) {
      video.pause();
      onSetup(video, video.duration);
    }
  };

  video.addEventListener("loadedmetadata", setup);
  if (video.readyState >= 1) setup();
}
function initVideoScrub() {
  createScrollVideo({
    videoSelector: "#scroll-video", // MATCH THIS TO YOUR WEBFLOW VIDEO ID
    safariSrc: "https://pedroneves-duall.github.io/pradecon-video/steps.mp4", // e.g., an HEVC optimized .mov
    chromeSrc: "https://pedroneves-duall.github.io/pradecon-video/steps.mp4", // e.g., a VP9 optimized .webm
    
    onSetup: (video, duration) => {
      ScrollTrigger.create({
        trigger: ".steps-container", // The tall section dictating scroll length
        start: "top top",
        end: "bottom bottom", 
        scrub: true, // This locks playback to the scrollbar
        onUpdate: (self) => {
          // self.progress goes from 0.0 to 1.0 as you scroll
          video.currentTime = self.progress * duration;
        }
      });
    }
  });
}


