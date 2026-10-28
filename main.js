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

  var galleryCards = Array.prototype.slice.call(document.querySelectorAll(".gallery__card"));
  var touchGallery = window.matchMedia && window.matchMedia("(hover: none)").matches;
  if (touchGallery && galleryCards.length) {
    var closeGalleryCaptions = function (exceptCard) {
      galleryCards.forEach(function (card) {
        if (card === exceptCard) {
          return;
        }
        var caption = card.querySelector(".gallery__caption");
        card.classList.remove("is-caption-open");
        card.setAttribute("aria-expanded", "false");
        if (caption) {
          card.setAttribute("aria-label", "Vis billedtekst: " + caption.textContent.trim());
        }
      });
    };

    galleryCards.forEach(function (card) {
      var caption = card.querySelector(".gallery__caption");
      if (!caption) {
        return;
      }
      var captionText = caption.textContent.trim();
      var toggleCaption = function () {
        var open = !card.classList.contains("is-caption-open");
        closeGalleryCaptions(card);
        card.classList.toggle("is-caption-open", open);
        card.setAttribute("aria-expanded", open ? "true" : "false");
        card.setAttribute(
          "aria-label",
          (open ? "Skjul" : "Vis") + " billedtekst: " + captionText
        );
      };

      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", "false");
      card.setAttribute("aria-label", "Vis billedtekst: " + captionText);
      card.addEventListener("click", toggleCaption);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleCaption();
        }
      });
    });

    document.addEventListener("click", function (event) {
      var clickedCard = galleryCards.some(function (card) {
        return card.contains(event.target);
      });
      if (!clickedCard) {
        closeGalleryCaptions();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeGalleryCaptions();
      }
    });
  }

  var headerLine = document.querySelector(".site-header");
  var heroLayer = document.querySelector(".hero__parallax-layer");
  var homeHero = document.querySelector(".hero");
  if (headerLine) {
    var headerLineTicking = false;
    var updateHeaderLine = function () {
      headerLineTicking = false;
      var scrollY = Math.max(window.scrollY, 0);
      var headerHeight = headerLine.offsetHeight;
      if (heroLayer) {
        heroLayer.style.top = headerHeight + "px";
      }
      if (homeHero && headerLine.classList.contains("site-header--home")) {
        headerLine.classList.toggle(
          "is-past-hero",
          homeHero.getBoundingClientRect().bottom <= headerHeight
        );
      }
      var videoFadeDistance = headerHeight / 0.84 + 12;
      var videoFadeProgress = Math.min(scrollY / videoFadeDistance, 1);
      headerLine.style.setProperty("--header-line-opacity", String(1 - videoFadeProgress));
      headerLine.style.setProperty("--header-video-opacity", String(0.72 * (1 - videoFadeProgress)));
      headerLine.style.setProperty(
        "--header-video-clip",
        Math.round(headerHeight * videoFadeProgress) + "px"
      );
    };
    var onScrollForHeaderLine = function () {
      if (!headerLineTicking) {
        headerLineTicking = true;
        window.requestAnimationFrame(updateHeaderLine);
      }
    };
    window.addEventListener("scroll", onScrollForHeaderLine, { passive: true });
    window.addEventListener("resize", onScrollForHeaderLine, { passive: true });
    updateHeaderLine();
  }

  var heroVideo = document.querySelector(".hero__parallax-layer video");
  var heroVideoLayer = document.querySelector(".hero__parallax-layer");
  var headerVideoBackdrop = document.querySelector(".site-header__video-backdrop");
  var headerVideo = headerVideoBackdrop && headerVideoBackdrop.querySelector("video");
  if (heroVideo && heroVideoLayer) {
    var userGesturePlayback = false;
    var showHeroVideoFallback = function () {
      heroVideoLayer.classList.remove("is-playing");
      heroVideoLayer.classList.add("is-fallback");
    };
    var clearHeroVideoFallback = function () {
      heroVideoLayer.classList.remove("is-fallback");
      heroVideoLayer.classList.add("is-playing");
      if (headerVideoBackdrop) {
        headerVideoBackdrop.classList.remove("is-synced");
      }
    };

    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute("webkit-playsinline", "");
    heroVideo.addEventListener("playing", clearHeroVideoFallback);
    heroVideo.addEventListener("pause", function () {
      heroVideoLayer.classList.remove("is-playing");
    });
    heroVideo.addEventListener("error", function () {
      if (userGesturePlayback) {
        showHeroVideoFallback();
      }
    });

    var startHeroVideo = function (fromUserGesture) {
      if (document.visibilityState === "hidden" || !heroVideo.paused) {
        return;
      }
      heroVideo.muted = true;
      try {
        var playPromise = heroVideo.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (fromUserGesture === true) {
              userPlaybackAttempted = false;
              showHeroVideoFallback();
            }
          });
        }
      } catch (error) {
        if (fromUserGesture === true) {
          userPlaybackAttempted = false;
          showHeroVideoFallback();
        }
      }
    };

    var userPlaybackAttempted = false;
    var startHeroVideoFromUserAction = function () {
      if (userPlaybackAttempted || !heroVideo.paused) {
        return;
      }
      userPlaybackAttempted = true;
      userGesturePlayback = true;
      startHeroVideo(true);

      if (headerVideo && !headerVideoBackdrop.classList.contains("is-synced")) {
        headerVideo.muted = true;
        try {
          var headerPlayPromise = headerVideo.play();
          if (headerPlayPromise && typeof headerPlayPromise.then === "function") {
            headerPlayPromise.then(function () {
              if (typeof alignHeaderVideo === "function") {
                alignHeaderVideo();
              }
            }).catch(function () {});
          }
        } catch (error) {}
      }
    };

    window.addEventListener(
      "wheel",
      function (event) {
        if (event.isTrusted && event.deltaY !== 0) {
          startHeroVideoFromUserAction();
        }
      },
      { passive: true }
    );

    var lastScrollY = window.scrollY;
    window.addEventListener(
      "scroll",
      function (event) {
        var currentScrollY = window.scrollY;
        var moved = currentScrollY !== lastScrollY;
        lastScrollY = currentScrollY;
        if (event.isTrusted && moved) {
          startHeroVideoFromUserAction();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      function (event) {
        if (event.isTrusted && (event.pointerType !== "mouse" || event.button === 0)) {
          startHeroVideoFromUserAction();
        }
      },
      { passive: true }
    );

    var touchStartY = null;
    var touchStartScrollY = 0;
    window.addEventListener(
      "touchstart",
      function (event) {
        if (!event.isTrusted || event.touches.length !== 1) {
          touchStartY = null;
          return;
        }
        touchStartY = event.touches[0].clientY;
        touchStartScrollY = window.scrollY;
      },
      { passive: true }
    );
    window.addEventListener(
      "touchend",
      function (event) {
        if (!event.isTrusted || touchStartY === null) {
          return;
        }
        var touch = event.changedTouches[0];
        var movedDown =
          window.scrollY > touchStartScrollY + 1 ||
          (touch && touchStartY - touch.clientY > 2);
        touchStartY = null;
        if (movedDown) {
          startHeroVideoFromUserAction();
        }
      },
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      function (event) {
        if (!event.isTrusted || touchStartY === null || event.touches.length !== 1) {
          return;
        }
        if (touchStartY - event.touches[0].clientY > 2) {
          startHeroVideoFromUserAction();
        }
      },
      { passive: true }
    );
    window.addEventListener(
      "touchcancel",
      function () {
        touchStartY = null;
      },
      { passive: true }
    );

    heroVideo.addEventListener("canplay", function () {
      startHeroVideo(false);
    });
    window.addEventListener("pageshow", function () {
      startHeroVideo(false);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        startHeroVideo(false);
      }
    });
    if (!heroVideo.paused) {
      heroVideoLayer.classList.add("is-playing");
    } else if (heroVideo.readyState >= 2) {
      startHeroVideo(false);
    }

  }
  if (heroVideo && headerVideo) {
    headerVideo.muted = true;
    headerVideo.defaultMuted = true;
    headerVideo.playsInline = true;
    headerVideo.setAttribute("webkit-playsinline", "");
    var headerVideoSyncing = false;
    var alignHeaderVideo = function () {
      if (headerVideoSyncing || heroVideo.paused || headerVideo.readyState < 2) {
        return;
      }

      var drift = heroVideo.currentTime - headerVideo.currentTime;
      if (Math.abs(drift) > 0.12) {
        headerVideoSyncing = true;
        headerVideo.pause();
        headerVideoBackdrop.classList.remove("is-synced");
        headerVideo.addEventListener(
          "seeked",
          function () {
            headerVideoSyncing = false;
            alignHeaderVideo();
          },
          { once: true }
        );
        headerVideo.currentTime = Math.max(0, heroVideo.currentTime);
        return;
      }

      var correction = Math.max(-0.03, Math.min(0.03, drift * 0.12));
      headerVideo.playbackRate = heroVideo.playbackRate + correction;
      if (headerVideo.paused) {
        var playPromise = headerVideo.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(function () {
              headerVideoBackdrop.classList.add("is-synced");
            })
            .catch(function () {});
        } else {
          headerVideoBackdrop.classList.add("is-synced");
        }
      } else {
        headerVideoBackdrop.classList.add("is-synced");
      }
    };

    var maintainHeaderVideoSync = function () {
      if (headerVideoSyncing || heroVideo.paused || headerVideo.paused) {
        return;
      }

      var drift = heroVideo.currentTime - headerVideo.currentTime;
      if (Math.abs(drift) > 0.35) {
        alignHeaderVideo();
      } else {
        var correction = Math.max(-0.03, Math.min(0.03, drift * 0.12));
        headerVideo.playbackRate = heroVideo.playbackRate + correction;
      }
    };

    heroVideo.addEventListener("play", alignHeaderVideo);
    heroVideo.addEventListener("timeupdate", maintainHeaderVideoSync);
    heroVideo.addEventListener("seeked", alignHeaderVideo);
    heroVideo.addEventListener("pause", function () {
      headerVideo.pause();
    });
    headerVideo.addEventListener("loadeddata", alignHeaderVideo);
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
    var galleryPeek = document.querySelector(".hero + .gallery");
    var fadeRootMargin = galleryPeek ? "20% 0px 16% 0px" : "0px 0px 16% 0px";
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: fadeRootMargin, threshold: 0.04 }
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

  var scrollCue = document.querySelector(".hero__scroll-cue");
  if (scrollCue) {
    var cueTick = false;
    var updateScrollCue = function () {
      cueTick = false;
      if (window.scrollY > 56) {
        scrollCue.classList.add("is-hidden");
      } else {
        scrollCue.classList.remove("is-hidden");
      }
    };
    var onScrollForCue = function () {
      if (!cueTick) {
        cueTick = true;
        requestAnimationFrame(updateScrollCue);
      }
    };
    window.addEventListener("scroll", onScrollForCue, { passive: true });
    updateScrollCue();
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
