"use strict";

/* Cake King Bakery - shared script for all pages.
   Each feature checks that its elements exist, so one file works everywhere. */

document.addEventListener("DOMContentLoaded", function () {
  highlightActiveNav();
  setupRevealAnimations();
  setupServicesFilter();
  setupContactForm();
  setupEnquiryForm();
  setupBackToTop();
  setupMobileMenu();
  setupScrollProgress();
  setupSprinkles();
  setupTypewriter();
  setupLightbox();
  setupCharCounters();
  setupAccordion();
  setupMap();
});

/* ---------- Navigation: mark the current page ---------- */
function highlightActiveNav() {
  var current = window.location.pathname.split("/").pop().toLowerCase() || "home.html";
  document.querySelectorAll(".nav-link a").forEach(function (link) {
    if (link.getAttribute("href").toLowerCase() === current) {
      link.classList.add("active");
    }
  });
}

/* ---------- Scroll reveal animation ---------- */
function setupRevealAnimations() {
  var items = document.querySelectorAll(
    "main h1, main h2, main h3, main > p, .about-image, .about-text p, .card, " +
    ".Gallery, .contact-left, .contact-right, .enquiry-form, .service-tools"
  );
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  items.forEach(function (el) { el.classList.add("reveal"); });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("visible"); });
    return;
  }

  var order = 0;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        setTimeout(function () { el.classList.add("visible"); }, order * 120);
        order++;
        observer.unobserve(el);
      }
    });
    setTimeout(function () { order = 0; }, 500);
  }, { threshold: 0.1 });

  items.forEach(function (el) { observer.observe(el); });
}

/* ---------- Services: search + category filter ---------- */
function setupServicesFilter() {
  var searchInput = document.getElementById("serviceSearch");
  if (!searchInput) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll(".cards-container .card"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-buttons .filter-btn"));
  var countEl = document.getElementById("resultCount");
  var noResults = document.getElementById("noResults");
  var resetBtn = document.getElementById("resetFilters");
  var category = "all";
  var sortSelect = document.getElementById("sortSelect");
  var cardContainer = document.querySelector(".cards-container");

  function cardText(card) {
    var parts = [];
    card.querySelectorAll("h2, p, li").forEach(function (n) { parts.push(n.textContent); });
    return parts.join(" ").toLowerCase();
  }

  function replayAnimation(card) {
    card.classList.remove("pop-in");
    void card.offsetWidth; // force reflow so the animation restarts
    card.classList.add("pop-in");
  }

  function applyFilters() {
    var query = searchInput.value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var matchesCategory = category === "all" || card.dataset.category === category;
      var matchesText = query === "" || cardText(card).indexOf(query) !== -1;
      var show = matchesCategory && matchesText;

      card.querySelectorAll("li").forEach(function (li) {
        li.classList.toggle("match", query !== "" && li.textContent.toLowerCase().indexOf(query) !== -1);
      });

      if (show) {
        visible++;
        if (card.classList.contains("is-hidden")) {
          card.classList.remove("is-hidden");
          card.classList.add("visible");
          replayAnimation(card);
        }
      } else {
        card.classList.add("is-hidden");
      }
    });

    var shownProducts = renderProducts(query, category, sortSelect ? sortSelect.value : "default");
    countEl.textContent = "Showing " + visible + " of " + cards.length + " services and " + shownProducts + " menu items";
    noResults.hidden = (visible + shownProducts) !== 0;
  }

  searchInput.addEventListener("input", applyFilters);
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { searchInput.value = ""; applyFilters(); }
  });

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      category = btn.dataset.filter;
      buttons.forEach(function (b) {
        var isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      applyFilters();
    });
  });

  resetBtn.addEventListener("click", function () {
    searchInput.value = "";
    category = "all";
    if (sortSelect) { sortSelect.value = "default"; sortCards("default"); }
    buttons.forEach(function (b) {
      var isAll = b.dataset.filter === "all";
      b.classList.toggle("active", isAll);
      b.setAttribute("aria-pressed", isAll ? "true" : "false");
    });
    applyFilters();
    searchInput.focus();
  });

  // Click a card to highlight it (clicking Enquire still follows the link)
  cards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      card.classList.toggle("selected");
    });
  });

  // Sort the service cards (A-Z / Z-A); price sorting applies to the menu list
  var defaultOrder = cards.slice();
  function sortCards(mode) {
    var list = defaultOrder.slice();
    if (mode === "az" || mode === "za") {
      list.sort(function (a, b) {
        var r = a.querySelector("h2").textContent.localeCompare(b.querySelector("h2").textContent);
        return mode === "az" ? r : -r;
      });
    }
    list.forEach(function (c) { cardContainer.appendChild(c); });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", function () { sortCards(sortSelect.value); applyFilters(); });
  }

  applyFilters();
}

/* ---------- Shared form helpers ---------- */
function showError(field, message) {
  clearError(field);
  field.classList.add("invalid");
  var msg = document.createElement("span");
  msg.className = "error-msg";
  msg.textContent = message;
  field.insertAdjacentElement("afterend", msg);
}

function clearError(field) {
  field.classList.remove("invalid");
  var next = field.nextElementSibling;
  if (next && next.classList.contains("error-msg")) next.remove();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showSuccess(form, text) {
  var old = form.parentElement.querySelector(".form-success");
  if (old) old.remove();
  var box = document.createElement("div");
  box.className = "form-success";
  box.setAttribute("role", "status");
  box.textContent = text;
  form.insertAdjacentElement("beforebegin", box);
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  launchConfetti();
  return box;
}

function clearErrorsOnInput(form) {
  form.querySelectorAll("input, textarea, select").forEach(function (f) {
    f.addEventListener("input", function () { clearError(f); });
  });
}

/* ---------- Contact form ---------- */
function setupContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;
  clearErrorsOnInput(form);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var fname = form.elements.fname;
    var lname = form.elements.lname;
    var email = form.elements.email;
    var message = form.elements.message;

    if (fname.value.trim().length < 2) { showError(fname, "Please enter your first name."); ok = false; }
    if (lname.value.trim().length < 2) { showError(lname, "Please enter your last name."); ok = false; }
    if (!isValidEmail(email.value.trim())) { showError(email, "Please enter a valid email address."); ok = false; }
    if (message.value.trim().length < 10) { showError(message, "Your message must be at least 10 characters."); ok = false; }

    var phone = form.elements.phone;
    var type = form.elements.messageType;
    var phoneDigits = phone.value.replace(/\D/g, "");
    if (!(/^0\d{9}$/.test(phoneDigits) || /^27\d{9}$/.test(phoneDigits))) { showError(phone, "Enter a valid phone number, e.g. 063-638-9414."); ok = false; }
    if (type.value === "") { showError(type, "Please choose the type of message."); ok = false; }

    if (ok) {
      // Compile the form into an email addressed to the bakery
      var fullName = fname.value.trim() + " " + lname.value.trim();
      var subject = "[" + type.value + "] Message from " + fullName;
      var body = "Name: " + fullName + "\nEmail: " + email.value.trim() + "\nPhone: " + phone.value.trim() +
                 "\nMessage type: " + type.value + "\n\nMessage:\n" + message.value.trim();
      var href = "mailto:" + BAKERY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      var box = showSuccess(form, "Thank you, " + fname.value.trim() + "! Your email to " + BAKERY_EMAIL + " is ready. Check it below, then press the button to send it from your email app.");
      var preview = document.createElement("pre");
      preview.className = "email-preview";
      preview.textContent = "To: " + BAKERY_EMAIL + "\nSubject: " + subject + "\n\n" + body;
      var send = document.createElement("a");
      send.className = "card-btn";
      send.href = href;
      send.textContent = "Open email to send";
      box.appendChild(preview);
      box.appendChild(send);
      form.reset();
    }
  });
}

/* ---------- Enquiry form ---------- */
function setupEnquiryForm() {
  var form = document.getElementById("enquiryForm");
  if (!form) return;
  clearErrorsOnInput(form);

  // Do not allow dates in the past
  var dateInput = form.elements.prefDate;
  var now = new Date();
  var month = String(now.getMonth() + 1).padStart(2, "0");
  var day = String(now.getDate()).padStart(2, "0");
  var today = now.getFullYear() + "-" + month + "-" + day;
  dateInput.min = today;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var f = form.elements;

    if (f.fullName.value.trim().length < 2) { showError(f.fullName, "Please enter your full name."); ok = false; }
    if (!isValidEmail(f.email.value.trim())) { showError(f.email, "Please enter a valid email address."); ok = false; }

    var digits = f.phone.value.replace(/\D/g, "");
    if (!(/^0\d{9}$/.test(digits) || /^27\d{9}$/.test(digits))) {
      showError(f.phone, "Enter a valid phone number, e.g. 063-638-9414."); ok = false;
    }
    if (f.cakeType.value.trim() === "") { showError(f.cakeType, "Please tell us the cake type."); ok = false; }
    if (f.cakeFlavour.value.trim() === "") { showError(f.cakeFlavour, "Please tell us the flavour."); ok = false; }

    if (f.prefDate.value === "") {
      showError(f.prefDate, "Please choose a preferred date."); ok = false;
    } else if (f.prefDate.value < today) {
      showError(f.prefDate, "The date cannot be in the past."); ok = false;
    }

    var people = parseInt(f.people.value, 10);
    if (isNaN(people) || people < 1) { showError(f.people, "Enter the number of people (at least 1)."); ok = false; }

    if (ok) {
      var result = calculateEstimate(f);
      var payload = {
        name: f.fullName.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
        cakeType: f.cakeType.value.trim(), flavour: f.cakeFlavour.value.trim(), size: f.cakeSize.value,
        occasion: f.occasion.value, date: f.prefDate.value, people: people,
        description: f.description.value.trim(), specialRequest: f.specialRequest.value.trim(),
        estimatedCost: "R" + result.cost, available: result.available
      };
      var box = showEnquiryResponse(form, f.fullName.value.trim(), result);
      sendFormAjax(form.action, payload, box);
      form.reset();
    } else {
      var firstBad = form.querySelector(".invalid");
      if (firstBad) firstBad.focus();
    }
  });
}

/* ---------- Back to top button ---------- */
function setupBackToTop() {
  var btn = document.createElement("button");
  btn.id = "backToTop";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.textContent = "\u2191";
  document.body.appendChild(btn);

  window.addEventListener("scroll", function () {
    btn.classList.toggle("show", window.scrollY > 300);
  });
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* ===================================================
   Extra features
   =================================================== */

/* ---------- Mobile hamburger menu ---------- */
function setupMobileMenu() {
  var nav = document.querySelector(".nav-link");
  if (!nav) return;
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nav-toggle";
  btn.setAttribute("aria-label", "Toggle menu");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = "&#9776; Menu";
  nav.parentElement.insertBefore(btn, nav);

  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });
}

/* ---------- Scroll progress bar ---------- */
function setupScrollProgress() {
  var bar = document.createElement("div");
  bar.id = "scrollProgress";
  document.body.appendChild(bar);
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", update);
  update();
}

/* ---------- Floating sprinkles (home page) ---------- */
function setupSprinkles() {
  if (!document.querySelector(".logo")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var wrap = document.createElement("div");
  wrap.className = "sprinkles";
  wrap.setAttribute("aria-hidden", "true");
  var colors = ["#b16b5f", "#d4af37", "#f4a9b8", "#ffffff", "#9ad4d6"];
  for (var i = 0; i < 28; i++) {
    var s = document.createElement("span");
    s.className = "sprinkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.background = colors[i % colors.length];
    s.style.animationDuration = 8 + Math.random() * 10 + "s";
    s.style.animationDelay = -Math.random() * 15 + "s";
    s.style.transform = "rotate(" + Math.floor(Math.random() * 180) + "deg)";
    wrap.appendChild(s);
  }
  document.body.appendChild(wrap);
}

/* ---------- Typewriter tagline (home page) ---------- */
function setupTypewriter() {
  var target = document.querySelector("main h3 i");
  if (!target) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var text = target.textContent;
  var i = 0;
  target.textContent = "";
  target.classList.add("typing");
  var timer = setInterval(function () {
    target.textContent = text.slice(0, ++i);
    if (i >= text.length) {
      clearInterval(timer);
      target.classList.remove("typing");
    }
  }, 35);
}

/* ---------- Gallery lightbox ---------- */
function setupLightbox() {
  var links = Array.prototype.slice.call(document.querySelectorAll(".Gallery a"));
  if (links.length === 0) return;
  var index = 0;

  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.hidden = true;
  overlay.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
    '<button type="button" class="lb-prev" aria-label="Previous">&#10094;</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-next" aria-label="Next">&#10095;</button>';
  document.body.appendChild(overlay);
  var img = overlay.querySelector("img");
  var caption = overlay.querySelector("figcaption");

  function show(i) {
    index = (i + links.length) % links.length;
    var link = links[index];
    img.src = link.getAttribute("href");
    img.alt = link.querySelector("img").alt;
    caption.textContent = link.parentElement.querySelector(".description").textContent;
    overlay.hidden = false;
    document.body.classList.add("no-scroll");
  }
  function close() {
    overlay.hidden = true;
    document.body.classList.remove("no-scroll");
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      show(i);
    });
  });
  overlay.querySelector(".lb-close").addEventListener("click", close);
  overlay.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
  overlay.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

/* ---------- Textarea character counters ---------- */
function setupCharCounters() {
  document.querySelectorAll("form textarea").forEach(function (ta) {
    var max = 300;
    ta.maxLength = max;
    var counter = document.createElement("small");
    counter.className = "char-counter";
    counter.textContent = "0 / " + max;
    ta.insertAdjacentElement("afterend", counter);
    ta.addEventListener("input", function () {
      counter.textContent = ta.value.length + " / " + max;
    });
    if (ta.form) {
      ta.form.addEventListener("reset", function () { counter.textContent = "0 / " + max; });
    }
  });
}

/* ---------- Confetti celebration on form success ---------- */
function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var colors = ["#b16b5f", "#d4af37", "#f4a9b8", "#ffffff", "#9ad4d6"];
  var holder = document.createElement("div");
  holder.className = "confetti";
  holder.setAttribute("aria-hidden", "true");
  for (var i = 0; i < 60; i++) {
    var p = document.createElement("span");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.6 + "s";
    p.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    holder.appendChild(p);
  }
  document.body.appendChild(holder);
  setTimeout(function () { holder.remove(); }, 4500);
}


/* ===================================================
   Part 3 additions
   =================================================== */

/* ---------- Settings you can edit ---------- */
var BAKERY_EMAIL = "CakeKingBakery@gmail.com";
var BAKERY_ADDRESS = "28217 Modiwane Street, Joburg South, Gauteng";
var BAKERY_LOCATION = { lat: -26.2708, lng: 28.0300 }; // change to the exact bakery coordinates
var SIZE_PRICE = { Small: 250, Medium: 450, Large: 750 };   // rand
var OCCASION_EXTRA = { "Wedding": 500, "Baby shower": 150, "Birthday": 0, "Graduations": 100, "Anniversaries": 100, "Other": 0 };
var CUPCAKE_PRICE = 15; // per cupcake, rand

var PRODUCTS = [
  { name: "Children's Birthday Cake", category: "cakes", price: SIZE_PRICE.Medium, desc: "A fun themed cake for children's birthdays, soft, fluffy and moist." },
  { name: "Adult Birthday Cake", category: "cakes", price: SIZE_PRICE.Medium, desc: "An elegant birthday cake made to suit your taste." },
  { name: "Wedding Cake", category: "cakes", price: SIZE_PRICE.Large + OCCASION_EXTRA.Wedding, desc: "A show-stopping tiered cake for your big day." },
  { name: "Custom Theme Cake", category: "cakes", price: SIZE_PRICE.Medium + 150, desc: "Tell us your theme and we will design a cake around it." },
  { name: "Individual Cupcake", category: "cupcakes", price: CUPCAKE_PRICE, desc: "A single cupcake in your choice of flavour and decoration." },
  { name: "Cupcake Box (6)", category: "cupcakes", price: CUPCAKE_PRICE * 6, desc: "A box of six cupcakes in different flavours and decorations." },
  { name: "Baby Shower Cake", category: "celebration", price: SIZE_PRICE.Medium + OCCASION_EXTRA["Baby shower"], desc: "A sweet cake to welcome the new arrival." },
  { name: "Graduation Cake", category: "celebration", price: SIZE_PRICE.Medium + OCCASION_EXTRA.Graduations, desc: "Celebrate all the hard work with a special cake." },
  { name: "Anniversary Cake", category: "celebration", price: SIZE_PRICE.Medium + OCCASION_EXTRA.Anniversaries, desc: "A romantic cake to mark your special years together." }
];

/* ---------- Dynamic menu (built from the PRODUCTS array) ---------- */
function renderProducts(query, category, sortMode) {
  var list = document.getElementById("productList");
  if (!list) return 0;

  var items = PRODUCTS.filter(function (p) {
    var matchesCategory = category === "all" || p.category === category;
    var text = (p.name + " " + p.desc + " " + p.category).toLowerCase();
    return matchesCategory && (query === "" || text.indexOf(query) !== -1);
  });

  if (sortMode === "az") items.sort(function (a, b) { return a.name.localeCompare(b.name); });
  if (sortMode === "za") items.sort(function (a, b) { return b.name.localeCompare(a.name); });
  if (sortMode === "low") items.sort(function (a, b) { return a.price - b.price; });
  if (sortMode === "high") items.sort(function (a, b) { return b.price - a.price; });

  list.innerHTML = "";
  items.forEach(function (p, i) {
    var item = document.createElement("article");
    item.className = "product-item";
    item.style.animationDelay = i * 60 + "ms";

    var title = document.createElement("h3");
    title.textContent = p.name;
    var desc = document.createElement("p");
    desc.textContent = p.desc;
    var price = document.createElement("span");
    price.className = "product-price";
    price.textContent = "From R" + p.price;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.textContent = "View details";
    btn.addEventListener("click", function () { openProductModal(p); });

    item.appendChild(title);
    item.appendChild(desc);
    item.appendChild(price);
    item.appendChild(btn);
    list.appendChild(item);
  });
  return items.length;
}

/* ---------- Modal (product details) ---------- */
function openProductModal(product) {
  var overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">' +
    '<button type="button" class="modal-close" aria-label="Close">&times;</button>' +
    '<h2 id="modalTitle"></h2><p class="modal-desc"></p><p class="modal-price"></p>' +
    '<a class="card-btn" href="enquiry.html">Enquire about this</a></div>';
  overlay.querySelector("#modalTitle").textContent = product.name;
  overlay.querySelector(".modal-desc").textContent = product.desc;
  overlay.querySelector(".modal-price").textContent = "From R" + product.price + " (estimate)";
  document.body.appendChild(overlay);
  document.body.classList.add("no-scroll");

  function close() {
    overlay.remove();
    document.body.classList.remove("no-scroll");
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) { if (e.key === "Escape") close(); }
  overlay.querySelector(".modal-close").addEventListener("click", close);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  document.addEventListener("keydown", onKey);
  overlay.querySelector(".modal-close").focus();
}

/* ---------- Accordion (FAQ) ---------- */
function setupAccordion() {
  var headers = document.querySelectorAll(".accordion-header");
  headers.forEach(function (header) {
    header.addEventListener("click", function () {
      var panel = header.nextElementSibling;
      var opening = header.getAttribute("aria-expanded") !== "true";

      // close the others so only one is open at a time
      headers.forEach(function (h) {
        h.setAttribute("aria-expanded", "false");
        h.parentElement.classList.remove("open");
        h.nextElementSibling.style.maxHeight = null;
      });

      if (opening) {
        header.setAttribute("aria-expanded", "true");
        header.parentElement.classList.add("open");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
}

/* ---------- Interactive map (Leaflet + OpenStreetMap) ---------- */
function setupMap() {
  var mapEl = document.getElementById("map");
  if (!mapEl) return;

  if (typeof L === "undefined") {
    mapEl.innerHTML = '<p class="map-fallback">The map could not load. Please check your internet connection. Find us at: ' +
      BAKERY_ADDRESS + '</p>';
    return;
  }

  var map = L.map("map").setView([BAKERY_LOCATION.lat, BAKERY_LOCATION.lng], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  var bakery = L.marker([BAKERY_LOCATION.lat, BAKERY_LOCATION.lng]).addTo(map);
  bakery.bindPopup("<b>Cake King Bakery</b><br>" + BAKERY_ADDRESS).openPopup();

  // Location feature: show the visitor's distance to the bakery
  var locateBtn = document.getElementById("locateBtn");
  var result = document.getElementById("distanceResult");
  locateBtn.addEventListener("click", function () {
    if (!navigator.geolocation) {
      result.textContent = "Your browser does not support location.";
      return;
    }
    result.textContent = "Finding your location...";
    navigator.geolocation.getCurrentPosition(function (pos) {
      var you = L.latLng(pos.coords.latitude, pos.coords.longitude);
      var km = (you.distanceTo(bakery.getLatLng()) / 1000).toFixed(1);
      L.marker(you).addTo(map).bindPopup("You are here").openPopup();
      L.polyline([you, bakery.getLatLng()], { color: "#b16b5f", dashArray: "8" }).addTo(map);
      map.fitBounds([you, bakery.getLatLng()], { padding: [40, 40] });
      result.textContent = "You are about " + km + " km from Cake King Bakery.";
    }, function () {
      result.textContent = "We could not get your location. Please allow location access and try again.";
    });
  });
}

/* ---------- Enquiry: cost + availability response ---------- */
function calculateEstimate(f) {
  var isCupcakes = /cupcake/i.test(f.cakeType.value);
  var people = parseInt(f.people.value, 10);
  var size = f.cakeSize.value;
  var occasion = f.occasion.value;
  var cost, lines = [], leadDays;

  if (isCupcakes) {
    cost = people * CUPCAKE_PRICE;
    lines.push(people + " cupcakes x R" + CUPCAKE_PRICE + " = R" + cost);
    leadDays = 2;
  } else {
    var extra = OCCASION_EXTRA[occasion] || 0;
    cost = SIZE_PRICE[size] + extra;
    lines.push(size + " cake: R" + SIZE_PRICE[size]);
    if (extra > 0) lines.push(occasion + " extras: R" + extra);
    leadDays = 3;
    if (size === "Large") leadDays = 7;
    if (occasion === "Wedding") leadDays = 14;
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var wanted = new Date(f.prefDate.value + "T00:00:00");
  var daysAway = Math.round((wanted - today) / 86400000);
  var earliest = new Date(today.getTime() + leadDays * 86400000);

  return {
    cost: cost,
    lines: lines,
    leadDays: leadDays,
    daysAway: daysAway,
    available: daysAway >= leadDays,
    earliest: earliest.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })
  };
}

function showEnquiryResponse(form, name, r) {
  var box = showSuccess(form, "Thank you, " + name + "! Here is your enquiry response:");
  box.classList.add("enquiry-response");

  var list = document.createElement("ul");
  r.lines.forEach(function (text) {
    var li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
  var total = document.createElement("li");
  total.className = "estimate-total";
  total.textContent = "Estimated cost: R" + r.cost;
  list.appendChild(total);
  box.appendChild(list);

  var avail = document.createElement("p");
  avail.className = r.available ? "avail-yes" : "avail-no";
  avail.textContent = r.available
    ? "Good news! Your date is available (we need " + r.leadDays + " days notice and you are " + r.daysAway + " days ahead)."
    : "We need at least " + r.leadDays + " days notice for this order. The earliest available date is " + r.earliest + ".";
  box.appendChild(avail);

  var note = document.createElement("p");
  note.className = "ajax-status";
  note.textContent = "Sending your enquiry to the bakery...";
  box.appendChild(note);

  var disclaimer = document.createElement("small");
  disclaimer.textContent = "This is an estimate only. The bakery will confirm the final price.";
  box.appendChild(disclaimer);
  return box;
}

/* ---------- AJAX submission (fetch, no page reload) ---------- */
function sendFormAjax(url, data, box) {
  var status = box.querySelector(".ajax-status");
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data)
  }).then(function (res) {
    if (!res.ok) throw new Error("Request failed");
    status.textContent = "Your enquiry was also sent to the bakery. We will contact you soon.";
  }).catch(function () {
    status.textContent = "We could not send your enquiry online right now. Please email " + BAKERY_EMAIL + " or try again later.";
  });
}
