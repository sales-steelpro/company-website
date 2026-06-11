/* SteelPro Distribution Australia — site interactions */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----- Stagger indices for masked lines and grouped items ----- */
  document.querySelectorAll(".reveal").forEach((el) => {
    el.querySelectorAll(".mask-line").forEach((line, i) =>
      line.style.setProperty("--i", i)
    );
  });

  document.querySelectorAll(".menu-drawer .mask-line").forEach((line, i) =>
    line.style.setProperty("--i", i)
  );

  [".rows .row", ".process .process-step", ".about-points .point", ".footer-col"].forEach(
    (selector) =>
      document.querySelectorAll(selector).forEach((el, i) =>
        el.style.setProperty("--i", i)
      )
  );

  document.querySelectorAll(".product-grid").forEach((grid) =>
    grid.querySelectorAll(".product").forEach((el, i) =>
      el.style.setProperty("--i", i)
    )
  );

  /* ----- Line illustrations: normalise path lengths + stagger the draw ----- */
  document.querySelectorAll(".draw").forEach((svg) => {
    svg
      .querySelectorAll("path, line, rect, circle, polyline, ellipse")
      .forEach((el, i) => {
        if (el.classList.contains("dash")) return;
        el.setAttribute("pathLength", "1");
        el.style.setProperty("--d", (0.2 + i * 0.07).toFixed(2) + "s");
      });
  });

  /* ----- Header: border on scroll, hide on scroll down ----- */
  const header = document.querySelector(".site-header");
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    header.classList.toggle("is-hidden", y > lastY && y > 140);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Menu drawer ----- */
  const drawer = document.getElementById("menu-drawer");
  const scrim = document.getElementById("menu-scrim");
  const trigger = document.getElementById("menu-trigger");
  const closeBtn = document.getElementById("menu-close");

  const setMenu = (open) => {
    drawer.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    trigger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-locked", open);
    if (open) header.classList.remove("is-hidden");
  };

  trigger.addEventListener("click", () =>
    setMenu(!drawer.classList.contains("is-open"))
  );
  closeBtn.addEventListener("click", () => setMenu(false));
  scrim.addEventListener("click", () => setMenu(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
  drawer.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setMenu(false))
  );

  /* ----- Hero fold: pinned hero recedes and fades as the page covers it ----- */
  const heroInner = document.querySelector(".hero-inner");

  if (heroInner && !reducedMotion) {
    let heroTicking = false;

    const updateHero = () => {
      heroTicking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y > vh * 1.2) return; /* hero fully covered, nothing to update */
      heroInner.style.transform = "translateY(" + (y * 0.3).toFixed(1) + "px)";
      heroInner.style.opacity = Math.max(1 - y / (vh * 0.85), 0).toFixed(3);
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!heroTicking) {
          heroTicking = true;
          requestAnimationFrame(updateHero);
        }
      },
      { passive: true }
    );
    updateHero();
  }

  /* ----- Scroll reveals (masked lines + fade-ups) ----- */
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ----- Product range tabs ----- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.panel === tab.dataset.tab)
      );
    });
  });

  /* ----- Footer window: content slides into place as it's revealed ----- */
  const footerWindow = document.getElementById("footer-window");
  const footerParallax = document.getElementById("footer-parallax");
  const footerOver = document.getElementById("footer-over");

  if (footerWindow && !reducedMotion) {
    let ticking = false;

    const updateFooter = () => {
      ticking = false;
      const rect = footerWindow.getBoundingClientRect();
      const vh = window.innerHeight;
      /* 0 when the window's top reaches the viewport bottom,
         1 when the window is fully on screen */
      const progress = Math.min(Math.max((vh - rect.top) / rect.height, 0), 1);
      footerParallax.style.transform =
        "translateY(" + (-40 * (1 - progress)).toFixed(2) + "%)";
      footerOver.style.opacity = (0.45 * (1 - progress)).toFixed(3);
    };

    const requestFooterUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateFooter);
      }
    };

    window.addEventListener("scroll", requestFooterUpdate, { passive: true });
    window.addEventListener("resize", requestFooterUpdate);
    updateFooter();
  } else if (footerOver) {
    footerOver.style.opacity = "0";
  }

  /* ----- Footer year ----- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
