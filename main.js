(function () {
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target && e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      }
    });
  }

  var parallax = document.querySelector("[data-parallax]");
  if (parallax && !reduceMotion) {
    var layer = parallax.querySelector(".hero__parallax-layer");
    var ticking = false;
    var update = function () {
      var y = window.scrollY;
      var rate = 0.16;
      var offset = y * rate;
      if (layer) {
        layer.style.transform = "translate3d(0, " + offset + "px, 0)";
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var fadeEls = document.querySelectorAll("[data-fade]");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px 16% 0px", threshold: 0.04 }
    );
    fadeEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll("[data-fade]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var title = document.querySelector(".hero__title");
  var titleWrap = document.querySelector(".hero__title-wrap");
  if (title && titleWrap) {
    var fitTitle = function () {
      title.style.transform = "";
      var wrapW = titleWrap.clientWidth;
      var titleW = title.scrollWidth;
      if (titleW > wrapW && wrapW > 0) {
        title.style.transform = "scale(" + wrapW / titleW + ")";
        title.style.transformOrigin = "center center";
      }
    };
    fitTitle();
    window.addEventListener("resize", fitTitle, { passive: true });
  }

  var workTitles = document.querySelectorAll(".work-line__title");
  if (workTitles.length) {
    var fitWorkLineTitles = function () {
      workTitles.forEach(function (el) {
        el.style.fontSize = "";
        if (el.clientWidth < 4) {
          return;
        }
        if (el.scrollWidth <= el.clientWidth) {
          return;
        }
        var startPx = parseFloat(window.getComputedStyle(el).fontSize) || 15;
        var absoluteMin = 12;
        var softMin = Math.max(absoluteMin, Math.round(startPx * 0.88 * 10) / 10);
        softMin = Math.min(softMin, startPx - 0.02);
        if (softMin < absoluteMin) {
          softMin = absoluteMin;
        }

        var binaryDown = function (lo, hi) {
          if (hi <= lo) {
            el.style.fontSize = lo + "px";
            return;
          }
          var low = lo;
          var high = hi;
          var i;
          for (i = 0; i < 16; i++) {
            var mid = (low + high) / 2;
            el.style.fontSize = mid + "px";
            if (el.scrollWidth <= el.clientWidth) {
              low = mid;
            } else {
              high = mid;
            }
          }
          el.style.fontSize = low + "px";
        };

        if (softMin >= startPx - 0.015) {
          binaryDown(absoluteMin, startPx);
        } else {
          binaryDown(softMin, startPx);
          if (el.scrollWidth > el.clientWidth && softMin > absoluteMin + 0.05) {
            binaryDown(absoluteMin, softMin);
          }
        }
        while (parseFloat(el.style.fontSize) > absoluteMin && el.scrollWidth > el.clientWidth) {
          el.style.fontSize = parseFloat(el.style.fontSize) - 0.5 + "px";
        }
      });
    };

    var workTitlesRaf = 0;
    var scheduleFitWorkTitles = function () {
      if (workTitlesRaf) {
        cancelAnimationFrame(workTitlesRaf);
      }
      workTitlesRaf = requestAnimationFrame(function () {
        workTitlesRaf = 0;
        fitWorkLineTitles();
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFitWorkTitles);
    } else {
      scheduleFitWorkTitles();
    }
    window.addEventListener("resize", scheduleFitWorkTitles, { passive: true });
  }
})();
