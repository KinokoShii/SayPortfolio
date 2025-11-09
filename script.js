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

  // Cursor position relative to container
  let x = e.clientX - containerRect.left - halfWidth;

  // Clamp to container boundaries
  const minX = 0;
  const maxX = containerRect.width - rect.width;
  x = Math.max(minX, Math.min(x, maxX));

  // Center position
  const centerX = (containerRect.width - rect.width) / 2;

  // Gradually reduce horizontal movement
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
// Initialize currentX/targetX from computed position to avoid jump
const initialRect = video.getBoundingClientRect();
currentX = initialRect.left;
targetX = currentX;
// initial/target widths for progressive scaling
let initialWidth = video.offsetWidth;
let targetWidthPx = Math.round(window.innerWidth * 0.55);

// update targetWidth on resize
window.addEventListener("resize", () => {
  targetWidthPx = Math.round(window.innerWidth * 0.55);
});

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY || window.pageYOffset;

  // Note: keep handling even when snapped so we can detect unsnap (rect.top > 0)

  // compute videoZone progress early so we can use it to scale width progressively
  const videoZone = document.getElementById("videoZone");
  const windowHeight = window.innerHeight;
  let progress = 0;
  let rect = null;
  if (videoZone) {
    rect = videoZone.getBoundingClientRect();
    progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);
  }

  // On first scroll, center the video and lock mouse interaction
  if (scrollY > 0 && !video.classList.contains("centered")) {
    video.classList.add("centered");
    locked = true; // stops mousemove/animate from changing left
    // center horizontally using left 50% + translateX(-50%)
    video.style.left = "50%";
    video.style.transform = "translateX(-50%)";
    // remove mouse listener so cursor can't move it anymore
    document.removeEventListener("mousemove", handleMouse);
    // capture sizes for scaling
    initialWidth = video.offsetWidth || initialWidth;
    targetWidthPx = Math.round(window.innerWidth * 0.55);
  }

  // If scrolled back to top, restore original state
  if (scrollY === 0 && video.classList.contains("centered")) {
    video.classList.remove("centered");
    locked = false;
    // reset inline styles so CSS base position takes over
    video.style.removeProperty("left");
    video.style.removeProperty("transform");
    video.style.removeProperty("position");
    video.style.removeProperty("top");
    // reset currentX/targetX so animate resumes smoothly
    const rect = video.getBoundingClientRect();
    currentX = rect.left;
    targetX = currentX;
    // reattach mouse handler so it can be moved again
    document.addEventListener("mousemove", handleMouse);
  }

  // While centered but not yet snapped, progress width from initialWidth → targetWidthPx
  if (video.classList.contains("centered") && !snapped) {
    const widthPx = Math.round(
      initialWidth + (targetWidthPx - initialWidth) * progress
    );
    video.style.width = `${widthPx}px`;
  }

  // Check videoZone to snap to absolute final position (when its top reaches viewport top)
  if (videoZone && rect) {
    const fixedY = window.innerHeight * 0.2;
    // Snap when videoZone reaches top
    if (rect.top <= 0 && !snapped) {
      snapped = true;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const absoluteY = scrollTop + fixedY;

      // Temporarily disable transitions and set all final styles instantly
      video.classList.add("no-transition");
      video.style.position = "absolute";
      video.style.left = "50%";
      video.style.top = `${absoluteY}px`;
      video.style.transform = "translateX(-50%)";
      video.style.width = "55vw";
      // force reflow then re-enable transitions after a short delay so layout settles
      void video.offsetWidth;
      setTimeout(() => video.classList.remove("no-transition"), 40);

      // Unsnap: when videoZone moves down again (user scrolls back up)
    } else if (rect.top > 0 && snapped) {
      snapped = false;
      // Temporarily disable transitions and set fixed positioning/styles instantly
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
      // force reflow then re-enable transitions after a short delay so layout settles
      void video.offsetWidth;
      setTimeout(() => video.classList.remove("no-transition"), 40);
      // keep locked = true (still centered and not movable by mouse)
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

// Pick elements
const track = document.querySelector(".marketZone-track");
const titles = gsap.utils.toArray(".marketZone-track .title2");
const itemCount = titles.length;

if (!track || itemCount === 0) {
  console.warn("marketZone-track or title2 elements not found.");
} else {
  // First, set the initial state immediately (before any ScrollTrigger)
  titles.forEach((title, i) => {
    gsap.set(title, {
      yPercent: i * 50,
      opacity: i === 0 ? 1 : 0.2,
      zIndex: titles.length - i
    });
  });

  // Then create the main timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".marketZone",
      start: "top-=10 top",
      end: () => `+=${(itemCount+1) * window.innerHeight}`,
      pin: ".marketZone-inner",
      scrub: 1,
      anticipatePin: 1
    }
  });

  // Create the main animation
  titles.forEach((title, i) => {
    // Animate all titles up to and including the current one
    tl.to(titles.slice(0, i + 1), {
      yPercent: (index) => (index - i - 1) * 100,
      duration: 1,
      ease: "none"
    })
    .to(titles, {
      opacity: (index) => index === i ? 1 : 0.2,
      duration: 0.5,
      ease: "power1.inOut"
    }, "<"); // Run opacity animation at the same time

    // Add a pause between movements
    if (i < titles.length - 1) {
      tl.to({}, { duration: 0.5 }); // shorter hold for smoother transitions
    }
  });

  // Handle resize
  ScrollTrigger.addEventListener("refreshInit", () => {
    ScrollTrigger.refresh(true);
  });
}

 
