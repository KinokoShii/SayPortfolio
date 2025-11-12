function updateTime() {
  const timeDiv = document.querySelector(".time");
  const now = new Date();

  // Format the time in UTC-5
  const options = { timeZone: "America/New_York", hour12: false };
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    ...options,
  });
  const parts = formatter.formatToParts(now);

  // Extract just the time parts
  const time = parts
    .filter((part) => part.type !== "timeZoneName")
    .map((part) => part.value)
    .join("");

  timeDiv.innerHTML = time;
}

// Call updateTime every second
setInterval(updateTime, 1000);

// Call it once immediately to avoid delay
updateTime();

window.onscroll = function () {
  myFunction();
};

function myFunction() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

const video = document.getElementById("video1");
const container = document.querySelector(".content");

let targetX = 0;
let currentX = 0;
let movementFactor = 1;
let locked = false; // track if the video is locked at center
let snapped = false; // track final snap (absolute)

function handleMouse(e) {
  if (locked) return; // stop moving when locked

  const containerRect = container.getBoundingClientRect();
  const rect = video.getBoundingClientRect();
  const halfWidth = rect.width / 2;

  let x = e.clientX - containerRect.left - halfWidth;

  const minX = 0;
  const maxX = containerRect.width - rect.width;
  x = Math.max(minX, Math.min(x, maxX));

  const centerX = (containerRect.width - rect.width) / 2;
  targetX = centerX + (x - centerX) * movementFactor;
}
document.addEventListener("mousemove", handleMouse);

function animate() {
  if (!locked) {
    currentX += (targetX - currentX) * 0.1;
    video.style.left = `${currentX}px`;
  }
  requestAnimationFrame(animate);
}
animate();

const initialRect = video.getBoundingClientRect();
currentX = initialRect.left;
targetX = currentX;
let initialWidth = video.offsetWidth;
let targetWidthPx = Math.round(window.innerWidth * 0.55);

// --- REFRESH FIX ---
// This self-executing function runs once on page load.
(function() {
    const videoZone = document.getElementById("videoZone");
    // If the elements don't exist yet, do nothing.
    if (!videoZone || !video) return;

    // The 'snapPoint' is the scroll position where the animation ends.
    // It's the distance from the top of the document to the top of the videoZone.
    const snapPoint = videoZone.offsetTop;

    // If the page is loaded scrolled past this point...
    if (window.scrollY > snapPoint) {
        // ...then we immediately put the video into its final state.
        locked = true;
        snapped = true;
        document.removeEventListener("mousemove", handleMouse);

        video.style.position = "absolute";
        video.style.width = "55vw";
        video.style.left = "50%";
        // The final 'top' position is the snapPoint plus the 20% viewport offset.
        video.style.top = `${snapPoint + (window.innerHeight * 0.2)}px`;
        video.style.transform = "translateX(-50%)";
        video.classList.add("centered");
    }
})();
// --- END REFRESH FIX ---

window.addEventListener("resize", () => {
  targetWidthPx = Math.round(window.innerWidth * 0.55);
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const videoZone = document.getElementById("videoZone");
  const windowHeight = window.innerHeight;
  let progress = 0;
  let rect = null;
  if (videoZone) {
    rect = videoZone.getBoundingClientRect();
    progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);
  }

  if (scrollY > 0 && !video.classList.contains("centered")) {
    video.classList.add("centered");
    locked = true;
    video.style.left = "50%";
    video.style.transform = "translateX(-50%)";
    document.removeEventListener("mousemove", handleMouse);
    initialWidth = video.offsetWidth || initialWidth;
    targetWidthPx = Math.round(window.innerWidth * 0.55);
  }

  if (scrollY === 0 && video.classList.contains("centered")) {
    video.classList.remove("centered");
    locked = false;
    snapped = false; // Also reset the snapped state
    video.style.removeProperty("left");
    video.style.removeProperty("transform");
    video.style.removeProperty("position");
    video.style.removeProperty("top");
    video.style.removeProperty("width"); // Also reset width
    const rect = video.getBoundingClientRect();
    currentX = rect.left;
    targetX = currentX;
    document.addEventListener("mousemove", handleMouse);
  }

  if (video.classList.contains("centered") && !snapped) {
    const widthPx = Math.round(
      initialWidth + (targetWidthPx - initialWidth) * progress
    );
    video.style.width = `${widthPx}px`;
  }

  if (videoZone && rect) {
    const fixedY = window.innerHeight * 0.2;
    if (rect.top <= 0 && !snapped) {
      snapped = true;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const absoluteY = scrollTop + fixedY;

      video.classList.add("no-transition");
      video.style.position = "absolute";
      video.style.left = "50%";
      video.style.top = `${absoluteY}px`;
      video.style.transform = "translateX(-50%)";
      video.style.width = "55vw";
      void video.offsetWidth;
      setTimeout(() => video.classList.remove("no-transition"), 40);

    } else if (rect.top > 0 && snapped) {
      snapped = false;
      video.classList.add("no-transition");
      video.style.position = "fixed";
      video.style.top = `${fixedY}px`;
      video.style.left = "50%";
      const currentProgress = Math.min(
        Math.max(1 - rect.top / windowHeight, 0),
        1
      );
      const widthPx = Math.round(
        initialWidth + (targetWidthPx - initialWidth) * currentProgress
      );
      video.style.width = `${widthPx}px`;
      video.style.transform = "translateX(-50%)";
      void video.offsetWidth;
      setTimeout(() => video.classList.remove("no-transition"), 40);
      locked = true;
    }
  }
});

// Cursor-follow divider for .imgZone2
(function () {
  const container = document.querySelector(".imgZone2");
  const left = document.getElementById("imgLeft");
  const right = document.getElementById("imgRight");
  if (!container || !left || !right) return; // nothing to do

  // Ensure a divider exists (CSS already styles .divider)
  let divider = container.querySelector(".divider");
  if (!divider) {
    divider = document.createElement("div");
    divider.className = "divider";
    container.appendChild(divider);
  }

  let raf = null;

  function handlePointerMove(e) {
    // Support touch and mouse/pointer events
    const clientX = e.touches
      ? e.touches[0].clientX
      : e.clientX ||
        (e.changedTouches &&
          e.changedTouches[0] &&
          e.changedTouches[0].clientX);
    if (clientX == null) return;
    const rect = container.getBoundingClientRect();
    // x relative to container, clamped
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(rect.width, x));

    // throttle visual updates to animation frames
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const dividerWidth = divider.offsetWidth || 6;
      // set pixel widths so the divider edge follows the cursor
      left.style.width = `${x}px`;
      right.style.width = `${Math.max(0, Math.round(rect.width - x))}px`;
      // position divider so its center aligns with the cursor
      divider.style.left = `${Math.max(0, x - dividerWidth / 2)}px`;
      raf = null;
    });
  }

  function resetToHalf() {
    // Clearing inline widths lets the CSS 50% rule take over (with transition)
    left.style.width = "";
    right.style.width = "";
    divider.style.left = "";
  }

  // Use pointer events where available, with mouse/touch fallbacks
  container.addEventListener("pointermove", handlePointerMove);
  container.addEventListener("mousemove", handlePointerMove);
  container.addEventListener("touchmove", handlePointerMove, { passive: true });

  container.addEventListener("pointerleave", resetToHalf);
  container.addEventListener("mouseleave", resetToHalf);
  container.addEventListener("touchend", resetToHalf);
})();

window.addEventListener("scroll", () => {
  const body = document.querySelector("body");
  const root = document.documentElement;
  const videoZone = document.getElementById("videoZone");
  const under = document.querySelector(".under");
  if (!videoZone) return;
  const rect = videoZone.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Calculate how far you've scrolled *through* .videoZone
  const progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);
  const eased = Math.pow(progress, 1.4);
  const grayValue = Math.round(255 * (1 - eased));

  // Compute under section progress
  let underProgress = 0;
  if (under) {
    const underRect = under.getBoundingClientRect();
    underProgress = Math.min(
      Math.max((windowHeight - underRect.top) / windowHeight, 0),
      1
    );
    underProgress = Math.pow(underProgress, 1.2);
  }

  // Final color value for body
  const finalValue = Math.round(grayValue + (255 - grayValue) * underProgress);

  // Update body background and store the color as a CSS variable
  body.style.backgroundColor = `rgb(${finalValue}, ${finalValue}, ${finalValue})`;
  root.style.setProperty(
    "--current-bg",
    `rgb(${finalValue}, ${finalValue}, ${finalValue})`
  );
});

gsap.registerPlugin(ScrollTrigger);

// --- 1. DEFINE YOUR DYNAMIC CONTENT (No changes here) ---
const sectionContent = [
  {
    text: "I create visuals that are the first point of <br /> connection with audiences—guiding <br /> perception, communicating brand <br /> values, and building memorable, <br /> cohesive identities.",
    tags: ["VISUAL IDENTITY", "PALETTES", "ICONOGRAPHY", "ILLUSTRATIONS", "TYPOGRAPHY"],
    imageSrc: "assets/image106.svg"
  },
  {
    text: " I help brands find their voice and <br /> purpose—shaping how they think, speak, <br />  and grow to build real, lasting  <br /> connections with their audiences.",
    tags: ["CULTURE", "MARKET RESEARCH", "STORYTELLER", "AUDIENCE INSIGHT", "TREND"],
    imageSrc: "assets/image107.svg"
  },
  {
    text: " I design interfaces that feel intuitive and <br /> alive—turning complex systems into <br />  seamless experiences that connect <br />  people with purpose and ease.",
    tags: ["UI DESIGN", "UX DESIGN", "INFORMATION ARCHITECHTURE", "PROTOTYPING", "INTERACTIONS"],
    imageSrc: "assets/image108.svg"
  }
];

// --- 2. GET REFERENCES TO THE DOM ELEMENTS (No changes here) ---
const track = document.querySelector(".marketZone-track");
const titles = gsap.utils.toArray(".marketZone-track .title2");
const contentText = document.querySelector(".marketZonetext");
const contentTags = document.querySelector(".attributeTag");
const contentImage = document.querySelector(".marketImg img");
const elementsToAnimate = [contentText, contentTags, contentImage];
const itemCount = titles.length;

// --- 3. CREATE THE CONTENT UPDATE FUNCTION (No changes here) ---
function updateContent(index) {
  if (!sectionContent[index]) return;

  const newContent = sectionContent[index];

  gsap.to(elementsToAnimate, {
    opacity: 0,
    duration: 0.3,
    ease: "power1.in",
    overwrite: "auto",
    onComplete: () => {
      contentText.innerHTML = newContent.text;
      contentImage.src = newContent.imageSrc;
      contentTags.innerHTML = newContent.tags
        .map(tag => `<div class="tag">${tag}</div>`)
        .join("");

      gsap.to(elementsToAnimate, {
        opacity: 1,
        duration: 0.4,
        ease: "power1.out"
      });
    }
  });
}

// --- 4. THE MAIN GSAP TIMELINE (WITH THE FIX) ---
if (!track || itemCount === 0) {
  console.warn("marketZone-track or title2 elements not found.");
} else {
  gsap.set(track, { yPercent: 0 });
  titles.forEach((title, i) => {
    gsap.set(title, {
      yPercent: i * 50,
      opacity: i === 0 ? 1 : 0.2,
      zIndex: titles.length - i
    });
  });

  let currentSection = 0;
  updateContent(0);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".marketZone",
      start: "top top",
      // THE FIX IS HERE: We REMOVED the "end" property.
      // GSAP will now automatically set the end of the scroll based on the timeline's duration.
      pin: ".marketZone-inner",
      scrub: 1.5,
      invalidateOnRefresh: true,
      onUpdate: self => {
        // This logic remains the same. It is now more reliable.
        const progress = self.progress;
        
        // We use itemCount - 1 for the progress calculation to better map to array indices.
        // And multiply progress by the number of sections we actually transition through.
        let sectionIndex = Math.floor(progress * (itemCount));
        
        const clampedIndex = gsap.utils.clamp(0, itemCount - 1, sectionIndex);

        if (clampedIndex !== currentSection) {
          currentSection = clampedIndex;
          updateContent(currentSection);
        }
      }
    }
  });

  // Build the timeline (No changes here)
  titles.forEach((title, i) => {
    if (i < itemCount - 1) {
      tl.to({}, { duration: 2 });

      tl.to(track, {
          yPercent: -50 * (i + 1),
          duration: 3,
          ease: "power1.inOut"
        })
        .to(titles, {
          opacity: (index) => (index === i + 1 ? 1 : 0.2),
          duration: 1.5,
          ease: "power1.inOut"
        }, "<");
    }
  });

  // Add a final pause for the last item
  tl.to({}, { duration: 2 });
}
 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth"
    });
  });
});





  
