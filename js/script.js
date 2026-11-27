/* ============================================================
   TALANTA SPORTS CITY — APPLICATION ENGINE
   Reusable page templates, navigation, homepage features,
   and the interactive stadium ticketing system.
   ============================================================ */
"use strict";

/* ============================================================
   01. APPLICATION CONFIGURATION
   ============================================================ */
var APP_CONFIG = {
  apiBaseUrl: "",
  homeRoute: "home",
  ticketRoute: "tickets",
  ticketHash: "#tickets-view",
  homeHash: "#home",
  slideDuration: 7000,
};

/* ============================================================
   02. APPLICATION STATE
   ============================================================ */
var app = document.getElementById("app");
var state = {
  route: "home",
};
var slideTimer = null;
var globalEventsBound = false;
var lastHandledLocationHash = location.hash;

/* ============================================================
   THEME PREFERENCE — LIGHT / DARK
   ============================================================ */
function getSavedTheme() {
  try {
    var savedTheme = localStorage.getItem("talanta-theme-v2");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch (error) {
    // Keep the dark default when storage is unavailable.
  }
  return "dark";
}

function updateThemeToggle() {
  var themeButton = document.getElementById("themeToggle");
  if (!themeButton) return;

  var isDark = document.documentElement.getAttribute("data-theme") === "dark";
  themeButton.textContent = isDark ? "☀" : "☾";
  themeButton.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
  themeButton.setAttribute(
    "title",
    isDark ? "Switch to light theme" : "Switch to dark theme",
  );
  themeButton.setAttribute("aria-pressed", String(isDark));
}

function applyTheme(theme) {
  var selectedTheme = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", selectedTheme);
  document.documentElement.setAttribute("data-theme", selectedTheme);

  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute(
      "content",
      selectedTheme === "dark" ? "#080b10" : "#f4f5f1",
    );
  }

  try {
    localStorage.setItem("talanta-theme-v2", selectedTheme);
  } catch (error) {
    // Theme still works for the current page when storage is unavailable.
  }

  updateThemeToggle();
}

function initializeTheme() {
  applyTheme(getSavedTheme());
}

/* ============================================================
   03. HTML TEMPLATES — REUSABLE COMPONENTS
   ============================================================ */

function renderEmblem(className) {
  var safeClass = String(className || "stadium-emblem").replace(
    /[^a-zA-Z0-9_-]/g,
    "",
  );
  var emblem =
    "" +
    '<svg aria-hidden="true" class="' +
    safeClass +
    '" data-testid="stadium-mark" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 319.5 111" preserveAspectRatio="xMidYMid meet">' +
    '        <path d="M136.5,17s-8.7,9.1-12.2,16.9c0,0,6.2,13.2.3,30.2,0,0,6.3,11.4,12.3,18.5,0,0,6.9-10,12-19.3,0,0-8.2-12.1-.6-31.6,0,0-4.8-9.5-11.8-14.6Z" fill="#be0000">\'' +
    "        </path>'" +
    '        <path d="M246.7,25.8s-1.7,5.9-4.2,13.4c0,0,8,13-1.2,26.6l5.5,16.5s5.8-7.9,10.5-18.8c0,0-1.5-5,0-18.4,0,0-1.7-12.5-10.6-19.3Z" fill="#be0000">\'' +
    "        </path>'" +
    '        <path d="M47,40c-1.1,2.7-3.6,8.9-4.5,12.1,0,0,1.6,11.4.1,16.4,0,0,1.5,9.8,6.7,15.3l.2-13.5s-3.6-2-3.1-11.5,2.6-10.9,2.6-10.9c0,0-.8-5.1-1.2-7.7s-.6-.5-.7,0Z" fill="#be0000">\'' +
    "        </path>'" +
    '        <ellipse cx="136.5" cy="47.6" fill="#fff" rx="3.6" ry="2.5" transform="translate(87.6 183.7) rotate(-89.5)">\'' +
    "        </ellipse>'" +
    '        <path d="M137.9,20.1l-.8,22.2s2.8-4.6,3.4-11.4-1.2-9.4-2.6-10.8Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M136.4,20l-.8,22.3s-2.8-6.3-2.5-11.4,1.1-8.8,3.3-11Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M137.3,53.1l.3,24s2.3-4.2,2.7-12.7-3-11.3-3-11.3Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M135.2,52.9l.7,24.2s-3.8-7.4-3.4-15.4,2.7-8.8,2.7-8.8Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M251.4,49.3s-1.7,0-1.9,2.3,1.1,4.8,2.4,4.5,2.3-5.8-.6-6.9Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M252,57.4c-.3,2.5-1.6,14.2-3.5,19.4,0,.2.2.2.3.1,1-1.6,2.9-5,3.9-9.8s0-8.6-.4-9.7-.3,0-.3,0Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M250.7,56.5s-1.3,14.8-3.8,20.8c0,0-1.5-9.4,3.8-20.8Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M249,29.5c1.5,2.7,5,10.3,2.9,19.1,0,0-1.5-14.1-3-19s.1-.2.2,0Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M247.1,29.1c.6,2.3,2.8,12,3.1,19.2,0,0-4.5-11-3.3-19.2s.2-.1.2,0Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M47.2,41.5s-1.5,10.4-2.4,15.4c0,0-2.5-4.5,2.4-15.4Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M44.7,64.5c-.3-1.9,1.6,4.2,3.3,15.3.3,2.1-3.5-2.1-3.3-15.3Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M44.5,58.1s-.6,1.8-.5,2.7.2,1.1.3,1.8.5.3.6,0c.1-.6.3-1.4.2-2.3,0-1.8,0-2.9-.6-2.2Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M62.1,56.6c-.3-1.2-2.4-10.6-2.3-18.3-2.2,5.4-7,17.4-7.3,21.8-.3,4.5,5.7,16.3,8.2,21-.3-4.9-.8-16.6,1.4-24.5Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M72.9,28.8l-10.8,4.3c0,1.7-.4,10.7,1.5,19.1,1.2-4.4,4.7-16,9.2-23.5Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M74.2,32c-2.2,4.6-8.3,18.3-9,25.1.4,1.2,4.4,13.7,10.3,22.5.2-3.9,1-15.3,4.7-26.6-.6-1.4-5-11.4-6-21.1Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M76.9,27.3c0,1.9-.3,11.9,4.4,21.8,1.5-3.9,6.9-17.6,13.8-26.4-2.6.5-8.9,1.9-18.2,4.7Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M59.1,34.2l-8.9,4.4c0,1.2-.4,6.5,1.3,14.9,1.1-3.3,3.6-10.9,7.6-19.3Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M59.7,84.6c-4.9-8.5-7.2-14.8-8.2-18.1-.5,7.3-.2,16.1,0,18.2h8.2Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M63.4,84.5h11.4c-1.6-2.7-7.3-12.1-10.6-21.8-.6,3.9-1.9,13.2-.8,21.8Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M98,84.2c-2.1-3.2-10.6-16.4-16.3-28-.4,1.8-1.1,5.2-1.7,9.2-.8,5.3-1.7,12.9-1.2,18.9l19.2-.2Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M97.6,23.4c-2.9,3.8-8.9,13.8-14.3,28.9.6,2.8,4.8,11.9,16.2,26.9.9-3.2,4.6-14.4,12.9-28.9-1.5-2.3-11.9-18.9-14.9-26.8Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M100,21.9c.6,1.7,3.2,8.2,14.2,25.1,1.1-3,5.2-12.7,17.8-29.1-4.6.4-22.8,2-32,3.9Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M101.5,84.2c1.6,0,4.8-.1,9.6-.2,8.7,0,20.1,0,23.7,0-3.3-3.5-7.7-9.6-13-18.3-3.4-5.6-6.3-10.6-7.3-12.5-6.4,10.5-11.9,27.5-13,31Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M178.3,17.8c-3.7-.2-19.6-.8-29.8-.7s-4.8,0-6.3.2c.9,1.1,2.7,3.4,5.1,7.1,3,4.6,7.4,12.2,11.8,22.5,2.5-3.5,13.6-19.6,19.2-29.1Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M196.9,42.4c-2.8-4.8-7.9-12.8-16.1-23.3-2.6,4.1-17.2,27.2-19.4,30.4l20.2,31.7c2.4-3.3,14.2-20.3,19.6-30.9-.3-.7-1.5-3.4-4.2-7.9Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M215.1,21.8c-3.4-.5-21.6-3.4-31-3.7,2.9,3.9,15.5,21,19.2,30.3,1.9-3.6,8.7-16.8,11.8-26.6Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M215,83.1c-.7-2.9-4.4-16.1-12-29.5-1.9,3.4-9.8,17.5-20.3,29.8l32.3-.3Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M217.2,22.7c-.9,3.3-4.3,15-12,28,.5,1,2.6,5.2,5,10.4,2.4,5.3,5.5,12.9,7.2,19.3,2.1-3.4,9.4-15.2,16.3-27.7-1-2.2-9.4-21-16.4-30.1Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M179,83.5l-19.9-31c-6.3,12-17.1,27.8-19.6,31.4l39.5-.4Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M244.8,26.4c-2.2-.5-12.6-2.6-24.9-4,2.3,2.4,7.9,9.5,15.7,27.7,1.8-4.2,8.3-19.9,9.2-23.7Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M219.4,83.1l24.9-.2c-1-3.2-5.4-18-9.1-27.4-1.7,3.6-7.7,16.2-15.9,27.6Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M267,31.6c-.5,4.3-2.5,18.6-4.5,23.3.7,1.6,5.5,12.8,6.2,25.8,2.3-4.3,8.5-16.4,10.4-22.1-.2-1.2-2-13.2-12-26.9Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M282.8,58.3c.3,1.3,2.6,12.2,2.1,20.9,1.7-4.4,4.6-12.5,4.7-17.8.1-7.1-2.5-18.3-6.4-24.1.5,3.9,1.4,13.4-.5,21.1Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M270.3,82.6h12.5c.1-1.8.5-8.7-2.1-20.5-1.6,3.9-6.4,14.7-10.4,20.5Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M280.9,35.2l-11.2-3.9c1.1,1.5,3,4.2,5,7.5,3.2,5.4,5.4,10.1,6.4,14,.5-4.2,1.1-12.1-.2-17.6Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M266.4,82.7c-1-7.9-4.2-19.1-5.5-23.6-.8,3.8-3,8.7-6.4,14.8-2.3,4.1-4.6,7.5-5.6,9l17.6-.2Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M261,50.5c2-7.1,2.9-18.3,3.1-20.6l-13.5-2.7c3.1,2.9,5.8,7.7,8,14.3,1.2,3.6,2,7,2.4,8.9Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M36.2,56.9c-.6,3.2-1,6.7-1,9.7.1,5.1,1.4,10.4,2.4,13.9l-1.3-13.1c0,0-.5-4.7-.2-10.6Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M45.1,41.6l-4.7,3.3s-2,9.3-1.4,16.3c1.4-8.6,6-19.6,6-19.6Z" fill="#fff">\'' +
    "        </path>'" +
    '        <path d="M40.7,84.8h6.6c-2.1-3.7-5.9-13.8-7.5-18.1-.7,7.8.6,16.2.9,18.1Z" fill="#fff">\'' +
    "        </path>'" +
    '        <polygon fill="#fff" points="14.7 88.6 305.3 88.6 300.8 85.6 21.5 87.6 14.7 88.6">\'' +
    "        </polygon>'" +
    "</svg>";
  return emblem.replace(/'/g, "");
}

function renderHeader() {
  return (
    "" +
    '<header class="header" id="home">' +
    '  <div class="container nav-container">' +
    '    <a class="logo" href="#home" aria-label="Talanta Sports City home">' +
    renderEmblem("header-emblem") +
    "    </a>" +
    '    <nav class="navigation" id="navigation">' +
    '      <a href="#home">' +
    "        Home" +
    "      </a>" +
    '      <a href="#stadium">' +
    "        The Stadium" +
    "      </a>" +
    '      <a href="#events">' +
    "        Events" +
    "      </a>" +
    '      <a href="#hospitality">' +
    "        Hospitality" +
    "      </a>" +
    '      <a href="#gallery">' +
    "        Gallery" +
    "      </a>" +
    '      <a href="#location">' +
    "        Visit Us" +
    "      </a>" +
    "    </nav>" +
    '    <a class="nav-button" data-route="tickets" href="#tickets-view">' +
    "      Buy Tickets" +
    "    </a>" +
    '    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark theme" title="Switch to dark theme" aria-pressed="false">☾</button>' +
    '    <button aria-label="Toggle navigation" class="menu-toggle" id="menuToggle">' +
    "       ☰" +
    "    </button>" +
    "  </div>" +
    "</header>"
  );
}

function renderTicketHeader() {
  return (
    "" +
    '<header class="header" id="home">' +
    '  <div class="container nav-container">' +
    '    <a class="logo" data-route="home" href="#home" aria-label="Talanta Sports City home">' +
    renderEmblem("header-emblem") +
    "    </a>" +
    '    <nav class="navigation" id="navigation">' +
    '      <a data-route="home" data-section="home" href="#home">' +
    "        Home" +
    "      </a>" +
    '      <a data-route="home" data-section="stadium" href="#stadium">' +
    "        The Stadium" +
    "      </a>" +
    '      <a data-route="home" data-section="events" href="#events">' +
    "        Events" +
    "      </a>" +
    '      <a data-route="home" data-section="hospitality" href="#hospitality">' +
    "        Hospitality" +
    "      </a>" +
    '      <a data-route="home" data-section="gallery" href="#gallery">' +
    "        Gallery" +
    "      </a>" +
    '      <a data-route="home" data-section="location" href="#location">' +
    "        Visit Us" +
    "      </a>" +
    "    </nav>" +
    '    <a class="nav-button" data-route="tickets" href="#tickets-view">' +
    "      Buy Tickets" +
    "    </a>" +
    '    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark theme" title="Switch to dark theme" aria-pressed="false">☾</button>' +
    '    <button aria-label="Toggle navigation" class="menu-toggle" id="menuToggle">' +
    "       ☰" +
    "    </button>" +
    "  </div>" +
    "</header>"
  );
}

function renderHero() {
  return (
    "" +
    '<section class="hero">' +
    '  <img alt="Footballer shooting a ball" class="hero-player" src="assets/images/ashoot.png"/>' +
    '  <div class="hero-overlay">' +
    "  </div>" +
    '  <div class="container hero-content">' +
    '    <span class="eyebrow">' +
    "      WELCOME TO TALANTA SPORTS CITY" +
    "    </span>" +
    "    <h1>" +
    "      WHERE KENYA" +
    "      <br/>" +
    "      MEETS THE WORLD." +
    "    </h1>" +
    "    <p>" +
    "       Experience the passion of sport, entertainment" +
    "       and unforgettable moments at Kenya's premier" +
    "       sporting destination." +
    "    </p>" +
    '    <div class="hero-buttons">' +
    '      <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    "        Explore Tickets" +
    "      </a>" +
    '      <a class="btn btn-outline" href="#stadium">' +
    "        Discover Stadium" +
    "      </a>" +
    "    </div>" +
    "  </div>" +
    '  <div class="hero-bottom">' +
    "    <span>" +
    "      RAILA ODINGA INTERNATIONAL STADIUM" +
    "    </span>" +
    "    <span>" +
    "      NAIROBI · KENYA" +
    "    </span>" +
    "  </div>" +
    "</section>"
  );
}

function renderFeaturedEvent() {
  return (
    "" +
    '<section class="featured-event" id="events">' +
    '  <div class="container event-container">' +
    "    <div>" +
    '      <span class="eyebrow">' +
    "        UPCOMING FEATURED EVENT" +
    "      </span>" +
    "      <h2>" +
    "        Bayern Munich " +
    "        <span>" +
    "          VS" +
    "        </span>" +
    "         Ajax" +
    "      </h2>" +
    "      <p>" +
    "        Tuesday, 5 January 2027 · Nairobi, Kenya" +
    "      </p>" +
    "    </div>" +
    '    <div class="badges">' +
    '      <span class="bayern">' +
    '        <img alt="Bayern Munich" src="assets/images/bayern.png"/>' +
    "      </span>" +
    '      <div class="vs">' +
    "        VS" +
    "      </div>" +
    '      <span class="ajax">' +
    '        <img alt="Ajax" src="assets/images/ajax.png"/>' +
    "      </span>" +
    "    </div>" +
    '    <div class="event-action">' +
    "      <span>" +
    "        Tickets from " +
    "        <strong>" +
    "          KSh 2,500" +
    "        </strong>" +
    "      </span>" +
    '      <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    "        Buy Tickets →" +
    "      </a>" +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function renderStadium() {
  return (
    "" +
    '<section class="stadium section-padding" id="stadium">' +
    '  <div class="container stadium-grid">' +
    '    <div class="stadium-info">' +
    '      <span class="eyebrow">' +
    "        THE STADIUM" +
    "      </span>" +
    "      <h2>" +
    "        RAILA ODINGA" +
    "        <br/>" +
    "        International Stadium" +
    "      </h2>" +
    "      <p>" +
    "         Welcome to a 60,000-seat destination built for the" +
    "         passion of sports and the energy of live entertainment." +
    "         This is where Kenya's sporting ambition meets the world." +
    "      </p>" +
    '      <div class="stats">' +
    "        <div>" +
    "          <strong>" +
    "            60,000" +
    "          </strong>" +
    "          <span>" +
    "            Seats" +
    "          </span>" +
    "        </div>" +
    "        <div>" +
    "          <strong>" +
    "            NAIROBI" +
    "          </strong>" +
    "          <span>" +
    "            Kenya" +
    "          </span>" +
    "        </div>" +
    "        <div>" +
    "          <strong>" +
    "            2027" +
    "          </strong>" +
    "          <span>" +
    "            AFCON Co-host" +
    "          </span>" +
    "        </div>" +
    "      </div>" +
    '      <a class="text-link" href="#location">' +
    "        Discover the Stadium →" +
    "      </a>" +
    "    </div>" +
    '    <div class="stadium-image">' +
    '      <img alt="Raila Odinga International Stadium" src="assets/images/stadium.jpg"/>' +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function renderHospitality() {
  return (
    "" +
    '<section class="hospitality section-padding" id="hospitality">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    "        EXCLUSIVE EXPERIENCES" +
    "      </span>" +
    "      <h2>" +
    "        Hospitality" +
    "      </h2>" +
    "      <p>" +
    "        Experience match day with premium comfort and exclusive access." +
    "      </p>" +
    "    </div>" +
    '    <div class="hospitality-grid">' +
    "      <!-- GOLD EXPERIENCE -->" +
    '      <article class="hospitality-card gold-card">' +
    '        <div class="tier-badge">' +
    "          PREMIUM" +
    "        </div>" +
    '        <span aria-label="Coming soon" class="coming-soon-ribbon">' +
    '          <span class="coming-soon-shine">' +
    "          </span>" +
    "        </span>" +
    '        <img alt="Gold luxury stadium hospitality suite" src="assets/images/talanta-15.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    "            ♛   SECTIONS F01–F05" +
    "          </span>" +
    "          <h2>" +
    "            GOLD" +
    "          </h2>" +
    "          <p>" +
    "            Elevated match-day hospitality and exclusive suite access." +
    "          </p>" +
    '<button type="button" class="hospitality-discover" data-hospitality-tier="gold">Discover Gold →</button>' +
    "        </div>" +
    "      </article>" +


    "      <!-- PLATINUM EXPERIENCE -->" +
    '      <article class="hospitality-card platinum-card">' +
    '        <div class="tier-badge">' +
    "          ELITE" +
    "        </div>" +
    '        <span aria-label="Coming soon" class="coming-soon-ribbon">' +
    '          <span class="coming-soon-shine">' +
    "          </span>" +
    "        </span>" +
    '        <img alt="Platinum premium stadium lounge" src="assets/images/talanta-16.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    "            ◇   LEVEL 2 · MAIN STAND" +
    "          </span>" +
    "          <h2>" +
    "            PLATINUM" +
    "          </h2>" +
    "          <p>" +
    "            Premium match-day hospitality and exclusive lounge access." +
    "          </p>" +
    '<button type="button" class="hospitality-discover" data-hospitality-tier="platinum">Discover Platinum →</button>' +
    "        </div>" +
    "      </article>" +


    "      <!-- SKYBOX EXPERIENCE -->" +
    '      <article class="hospitality-card skybox-card">' +
    '        <div class="tier-badge">' +
    "          VIP" +
    "        </div>" +
    '        <span aria-label="Coming soon" class="coming-soon-ribbon">' +
    '          <span class="coming-soon-shine">' +
    "          </span>" +
    "        </span>" +
    '        <img alt="Private Skybox stadium suite" src="assets/images/skybox.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    "            ♧   LEVEL 2 · PRIVATE BOXES" +
    "          </span>" +
    "          <h2>" +
    "            SKYBOX" +
    "          </h2>" +
    "          <p>" +
    "            Your own private box with an unforgettable stadium view." +
    "          </p>" +
    '<button type="button" class="hospitality-discover" data-hospitality-tier="skybox">Discover Skybox →</button>' +
    "        </div>" +
    "      </article>" +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function showHospitalityDetails(tier) {
  const packages = {
    gold: {
      name: "GOLD HOSPITALITY",
      price: TICKET_CONFIG.prices.gold,
      active: true,
      description:
        "Experience Talanta Sports City with premium matchday hospitality. Enjoy an elevated stadium experience with exclusive access and premium comfort.",
      benefits: [
        "Sections F01–F05 access",
        "Premium hospitality seating",
        "Exclusive suite access",
        "Priority stadium entry",
        "Dedicated hospitality service",
      ],
      image: "assets/images/talanta-15.jpg",
    },
    platinum: {
      name: "PLATINUM HOSPITALITY",
      price: TICKET_CONFIG.prices.platinum,
      active: true,
      description:
        "Discover elevated VIP hospitality designed for guests seeking exceptional comfort, premium surroundings and an exclusive matchday atmosphere.",
      benefits: [
        "Level 2 Main Stand access",
        "Premium lounge experience",
        "Exclusive hospitality seating",
        "Enhanced dining experience",
        "Priority VIP check-in",
      ],
      image: "assets/images/talanta-16.jpg",
    },
    skybox: {
      name: "SKYBOX EXPERIENCE",
      price: TICKET_CONFIG.prices.skybox,
      active: true,
      description:
        "Enjoy the ultimate private stadium experience from an exclusive Skybox with exceptional views and a refined private setting.",
      benefits: [
        "Level 2 private box access",
        "Private hospitality environment",
        "Panoramic stadium views",
        "Premium catering experience",
        "Dedicated hospitality service",
      ],
      image: "assets/images/skybox.jpg",
    },
  };

  const pkg = packages[tier];
  if (!pkg) return;
  document.getElementById("hospitality-details-modal")?.remove();

  const modal = document.createElement("div");
  modal.id = "hospitality-details-modal";

  modal.innerHTML = `
    <div class="hospitality-modal-overlay">
      <div class="hospitality-modal">
        <button class="hospitality-modal-close"
          onclick="document.getElementById('hospitality-details-modal').remove()">
          &times;
        </button>

        <img class="hospitality-modal-image"
          src="${pkg.image}" alt="${pkg.name}">

        <div class="hospitality-modal-content">
          <span class="eyebrow">EXCLUSIVE EXPERIENCE</span>
          <h2>${pkg.name}</h2>
          <p class="hospitality-modal-description">
            ${pkg.description}
          </p>

          <h3>WHAT YOU GET</h3>
          <ul>
            ${pkg.benefits
              .map((item) => `<li><span>✓</span> ${item}</li>`)
              .join("")}
          </ul>

          <div class="hospitality-modal-price">
            KSh ${pkg.price.toLocaleString("en-KE")}
          </div>

          <button
  type="button"
  class="hospitality-modal-purchase"
  data-hospitality-purchase="${tier}"
>
  PAY NOW — KSh ${pkg.price.toLocaleString("en-KE")}
  →
</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target.classList.contains("hospitality-modal-overlay")) {
      modal.remove();
    }
  });
}

window.showHospitalityDetails = showHospitalityDetails;

function openHospitalityDetails(tier) {
  const packages = {
    gold: {
      name: "GOLD HOSPITALITY",
      price: TICKET_CONFIG.prices.gold,
      active: true,
      image: "assets/images/talanta-15.jpg",
      description:
        "Experience match day with elevated comfort, premium hospitality and exclusive suite access.",
      benefits: [
        "Premium hospitality seating",
        "Exclusive suite access",
        "Priority entry",
        "Dedicated hospitality experience",
      ],
    },
    platinum: {
      name: "PLATINUM HOSPITALITY",
      price: TICKET_CONFIG.prices.platinum,
      active: true,
      image: "assets/images/talanta-16.jpg",
      description:
        "Enjoy an elevated VIP matchday experience with exclusive hospitality and premium comfort.",
      benefits: [
        "Exclusive Platinum lounge access",
        "Premium seating",
        "Enhanced dining experience",
        "Priority VIP check-in",
      ],
    },
    skybox: {
      name: "SKYBOX EXPERIENCE",
      price: TICKET_CONFIG.prices.skybox,
      active: true,
      image: "assets/images/skybox.jpg",
      description:
        "Enjoy the ultimate private hospitality experience with exceptional views of the action.",
      benefits: [
        "Private luxury suite",
        "Panoramic stadium views",
        "Premium catering",
        "Dedicated suite hospitality",
      ],
    },
  };

  const pkg = packages[tier];
  if (!pkg) return;
  if (!pkg.active) {
    alert(
      pkg.name + " is coming soon and is not currently available for purchase.",
    );
    return;
  }

  const existing = document.getElementById("hospitality-detail-view");
  if (existing) existing.remove();

  const page = document.createElement("div");
  page.id = "hospitality-detail-view";

  page.innerHTML = `
    <div style="min-height:100vh;background:#080b12;color:white;padding:35px 6%;font-family:inherit;">
      <button onclick="document.getElementById('hospitality-detail-view').remove()"
        style="background:transparent;color:white;border:1px solid #777;padding:12px 20px;cursor:pointer;">
        ← BACK TO HOSPITALITY
      </button>

      <div style="max-width:1100px;margin:40px auto;">
        <img src="${pkg.image}" alt="${pkg.name}"
          style="width:100%;max-height:480px;object-fit:cover;border-radius:16px;">

        <p style="color:#c6a15a;letter-spacing:4px;margin-top:30px;">EXCLUSIVE EXPERIENCE</p>
        <h1 style="font-size:clamp(35px,6vw,65px);">${pkg.name}</h1>
        <h2 style="color:#d6b66e;">KSh ${pkg.price.toLocaleString("en-KE")}</h2>
        <p style="font-size:18px;line-height:1.8;max-width:750px;">${pkg.description}</p>

        <h2>YOUR EXPERIENCE INCLUDES</h2>
        <ul style="line-height:2.5;">
          ${pkg.benefits.map((item) => `<li>✓ ${item}</li>`).join("")}
        </ul>

        <button onclick="window.dispatchEvent(new CustomEvent('talanta:hospitality-purchase',{detail:{type:'HOSPITALITY',itemCode:'${tier.toUpperCase()}',name:'${tier.toUpperCase()}',unitPrice:${pkg.price},quantity:1}}))"
          style="background:#c6a15a;color:#080b12;border:0;padding:18px 35px;font-weight:bold;cursor:pointer;border-radius:6px;">
          PURCHASE ${tier.toUpperCase()} →
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(page);
}

function renderGallery() {
  return (
    "" +
    '<section class="gallery section-padding" id="gallery">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    "        EXPLORE TALANTA" +
    "      </span>" +
    "      <h2>" +
    "        Inside the Experience" +
    "      </h2>" +
    "    </div>" +
    '    <div class="gallery-grid">' +
    '      <img alt="Stadium exterior" src="assets/images/talanta-9.jpg"/>' +
    '      <img alt="Stadium interior" src="assets/images/talanta-22.jpg"/>' +
    '      <img alt="Stadium seating" src="assets/images/talanta-10.webp"/>' +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function renderTicketPromotion() {
  return (
    "" +
    '<section class="tickets section-padding" id="tickets">' +
    '  <div class="tickets-slideshow">' +
    '    <div class="tickets-slide active" style="background-image:url(\'assets/images/stadium.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-2.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-3.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/stadium-24.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-5.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-6.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-7.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-8.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-9.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-10.webp\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-11.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-12.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-13.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-14.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-15.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-16.jpg\')">' +
    "    </div>" +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-17.jpg\')">' +
    "    </div>" +
    "  </div>" +
    '  <div class="tickets-overlay">' +
    "  </div>" +
    '  <div class="container tickets-content">' +
    '    <span class="eyebrow">' +
    "      BE PART OF THE ACTION" +
    "    </span>" +
    "    <h2>" +
    "      Make Every Moment Count." +
    "    </h2>" +
    "    <p>" +
    "      Secure your place and experience the excitement of Talanta Sports City." +
    "    </p>" +
    '    <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    "      Explore Official Tickets →" +
    "    </a>" +
    "  </div>" +
    "</section>"
  );
}

function renderLocation() {
  return (
    "" +
    '<section class="location section-padding" id="location">' +
    '  <div class="container location-grid">' +
    "    <div>" +
    '      <span class="eyebrow">' +
    "        PLAN YOUR VISIT" +
    "      </span>" +
    "      <h2>" +
    "        Getting There" +
    "      </h2>" +
    "      <p>" +
    "        Raila Odinga International Stadium, Talanta Sports City, Ngong Road, Nairobi, Kenya." +
    "      </p>" +
    '      <a href="https://www.google.com/maps/search/?api=1&amp;query=Raila+Odinga+International+Stadium+Nairobi" rel="noopener" target="_blank">' +
    "        Get Directions →" +
    "      </a>" +
    "    </div>" +
    '    <div class="map-placeholder">' +
    '      <iframe allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Raila%20Odinga%20International%20Stadium%2C%20Nairobi&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="Map showing Raila Odinga International Stadium in Nairobi">' +
    "      </iframe>" +
    '      <a class="map-link" href="https://www.google.com/maps/search/?api=1&amp;query=Raila+Odinga+International+Stadium+Nairobi" rel="noopener" target="_blank">' +
    "        Open Google Maps ↗" +
    "      </a>" +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function renderFAQ() {
  return (
    "" +
    '<section class="faq section-padding" id="faq">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    "        NEED HELP?" +
    "      </span>" +
    "      <h2>" +
    "        Frequently Asked Questions" +
    "      </h2>" +
    "    </div>" +
    '    <div class="faq-list">' +
    "      <details>" +
    "        <summary>" +
    "          How do I get my tickets?" +
    "        </summary>" +
    "        <p>" +
    "          Tickets are delivered digitally (E-MAIL) after a successful purchase , An is sent to you with the Ticket Details." +
    "        </p>" +
    "      </details>" +
    "      <details>" +
    "        <summary>" +
    "          Where is Talanta Sports City located?" +
    "        </summary>" +
    "        <p>" +
    "          It is located along Ngong Road in Nairobi, Kenya." +
    "        </p>" +
    "      </details>" +
    "      <details>" +
    "        <summary>" +
    "          How can I pay for tickets?" +
    "        </summary>" +
    "        <p>" +
    "          Available payment methods are displayed on the official ticketing checkout." +
    "        </p>" +
    "      </details>" +
    "      <details>" +
    "        <summary>" +
    "          Can I book hospitality packages?" +
    "        </summary>" +
    "        <p>" +
    "          Yes. Gold, Platinum and Skybox hospitality options are available subject to event availability." +
    "        </p>" +
    "      </details>" +
    "    </div>" +
    "  </div>" +
    "</section>"
  );
}

function renderFooter() {
  return (
    "" +
    '<footer class="talanta-footer">' +
    '  <div class="footer-pattern">' +
    "  </div>" +
    '  <div class="footer-container">' +
    /* FOOTER BRAND */
    '    <div class="footer-brand">' +
    renderEmblem("footer-emblem") +
    "      <h2>" +
    "        TALANTA SPORTS CITY" +
    "      </h2>" +
    "    </div>" +
    /* FOOTER COLUMNS */
    '    <div class="footer-columns">' +
    '      <div class="footer-column">' +
    "        <h4>Buy</h4>" +
    '        <a href="#events">Match info</a>' +
    "      </div>" +
    '      <div class="footer-column">' +
    "        <h4>Help</h4>" +
    '        <a href="#stadium">About the Stadium</a>' +
    '<a data-route="tickets" href="#tickets-view">My tickets</a>' +
    '        <a href="#faq">Frequently Asked Questions</a>' +
    '        <a href="#faq">Help and contact</a>' +
    '        <a href="#location">Getting there</a>' +
    '        <a href="#tickets">Log in</a>' +
    "      </div>" +
    '      <div class="footer-column">' +
    "        <h4>Legal</h4>" +

    
    '<a href="#" data-policy="terms">Ticketing and Admission Terms</a>' +
    '<a href="#" data-policy="terms">Terms of Use</a>' +
    '<a href="#" data-policy="privacy">Privacy Policy</a>' +
   
    "      </div>" +
    '      <div class="footer-column">' +
    "        <h4>Contact</h4>" +
    '        <a href="mailto:info@talantasportscity.com">Contact us</a>' +
    '        <a href="mailto:info@talantasportscity.com">info@talantasportscity.com</a>' +
    "        <span>Ngong Rd, Nairobi</span>" +
    "      </div>" +
    "    </div>" +
    /* TRUST SECTION */
    '    <div class="footer-trust">' +
    '      <div class="trust-item">' +
    '        <div class="trust-icon shield-check">' +
    '          <img alt="Official ticket seller" src="assets/icons/trust.svg"/>' +
    "        </div>" +
    "        <div>" +
    "          <strong>Official ticket seller</strong>" +
    "          <p>for Bayern Munich vs Ajax at Talanta</p>" +
    "        </div>" +
    "      </div>" +
    '      <div class="trust-item">' +
    '        <div class="trust-icon lock-icon">' +
    '          <img alt="Secure payment" src="assets/icons/lock.svg"/>' +
    "        </div>" +
    "        <div>" +
    "          <strong>Secure mobile money and card</strong>" +
    "          <p>Card details never touch this site</p>" +
    "        </div>" +
    "      </div>" +
    '      <div class="trust-item">' +
    '        <div class="trust-icon ticket-icon">' +
    '          <img alt="Secure tickets" src="assets/icons/ticket.svg"/>' +
    "        </div>" +
    "        <div>" +
    "          <strong>Secure tickets</strong>" +
    "          <p>By SMS and e-mail, and under My tickets</p>" +
    "        </div>" +
    "      </div>" +
    "    </div>" +
    /* FOOTER BOTTOM */
    '    <div class="footer-bottom">' +
    "      <p>© 2026 Talanta Sports City · Ngong Rd, Nairobi.</p>" +
    '      <div class="footer-socials">' +
    '        <a aria-label="Instagram" href="https://www.instagram.com/talantasportscity?xtok=MWJreGRrN2p4cG55NA==">' +
    '          <img alt="Instagram" src="assets/icons/instagram.svg"/>' +
    "        </a>" +
    '        <a aria-label="X" href="https://x.com/talantacity">' +
    '          <img alt="X" src="assets/icons/x.svg"/>' +
    "        </a>" +
    '        <a aria-label="TikTok" href="https://www.tiktok.com/@talantasportscity">' +
    '          <img alt="TikTok" src="assets/icons/tiktok.svg"/>' +
    "        </a>" +
    '        <a aria-label="YouTube" href="https://www.youtube.com/@TalantaSportsCity">' +
    '          <img alt="YouTube" src="assets/icons/youtube.svg"/>' +
    "        </a>" +
    '        <a aria-label="Facebook" href="https://web.facebook.com/TalantaSportsCity?_rdc=1&amp;_rdr#">' +
    '          <img alt="Facebook" src="assets/icons/facebook.svg"/>' +
    "        </a>" +
    "      </div>" +
    "    </div>" +
    "  </div>" +
    "</footer>"
  );
}

function renderBookingWorkspace() {
  return (
    "" +
    '<section class="booking-workspace">' +
    '  <div class="stadium-panel">' +
    '    <div class="map-toolbar">' +
    '      <div aria-label="Map zoom controls" class="map-controls">' +
    '        <button aria-label="Zoom in" id="zoomIn">' +
    "          +" +
    "        </button>" +
    '        <button aria-label="Zoom out" id="zoomOut">' +
    "          −" +
    "        </button>" +
    '        <button aria-label="Reset zoom" id="resetZoom">' +
    "          ↻" +
    "        </button>" +
    "      </div>" +
    '      <div aria-label="Filter seating levels" class="level-controls">' +
    '        <button class="level-button active" data-level="all">' +
    "          ALL LEVELS" +
    "        </button>" +
    '        <button class="level-button" data-level="1">' +
    "          LEVEL 1" +
    "        </button>" +
    '        <button class="level-button" data-level="2">' +
    "          LEVEL 2" +
    "        </button>" +
    '        <button class="level-button" data-level="3">' +
    "          LEVEL 3" +
    "        </button>" +
    "      </div>" +
    '      <label class="event-picker">' +
    "        <span>" +
    "          EVENT" +
    "        </span>" +
    '        <select aria-label="Choose event" id="eventSelect">' +
    '          <option value="general">' +
    "            General admission demo" +
    "          </option>" +
    "        </select>" +
    "      </label>" +
    "    </div>" +
    '    <div class="stadium-map-wrapper">' +
    '      <div class="stadium-map" id="stadiumMap">' +
    '            <svg aria-label="Top-down Talanta Sports City stadium seating plan" id="seatingMap" role="img" viewBox="0 0 1000 667">' +
    '          <image height="667" href="assets/images/talanta-stadium-plan.jpg" preserveAspectRatio="none" width="1000" x="0" y="0"/>' +
    '          <g id="stadiumSections">' +
    "          </g>" +
    "        </svg>" +
    "      </div>" +
    '      <div class="map-legend">' +
    "        <span>" +
    '          <i class="legend-dot available">' +
    "          </i>" +
    "          Available" +
    "        </span>" +
    "        <span>" +
    '          <i class="legend-dot selected">' +
    "          </i>" +
    "          Selected" +
    "        </span>" +
    "        <span>" +
    '          <i class="legend-dot taken">' +
    "          </i>" +
    "          Taken" +
    "        </span>" +
    "        <span>" +
    '          <i class="legend-dot sold">' +
    "          </i>" +
    "          Sold out" +
    "        </span>" +
    "      </div>" +
    '      <div class="map-hint">' +
    "        Select a coloured seating block to view its price" +
    "      </div>" +
    "    </div>" +
    '    <div class="map-instructions">' +
    "       The seating plan is a visual reference. Select an available numbered section to continue." +
    "    </div>" +
    "  </div>" +
    '  <aside class="ticket-panel">' +
    '    <div class="ticket-panel-heading">' +
    "      <div>" +
    '        <span class="panel-eyebrow">' +
    "          YOUR MATCH DAY" +
    "        </span>" +
    "        <h2>" +
    "          Tickets" +
    "        </h2>" +
    "      </div>" +
    '      <div class="quantity-control">' +
    '        <button aria-label="Decrease tickets" id="decreaseQty">' +
    "          −" +
    "        </button>" +
    '        <strong id="ticketQuantity">' +
    "          1" +
    "        </strong>" +
    '        <button aria-label="Increase tickets" id="increaseQty">' +
    "          +" +
    "        </button>" +
    "      </div>" +
    "    </div>" +
    '    <button class="find-seats-button" id="findSeats">' +
    "      ✦   Find my seats" +
    "    </button>" +
    '    <div class="section-heading-row">' +
    "      <div>" +
    "        <h3>" +
    "          Choose a section" +
    "        </h3>" +
    '        <p id="sectionCount">' +
    "          Loading sections…" +
    "        </p>" +
    "      </div>" +
    '      <div class="sort-controls">' +
    '        <button class="sort-button active" data-sort="price">' +
    "          Cheapest" +
    "        </button>" +
    '        <button class="sort-button" data-sort="section">' +
    "          Section" +
    "        </button>" +
    "      </div>" +
    "    </div>" +
    '    <div class="section-list" id="sectionList">' +
    '      <div class="empty-state">' +
    "        Loading stadium sections…" +
    "      </div>" +
    "    </div>" +
    '    <div class="booking-summary">' +
    '      <div class="summary-heading">' +
    "        <h3>" +
    "          Booking Summary" +
    "        </h3>" +
    '        <span class="summary-step">' +
    "          STEP 1 OF 2" +
    "        </span>" +
    "      </div>" +
    '      <div class="summary-row">' +
    "        <span>" +
    "          Selected section" +
    "        </span>" +
    '        <strong id="selectedSection">' +
    "          None" +
    "        </strong>" +
    "      </div>" +
    '      <div class="summary-row">' +
    "        <span>" +
    "          Ticket quantity" +
    "        </span>" +
    '        <strong id="summaryQuantity">' +
    "          1" +
    "        </strong>" +
    "      </div>" +
    '      <div class="summary-row">' +
    "        <span>" +
    "          Price per ticket" +
    "        </span>" +
    '        <strong id="ticketPrice">' +
    "          KSh 0" +
    "        </strong>" +
    "      </div>" +
    '      <div class="summary-total">' +
    "        <span>" +
    "          Total" +
    "        </span>" +
    '        <strong id="totalPrice">' +
    "          KSh 0" +
    "        </strong>" +
    "      </div>" +
    '      <button class="continue-button" disabled="" id="continueBooking">' +
    "        Continue to Booking " +
    "        <span>" +
    "          →" +
    "        </span>" +
    "      </button>" +
    '      <p class="booking-note">' +
    "        Demonstration prices and availability. No payment is taken on this page." +
    "      </p>" +
    "    </div>" +
    "  </aside>" +
    "</section>"
  );
}

function renderTicketHospitalityIntro() {
  return (
    "" +
    '<section class="hospitality-booking">' +
    '  <div class="hospitality-heading">' +
    '    <span class="eyebrow">' +
    "      EXCLUSIVE EXPERIENCES" +
    "    </span>" +
    "    <h2>" +
    "      Upgrade Your Match Day" +
    "    </h2>" +
    "    <p>" +
    "      Discover exclusive hospitality at Talanta Sports City. " +
    "    </p>" +
    "  </div>" +
    "</section>"
  );
}

/* ============================================================
   04. PAGE COMPOSITION — HOME
   ============================================================ */
function renderHomePage() {
  if (!app) return;

  document.body.classList.remove("ticket-booking-page");

  app.innerHTML =
    "" +
    renderHeader() +
    renderHero() +
    renderFeaturedEvent() +
    renderStadium() +
    renderHospitality() +
    renderGallery() +
    renderTicketPromotion() +
    renderLocation() +
    renderFAQ() +
    renderFooter();

  updateThemeToggle();
  initializeHomeFeatures();
}

/* ============================================================
   05. PAGE COMPOSITION — TICKETS
   ============================================================ */
function renderTicketPage() {
  if (!app) return;

  document.body.classList.add("ticket-booking-page");

  app.innerHTML =
    "" +
    renderTicketHeader() +
    '<main class="booking-page">' +
    renderBookingWorkspace() +
    renderTicketHospitalityIntro() +
    "</main>" +
    renderHospitality() +
    renderFooter();

  updateThemeToggle();
  initializeTicketing();
  initializeTicketSlideshow();
  initializeMobileMenu();
  initializeHeaderScroll();
  initializeFooter();
}

/* ============================================================
   06. ROUTING AND NAVIGATION
   ============================================================ */
function navigateTo(route, options) {
  options = options || {};
  var nextRoute = route === APP_CONFIG.ticketRoute ? "tickets" : "home";

  state.route = nextRoute;

  if (nextRoute === "tickets") {
    renderTicketPage();
  } else {
    renderHomePage();
  }

  if (!options.fromPopState) {
    var nextHash =
      nextRoute === "tickets" ? APP_CONFIG.ticketHash : APP_CONFIG.homeHash;

    if (nextRoute === "home" && options.section) {
      nextHash = "#" + options.section;
    }
    history.pushState({ route: nextRoute }, "", nextHash);
    lastHandledLocationHash = location.hash;
  }

  if (nextRoute === "home" && options.section) {
    window.setTimeout(function () {
      var target = document.getElementById(options.section);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

function handleRouteClick(event) {
  var routeLink = event.target.closest("[data-route]");
  if (!routeLink) return;

  event.preventDefault();
  var route = routeLink.getAttribute("data-route");
  var section = routeLink.getAttribute("data-section");

  navigateTo(route, route === "home" && section ? { section: section } : {});
}

function handleBrowserNavigation() {
  if (lastHandledLocationHash === location.hash) return;
  lastHandledLocationHash = location.hash;
  var hash = location.hash;
  var route = hash === APP_CONFIG.ticketHash ? "tickets" : "home";
  var section = hash.replace(/^#/, "");
  var supportedSections = [
    "home",
    "stadium",
    "events",
    "hospitality",
    "gallery",
    "location",
    "faq",
    "tickets",
  ];
  navigateTo(route, {
    fromPopState: true,
    section:
      route === "home" && supportedSections.indexOf(section) !== -1
        ? section
        : null,
  });
}

/* ============================================================
   07. GLOBAL EVENT BINDING
   Bind once: pages are replaced during SPA navigation.
   ============================================================ */
function bindGlobalEvents() {
  if (globalEventsBound) return;
  globalEventsBound = true;

  document.addEventListener("click", function (event) {
    var themeButton = event.target.closest("#themeToggle");
    if (themeButton) {
      var currentTheme = document.body.getAttribute("data-theme") || "dark";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
      return;
    }
    var hospitalityPurchaseButton = event.target.closest(
      ".hospitality-modal-purchase[data-hospitality-purchase]",
    );
    if (hospitalityPurchaseButton) {
      event.preventDefault();
      if (hospitalityPurchaseButton.disabled) return;
      var tier = String(
        hospitalityPurchaseButton.getAttribute("data-hospitality-purchase") ||
          "",
      ).toLowerCase();
      if (typeof window.startHospitalityCheckout === "function") {
        window.startHospitalityCheckout(tier);
      }
      return;
    }
    var hospitalityButton = event.target.closest("[data-hospitality-tier]");

    if (hospitalityButton) {
      event.preventDefault();
      showHospitalityDetails(
        hospitalityButton.getAttribute("data-hospitality-tier"),
      );
      return;
    }

    handleRouteClick(event);
    closeMobileMenuOnOutsideClick(event);
    closeMobileMenuAfterNavigation(event);
  });

  window.addEventListener("popstate", handleBrowserNavigation);
  window.addEventListener("hashchange", handleBrowserNavigation);
}

/* ============================================================
   08. HOMEPAGE — MOBILE NAVIGATION
   ============================================================ */
function initializeMobileMenu() {
  var menuToggle = document.getElementById("menuToggle");
  var navigation = document.getElementById("navigation");

  if (!menuToggle || !navigation) return;

  menuToggle.onclick = function () {
    var isOpen = navigation.classList.toggle("active");
    menuToggle.textContent = isOpen ? "✕" : "☰";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  };
}

function closeMobileMenu() {
  var menuToggle = document.getElementById("menuToggle");
  var navigation = document.getElementById("navigation");

  if (!menuToggle || !navigation) return;

  navigation.classList.remove("active");
  menuToggle.textContent = "☰";
  menuToggle.setAttribute("aria-expanded", "false");
}

function closeMobileMenuOnOutsideClick(event) {
  var menuToggle = document.getElementById("menuToggle");
  var navigation = document.getElementById("navigation");

  if (!menuToggle || !navigation || !navigation.classList.contains("active"))
    return;
  if (navigation.contains(event.target) || menuToggle.contains(event.target))
    return;

  closeMobileMenu();
}

function closeMobileMenuAfterNavigation(event) {
  var navigation = document.getElementById("navigation");
  if (!navigation) return;

  if (event.target.closest("#navigation a")) {
    closeMobileMenu();
  }
}

/* ============================================================
   09. HOMEPAGE — HEADER SCROLL EFFECT
   ============================================================ */
function initializeHeaderScroll() {
  updateHeaderScroll();
  window.removeEventListener("scroll", updateHeaderScroll);
  window.addEventListener("scroll", updateHeaderScroll, { passive: true });
}

function updateHeaderScroll() {
  var header = document.querySelector(".header");
  if (!header) return;

  header.classList.toggle("scrolled", window.scrollY > 50);
}

/* ============================================================
   10. HOMEPAGE — REVEAL ANIMATIONS
   ============================================================ */
function initializeRevealAnimations() {
  var selectors = [
    ".stadium-info",
    ".stadium-image",
    ".hospitality-card",
    ".gallery-grid img",
    ".tickets-content",
    ".location-grid",
    ".faq-list",
  ];
  var revealItems = document.querySelectorAll(selectors.join(", "));

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, activeObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        activeObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealItems.forEach(function (item) {
    item.classList.add("reveal");
    observer.observe(item);
  });
}

/* ============================================================
   11. HOMEPAGE — TICKET SLIDESHOW
   ============================================================ */
function initializeTicketSlideshow() {
  var slides = Array.from(document.querySelectorAll(".tickets-slide"));
  if (slideTimer) {
    window.clearInterval(slideTimer);
    slideTimer = null;
  }
  if (slides.length < 2) return;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  var activeIndex = slides.findIndex(function (slide) {
    return slide.classList.contains("active");
  });
  if (activeIndex < 0) activeIndex = 0;

  slideTimer = window.setInterval(function () {
    if (document.hidden) return;
    slides[activeIndex].classList.remove("active");
    activeIndex = (activeIndex + 1) % slides.length;
    slides[activeIndex].classList.add("active");
  }, APP_CONFIG.slideDuration);
}

/* ============================================================
   12. HOMEPAGE — FOOTER DETAILS
   ============================================================ */
function initializeFooter() {
  var copyright = document.querySelector(".footer-bottom p");
  if (!copyright) return;

  copyright.textContent =
    "© " +
    new Date().getFullYear() +
    " Talanta Sports City. Unofficial demonstration clone.";
}

/* ============================================================
   13. HOMEPAGE — INITIALIZATION
   ============================================================ */
function initializeHomeFeatures() {
  initializeMobileMenu();
  initializeHeaderScroll();
  initializeRevealAnimations();
  initializeTicketSlideshow();
  initializeFooter();

  console.log("TALANTA homepage initialized");
}

/* ============================================================
   14. TICKETING — CONFIGURATION AND DATA
   ============================================================ */
var TICKET_CONFIG = {
  currency: "KSh",
  maxTickets: 10,
  prices: {
    1: 2500,
    2: 5000,
    3: 15000,
    gold: 20000,
    platinum: 35000,
    skybox: 75000,
  },
  levels: {
    1: {
      start: 101,
      count: 28,
      innerX: 252,
      innerY: 158,
      outerX: 282,
      outerY: 185,
    },
    2: {
      start: 201,
      count: 20,
      innerX: 292,
      innerY: 190,
      outerX: 344,
      outerY: 235,
    },
    3: {
      start: 401,
      count: 35,
      innerX: 350,
      innerY: 239,
      outerX: 393,
      outerY: 284,
    },
  },
};

var hospitalityCheckoutBootstrapInitialized = false;

function initializeHospitalityCheckoutFromHomepage() {
  if (hospitalityCheckoutBootstrapInitialized) return;

  var bootstrap = document.createElement("div");
  bootstrap.id = "hospitalityCheckoutBootstrap";
  bootstrap.hidden = true;
  bootstrap.innerHTML = renderBookingWorkspace();
  document.body.appendChild(bootstrap);

  initializeTicketing();
  bootstrap.remove();
  hospitalityCheckoutBootstrapInitialized = true;
}

window.startHospitalityCheckout = function (tier) {
  var normalizedTier = String(tier).toLowerCase();
  if (!["gold", "platinum", "skybox"].includes(normalizedTier)) return;

  initializeHospitalityCheckoutFromHomepage();
  if (typeof window.__talantaStartHospitalityCheckout === "function") {
    window.__talantaStartHospitalityCheckout(normalizedTier);
  }
};

function formatTicketMoney(value) {
  var amount = Number(value);
  if (!Number.isFinite(amount)) amount = 0;
  return TICKET_CONFIG.currency + " " + amount.toLocaleString("en-KE");
}

function isTicketSectionAvailable(section) {
  return section.status === "available" && section.seats > 0;
}

function createTicketSections() {
  var sections = [];

  Object.keys(TICKET_CONFIG.levels).forEach(function (level) {
    var config = TICKET_CONFIG.levels[level];

    for (var index = 0; index < config.count; index += 1) {
      var status = "available";
      if (index % 11 === 0) status = "sold";
      else if (index % 7 === 0) status = "taken";

      sections.push({
        id: config.start + index,
        level: Number(level),
        status: status,
        seats: status === "available" ? 4 + ((index * 7) % 47) : 0,
        price: TICKET_CONFIG.prices[level],
      });
    }
  });

  return sections;
}

/* ============================================================
   15. TICKETING — SVG GEOMETRY HELPERS
   ============================================================ */
function getStadiumPoint(centerX, centerY, radiusX, radiusY, angle) {
  var radians = (angle * Math.PI) / 180;

  return {
    x: centerX + radiusX * Math.cos(radians),
    y: centerY + radiusY * Math.sin(radians),
  };
}

function createStadiumSectionPath(
  centerX,
  centerY,
  outerX,
  outerY,
  innerX,
  innerY,
  startAngle,
  endAngle,
) {
  var startOuter = getStadiumPoint(
    centerX,
    centerY,
    outerX,
    outerY,
    startAngle,
  );
  var endOuter = getStadiumPoint(centerX, centerY, outerX, outerY, endAngle);
  var endInner = getStadiumPoint(centerX, centerY, innerX, innerY, endAngle);
  var startInner = getStadiumPoint(
    centerX,
    centerY,
    innerX,
    innerY,
    startAngle,
  );
  var largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return (
    "M " +
    startOuter.x +
    " " +
    startOuter.y +
    " A " +
    outerX +
    " " +
    outerY +
    " 0 " +
    largeArc +
    " 1 " +
    endOuter.x +
    " " +
    endOuter.y +
    " L " +
    endInner.x +
    " " +
    endInner.y +
    " A " +
    innerX +
    " " +
    innerY +
    " 0 " +
    largeArc +
    " 0 " +
    startInner.x +
    " " +
    startInner.y +
    " Z"
  );
}

/* ============================================================
   16. TICKETING — CONTROLLER
   ============================================================ */
function initializeTicketing() {
  var elements = {
    map: document.getElementById("stadiumSections"),
    stadiumMap: document.getElementById("stadiumMap"),
    sectionList: document.getElementById("sectionList"),
    sectionCount: document.getElementById("sectionCount"),
    quantity: document.getElementById("ticketQuantity"),
    summaryQuantity: document.getElementById("summaryQuantity"),
    selectedSection: document.getElementById("selectedSection"),
    ticketPrice: document.getElementById("ticketPrice"),
    totalPrice: document.getElementById("totalPrice"),
    decreaseQuantity: document.getElementById("decreaseQty"),
    increaseQuantity: document.getElementById("increaseQty"),
    findSeats: document.getElementById("findSeats"),
    continueBooking: document.getElementById("continueBooking"),
    zoomIn: document.getElementById("zoomIn"),
    zoomOut: document.getElementById("zoomOut"),
    resetZoom: document.getElementById("resetZoom"),
    eventSelect: document.getElementById("eventSelect"),
  };

  if (!elements.map || !elements.stadiumMap || !elements.sectionList) {
    console.warn(
      "TALANTA ticketing: required stadium elements were not found.",
    );
    return;
  }

  var sections = createTicketSections();
  var currentLevel = "all";
  var selectedSection = null;
  var selectedHospitality = null;
  var quantity = 1;
  var sortMode = "price";
  var zoom = 1;

  /* ----------------------------------------------------------
     Selection helpers
     ---------------------------------------------------------- */
  function getSelectedPrice() {
    if (selectedSection) return selectedSection.price;
    if (selectedHospitality) return selectedHospitality.price;
    return 0;
  }

  function getSelectedName() {
    if (selectedSection) return "Section " + selectedSection.id;
    if (selectedHospitality) return selectedHospitality.name;
    return "None";
  }

  function clearHospitalitySelection() {
    document.querySelectorAll(".hospitality-option").forEach(function (button) {
      button.classList.remove("chosen");
    });
  }

  /* ----------------------------------------------------------
     Stadium map rendering
     ---------------------------------------------------------- */
  function updateMapSelection() {
    elements.map.querySelectorAll(".stadium-section").forEach(function (path) {
      var sectionId = Number(path.getAttribute("data-section"));
      var section = sections.find(function (item) {
        return item.id === sectionId;
      });
      if (!section) return;

      var className =
        selectedSection && selectedSection.id === section.id
          ? "selected"
          : section.status;
      path.setAttribute("class", "stadium-section " + className);
    });
  }

  function drawStadium() {
    var namespace = "http://www.w3.org/2000/svg";
    var levels = currentLevel === "all" ? [1, 2, 3] : [Number(currentLevel)];

    elements.map.innerHTML = "";

    levels.forEach(function (level) {
      var config = TICKET_CONFIG.levels[level];
      var levelSections = sections.filter(function (section) {
        return section.level === level;
      });
      var step = 360 / config.count;
      var gap = Math.min(1.15, step * 0.09);

      levelSections.forEach(function (section, index) {
        var startAngle = -90 + index * step + gap / 2;
        var endAngle = -90 + (index + 1) * step - gap / 2;
        var middleAngle = (startAngle + endAngle) / 2;

        var path = document.createElementNS(namespace, "path");
        path.setAttribute(
          "d",
          createStadiumSectionPath(
            500,
            333,
            config.outerX,
            config.outerY,
            config.innerX,
            config.innerY,
            startAngle,
            endAngle,
          ),
        );
        path.setAttribute("class", "stadium-section " + section.status);
        path.setAttribute("data-section", section.id);
        path.setAttribute("data-level", level);
        path.setAttribute("role", "button");
        path.setAttribute(
          "tabindex",
          isTicketSectionAvailable(section) ? "0" : "-1",
        );
        path.setAttribute(
          "aria-label",
          "Section " +
            section.id +
            ", level " +
            level +
            ", " +
            (isTicketSectionAvailable(section) ? "available" : section.status),
        );
        path.addEventListener("click", function () {
          selectSection(section.id);
        });
        path.addEventListener("keydown", function (event) {
          if (
            (event.key === "Enter" || event.key === " ") &&
            isTicketSectionAvailable(section)
          ) {
            event.preventDefault();
            selectSection(section.id);
          }
        });
        elements.map.appendChild(path);

        var labelPosition = getStadiumPoint(
          500,
          333,
          (config.innerX + config.outerX) / 2,
          (config.innerY + config.outerY) / 2,
          middleAngle,
        );
        var label = document.createElementNS(namespace, "text");
        label.setAttribute("x", labelPosition.x);
        label.setAttribute("y", labelPosition.y);
        label.setAttribute("class", "section-map-label");
        label.textContent = section.id;
        elements.map.appendChild(label);
      });
    });

    updateMapSelection();
  }

  /* ----------------------------------------------------------
     Level and section selection
     ---------------------------------------------------------- */
  function setLevelButtons() {
    document.querySelectorAll(".level-button").forEach(function (button) {
      button.classList.toggle(
        "active",
        button.getAttribute("data-level") === String(currentLevel),
      );
    });
  }

  function changeLevel(level) {
    currentLevel = level === "all" ? "all" : Number(level);
    selectedSection = null;
    selectedHospitality = null;
    clearHospitalitySelection();
    setLevelButtons();
    drawStadium();
    renderSectionList();
    updateSummary();
  }

  function selectSection(sectionId) {
    var section = sections.find(function (item) {
      return item.id === Number(sectionId);
    });
    if (!section || !isTicketSectionAvailable(section)) return;

    selectedSection = section;
    selectedHospitality = null;
    currentLevel = section.level;
    quantity = Math.min(quantity, section.seats);

    clearHospitalitySelection();
    setLevelButtons();
    drawStadium();
    renderSectionList();
    updateSummary();
  }

  /* ----------------------------------------------------------
     Ticket section list
     ---------------------------------------------------------- */
  function renderSectionList() {
    var visibleSections = sections.filter(function (section) {
      return currentLevel === "all" || section.level === Number(currentLevel);
    });

    visibleSections = visibleSections.slice().sort(function (first, second) {
      if (sortMode === "price") {
        return first.price - second.price || first.id - second.id;
      }
      return first.id - second.id;
    });

    var availableCount = visibleSections.filter(
      isTicketSectionAvailable,
    ).length;
    if (elements.sectionCount) {
      elements.sectionCount.textContent =
        availableCount +
        " of " +
        visibleSections.length +
        " sections available";
    }

    if (!visibleSections.length) {
      elements.sectionList.innerHTML =
        '<div class="empty-state">No sections found.</div>';
      return;
    }

    elements.sectionList.innerHTML = visibleSections
      .map(function (section) {
        var isSelected = selectedSection && selectedSection.id === section.id;
        var unavailable = !isTicketSectionAvailable(section);
        var statusText =
          section.status === "sold"
            ? "Sold out"
            : section.status === "taken"
              ? "Unavailable"
              : section.seats + " seats left";

        return (
          "" +
          '<button type="button" class="section-item ' +
          (isSelected ? "active" : "") +
          " " +
          (unavailable ? "unavailable" : "") +
          '"' +
          ' data-section="' +
          section.id +
          '" ' +
          (unavailable ? 'disabled aria-disabled="true"' : "") +
          ">" +
          '<div class="section-item-top">' +
          "<div><h4>Section " +
          section.id +
          "</h4><p>Level " +
          section.level +
          " seating</p></div>" +
          '<div class="section-price"><small>Price per ticket</small><strong>' +
          formatTicketMoney(section.price) +
          "</strong></div>" +
          "</div>" +
          '<p class="seats-left">' +
          statusText +
          "</p>" +
          "</button>"
        );
      })
      .join("");

    elements.sectionList
      .querySelectorAll(".section-item")
      .forEach(function (item) {
        item.addEventListener("click", function () {
          selectSection(item.getAttribute("data-section"));
        });
      });
  }

  /* ----------------------------------------------------------
     Booking summary and quantity controls
     ---------------------------------------------------------- */
  function updateSummary() {
    var price = getSelectedPrice();

    if (elements.quantity) elements.quantity.textContent = quantity;
    if (elements.summaryQuantity)
      elements.summaryQuantity.textContent = quantity;
    if (elements.selectedSection)
      elements.selectedSection.textContent = getSelectedName();
    if (elements.ticketPrice)
      elements.ticketPrice.textContent = formatTicketMoney(price);
    if (elements.totalPrice)
      elements.totalPrice.textContent = formatTicketMoney(price * quantity);
    if (elements.continueBooking) {
      elements.continueBooking.disabled =
        !selectedSection && !selectedHospitality;
    }

    updateMapSelection();
  }

  function changeQuantity(amount) {
    var maxQuantity = selectedSection
      ? Math.min(TICKET_CONFIG.maxTickets, selectedSection.seats)
      : TICKET_CONFIG.maxTickets;

    quantity = Math.max(
      1,
      Math.min(maxQuantity, Number(quantity) + Number(amount)),
    );
    updateSummary();
  }

  /* ----------------------------------------------------------
     Find available seats
     ---------------------------------------------------------- */
  function findAvailableSeats() {
    var candidate = sections
      .filter(isTicketSectionAvailable)
      .filter(function (section) {
        return section.seats >= quantity;
      })
      .sort(function (first, second) {
        return first.price - second.price || first.id - second.id;
      })[0];

    if (!candidate) {
      alert(
        "No available section currently has " +
          quantity +
          " seats. Try reducing your quantity.",
      );
      return;
    }

    selectSection(candidate.id);
    var summary = document.querySelector(".booking-summary");
    if (summary)
      summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ----------------------------------------------------------
     Hospitality package selection
     ---------------------------------------------------------- */
  function selectHospitality(button) {
    var packages = {
      gold: {
        name: "Gold Hospitality",
        price: TICKET_CONFIG.prices.gold,
        active: true,
      },
      platinum: {
        name: "Platinum Hospitality",
        price: TICKET_CONFIG.prices.platinum,
        active: true,
      },
      skybox: {
        name: "Skybox VIP",
        price: TICKET_CONFIG.prices.skybox,
        active: true,
      },
    };
    var category = button.getAttribute("data-category");
    var selectedPackage = packages[category];

    if (!selectedPackage || !selectedPackage.active) return;

    selectedSection = null;
    selectedHospitality = {
      name: selectedPackage.name,
      price: selectedPackage.price,
      category: category,
    };

    document.querySelectorAll(".hospitality-option").forEach(function (option) {
      option.classList.toggle("chosen", option === button);
    });

    renderSectionList();
    updateSummary();

    var summary = document.querySelector(".booking-summary");
    if (summary)
      summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ----------------------------------------------------------
     Stadium map zoom
     ---------------------------------------------------------- */
  function applyZoom() {
    if (!elements.stadiumMap) return;
    elements.stadiumMap.style.transform = "scale(" + zoom + ")";
  }

  function changeZoom(amount) {
    zoom = Math.max(0.7, Math.min(2, zoom + amount));
    applyZoom();
  }

  function resetZoom() {
    zoom = 1;
    applyZoom();
  }

  /* ----------------------------------------------------------
     Event selector and booking action
     ---------------------------------------------------------- */
  function resetSelectionForEvent() {
    selectedSection = null;
    selectedHospitality = null;
    quantity = 1;
    clearHospitalitySelection();
    drawStadium();
    renderSectionList();
    updateSummary();
  }

  function continueBooking() {
    if (!selectedSection && !selectedHospitality) return;

    var price = getSelectedPrice();

    var selectedEventOption =
      elements.eventSelect && elements.eventSelect.selectedOptions
        ? elements.eventSelect.selectedOptions[0]
        : null;

    var booking = {
      event: elements.eventSelect
        ? elements.eventSelect.value
        : "Talanta Sports City Demo Event",
      eventDate: selectedEventOption
        ? selectedEventOption.dataset.date || ""
        : "",
      eventTime: selectedEventOption
        ? selectedEventOption.dataset.time || ""
        : "",
      venue: selectedEventOption ? selectedEventOption.dataset.venue || "" : "",
      homeCrest: selectedEventOption
        ? selectedEventOption.dataset.homeCrest || ""
        : "",
      awayCrest: selectedEventOption
        ? selectedEventOption.dataset.awayCrest || ""
        : "",
      selection: getSelectedName(),
      category: selectedHospitality ? selectedHospitality.category : "standard",
      ticketType: selectedHospitality ? "hospitality" : "section",
      hospitalityType: selectedHospitality
        ? selectedHospitality.category
        : null,
      sectionId: selectedSection ? selectedSection.id : null,
      quantity: quantity,
      pricePerTicket: price,
      total: price * quantity,
      currency: TICKET_CONFIG.currency,
    };

    openMpesaCheckout(booking);
    console.log("Talanta checkout:", booking);
  }

  window.__talantaStartHospitalityCheckout = function (tier) {
    var normalizedTier = String(tier).toLowerCase();
    var packages = {
      gold: {
        name: "Gold Hospitality",
        price: TICKET_CONFIG.prices.gold,
        active: true,
      },
      platinum: {
        name: "Platinum Hospitality",
        price: TICKET_CONFIG.prices.platinum,
        active: true,
      },
      skybox: {
        name: "Skybox VIP",
        price: TICKET_CONFIG.prices.skybox,
        active: true,
      },
    };

    var selectedPackage = packages[normalizedTier];
    if (!selectedPackage) return;
    if (!selectedPackage.active) return;

    selectedSection = null;
    selectedHospitality = {
      name: selectedPackage.name,
      price: selectedPackage.price,
      category: normalizedTier,
    };

    quantity = 1;
    updateSummary();

    document.getElementById("hospitality-details-modal")?.remove();

    continueBooking();
  };
  window.startHospitalityCheckout = window.__talantaStartHospitalityCheckout;

  /* ----------------------------------------------------------
   M-PESA CHECKOUT MODAL
   ---------------------------------------------------------- */

  function openMpesaCheckout(booking) {
    var existing = document.getElementById("mpesaCheckoutModal");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = "mpesaCheckoutModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Secure M-Pesa checkout");
    modal.style.cssText = `
  position:fixed;inset:0;z-index:99999;overflow-y:auto;
  background:#f4f5f1;color:#071b16;
  font-family:Inter,Segoe UI,sans-serif;
`;

    var qty = Number(booking.quantity) || 1;
    var customerName = "";
    var currentOrderId = "";
    var currentAccessToken = "";
    var currentPaymentStatus = "IDLE";
    var unitPrice = Number(booking.pricePerTicket) || 0;
    var checkoutPreviousFocus = document.activeElement;
    var selectedSeatSection = booking.sectionId
      ? sections.find(function (section) {
          return String(section.id) === String(booking.sectionId);
        })
      : null;
    var checkoutMaxQty = selectedSeatSection
      ? Math.max(
          1,
          Math.min(
            TICKET_CONFIG.maxTickets,
            Number(selectedSeatSection.seats) || 1,
          ),
        )
      : TICKET_CONFIG.maxTickets;
    qty = Math.max(1, Math.min(checkoutMaxQty, qty));

    modal.innerHTML = `
    <div class="tsc-checkout-shell">
      <header class="tsc-checkout-header">
        <a class="tsc-checkout-brand" href="/" aria-label="Talanta Sports City home">TALANTA SPORTS CITY</a>
        <button type="button" id="checkoutClose" aria-label="Close checkout">&times;</button>
      </header>

      <div class="tsc-checkout-intro">
        <p class="tsc-eyebrow">SECURE M-PESA CHECKOUT</p>
        <h1>Checkout</h1>
        <p>Confirm your details and approve the M-Pesa prompt on your phone.</p>
      </div>

      <nav class="tsc-checkout-steps" aria-label="Checkout progress">
        <span class="tsc-step tsc-step-done"><b>1</b> Seats</span>
        <span class="tsc-step tsc-step-active"><b>2</b> Details</span>
        <span class="tsc-step"><b>3</b> Payment</span>
      </nav>
      <p class="tsc-step-caption">Step 2 of 3</p>

      <div id="checkoutDetailsLayout" class="tsc-checkout-layout">
        <main class="tsc-checkout-main">
          <section id="checkoutFormPanel" class="tsc-checkout-card">
            <h2>Your details</h2>
            <p class="tsc-muted">We use these details to prepare your checkout and send the M-Pesa prompt. Your M-Pesa PIN is never collected.</p>
            <form id="checkoutPaymentForm">
              <label for="checkoutName">Full name</label>
              <input id="checkoutName" type="text" autocomplete="name" placeholder="Your full name" required>

              <label for="checkoutEmail">Email (optional)</label>
              <input id="checkoutEmail" type="email" autocomplete="email" placeholder="you@example.com">

              <label for="checkoutPhone">M-Pesa number</label>
              <input id="checkoutPhone" type="tel" autocomplete="tel" inputmode="tel" placeholder="07XXXXXXXX" required>

              <div class="tsc-payment-method">
                <span class="tsc-mpesa-mark">M</span>
                <div><strong>Payment method</strong><b>M-PESA</b><p><strong>M-Pesa STK push</strong><br>We send a payment prompt to your phone. Enter your PIN to approve.</p></div>
              </div>
              <p class="tsc-privacy-note">Your M-Pesa number is only used for this payment. We never collect or store your PIN.</p>
              <p id="checkoutStatus" class="tsc-checkout-status" role="status" aria-live="polite"></p>
              <button id="checkoutPayButton" class="tsc-primary-button" type="submit">Pay KSh <span id="checkoutPayAmount"></span></button>

<label class="tsc-terms" for="checkoutTerms">
  <input id="checkoutTerms" type="checkbox" required>

  <span>By paying you agree to our 
    <button type="button" class="tsc-policy-button" data-policy="terms">Terms &amp; Conditions</button>
    and
    <button type="button" class="tsc-policy-button" data-policy="privacy">Privacy Policy</button>.. No re-entry.
  </span>

</label>



              </form>
          </section>

          <section id="checkoutWaiting" class="tsc-checkout-card tsc-waiting-card" style="display:none">
            <p class="tsc-eyebrow">M-PESA</p>
            <div class="tsc-stk-icon">↗</div>
            <h2>STK push sent</h2>
            <h3>Check your phone</h3>
            <p>Enter your M-Pesa PIN to approve <strong id="waitingAmount"></strong>.</p>
            <div class="tsc-payment-reference">
              <p>M-Pesa number <strong id="waitingPhone"></strong></p>
              <p>Order reference <strong id="waitingOrder"></strong></p>
              <p>Section <strong id="waitingSection"></strong></p>
            </div>
            <p id="waitingMessage" class="tsc-waiting-message" role="status" aria-live="polite">Waiting for confirmation from M-Pesa. Keep this page open.</p>
            <div class="tsc-waiting-actions">
              <button type="button" id="checkoutCheckAgain" class="tsc-primary-button">Check again</button>
              <button type="button" id="checkoutCancel" class="tsc-secondary-button">Cancel and start over</button>
            </div>
          </section>
        </main>

        <aside class="tsc-checkout-card tsc-order-card">
          <h2>Order summary</h2>
          <div class="tsc-event-art" aria-hidden="true"><span>⚽</span><span>VS</span><span>⚽</span></div>
          <h3 id="checkoutEvent"></h3>
          <p id="checkoutEventMeta" class="tsc-muted"></p>
          <div class="tsc-order-line"><span id="checkoutSelectionLabel">Ticket</span><strong id="checkoutEach"></strong></div>
          <div class="tsc-order-line"><span>Section</span><strong id="checkoutSectionSummary"></strong></div>
          <div class="tsc-order-line"><span>Quantity</span><div class="tsc-quantity-control"><button type="button" id="checkoutMinus" aria-label="Decrease quantity">−</button><strong id="checkoutQty"></strong><button type="button" id="checkoutPlus" aria-label="Increase quantity">+</button></div></div>
          <div class="tsc-order-line"><span>Service fee</span><strong>Included</strong></div>
          <div class="tsc-order-total"><span>Total</span><strong id="checkoutTotal"></strong></div>
          <div class="tsc-secure-note"><span>♧</span><div><strong>Secure M-Pesa payment</strong><p>Card details never touch this site. Tickets are issued after payment is verified.</p></div></div>
        </aside>
      </div>

      <section id="checkoutSuccess" class="tsc-checkout-card tsc-success-card" style="display:none">
        <div class="tsc-success-heading"><div class="tsc-success-check">✓</div><p class="tsc-eyebrow">PAYMENT SUCCESSFUL</p><h1 id="successWelcome">Welcome!</h1><p>Your payment has been verified. Your Talanta tickets are confirmed.</p></div>
        <h3>Booking details</h3>
        <p>Event: <strong id="successEvent"></strong></p><p>Order reference: <strong id="successOrder"></strong></p><p>M-Pesa receipt: <strong id="successReceipt"></strong></p><p>Section/package: <strong id="successSection"></strong></p><p>Quantity: <strong id="successQuantity"></strong></p><p>Total paid: <strong id="successAmount"></strong></p>
        <h3>Your ticket codes</h3><div id="successTickets"></div>
        <p class="tsc-muted">Thank you for choosing Talanta Sports City. We look forward to welcoming you!</p>
      </section>

      <footer class="tsc-checkout-footer">TALANTA SPORTS CITY · Nairobi, Kenya</footer>
    </div>
  `;

    document.body.appendChild(modal);
    var checkoutCloseButton = modal.querySelector("#checkoutClose");
    if (checkoutCloseButton) checkoutCloseButton.focus();
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeCheckout();
    });

    function updateCheckoutProgress(step) {
      var steps = modal.querySelectorAll(".tsc-step");
      steps.forEach(function (item, index) {
        item.classList.toggle("tsc-step-active", index === step - 1);
        if (index < step - 1) item.classList.add("tsc-step-done");
        else item.classList.remove("tsc-step-done");
      });
      modal.querySelector(".tsc-step-caption").textContent =
        "Step " + step + " of 3";
    }

    function money(value) {
      return "KSh " + Number(value).toLocaleString("en-KE");
    }

    function renderCheckoutSuccess(payment) {
      currentPaymentStatus = "SUCCESS";
      modal.querySelector("#checkoutWaiting").style.display = "none";
      modal.querySelector("#checkoutSuccess").style.display = "block";
      modal.querySelector("#checkoutDetailsLayout").style.display = "none";
      modal.querySelector("#successWelcome").textContent =
        "Welcome, " + customerName + "!";
      modal.querySelector("#successEvent").textContent =
        booking.event || "Talanta Sports City Event";
      modal.querySelector("#successOrder").textContent =
        payment.orderId || currentOrderId;
      modal.querySelector("#successReceipt").textContent =
        payment.mpesaReceiptNumber || "Not provided";
      modal.querySelector("#successSection").textContent =
        payment.itemCode || booking.selection || "General Admission";
      modal.querySelector("#successQuantity").textContent =
        payment.quantity || qty;
      modal.querySelector("#successAmount").textContent = money(
        payment.amount != null ? payment.amount : booking.total,
      );
      var ticketContainer = modal.querySelector("#successTickets");
      ticketContainer.replaceChildren();
      var tickets = Array.isArray(payment.tickets) ? payment.tickets : [];
      if (tickets.length) {
        tickets.forEach(function (ticket) {
          var item = document.createElement("p");
          item.textContent = ticket.ticketCode || "Ticket code unavailable";
          ticketContainer.appendChild(item);
        });
      } else {
        ticketContainer.textContent =
          "Payment verified. Keep your order reference if you need support with ticket delivery.";
      }
    }

    function updateCheckout() {
      booking.quantity = qty;
      booking.total = unitPrice * qty;

      modal.querySelector("#checkoutQty").textContent = qty;
      modal.querySelector("#checkoutEach").textContent = money(unitPrice);
      modal.querySelector("#checkoutTotal").textContent = money(booking.total);
      modal.querySelector("#checkoutPayAmount").textContent = Number(
        booking.total,
      ).toLocaleString("en-KE");
    }

    modal.querySelector("#checkoutEvent").textContent =
      booking.event || "Talanta Sports City Event";
    modal.querySelector("#checkoutSelectionLabel").textContent =
      booking.category || "Ticket";
    modal.querySelector("#checkoutSectionSummary").textContent =
      booking.selection ||
      booking.sectionId ||
      booking.hospitalityType ||
      "General Admission";
    var eventMeta = [booking.eventDate, booking.eventTime, booking.venue]
      .filter(Boolean)
      .join(" · ");
    var eventMetaElement = modal.querySelector("#checkoutEventMeta");
    eventMetaElement.textContent = eventMeta;
    eventMetaElement.hidden = !eventMeta;

    if (booking.homeCrest || booking.awayCrest) {
      var eventArt = modal.querySelector(".tsc-event-art");
      eventArt.replaceChildren();
      [booking.homeCrest, booking.awayCrest].forEach(function (src, index) {
        var crest = document.createElement("img");
        crest.alt = index === 0 ? "Home team crest" : "Away team crest";
        crest.width = 52;
        crest.height = 52;
        crest.loading = "lazy";
        crest.src = src;
        eventArt.appendChild(crest);
      });
      var versus = document.createElement("span");
      versus.className = "tsc-event-versus";
      versus.textContent = "VS";
      eventArt.insertBefore(versus, eventArt.children[1] || null);
    }

    modal
      .querySelector("#checkoutMinus")
      .addEventListener("click", function () {
        if (qty > 1) {
          qty--;
          updateCheckout();
        }
      });

    modal.querySelector("#checkoutPlus").addEventListener("click", function () {
      if (qty < checkoutMaxQty) {
        qty++;
        updateCheckout();
      }
    });

    updateCheckout();

    function closeCheckout() {
      if (
        currentPaymentStatus === "PENDING" ||
        currentPaymentStatus === "PENDING_VERIFICATION"
      ) {
        var waitingMessage = modal.querySelector("#waitingMessage");
        if (waitingMessage)
          waitingMessage.textContent =
            "Your M-PESA request may still be active. Do not start another payment until its status is resolved.";
        return;
      }
      modal.remove();
      if (
        checkoutPreviousFocus &&
        typeof checkoutPreviousFocus.focus === "function"
      ) {
        checkoutPreviousFocus.focus();
      }
    }

    modal
      .querySelector("#checkoutClose")
      .addEventListener("click", closeCheckout);

    modal
      .querySelector("#checkoutPaymentForm")
      .addEventListener("submit", async function (event) {
        event.preventDefault();

        var phoneInput = modal.querySelector("#checkoutPhone");
        var payButton = modal.querySelector("#checkoutPayButton");
        var status = modal.querySelector("#checkoutStatus");

        customerName = modal.querySelector("#checkoutName").value.trim();
        var customerEmail = modal.querySelector("#checkoutEmail").value.trim();

        if (!customerName) {
          status.textContent = "Please enter your full name.";
          return;
        }

        if (
          customerEmail &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
        ) {
          status.textContent = "Enter a valid email address.";
          return;
        }

        var phone = phoneInput.value.replace(/[\s+()-]/g, "");

        if (/^0[17]\d{8}$/.test(phone)) {
          phone = "254" + phone.substring(1);
        }

        if (!/^254[17]\d{8}$/.test(phone)) {
          status.textContent = "Enter a valid Kenyan M-PESA phone number.";
          return;
        }

        payButton.disabled = true;
        payButton.textContent = "Sending payment request...";
        status.textContent = "Connecting to Safaricom...";

        try {
          var response = await fetch(
            APP_CONFIG.apiBaseUrl + "/api/payment/stkpush",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                phone: phone,
                ticketType: booking.ticketType,
                sectionId: booking.sectionId,
                hospitalityType: booking.hospitalityType,
                quantity: qty,
              }),
            },
          );

          var result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ||
                result.error ||
                "Unable to initiate M-PESA payment.",
            );
          }

          currentOrderId = result.orderId;
          currentAccessToken = result.accessToken;
          currentPaymentStatus = "PENDING";
          updateCheckoutProgress(3);

          var waitingScreen = modal.querySelector("#checkoutWaiting");

          var maskedPhone = phone.substring(0, 5) + "***" + phone.slice(-3);

          modal.querySelector("#waitingPhone").textContent = maskedPhone;
          modal.querySelector("#waitingOrder").textContent = currentOrderId;
          modal.querySelector("#waitingSection").textContent =
            booking.selection ||
            booking.sectionId ||
            booking.hospitalityType ||
            "General Admission";
          modal.querySelector("#waitingAmount").textContent =
            money(booking.total) +
            " for " +
            qty +
            (qty === 1 ? " ticket" : " tickets");

          waitingScreen.style.display = "block";

          var cancelButton = modal.querySelector("#checkoutCancel");

          cancelButton.onclick = function () {
            if (
              currentPaymentStatus === "PENDING" ||
              currentPaymentStatus === "PENDING_VERIFICATION"
            ) {
              modal.querySelector("#waitingMessage").textContent =
                "Your payment request may still be active. Do not start another payment until its status is resolved.";
              return;
            }

            modal.remove();
          };

          var checkAgainButton = modal.querySelector("#checkoutCheckAgain");

          checkAgainButton.onclick = async function () {
            checkAgainButton.disabled = true;
            checkAgainButton.textContent = "Checking...";

            var waitingMessage = modal.querySelector("#waitingMessage");

            try {
              var response = await fetch(
                APP_CONFIG.apiBaseUrl +
                  "/api/payment/status/" +
                  encodeURIComponent(currentOrderId),
                {
                  method: "GET",
                  cache: "no-store",
                  headers: {
                    "X-Payment-Token": currentAccessToken,
                  },
                },
              );

              var payment = await response.json();

              if (!response.ok || !payment.success) {
                throw new Error(payment.message || "Unable to check payment.");
              }

              currentPaymentStatus = payment.status;

              if (payment.status === "SUCCESS") {
                renderCheckoutSuccess(payment);
                checkAgainButton.disabled = true;
                checkAgainButton.textContent = "Payment confirmed";
                return;
              } else if (payment.status === "FAILED") {
                modal.querySelector("#checkoutWaiting").style.display = "none";
                updateCheckoutProgress(2);
                modal.querySelector("#checkoutDetailsLayout").style.display =
                  "grid";
                modal
                  .querySelector("#checkoutPaymentForm")
                  .closest("section").style.display = "block";
                payButton.disabled = false;
                payButton.textContent = "Try payment again";
                waitingMessage.textContent =
                  "Payment failed. Check your M-PESA messages.";
              } else if (payment.status === "PENDING_VERIFICATION") {
                waitingMessage.textContent =
                  "Payment is undergoing additional verification. Please wait.";
              } else {
                waitingMessage.textContent =
                  "Waiting for confirmation from M-PESA. Keep this page open.";
              }
            } catch (error) {
              waitingMessage.textContent = error.message;
            } finally {
              checkAgainButton.disabled = currentPaymentStatus === "SUCCESS";
              checkAgainButton.textContent =
                currentPaymentStatus === "SUCCESS"
                  ? "Payment confirmed"
                  : "Check again";
            }
          };

          modal
            .querySelector("#checkoutPaymentForm")
            .closest("section").style.display = "none";

          status.textContent =
            "STK Push sent. Check your phone and enter your M-PESA PIN.";

          payButton.textContent = "Waiting for payment...";

          await monitorTalantaPayment(
            result.orderId,
            result.accessToken,
            modal.querySelector("#waitingMessage"),
            payButton,
            renderCheckoutSuccess,
            function (payment) {
              currentPaymentStatus = payment.status;
              if (payment.status === "FAILED") {
                modal.querySelector("#checkoutWaiting").style.display = "none";
                updateCheckoutProgress(2);
                modal.querySelector("#checkoutDetailsLayout").style.display =
                  "grid";
                modal
                  .querySelector("#checkoutPaymentForm")
                  .closest("section").style.display = "block";
                payButton.disabled = false;
                payButton.textContent = "Try payment again";
                status.textContent =
                  "The previous payment was marked as failed. You may retry.";
              } else if (payment.status === "PENDING_VERIFICATION") {
                modal.querySelector("#waitingMessage").textContent =
                  "Your payment is undergoing additional verification. Do not submit another payment.";
              }
            },
          );
        } catch (error) {
          status.textContent = error.message;
          payButton.disabled = false;
          payButton.textContent =
            "PAY KSh " + Number(booking.total).toLocaleString("en-KE");
        }
      });
  }

  /* ----------------------------------------------------------
     Ticket page event listeners
     ---------------------------------------------------------- */
  function bindLevelButtons() {
    document.querySelectorAll(".level-button").forEach(function (button) {
      button.addEventListener("click", function () {
        changeLevel(button.getAttribute("data-level"));
      });
    });
  }

  function bindSortButtons() {
    document.querySelectorAll(".sort-button").forEach(function (button) {
      button.addEventListener("click", function () {
        sortMode = button.getAttribute("data-sort");
        document.querySelectorAll(".sort-button").forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        renderSectionList();
      });
    });
  }

  function bindQuantityButtons() {
    if (elements.increaseQuantity) {
      elements.increaseQuantity.addEventListener("click", function () {
        changeQuantity(1);
      });
    }
    if (elements.decreaseQuantity) {
      elements.decreaseQuantity.addEventListener("click", function () {
        changeQuantity(-1);
      });
    }
  }

  function bindHospitalityButtons() {
    document.querySelectorAll(".hospitality-option").forEach(function (button) {
      button.addEventListener("click", function () {
        selectHospitality(button);
      });
    });
  }

  function bindZoomButtons() {
    if (elements.zoomIn)
      elements.zoomIn.addEventListener("click", function () {
        changeZoom(0.15);
      });
    if (elements.zoomOut)
      elements.zoomOut.addEventListener("click", function () {
        changeZoom(-0.15);
      });
    if (elements.resetZoom)
      elements.resetZoom.addEventListener("click", resetZoom);
  }

  function bindBookingButtons() {
    if (elements.findSeats) {
      elements.findSeats.addEventListener("click", findAvailableSeats);
    }
    if (elements.continueBooking) {
      elements.continueBooking.addEventListener("click", continueBooking);
    }
    if (elements.eventSelect) {
      elements.eventSelect.addEventListener("change", resetSelectionForEvent);
    }
  }

  /* ----------------------------------------------------------
     Initialize ticket page
     ---------------------------------------------------------- */
  function bindTicketingEvents() {
    bindLevelButtons();
    bindSortButtons();
    bindQuantityButtons();
    bindHospitalityButtons();
    bindZoomButtons();
    bindBookingButtons();
  }

  bindTicketingEvents();
  setLevelButtons();
  drawStadium();
  renderSectionList();
  updateSummary();

  console.log(
    "TALANTA TICKETING ENGINE INITIALIZED — " +
      sections.length +
      " demo sections",
  );
}

async function monitorTalantaPayment(
  orderId,
  accessToken,
  statusElement,
  button,
  onSuccess,
  onStatus,
) {
  if (!orderId || !accessToken) {
    statusElement.textContent =
      "Payment reference or security token missing. Contact support before retrying.";
    return;
  }

  for (var attempt = 0; attempt < 40; attempt += 1) {
    await new Promise(function (resolve) {
      setTimeout(resolve, 3000);
    });

    try {
      var response = await fetch(
        APP_CONFIG.apiBaseUrl +
          "/api/payment/status/" +
          encodeURIComponent(orderId),
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "X-Payment-Token": accessToken,
          },
        },
      );

      var payment = await response.json();

      if (!response.ok || !payment.success) {
        if (response.status === 404) {
          statusElement.textContent =
            "Payment status could not be authenticated. Contact support with your order reference.";
          return;
        }

        throw new Error(payment.message || "Unable to check payment status");
      }

      if (typeof onStatus === "function") {
        onStatus(payment);
      }

      if (payment.status === "SUCCESS") {
        if (typeof onSuccess === "function") {
          onSuccess(payment);
        }
        var ticketCodes = Array.isArray(payment.tickets) ? payment.tickets : [];

        var ticketText = ticketCodes.length
          ? "\nYour ticket code" +
            (ticketCodes.length > 1 ? "s" : "") +
            ":\n" +
            ticketCodes
              .map(function (ticket) {
                return ticket.ticketCode;
              })
              .join("\n")
          : "\nYour tickets are confirmed. If the codes do not appear, contact support with your order reference.";

        statusElement.textContent =
          "Payment confirmed" +
          (payment.mpesaReceiptNumber
            ? " (Receipt: " + payment.mpesaReceiptNumber + ")"
            : ".") +
          ticketText;

        button.textContent = "Payment confirmed";
        button.disabled = true;
        return;
      }

      if (payment.status === "FAILED") {
        statusElement.textContent =
          "Payment was not completed. Contact support if you received an M-PESA debit message.";

        button.disabled = false;
        button.textContent = "Try Again";
        return;
      }

      if (payment.status === "PENDING_VERIFICATION") {
        statusElement.textContent =
          "Your payment request needs additional verification. Do not submit another payment yet.";
      } else {
        statusElement.textContent =
          "Waiting for Safaricom payment confirmation...";
      }
    } catch (error) {
      statusElement.textContent =
        "Payment status check interrupted. Your payment may still be processing; do not submit another request yet.";
    }
  }

  statusElement.textContent =
    "Final confirmation has not arrived. Check your M-PESA messages and contact support before retrying.";

  button.textContent = "Check pending payment";
}

/* ============================================================
   LEGAL POLICIES — REUSABLE DROP-UP PANEL
   ============================================================ */
function initializeLegalDropup() {
  if (document.getElementById("tscLegalPanel")) return;

  var panel = document.createElement("section");
  panel.id = "tscLegalPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "tscLegalTitle");

  panel.innerHTML = `
    <div class="tsc-legal-header">
      <h3 id="tscLegalTitle">Terms & Conditions</h3>
      <button class="tsc-legal-close" type="button" aria-label="Close policy">&times;</button>
    </div>
    <div class="tsc-legal-content" id="tscLegalContent"></div>
  `;

  document.body.appendChild(panel);

  var content = panel.querySelector("#tscLegalContent");
  var title = panel.querySelector("#tscLegalTitle");
  var closeButton = panel.querySelector(".tsc-legal-close");
  var activeTrigger = null;

  var policies = {
    terms: {
      title: "Terms & Conditions",
      html: `
        <h4>1. About these terms</h4>
        <p>These terms govern your use of the Talanta Sports City platform and its ticketing services. By using the platform or purchasing a ticket, you agree to the applicable terms.</p>

        <h4>2. Ticket purchases</h4>
        <p>Tickets are subject to availability. Prices are displayed in Kenyan Shillings (KES). Check the selected event, ticket category, quantity and total amount before confirming your order.</p>
        <p>An order is not confirmed merely because a payment request has been initiated. Confirmation follows successful payment verification.</p>

        <h4>3. M-PESA payments</h4>
        <p>Payments may be processed through Safaricom M-PESA. An STK Push may be sent to the phone number supplied during checkout.</p>
        <ul>
          <li>Only approve a payment you have personally requested.</li>
          <li>Check the amount displayed on your phone before entering your M-PESA PIN.</li>
          <li>Never share your M-PESA PIN or one-time security codes with anyone.</li>
          <li>Talanta Sports City will not ask you to disclose your M-PESA PIN.</li>
          <li>A pending payment is not a confirmed payment. Wait for confirmation before attempting another payment.</li>
        </ul>

        <h4>4. Ticket delivery and validity</h4>
        <p>Tickets are issued after successful payment verification. Keep your ticket and order information secure. A ticket may be refused if it is altered, duplicated, invalid, cancelled or obtained fraudulently.</p>

        <h4>5. Admission and venue rules</h4>
        <p>Admission is subject to the event's entry requirements, venue security procedures and any published event-specific rules. You may be required to present a valid ticket and cooperate with security checks.</p>
        <p>Unless an event explicitly states otherwise, re-entry is not permitted after leaving the venue.</p>

        <h4>6. Event changes and cancellations</h4>
        <p>Event schedules, performers, facilities and arrangements may change. Where an event is cancelled or materially changed, applicable refund or alternative arrangements will be communicated in accordance with the law and the event's published instructions.</p>
        <p>Any refund request remains subject to applicable consumer protection requirements and the circumstances of the event.</p>

        <h4>7. Prohibited conduct</h4>
        <p>You must not misuse the platform, attempt unauthorized access, interfere with payment or ticket systems, resell tickets unlawfully, or use fraudulent payment details.</p>

        <h4>8. Platform content</h4>
        <p>Platform text, graphics, branding and other materials are protected by applicable intellectual property laws. They may not be copied or commercially reused without permission.</p>

        <h4>9. Service availability and liability</h4>
        <p>We aim to keep the platform reliable and secure but cannot guarantee uninterrupted availability. Nothing in these terms excludes liability where exclusion is prohibited by law.</p>

        <h4>10. Applicable law and updates</h4>
        <p>These terms are governed by the applicable laws of Kenya. We may update them when necessary. The version displayed on the platform at the time of use applies, subject to applicable law.</p>
      `,
    },

    privacy: {
      title: "Privacy Policy",
      html: `
        <h4>1. Introduction</h4>
        <p>This policy explains how Talanta Sports City handles personal information when you use the platform, purchase tickets or interact with its services.</p>

        <h4>2. Information we collect</h4>
        <p>Depending on how you use the platform, information may include:</p>
        <ul>
          <li>Your name, email address and phone number.</li>
          <li>Ticket selections, order references and booking details.</li>
          <li>Payment status, transaction references and M-PESA receipt details.</li>
          <li>Technical information such as browser, device and usage data.</li>
          <li>Information you provide when requesting assistance.</li>
        </ul>

        <h4>3. How we use your information</h4>
        <p>Information may be used to process orders, request and verify payments, issue tickets, provide customer support, prevent fraud, maintain platform security, improve services and comply with legal obligations.</p>

        <h4>4. Lawful processing</h4>
        <p>Personal information is processed where necessary to provide a requested service, fulfil legal obligations, pursue legitimate interests or obtain consent where required by law.</p>

        <h4>5. Sharing information</h4>
        <p>Information may be shared where necessary with Safaricom and payment service providers, hosting and database providers, relevant event or venue operators, and authorized public authorities where legally required.</p>
        <p>We do not sell personal information to third parties.</p>

        <h4>6. Storage and international transfers</h4>
        <p>Information may be stored using service providers whose systems are located in Kenya or other countries. Where applicable, appropriate safeguards will be used for transfers in accordance with data protection requirements.</p>

        <h4>7. Data retention</h4>
        <p>We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including transaction records, security, dispute resolution and legal compliance.</p>

        <h4>8. Security</h4>
        <p>Reasonable technical and organizational measures are used to protect personal information. No online service can guarantee absolute security, so users should also protect their devices, accounts and payment credentials.</p>

        <h4>9. Your privacy rights</h4>
        <p>Subject to applicable Kenyan data protection law, you may have rights to request access to your personal information, correction of inaccurate information, deletion where applicable, objection to certain processing, restriction of processing and withdrawal of consent where processing relies on consent.</p>
        <p>You may also lodge a complaint with the Office of the Data Protection Commissioner in Kenya.</p>

        <h4>10. Cookies and local storage</h4>
        <p>The platform may use cookies or browser storage to support essential functionality, remember preferences and improve the user experience. You can manage browser storage through your browser settings, although some features may stop working correctly.</p>

        <h4>11. Children</h4>
        <p>The platform is not intended to collect children's personal information without appropriate authorization or another lawful basis. A parent or guardian should contact the platform through its official support channel if they believe a child has provided personal information improperly.</p>

        <h4>12. Policy updates</h4>
        <p>This policy may be updated when services or legal requirements change. The latest version will be published on the platform.</p>
      `,
    },
  };

  function closePanel(restoreFocus) {
    panel.classList.remove("is-open");

    if (activeTrigger) {
      activeTrigger.setAttribute("aria-expanded", "false");
    }

    var previousTrigger = activeTrigger;
    activeTrigger = null;

    if (restoreFocus && previousTrigger) {
      previousTrigger.focus();
    }
  }

  function positionPanel(trigger) {
    if (!trigger || !panel.classList.contains("is-open")) return;

    var rect = trigger.getBoundingClientRect();
    var panelWidth = panel.offsetWidth;
    var panelHeight = panel.offsetHeight;

    var left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));

    var top = rect.top - panelHeight - 10;
    top = Math.max(10, top);

    panel.style.left = left + "px";
    panel.style.top = top + "px";
  }

  function openPanel(trigger, policyName) {
    var policy = policies[policyName];
    if (!policy) return;

    content.innerHTML = policy.html;
    title.textContent = policy.title;

    if (activeTrigger) {
      activeTrigger.setAttribute("aria-expanded", "false");
    }

    activeTrigger = trigger;
    activeTrigger.setAttribute("aria-expanded", "true");
    activeTrigger.setAttribute("aria-controls", "tscLegalPanel");

    panel.classList.add("is-open");
    positionPanel(trigger);
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-policy]");

    if (trigger) {
      event.preventDefault();

      var policyName = trigger.getAttribute("data-policy");

      if (activeTrigger === trigger && panel.classList.contains("is-open")) {
        closePanel(false);
      } else {
        openPanel(trigger, policyName);
      }
      return;
    }

    if (panel.classList.contains("is-open") && !panel.contains(event.target)) {
      closePanel(false);
    }
  });

  closeButton.addEventListener("click", function () {
    closePanel(true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      closePanel(true);
    }
  });

  window.addEventListener("resize", function () {
    if (activeTrigger) positionPanel(activeTrigger);
  });

  window.addEventListener(
    "scroll",
    function () {
      if (activeTrigger) positionPanel(activeTrigger);
    },
    true,
  );
}

/* ============================================================
   17. APPLICATION INITIALIZATION
   ============================================================ */
function initializeApp() {
  if (!app) {
    console.error('TALANTA: missing required element with id="app".');
    return;
  }

  bindGlobalEvents();
  initializeTheme();
  initializeLegalDropup();

  var hash = location.hash;
  var initialRoute = hash === APP_CONFIG.ticketHash ? "tickets" : "home";
  state.route = initialRoute;

  if (initialRoute === "tickets") {
    renderTicketPage();
  } else {
    renderHomePage();
    var initialSection = hash.replace(/^#/, "");
    var supportedSections = [
      "home",
      "stadium",
      "events",
      "hospitality",
      "gallery",
      "location",
      "faq",
      "tickets",
    ];
    if (
      supportedSections.indexOf(initialSection) !== -1 &&
      initialSection !== "tickets"
    ) {
      window.setTimeout(function () {
        var target = document.getElementById(initialSection);
        if (target)
          target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
