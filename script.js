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

window.addEventListener("scroll", () => {
  const body = document.querySelector("body");
  const videoZone = document.getElementById("videoZone");
  const under = document.querySelector(".under");
  if (!videoZone) return;
  const rect = videoZone.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  // Calculate how far you've scrolled *through* .videoZone
  const progress = Math.min(Math.max(1 - rect.top / windowHeight, 0), 1);
  // Ease slightly for smoother feel
  const eased = Math.pow(progress, 1.4);
  // Base grayscale value (255 -> 0)
  const grayValue = Math.round(255 * (1 - eased));

  // If there's an .under section, compute how much it has entered the viewport
  // and blend the grayscale toward white accordingly.
  let underProgress = 0;
  if (under) {
    const underRect = under.getBoundingClientRect();
    // underProgress: 0 when .under top is below viewport, 1 when fully inside (top <= 0)
    underProgress = Math.min(
      Math.max((windowHeight - underRect.top) / windowHeight, 0),
      1
    );
    underProgress = Math.pow(underProgress, 1.2); // slight easing
  }

  // Mix grayscale -> white based on underProgress
  const finalValue = Math.round(grayValue + (255 - grayValue) * underProgress);
  body.style.backgroundColor = `rgb(${finalValue}, ${finalValue}, ${finalValue})`;
});
