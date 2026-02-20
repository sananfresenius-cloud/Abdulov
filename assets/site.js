(function () {
  var yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var i18n = window.ACC_I18N || null;
  var langButtons = Array.prototype.slice.call(document.querySelectorAll("[data-lang-btn]"));
  var defaultLang = "az";
  var currentLang = localStorage.getItem("acc_lang") || defaultLang;
  var prefersReducedMotion = false;
  if (window.matchMedia) {
    prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function t(key, lang) {
    if (!i18n || !key) return null;
    var actualLang = lang || currentLang;
    var src = (i18n[actualLang] && i18n[actualLang][key]) || (i18n.en && i18n.en[key]) || null;
    return typeof src === "string" ? src : null;
  }

  function applyLang(lang) {
    currentLang = i18n && i18n[lang] ? lang : defaultLang;
    localStorage.setItem("acc_lang", currentLang);
    document.documentElement.setAttribute("lang", currentLang);

    langButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === currentLang);
    });

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = t(key, currentLang);
      if (val !== null) el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      var val = t(key, currentLang);
      if (val !== null) el.innerHTML = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      var val = t(key, currentLang);
      if (val !== null) el.setAttribute("placeholder", val);
    });
  }

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang-btn");
      applyLang(lang);
    });
  });

  if (i18n) {
    applyLang(currentLang);
  }

  var mobileBtn = document.getElementById("mobileBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("show");
      mobileBtn.setAttribute("aria-expanded", mobileMenu.classList.contains("show") ? "true" : "false");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("show");
        mobileBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach(function (link) {
    var href = (link.getAttribute("href") || "").split("/").pop();
    if (href === path || (path === "" && href === "index.html")) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  function writeClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "true");
    helper.style.position = "absolute";
    helper.style.left = "-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
    return Promise.resolve();
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      if (!value) return;
      writeClipboard(value).then(function () {
        var original = btn.textContent;
        var copied = t("copied", currentLang) || "Copied";
        btn.textContent = copied;
        window.setTimeout(function () {
          btn.textContent = original;
        }, 1200);
      });
    });
  });

  var resultsFilter = document.querySelector("[data-results-filter]");
  if (resultsFilter) {
    var rows = Array.prototype.slice.call(document.querySelectorAll("[data-result-row]"));
    var countEl = document.querySelector("[data-results-count]");
    var applyFilter = function () {
      var query = (resultsFilter.value || "").trim().toLowerCase();
      var visible = 0;
      rows.forEach(function (row) {
        var rowText = (row.textContent || "").toLowerCase();
        var match = !query || rowText.indexOf(query) !== -1;
        row.classList.toggle("isHidden", !match);
        if (match) visible += 1;
      });
      if (countEl) {
        countEl.textContent = String(visible);
      }
    };
    resultsFilter.addEventListener("input", applyFilter);
    applyFilter();
  }

  var contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    var waLinks = Array.prototype.slice.call(document.querySelectorAll("[data-wa-link]"));

    var updateWhatsAppLink = function () {
      if (!waLinks.length) return;
      var name = (contactForm.querySelector('[name="name"]') || {}).value || "";
      var level = (contactForm.querySelector('[name="level"]') || {}).value || "";
      var program = (contactForm.querySelector('[name="program"]') || {}).value || "";
      var note = (contactForm.querySelector('[name="message"]') || {}).value || "";
      var text =
        "Salam Abdulov Chess Club, men ders almaq isteyirem.\n" +
        "Ad: " + (name || "-") + "\n" +
        "Seviye: " + (level || "-") + "\n" +
        "Proqram: " + (program || "-") + "\n" +
        "Qeyd: " + (note || "-");

      waLinks.forEach(function (waLinkEl) {
        var waBase = waLinkEl.getAttribute("data-wa-link") || "";
        if (waBase) {
          waLinkEl.setAttribute("href", waBase + encodeURIComponent(text));
        }
      });
    };

    ["input", "change"].forEach(function (evt) {
      contactForm.addEventListener(evt, updateWhatsAppLink);
    });
    updateWhatsAppLink();

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = contactForm.getAttribute("data-mailto") || "orkhanchess88@gmail.com";
      var name = (contactForm.querySelector('[name="name"]') || {}).value || "";
      var contact = (contactForm.querySelector('[name="contact"]') || {}).value || "";
      var level = (contactForm.querySelector('[name="level"]') || {}).value || "";
      var program = (contactForm.querySelector('[name="program"]') || {}).value || "";
      var message = (contactForm.querySelector('[name="message"]') || {}).value || "";

      var subject = encodeURIComponent("Lesson request - Abdulov Chess Club");
      var body =
        "Name: " + name + "\n" +
        "Contact: " + contact + "\n" +
        "Level: " + level + "\n" +
        "Program: " + program + "\n\n" +
        "Message:\n" + message;

      window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + encodeURIComponent(body);
    });
  }

  var revealTargets = Array.prototype.slice.call(document.querySelectorAll(".card, .sectionHead"));
  if (revealTargets.length) {
    revealTargets.forEach(function (el) {
      el.classList.add("js-reveal");
    });
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
      );
      revealTargets.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealTargets.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  if (!prefersReducedMotion) {
    var glowTargets = Array.prototype.slice.call(document.querySelectorAll(".heroPhotoFrame, .photoTile"));
    glowTargets.forEach(function (target) {
      var updateGlow = function (event) {
        var rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        var clampedX = Math.min(1, Math.max(0, x));
        var clampedY = Math.min(1, Math.max(0, y));
        target.style.setProperty("--mx", (clampedX * 100).toFixed(2) + "%");
        target.style.setProperty("--my", (clampedY * 100).toFixed(2) + "%");
        target.classList.add("is-tracking");
      };

      target.addEventListener("pointerenter", updateGlow);
      target.addEventListener("pointermove", updateGlow);
      target.addEventListener("pointerleave", function () {
        target.classList.remove("is-tracking");
      });
    });
  }

  var coachShots = Array.prototype.slice.call(document.querySelectorAll("[data-coach-shot]"));
  if (coachShots.length && !prefersReducedMotion) {
    var updateCoachBackdrop = function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      coachShots.forEach(function (shot) {
        var speed = Number(shot.getAttribute("data-speed")) || 0.06;
        shot.style.setProperty("--shift", (scrollTop * speed).toFixed(2) + "px");
      });
    };

    updateCoachBackdrop();
    window.addEventListener("scroll", updateCoachBackdrop, { passive: true });
  }
})();
