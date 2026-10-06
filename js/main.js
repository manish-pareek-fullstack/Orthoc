/* ==========================================================================
   Orthoc — shared behaviour (vanilla JS, no dependencies)
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  /* ---------------------------------------------------------------- year */

  function setYear() {
    var year = String(new Date().getFullYear());
    $$(".display-year").forEach(function (el) {
      el.textContent = year;
    });
  }

  /* ------------------------------------------------- missing image fallback */

  document.addEventListener(
    "error",
    function (event) {
      var el = event.target;
      if (!el || el.tagName !== "IMG") return;
      el.classList.add("is-missing");
      if (el.parentElement) el.parentElement.classList.add("is-missing");
    },
    true
  );

  /* ------------------------------------------------------- header on scroll */

  function initHeaderShadow() {
    var header = $(".header_section");
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle("is-scrolled", window.pageYOffset > 20);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------- mobile nav menu */

  var DESKTOP_MIN = 992;

  function initNavToggle() {
    var toggler = $(".navbar-toggler");
    var collapse = $("#navbarSupportedContent");
    if (!toggler || !collapse) return;

    var desktop = window.matchMedia("(min-width: " + DESKTOP_MIN + "px)");

    function isOpen() {
      return toggler.getAttribute("aria-expanded") === "true";
    }

    /* single place that writes state, so the class, aria and label never drift */
    function setState(open) {
      var next = !!open && !desktop.matches;
      toggler.setAttribute("aria-expanded", next ? "true" : "false");
      toggler.setAttribute("aria-label", next ? "Close navigation" : "Toggle navigation");
      collapse.classList.toggle("show", next);
    }

    /* the button is display:none on desktop, so ignore clicks that slip through */
    toggler.addEventListener("click", function () {
      if (desktop.matches) return;
      setState(!isOpen());
    });

    collapse.addEventListener("click", function (event) {
      if (event.target.closest(".nav-link")) setState(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setState(false);
        toggler.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!isOpen()) return;
      if (toggler.contains(event.target) || collapse.contains(event.target)) return;
      setState(false);
    });

    /* back up to desktop: drop the dropdown state instead of leaving it open */
    function syncToViewport() {
      if (desktop.matches) setState(false);
    }

    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", syncToViewport);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(syncToViewport);
    }

    window.addEventListener("resize", syncToViewport);
    syncToViewport();
  }

  /* --------------------------------------------------------- nav search box */

  function initNavSearch() {
    var form = $(".nav_search");
    if (!form) return;
    var button = $(".nav_search-btn", form);
    var panel = $("#navSearchPanel", form);
    var input = $("input[type='search']", form);
    var note = $(".nav_search-note", form);
    if (!button || !panel) return;

    function setOpen(open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      if (open && input) {
        if (note) note.hidden = true;
        input.focus();
      }
    }

    button.addEventListener("click", function () {
      setOpen(panel.hidden);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (note) {
        note.hidden = false;
        note.textContent = "Search is a demo on this template — no data is sent anywhere.";
      }
      if (input) input.focus();
    });

    document.addEventListener("click", function (event) {
      if (!panel.hidden && !form.contains(event.target)) setOpen(false);
    });
  }

  /* --------------------------------------------------------- scroll reveal */

  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    function showAll() {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }

    if (!("IntersectionObserver" in window) || reduceMotion) {
      showAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.05 }
    );

    items.forEach(function (el) {
      /* anything already on screen shows straight away */
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("is-visible");
      } else {
        observer.observe(el);
      }
    });

    /* safety net: never leave content hidden, whatever happens */
    window.setTimeout(showAll, 1500);
  }

  /* ---------------------------------------------------------------- carousel */

  function initCarousel(options) {
    var root = options.root;
    if (!root) return;

    var slides = $$(".carousel-item", root);
    var inner = $(".carousel-inner", root);
    if (slides.length < 1 || !inner) return;

    var dots = options.dots ? $$(options.dots) : [];
    var prev = options.prev ? $(options.prev, root) : null;
    var next = options.next ? $(options.next, root) : null;
    var step = options.step || 100;
    var index = 0;
    var timer = null;
    var delay = options.delay || 6000;
    var swipeX = null;
    var held = false;

    function render() {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        $$("a, button, input, textarea, select", slide).forEach(function (el) {
          if (active) {
            el.removeAttribute("tabindex");
          } else {
            el.setAttribute("tabindex", "-1");
          }
        });
      });
      inner.style.transform = "translate3d(" + -(index * step) + "%, 0, 0)";
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function goTo(target) {
      index = (target + slides.length) % slides.length;
      render();
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function play() {
      if (reduceMotion || timer || held) return;
      timer = window.setInterval(function () {
        goTo(index + 1);
      }, delay);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stop();
        goTo(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        stop();
        goTo(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        stop();
        goTo(index + 1);
        play();
      });
    }

    root.addEventListener("mouseenter", function () {
      held = true;
      stop();
    });
    root.addEventListener("mouseleave", function () {
      held = false;
      play();
    });
    root.addEventListener("focusin", function () {
      held = true;
      stop();
    });
    root.addEventListener("focusout", function (event) {
      if (root.contains(event.relatedTarget)) return;
      held = false;
      play();
    });

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stop();
        goTo(index - 1);
        play();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stop();
        goTo(index + 1);
        play();
      }
    });

    root.addEventListener("pointerdown", function (event) {
      swipeX = event.clientX;
    });

    root.addEventListener("pointerup", function (event) {
      if (swipeX === null) return;
      var delta = event.clientX - swipeX;
      swipeX = null;
      if (Math.abs(delta) < 45) return;
      stop();
      goTo(delta < 0 ? index + 1 : index - 1);
      play();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        play();
      }
    });

    render();
    play();
  }

  function initCarousels() {
    initCarousel({ root: $("#customCarousel1"), dots: "#heroIndicators .ind-dot", step: 33.333333, delay: 6500 });
    initCarousel({
      root: $("#carouselExample2Controls"),
      dots: null,
      prev: ".carousel-control-prev",
      next: ".carousel-control-next",
      step: 100,
      delay: 7000
    });
  }

  /* ------------------------------------------------------------------ forms */

  function errorFor(field) {
    var id = field.getAttribute("aria-describedby");
    return id ? document.getElementById(id) : null;
  }

  function showError(field, message) {
    field.setAttribute("aria-invalid", "true");
    var error = errorFor(field);
    if (error) error.textContent = message;
  }

  function clearError(field) {
    field.removeAttribute("aria-invalid");
    var error = errorFor(field);
    if (error) error.textContent = "";
  }

  function initContactForm() {
    var form = $(".contact-form form");
    if (!form) return;
    var status = $("#contactStatus", form.parentElement);

    function validate(field) {
      var value = field.value.trim();
      clearError(field);
      if (field.id === "contactName" && value.length < 2) {
        showError(field, "Please tell us your name (at least 2 characters).");
        return false;
      }
      if (field.id === "contactPhone" && value.replace(/[^\d]/g, "").length < 7) {
        showError(field, "Please enter a valid phone number.");
        return false;
      }
      if (field.id === "contactEmail" && !EMAIL_RE.test(value)) {
        showError(field, "Please enter a valid email address.");
        return false;
      }
      if (field.id === "contactMessage" && value.length < 10) {
        showError(field, "Please write a message of at least 10 characters.");
        return false;
      }
      return true;
    }

    var fields = $$("input, textarea", form).filter(function (el) {
      return el.type !== "submit" && el.type !== "button";
    });

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.value.trim()) validate(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var ok = true;
      var firstInvalid = null;

      fields.forEach(function (field) {
        if (!validate(field)) {
          ok = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (!ok) {
        if (status) status.textContent = "Please fix the highlighted fields and try again.";
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      form.reset();
      fields.forEach(clearError);
      if (status) {
        status.textContent =
          "Thank you! This is a demo form, so your message was not sent anywhere.";
      }
    });
  }

  function initNewsletter() {
    var form = $(".footer_section form");
    if (!form) return;
    var input = $("input[type='email']", form);
    if (!input) return;
    var note = $(".form-note", form.parentElement);

    function fail(message) {
      input.setAttribute("aria-invalid", "true");
      var error = errorFor(input);
      if (error) error.textContent = message;
      if (note) note.textContent = "";
      input.focus();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!EMAIL_RE.test(value)) {
        fail("Please enter a valid email address.");
        return;
      }

      var error = errorFor(input);
      if (error) error.textContent = "";
      input.removeAttribute("aria-invalid");
      form.reset();
      if (note) {
        note.textContent = "Subscribed! Demo only — nothing was sent anywhere.";
      }
    });

    input.addEventListener("input", function () {
      input.removeAttribute("aria-invalid");
      var error = errorFor(input);
      if (error) error.textContent = "";
      if (note) note.textContent = "";
    });
  }

  /* ------------------------------------------------------------------- init */

  function init() {
    setYear();
    initHeaderShadow();
    initNavToggle();
    initNavSearch();
    initReveal();
    initCarousels();
    initContactForm();
    initNewsletter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
