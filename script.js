/* Magnetic Button */
function initMagneticEffect() {
  const magnets = document.querySelectorAll("[data-magnetic-strength]");
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
      ...(!immediate && { ease: "elastic.out(1, 0.3)", duration: 1.6 }),
    });
  };

  const resetOnEnter = (e) => {
    const m = e.currentTarget;
    resetEl(m, true);
    resetEl(m.querySelector("[data-magnetic-inner-target]"), true);
  };

  const moveMagnet = (e) => {
    const m = e.currentTarget,
      b = m.getBoundingClientRect(),
      strength = parseFloat(m.getAttribute("data-magnetic-strength")) || 25,
      inner = m.querySelector("[data-magnetic-inner-target]"),
      innerStrength =
        parseFloat(m.getAttribute("data-magnetic-strength-inner")) || strength,
      offsetX = ((e.clientX - b.left) / m.offsetWidth - 0.5) * (strength / 16),
      offsetY = ((e.clientY - b.top) / m.offsetHeight - 0.5) * (strength / 16);

    gsap.to(m, {
      x: offsetX + "em",
      y: offsetY + "em",
      rotate: "0.001deg",
      ease: "power4.out",
      duration: 1.6,
    });

    if (inner) {
      const innerOffsetX =
          ((e.clientX - b.left) / m.offsetWidth - 0.5) * (innerStrength / 16),
        innerOffsetY =
          ((e.clientY - b.top) / m.offsetHeight - 0.5) * (innerStrength / 16);
      gsap.to(inner, {
        x: innerOffsetX + "em",
        y: innerOffsetY + "em",
        rotate: "0.001deg",
        ease: "power4.out",
        duration: 2,
      });
    }
  };

  const resetMagnet = (e) => {
    const m = e.currentTarget,
      inner = m.querySelector("[data-magnetic-inner-target]");
    gsap.to(m, {
      x: "0em",
      y: "0em",
      ease: "elastic.out(1, 0.3)",
      duration: 1.6,
      clearProps: "all",
    });
    if (inner) {
      gsap.to(inner, {
        x: "0em",
        y: "0em",
        ease: "elastic.out(1, 0.3)",
        duration: 2,
        clearProps: "all",
      });
    }
  };

  magnets.forEach((m) => {
    m.addEventListener("mouseenter", resetOnEnter);
    m.addEventListener("mousemove", moveMagnet);
    m.addEventListener("mouseleave", resetMagnet);
  });
}

initMagneticEffect();


/* Timeline */
gsap.registerPlugin(ScrollTrigger);

const sphere = document.querySelector(".sphere");
const numberLabel = document.querySelector(".sphere-text .number");

let currentValue = 0;
let currentGradient = "blue"; // Starts as blue

gsap.to(sphere, {
  scale: 1.75,
  scrollTrigger: {
    trigger: ".timeline-container",
    start: "top center",
    end: "bottom center",
    scrub: true,
    onUpdate: (self) => {
      const targetVal = Math.round(self.progress * 6);

      if (targetVal !== currentValue) {
        gsap.to({ val: currentValue }, {
          val: targetVal,
          duration: 0.2,
          onUpdate: function () {
            numberLabel.textContent = Math.round(this.targets()[0].val);
          }
        });
        currentValue = targetVal;

        // ✅ Gradient transition logic
        if ((currentValue === 6 || currentValue === 6) && currentGradient !== "red") {
          changeGradient("red");
        } else if (currentValue < 6 && currentGradient !== "blue") {
          changeGradient("blue");
        }
      }
    }
  }
});

function changeGradient(toColorKey) {
  const proxy = { progress: 0 };

  const gradients = {
    blue: "#4484e7",
    red: "#d9142b"
  };

  const fromColor = gradients[currentGradient];
  const toColor = gradients[toColorKey];

  currentGradient = toColorKey;

  gsap.to(proxy, {
    progress: 1,
    duration: 1,
    ease: "power2.out",
    onUpdate: () => {
      const blended = gsap.utils.interpolate(fromColor, toColor, proxy.progress);
      sphere.style.background = `radial-gradient(circle closest-side at 50% 50%, ${blended} 0%, #ffffff 100%)`;
    }
  });
}

/* Map */
  const lottieSources = {
    map1: "https://cdn.prod.website-files.com/684010379d2a23402c4d55c4/684ae43ec6fc9949a91383dd_map1-pradecon.json",
    map2: "https://cdn.prod.website-files.com/684010379d2a23402c4d55c4/684ae43ec6fc9949a91383dd_map2-other.json",
    map3: "https://cdn.prod.website-files.com/684010379d2a23402c4d55c4/684ae43ec6fc9949a91383dd_map3-other.json"
  };

  const lottiePlayers = {};
  let currentMapKey = null;
  let isTransitioning = false;

  const mapSelectors = document.querySelectorAll(".map-selector");
  const mapWraps = document.querySelectorAll(".map-wrap");

  // Hide all maps except the first one on load
  mapWraps.forEach((wrap, index) => {
    wrap.style.display = index === 0 ? "block" : "none";
  });

  // Set first selector as active
  mapSelectors[0].classList.add("active");
  const firstMapKey = "map1";
  const firstContainer = document.getElementById(firstMapKey);

  // Load and play the first Lottie to 50%
  lottiePlayers[firstMapKey] = lottie.loadAnimation({
    container: firstContainer,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: lottieSources[firstMapKey]
  });

  lottiePlayers[firstMapKey].addEventListener("DOMLoaded", () => {
    const half = lottiePlayers[firstMapKey].totalFrames / 2;
    lottiePlayers[firstMapKey].playSegments([0, half], true);
    currentMapKey = firstMapKey;
  });

  // Handle selector clicks
  mapSelectors.forEach(selector => {
    selector.addEventListener("click", () => {
      const nextMapKey = selector.dataset.map;
      if (isTransitioning || nextMapKey === currentMapKey) return;

      isTransitioning = true;

      // Update active class
      mapSelectors.forEach(sel => sel.classList.remove("active"));
      selector.classList.add("active");

      const transitionToNext = () => {
        // Hide all wraps
        mapWraps.forEach(wrap => wrap.style.display = "none");

        const nextContainer = document.getElementById(nextMapKey);
        const nextWrap = nextContainer.parentElement;
        nextWrap.style.display = "block";

        const playHalf = () => {
          const nextPlayer = lottiePlayers[nextMapKey];
          const half = nextPlayer.totalFrames / 2;
          nextPlayer.playSegments([0, half], true);
          nextPlayer.addEventListener("complete", () => {
            currentMapKey = nextMapKey;
            isTransitioning = false;
          }, { once: true });
        };

        if (!lottiePlayers[nextMapKey]) {
          lottiePlayers[nextMapKey] = lottie.loadAnimation({
            container: nextContainer,
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: lottieSources[nextMapKey]
          });

          lottiePlayers[nextMapKey].addEventListener("DOMLoaded", playHalf);
        } else {
          playHalf();
        }
      };

      // If a Lottie is playing, complete it to 100% before switching
      if (currentMapKey && lottiePlayers[currentMapKey]) {
        const currentPlayer = lottiePlayers[currentMapKey];
        currentPlayer.playSegments([currentPlayer.currentFrame, currentPlayer.totalFrames], true);
        currentPlayer.addEventListener("complete", function onComplete() {
          currentPlayer.removeEventListener("complete", onComplete);
          transitionToNext();
        });
      } else {
        transitionToNext();
      }
    });
  });

