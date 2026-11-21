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
  homeRoute: "home",
  ticketRoute: "tickets",
  ticketHash: "#tickets-view",
  homeHash: "#home",
  slideDuration: 7000
};

/* ============================================================
   02. APPLICATION STATE
   ============================================================ */
var app = document.getElementById("app");
var state = {
  route: "home"
};
var slideTimer = null;
var globalEventsBound = false;

/* ============================================================
   THEME PREFERENCE — LIGHT / DARK
   ============================================================ */
function getSavedTheme() {
  try {
    return localStorage.getItem("talanta-theme") === "dark" ? "dark" : "light";
  } catch (error) {
    return "light";
  }
}

function applyTheme(theme) {
  var selectedTheme = theme === "dark" ? "dark" : "light";
  document.body.setAttribute("data-theme", selectedTheme);
  document.documentElement.setAttribute("data-theme", selectedTheme);

  try {
    localStorage.setItem("talanta-theme", selectedTheme);
  } catch (error) {
    // Theme still works for the current page when storage is unavailable.
  }

  var themeButton = document.getElementById("themeToggle");
  if (themeButton) {
    var isDark = selectedTheme === "dark";
    themeButton.textContent = isDark ? "☀" : "☾";
    themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeButton.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeButton.setAttribute("aria-pressed", String(isDark));
  }
}

function initializeTheme() {
  applyTheme(getSavedTheme());
}

/* ============================================================
   03. HTML TEMPLATES — REUSABLE COMPONENTS
   ============================================================ */


function renderEmblem(className) {
  var safeClass = String(className || "stadium-emblem").replace(/[^a-zA-Z0-9_-]/g, "");
  return '' +
    '<svg aria-hidden="true" class="' + safeClass + '" data-testid="stadium-mark" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 319.5 111" preserveAspectRatio="xMidYMid meet">' +
    '        <path d="M136.5,17s-8.7,9.1-12.2,16.9c0,0,6.2,13.2.3,30.2,0,0,6.3,11.4,12.3,18.5,0,0,6.9-10,12-19.3,0,0-8.2-12.1-.6-31.6,0,0-4.8-9.5-11.8-14.6Z" fill="#be0000">\'' +
    '        </path>\'' +
    '        <path d="M246.7,25.8s-1.7,5.9-4.2,13.4c0,0,8,13-1.2,26.6l5.5,16.5s5.8-7.9,10.5-18.8c0,0-1.5-5,0-18.4,0,0-1.7-12.5-10.6-19.3Z" fill="#be0000">\'' +
    '        </path>\'' +
    '        <path d="M47,40c-1.1,2.7-3.6,8.9-4.5,12.1,0,0,1.6,11.4.1,16.4,0,0,1.5,9.8,6.7,15.3l.2-13.5s-3.6-2-3.1-11.5,2.6-10.9,2.6-10.9c0,0-.8-5.1-1.2-7.7s-.6-.5-.7,0Z" fill="#be0000">\'' +
    '        </path>\'' +
    '        <ellipse cx="136.5" cy="47.6" fill="#fff" rx="3.6" ry="2.5" transform="translate(87.6 183.7) rotate(-89.5)">\'' +
    '        </ellipse>\'' +
    '        <path d="M137.9,20.1l-.8,22.2s2.8-4.6,3.4-11.4-1.2-9.4-2.6-10.8Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M136.4,20l-.8,22.3s-2.8-6.3-2.5-11.4,1.1-8.8,3.3-11Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M137.3,53.1l.3,24s2.3-4.2,2.7-12.7-3-11.3-3-11.3Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M135.2,52.9l.7,24.2s-3.8-7.4-3.4-15.4,2.7-8.8,2.7-8.8Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M251.4,49.3s-1.7,0-1.9,2.3,1.1,4.8,2.4,4.5,2.3-5.8-.6-6.9Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M252,57.4c-.3,2.5-1.6,14.2-3.5,19.4,0,.2.2.2.3.1,1-1.6,2.9-5,3.9-9.8s0-8.6-.4-9.7-.3,0-.3,0Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M250.7,56.5s-1.3,14.8-3.8,20.8c0,0-1.5-9.4,3.8-20.8Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M249,29.5c1.5,2.7,5,10.3,2.9,19.1,0,0-1.5-14.1-3-19s.1-.2.2,0Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M247.1,29.1c.6,2.3,2.8,12,3.1,19.2,0,0-4.5-11-3.3-19.2s.2-.1.2,0Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M47.2,41.5s-1.5,10.4-2.4,15.4c0,0-2.5-4.5,2.4-15.4Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M44.7,64.5c-.3-1.9,1.6,4.2,3.3,15.3.3,2.1-3.5-2.1-3.3-15.3Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M44.5,58.1s-.6,1.8-.5,2.7.2,1.1.3,1.8.5.3.6,0c.1-.6.3-1.4.2-2.3,0-1.8,0-2.9-.6-2.2Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M62.1,56.6c-.3-1.2-2.4-10.6-2.3-18.3-2.2,5.4-7,17.4-7.3,21.8-.3,4.5,5.7,16.3,8.2,21-.3-4.9-.8-16.6,1.4-24.5Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M72.9,28.8l-10.8,4.3c0,1.7-.4,10.7,1.5,19.1,1.2-4.4,4.7-16,9.2-23.5Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M74.2,32c-2.2,4.6-8.3,18.3-9,25.1.4,1.2,4.4,13.7,10.3,22.5.2-3.9,1-15.3,4.7-26.6-.6-1.4-5-11.4-6-21.1Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M76.9,27.3c0,1.9-.3,11.9,4.4,21.8,1.5-3.9,6.9-17.6,13.8-26.4-2.6.5-8.9,1.9-18.2,4.7Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M59.1,34.2l-8.9,4.4c0,1.2-.4,6.5,1.3,14.9,1.1-3.3,3.6-10.9,7.6-19.3Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M59.7,84.6c-4.9-8.5-7.2-14.8-8.2-18.1-.5,7.3-.2,16.1,0,18.2h8.2Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M63.4,84.5h11.4c-1.6-2.7-7.3-12.1-10.6-21.8-.6,3.9-1.9,13.2-.8,21.8Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M98,84.2c-2.1-3.2-10.6-16.4-16.3-28-.4,1.8-1.1,5.2-1.7,9.2-.8,5.3-1.7,12.9-1.2,18.9l19.2-.2Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M97.6,23.4c-2.9,3.8-8.9,13.8-14.3,28.9.6,2.8,4.8,11.9,16.2,26.9.9-3.2,4.6-14.4,12.9-28.9-1.5-2.3-11.9-18.9-14.9-26.8Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M100,21.9c.6,1.7,3.2,8.2,14.2,25.1,1.1-3,5.2-12.7,17.8-29.1-4.6.4-22.8,2-32,3.9Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M101.5,84.2c1.6,0,4.8-.1,9.6-.2,8.7,0,20.1,0,23.7,0-3.3-3.5-7.7-9.6-13-18.3-3.4-5.6-6.3-10.6-7.3-12.5-6.4,10.5-11.9,27.5-13,31Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M178.3,17.8c-3.7-.2-19.6-.8-29.8-.7s-4.8,0-6.3.2c.9,1.1,2.7,3.4,5.1,7.1,3,4.6,7.4,12.2,11.8,22.5,2.5-3.5,13.6-19.6,19.2-29.1Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M196.9,42.4c-2.8-4.8-7.9-12.8-16.1-23.3-2.6,4.1-17.2,27.2-19.4,30.4l20.2,31.7c2.4-3.3,14.2-20.3,19.6-30.9-.3-.7-1.5-3.4-4.2-7.9Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M215.1,21.8c-3.4-.5-21.6-3.4-31-3.7,2.9,3.9,15.5,21,19.2,30.3,1.9-3.6,8.7-16.8,11.8-26.6Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M215,83.1c-.7-2.9-4.4-16.1-12-29.5-1.9,3.4-9.8,17.5-20.3,29.8l32.3-.3Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M217.2,22.7c-.9,3.3-4.3,15-12,28,.5,1,2.6,5.2,5,10.4,2.4,5.3,5.5,12.9,7.2,19.3,2.1-3.4,9.4-15.2,16.3-27.7-1-2.2-9.4-21-16.4-30.1Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M179,83.5l-19.9-31c-6.3,12-17.1,27.8-19.6,31.4l39.5-.4Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M244.8,26.4c-2.2-.5-12.6-2.6-24.9-4,2.3,2.4,7.9,9.5,15.7,27.7,1.8-4.2,8.3-19.9,9.2-23.7Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M219.4,83.1l24.9-.2c-1-3.2-5.4-18-9.1-27.4-1.7,3.6-7.7,16.2-15.9,27.6Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M267,31.6c-.5,4.3-2.5,18.6-4.5,23.3.7,1.6,5.5,12.8,6.2,25.8,2.3-4.3,8.5-16.4,10.4-22.1-.2-1.2-2-13.2-12-26.9Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M282.8,58.3c.3,1.3,2.6,12.2,2.1,20.9,1.7-4.4,4.6-12.5,4.7-17.8.1-7.1-2.5-18.3-6.4-24.1.5,3.9,1.4,13.4-.5,21.1Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M270.3,82.6h12.5c.1-1.8.5-8.7-2.1-20.5-1.6,3.9-6.4,14.7-10.4,20.5Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M280.9,35.2l-11.2-3.9c1.1,1.5,3,4.2,5,7.5,3.2,5.4,5.4,10.1,6.4,14,.5-4.2,1.1-12.1-.2-17.6Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M266.4,82.7c-1-7.9-4.2-19.1-5.5-23.6-.8,3.8-3,8.7-6.4,14.8-2.3,4.1-4.6,7.5-5.6,9l17.6-.2Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M261,50.5c2-7.1,2.9-18.3,3.1-20.6l-13.5-2.7c3.1,2.9,5.8,7.7,8,14.3,1.2,3.6,2,7,2.4,8.9Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M36.2,56.9c-.6,3.2-1,6.7-1,9.7.1,5.1,1.4,10.4,2.4,13.9l-1.3-13.1c0,0-.5-4.7-.2-10.6Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M45.1,41.6l-4.7,3.3s-2,9.3-1.4,16.3c1.4-8.6,6-19.6,6-19.6Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <path d="M40.7,84.8h6.6c-2.1-3.7-5.9-13.8-7.5-18.1-.7,7.8.6,16.2.9,18.1Z" fill="#fff">\'' +
    '        </path>\'' +
    '        <polygon fill="#fff" points="14.7 88.6 305.3 88.6 300.8 85.6 21.5 87.6 14.7 88.6">\'' +
    '        </polygon>\'' +
    '</svg>';
}

function renderHeader() {
  return '' +
    '<header class="header" id="home">' +
    '  <div class="container nav-container">' +
    '    <a class="logo" href="#home" aria-label="Talanta Sports City home">' +
         renderEmblem('header-emblem') +
    '    </a>' +
    
    '    <nav class="navigation" id="navigation">' +
    '      <a href="#home">' +
    '        Home' +
    '      </a>' +
    '      <a href="#stadium">' +
    '        The Stadium' +
    '      </a>' +
    '      <a href="#events">' +
    '        Events' +
    '      </a>' +
    '      <a href="#hospitality">' +
    '        Hospitality' +
    '      </a>' +
    '      <a href="#gallery">' +
    '        Gallery' +
    '      </a>' +
    '      <a href="#location">' +
    '        Visit Us' +
    '      </a>' +
    '    </nav>' +
    '    <a class="nav-button" data-route="tickets" href="#tickets-view">' +
    '      Buy Tickets' +
    '    </a>' +
    '    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark theme" title="Switch to dark theme" aria-pressed="false">☾</button>' +
    '    <button aria-label="Toggle navigation" class="menu-toggle" id="menuToggle">' +
    '       ☰' +
    '    </button>' +
    '  </div>' +
    '</header>';
}

function renderTicketHeader() {
  return '' +
    '<header class="header" id="home">' +
    '  <div class="container nav-container">' +
    '    <a class="logo" data-route="home" href="#home" aria-label="Talanta Sports City home">' +
         renderEmblem('header-emblem') +
    '    </a>' +
    '    <nav class="navigation" id="navigation">' +
    '      <a data-route="home" data-section="home" href="#home">' +
    '        Home' +
    '      </a>' +
    '      <a data-route="home" data-section="stadium" href="#stadium">' +
    '        The Stadium' +
    '      </a>' +
    '      <a data-route="home" data-section="events" href="#events">' +
    '        Events' +
    '      </a>' +
    '      <a data-route="home" data-section="hospitality" href="#hospitality">' +
    '        Hospitality' +
    '      </a>' +
    '      <a data-route="home" data-section="gallery" href="#gallery">' +
    '        Gallery' +
    '      </a>' +
    '      <a data-route="home" data-section="location" href="#location">' +
    '        Visit Us' +
    '      </a>' +
    '    </nav>' +
    '    <a class="nav-button" data-route="tickets" href="#tickets-view">' +
    '      Buy Tickets' +
    '    </a>' +
    '    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch to dark theme" title="Switch to dark theme" aria-pressed="false">☾</button>' +
    '    <button aria-label="Toggle navigation" class="menu-toggle" id="menuToggle">' +
    '       ☰' +
    '    </button>' +
    '  </div>' +
    '</header>';
}

function renderHero() {
  return '' +
    '<section class="hero">' +
    '  <img alt="Footballer shooting a ball" class="hero-player" src="assets/images/ashoot.png"/>' +
    '  <div class="hero-overlay">' +
    '  </div>' +
    '  <div class="container hero-content">' +
    '    <span class="eyebrow">' +
    '      WELCOME TO TALANTA SPORTS CITY' +
    '    </span>' +
    '    <h1>' +
    '      WHERE KENYA' +
    '      <br/>' +
    '      MEETS THE WORLD.' +
    '    </h1>' +
    '    <p>' +
    '       Experience the passion of sport, entertainment' +
    '       and unforgettable moments at Kenya\'s premier' +
    '       sporting destination.' +
    '    </p>' +
    '    <div class="hero-buttons">' +
    '      <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    '        Explore Tickets' +
    '      </a>' +
    '      <a class="btn btn-outline" href="#stadium">' +
    '        Discover Stadium' +
    '      </a>' +
    '    </div>' +
    '  </div>' +
    '  <div class="hero-bottom">' +
    '    <span>' +
    '      RAILA ODINGA INTERNATIONAL STADIUM' +
    '    </span>' +
    '    <span>' +
    '      NAIROBI · KENYA' +
    '    </span>' +
    '  </div>' +
    '</section>';
}

function renderFeaturedEvent() {
  return '' +
    '<section class="featured-event" id="events">' +
    '  <div class="container event-container">' +
    '    <div>' +
    '      <span class="eyebrow">' +
    '        UPCOMING FEATURED EVENT' +
    '      </span>' +
    '      <h2>' +
    '        Bayern Munich ' +
    '        <span>' +
    '          VS' +
    '        </span>' +
    '         Ajax' +
    '      </h2>' +
    '      <p>' +
    '        Tuesday, 5 January 2027 · Nairobi, Kenya' +
    '      </p>' +
    '    </div>' +
    '    <div class="badges">' +
    '      <span class="bayern">' +
    '        <img alt="Bayern Munich" src="assets/images/bayern.png"/>' +
    '      </span>' +
    '      <div class="vs">' +
    '        VS' +
    '      </div>' +
    '      <span class="ajax">' +
    '        <img alt="Ajax" src="assets/images/ajax.png"/>' +
    '      </span>' +
    '    </div>' +
    '    <div class="event-action">' +
    '      <span>' +
    '        Tickets from ' +
    '        <strong>' +
    '          KSh 2,500' +
    '        </strong>' +
    '      </span>' +
    '      <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    '        Buy Tickets →' +
    '      </a>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}

function renderStadium() {
  return '' +
    '<section class="stadium section-padding" id="stadium">' +
    '  <div class="container stadium-grid">' +
    '    <div class="stadium-info">' +
    '      <span class="eyebrow">' +
    '        THE STADIUM' +
    '      </span>' +
    '      <h2>' +
    '        RAILA ODINGA' +
    '        <br/>' +
    '        International Stadium' +
    '      </h2>' +
    '      <p>' +
    '         Welcome to a 60,000-seat destination built for the' +
    '         passion of sports and the energy of live entertainment.' +
    '         This is where Kenya\'s sporting ambition meets the world.' +
    '      </p>' +
    '      <div class="stats">' +
    '        <div>' +
    '          <strong>' +
    '            60,000' +
    '          </strong>' +
    '          <span>' +
    '            Seats' +
    '          </span>' +
    '        </div>' +
    '        <div>' +
    '          <strong>' +
    '            NAIROBI' +
    '          </strong>' +
    '          <span>' +
    '            Kenya' +
    '          </span>' +
    '        </div>' +
    '        <div>' +
    '          <strong>' +
    '            2027' +
    '          </strong>' +
    '          <span>' +
    '            AFCON Co-host' +
    '          </span>' +
    '        </div>' +
    '      </div>' +
    '      <a class="text-link" href="#location">' +
    '        Discover the Stadium →' +
    '      </a>' +
    '    </div>' +
    '    <div class="stadium-image">' +
    '      <img alt="Raila Odinga International Stadium" src="assets/images/stadium.jpg"/>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}

function renderHospitality() {
  return '' +
    '<section class="hospitality section-padding" id="hospitality">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    '        EXCLUSIVE EXPERIENCES' +
    '      </span>' +
    '      <h2>' +
    '        Hospitality' +
    '      </h2>' +
    '      <p>' +
    '        Experience match day with premium comfort and exclusive access.' +
    '      </p>' +
    '    </div>' +
    '    <div class="hospitality-grid">' +
    '      <!-- GOLD EXPERIENCE -->' +
    '      <article class="hospitality-card gold-card">' +
    '        <div class="tier-badge">' +
    '          PREMIUM' +
    '        </div>' +
    '        <img alt="Gold luxury stadium hospitality suite" src="assets/images/talanta-15.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    '            ♛   SECTIONS F01–F05' +
    '          </span>' +
    '          <h2>' +
    '            GOLD' +
    '          </h2>' +
    '          <p>' +
    '            Elevated match-day hospitality and exclusive suite access.' +
    '          </p>' +
    '          <a href="#tickets">' +
    '            Discover Gold →' +
    '          </a>' +
    '        </div>' +
    '      </article>' +
    '      <!-- PLATINUM EXPERIENCE -->' +
    '      <article class="hospitality-card platinum-card">' +
    '        <div class="tier-badge">' +
    '          ELITE' +
    '        </div>' +
    '        <span aria-label="Coming soon" class="coming-soon-ribbon">' +
    '          <span class="coming-soon-shine">' +
    '          </span>' +
    '        </span>' +
    '        <img alt="Platinum premium stadium lounge" src="assets/images/talanta-16.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    '            ◇   LEVEL 2 · MAIN STAND' +
    '          </span>' +
    '          <h2>' +
    '            PLATINUM' +
    '          </h2>' +
    '          <p>' +
    '            Premium match-day hospitality and exclusive lounge access.' +
    '          </p>' +
    '          <a href="#tickets">' +
    '            Discover Platinum →' +
    '          </a>' +
    '        </div>' +
    '      </article>' +
    '      <!-- SKYBOX EXPERIENCE -->' +
    '      <article class="hospitality-card skybox-card">' +
    '        <div class="tier-badge">' +
    '          VIP' +
    '        </div>' +
    '        <span aria-label="Coming soon" class="coming-soon-ribbon">' +
    '          <span class="coming-soon-shine">' +
    '          </span>' +
    '        </span>' +
    '        <img alt="Private Skybox stadium suite" src="assets/images/skybox.jpg"/>' +
    '        <div class="card-content">' +
    '          <span class="tier-label">' +
    '            ♧   LEVEL 2 · PRIVATE BOXES' +
    '          </span>' +
    '          <h2>' +
    '            SKYBOX' +
    '          </h2>' +
    '          <p>' +
    '            Your own private box with an unforgettable stadium view.' +
    '          </p>' +
    '          <a href="#tickets">' +
    '            Discover Skybox →' +
    '          </a>' +
    '        </div>' +
    '      </article>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}

function renderGallery() {
  return '' +
    '<section class="gallery section-padding" id="gallery">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    '        EXPLORE TALANTA' +
    '      </span>' +
    '      <h2>' +
    '        Inside the Experience' +
    '      </h2>' +
    '    </div>' +
    '    <div class="gallery-grid">' +
    '      <img alt="Stadium exterior" src="assets/images/talanta-9.jpg"/>' +
    '      <img alt="Stadium interior" src="assets/images/talanta-22.jpg"/>' +
    '      <img alt="Stadium seating" src="assets/images/talanta-10.webp"/>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}

function renderTicketPromotion() {
  return '' +
    '<section class="tickets section-padding" id="tickets">' +
    '  <div class="tickets-slideshow">' +
    '    <div class="tickets-slide active" style="background-image:url(\'assets/images/talanta-1.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-2.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-3.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-4.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-5.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-6.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-7.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-8.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-9.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-10.webp\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-11.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-12.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-13.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-14.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-15.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-16.jpg\')">' +
    '    </div>' +
    '    <div class="tickets-slide" style="background-image:url(\'assets/images/talanta-17.jpg\')">' +
    '    </div>' +
    '  </div>' +
    '  <div class="tickets-overlay">' +
    '  </div>' +
    '  <div class="container tickets-content">' +
    '    <span class="eyebrow">' +
    '      BE PART OF THE ACTION' +
    '    </span>' +
    '    <h2>' +
    '      Make Every Moment Count.' +
    '    </h2>' +
    '    <p>' +
    '      Secure your place and experience the excitement of Talanta Sports City.' +
    '    </p>' +
    '    <a class="btn btn-primary" data-route="tickets" href="#tickets-view">' +
    '      Explore Official Tickets →' +
    '    </a>' +
    '  </div>' +
    '</section>';
}

function renderLocation() {
  return '' +
    '<section class="location section-padding" id="location">' +
    '  <div class="container location-grid">' +
    '    <div>' +
    '      <span class="eyebrow">' +
    '        PLAN YOUR VISIT' +
    '      </span>' +
    '      <h2>' +
    '        Getting There' +
    '      </h2>' +
    '      <p>' +
    '        Raila Odinga International Stadium, Talanta Sports City, Ngong Road, Nairobi, Kenya.' +
    '      </p>' +
    '      <a href="https://www.google.com/maps/search/?api=1&amp;query=Raila+Odinga+International+Stadium+Nairobi" rel="noopener" target="_blank">' +
    '        Get Directions →' +
    '      </a>' +
    '    </div>' +
    '    <div class="map-placeholder">' +
    '      <iframe allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Raila%20Odinga%20International%20Stadium%2C%20Nairobi&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="Map showing Raila Odinga International Stadium in Nairobi">' +
    '      </iframe>' +
    '      <a class="map-link" href="https://www.google.com/maps/search/?api=1&amp;query=Raila+Odinga+International+Stadium+Nairobi" rel="noopener" target="_blank">' +
    '        Open Google Maps ↗' +
    '      </a>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}

function renderFAQ() {
  return '' +
    '<section class="faq section-padding" id="faq">' +
    '  <div class="container">' +
    '    <div class="section-heading">' +
    '      <span class="eyebrow">' +
    '        NEED HELP?' +
    '      </span>' +
    '      <h2>' +
    '        Frequently Asked Questions' +
    '      </h2>' +
    '    </div>' +
    '    <div class="faq-list">' +
    '      <details>' +
    '        <summary>' +
    '          How do I get my tickets?' +
    '        </summary>' +
    '        <p>' +
    '          Tickets are delivered digitally after a successful purchase through the official ticketing platform.' +
    '        </p>' +
    '      </details>' +
    '      <details>' +
    '        <summary>' +
    '          Where is Talanta Sports City located?' +
    '        </summary>' +
    '        <p>' +
    '          It is located along Ngong Road in Nairobi, Kenya.' +
    '        </p>' +
    '      </details>' +
    '      <details>' +
    '        <summary>' +
    '          How can I pay for tickets?' +
    '        </summary>' +
    '        <p>' +
    '          Available payment methods are displayed on the official ticketing checkout.' +
    '        </p>' +
    '      </details>' +
    '      <details>' +
    '        <summary>' +
    '          Can I book hospitality packages?' +
    '        </summary>' +
    '        <p>' +
    '          Yes. Gold, Platinum and Skybox hospitality options are available subject to event availability.' +
    '        </p>' +
    '      </details>' +
    '    </div>' +
    '  </div>' +
    '</section>';
}


function renderFooter() {
  return '' +
    '<footer class="talanta-footer">' +
    '  <div class="footer-pattern">' +
    '  </div>' +
    '  <div class="footer-container">' +

    /* FOOTER BRAND */
    '    <div class="footer-brand">' +
         renderEmblem('footer-emblem') +
    '      <h2>' +
    '        TALANTA SPORTS CITY' +
    '      </h2>' +
    '    </div>' +

    /* FOOTER COLUMNS */
    '    <div class="footer-columns">' +

    '      <div class="footer-column">' +
    '        <h4>Buy</h4>' +
    '        <a href="#events">Match info</a>' +
    '      </div>' +

    '      <div class="footer-column">' +
    '        <h4>Help</h4>' +
    '        <a href="#stadium">About the Stadium</a>' +
    '        <a href="#tickets">My tickets</a>' +
    '        <a href="#faq">Frequently Asked Questions</a>' +
    '        <a href="#faq">Help and contact</a>' +
    '        <a href="#location">Getting there</a>' +
    '        <a href="#tickets">Log in</a>' +
    '      </div>' +

    '      <div class="footer-column">' +
    '        <h4>Legal</h4>' +
    '        <a href="#tickets">Ticketing and Admission Terms</a>' +
    '        <a href="#tickets">Terms of Use</a>' +
    '        <a href="#tickets">Privacy Policy</a>' +
    '      </div>' +

    '      <div class="footer-column">' +
    '        <h4>Contact</h4>' +
    '        <a href="mailto:info@talantasportscity.com">Contact us</a>' +
    '        <a href="mailto:info@talantasportscity.com">info@talantasportscity.com</a>' +
    '        <span>Ngong Rd, Nairobi</span>' +
    '      </div>' +

    '    </div>' +

    /* TRUST SECTION */
    '    <div class="footer-trust">' +

    '      <div class="trust-item">' +
    '        <div class="trust-icon shield-check">' +
    '          <img alt="Official ticket seller" src="assets/icons/trust.svg"/>' +
    '        </div>' +
    '        <div>' +
    '          <strong>Official ticket seller</strong>' +
    '          <p>for Bayern Munich vs Ajax at Talanta</p>' +
    '        </div>' +
    '      </div>' +

    '      <div class="trust-item">' +
    '        <div class="trust-icon lock-icon">' +
    '          <img alt="Secure payment" src="assets/icons/lock.svg"/>' +
    '        </div>' +
    '        <div>' +
    '          <strong>Secure mobile money and card</strong>' +
    '          <p>Card details never touch this site</p>' +
    '        </div>' +
    '      </div>' +

    '      <div class="trust-item">' +
    '        <div class="trust-icon ticket-icon">' +
    '          <img alt="Secure tickets" src="assets/icons/ticket.svg"/>' +
    '        </div>' +
    '        <div>' +
    '          <strong>Secure tickets</strong>' +
    '          <p>By SMS and e-mail, and under My tickets</p>' +
    '        </div>' +
    '      </div>' +

    '    </div>' +

    /* FOOTER BOTTOM */
    '    <div class="footer-bottom">' +
    '      <p>© 2026 Talanta Sports City · Ngong Rd, Nairobi.</p>' +

    '      <div class="footer-socials">' +

    '        <a aria-label="Instagram" href="https://www.instagram.com/talantasportscity?xtok=MWJreGRrN2p4cG55NA==">' +
    '          <img alt="Instagram" src="assets/icons/instagram.svg"/>' +
    '        </a>' +

    '        <a aria-label="X" href="https://x.com/talantacity">' +
    '          <img alt="X" src="assets/icons/x.svg"/>' +
    '        </a>' +

    '        <a aria-label="TikTok" href="https://www.tiktok.com/@talantasportscity">' +
    '          <img alt="TikTok" src="assets/icons/tiktok.svg"/>' +
    '        </a>' +

    '        <a aria-label="YouTube" href="https://www.youtube.com/@TalantaSportsCity">' +
    '          <img alt="YouTube" src="assets/icons/youtube.svg"/>' +
    '        </a>' +

    '        <a aria-label="Facebook" href="https://web.facebook.com/TalantaSportsCity?_rdc=1&amp;_rdr#">' +
    '          <img alt="Facebook" src="assets/icons/facebook.svg"/>' +
    '        </a>' +

    '      </div>' +
    '    </div>' +

    '  </div>' +
    '</footer>';
}


function renderBookingWorkspace() {
  return '' +
    '<section class="booking-workspace">' +
    '  <div class="stadium-panel">' +
    '    <div class="map-toolbar">' +
    '      <div aria-label="Map zoom controls" class="map-controls">' +
    '        <button aria-label="Zoom in" id="zoomIn">' +
    '          +' +
    '        </button>' +
    '        <button aria-label="Zoom out" id="zoomOut">' +
    '          −' +
    '        </button>' +
    '        <button aria-label="Reset zoom" id="resetZoom">' +
    '          ↻' +
    '        </button>' +
    '      </div>' +
    '      <div aria-label="Filter seating levels" class="level-controls">' +
    '        <button class="level-button active" data-level="all">' +
    '          ALL LEVELS' +
    '        </button>' +
    '        <button class="level-button" data-level="1">' +
    '          LEVEL 1' +
    '        </button>' +
    '        <button class="level-button" data-level="2">' +
    '          LEVEL 2' +
    '        </button>' +
    '        <button class="level-button" data-level="3">' +
    '          LEVEL 3' +
    '        </button>' +
    '      </div>' +
    '      <label class="event-picker">' +
    '        <span>' +
    '          EVENT' +
    '        </span>' +
    '        <select aria-label="Choose event" id="eventSelect">' +
    '          <option value="general">' +
    '            General admission demo' +
    '          </option>' +
    '        </select>' +
    '      </label>' +
    '    </div>' +
    '    <div class="stadium-map-wrapper">' +
    '      <div class="stadium-map" id="stadiumMap">' +
    '        <svg aria-label="Top-down Talanta Sports City stadium seating plan" id="seatingMap" role="img" viewbox="0 0 1000 667">' +
    '          <image height="667" href="assets/images/talanta-stadium-plan.jpg" preserveaspectratio="none" width="1000" x="0" y="0"/>' +
    '          <g id="stadiumSections">' +
    '          </g>' +
    '        </svg>' +
    '      </div>' +
    '      <div class="map-legend">' +
    '        <span>' +
    '          <i class="legend-dot available">' +
    '          </i>' +
    '          Available' +
    '        </span>' +
    '        <span>' +
    '          <i class="legend-dot selected">' +
    '          </i>' +
    '          Selected' +
    '        </span>' +
    '        <span>' +
    '          <i class="legend-dot taken">' +
    '          </i>' +
    '          Taken' +
    '        </span>' +
    '        <span>' +
    '          <i class="legend-dot sold">' +
    '          </i>' +
    '          Sold out' +
    '        </span>' +
    '      </div>' +
    '      <div class="map-hint">' +
    '        Select a coloured seating block to view its price' +
    '      </div>' +
    '    </div>' +
    '    <div class="map-instructions">' +
    '       The seating plan is a visual reference. Select an available numbered section to continue.' +
    '    </div>' +
    '  </div>' +
    '  <aside class="ticket-panel">' +
    '    <div class="ticket-panel-heading">' +
    '      <div>' +
    '        <span class="panel-eyebrow">' +
    '          YOUR MATCH DAY' +
    '        </span>' +
    '        <h2>' +
    '          Tickets' +
    '        </h2>' +
    '      </div>' +
    '      <div class="quantity-control">' +
    '        <button aria-label="Decrease tickets" id="decreaseQty">' +
    '          −' +
    '        </button>' +
    '        <strong id="ticketQuantity">' +
    '          1' +
    '        </strong>' +
    '        <button aria-label="Increase tickets" id="increaseQty">' +
    '          +' +
    '        </button>' +
    '      </div>' +
    '    </div>' +
    '    <button class="find-seats-button" id="findSeats">' +
    '      ✦   Find my seats' +
    '    </button>' +
    '    <div class="section-heading-row">' +
    '      <div>' +
    '        <h3>' +
    '          Choose a section' +
    '        </h3>' +
    '        <p id="sectionCount">' +
    '          Loading sections…' +
    '        </p>' +
    '      </div>' +
    '      <div class="sort-controls">' +
    '        <button class="sort-button active" data-sort="price">' +
    '          Cheapest' +
    '        </button>' +
    '        <button class="sort-button" data-sort="section">' +
    '          Section' +
    '        </button>' +
    '      </div>' +
    '    </div>' +
    '    <div class="section-list" id="sectionList">' +
    '      <div class="empty-state">' +
    '        Loading stadium sections…' +
    '      </div>' +
    '    </div>' +
    '    <div class="booking-summary">' +
    '      <div class="summary-heading">' +
    '        <h3>' +
    '          Booking Summary' +
    '        </h3>' +
    '        <span class="summary-step">' +
    '          STEP 1 OF 2' +
    '        </span>' +
    '      </div>' +
    '      <div class="summary-row">' +
    '        <span>' +
    '          Selected section' +
    '        </span>' +
    '        <strong id="selectedSection">' +
    '          None' +
    '        </strong>' +
    '      </div>' +
    '      <div class="summary-row">' +
    '        <span>' +
    '          Ticket quantity' +
    '        </span>' +
    '        <strong id="summaryQuantity">' +
    '          1' +
    '        </strong>' +
    '      </div>' +
    '      <div class="summary-row">' +
    '        <span>' +
    '          Price per ticket' +
    '        </span>' +
    '        <strong id="ticketPrice">' +
    '          KSh 0' +
    '        </strong>' +
    '      </div>' +
    '      <div class="summary-total">' +
    '        <span>' +
    '          Total' +
    '        </span>' +
    '        <strong id="totalPrice">' +
    '          KSh 0' +
    '        </strong>' +
    '      </div>' +
    '      <button class="continue-button" disabled="" id="continueBooking">' +
    '        Continue to Booking ' +
    '        <span>' +
    '          →' +
    '        </span>' +
    '      </button>' +
    '      <p class="booking-note">' +
    '        Demonstration prices and availability. No payment is taken on this page.' +
    '      </p>' +
    '    </div>' +
    '  </aside>' +
    '</section>';
}

function renderTicketHospitalityIntro() {
  return '' +
    '<section class="hospitality-booking">' +
    '  <div class="hospitality-heading">' +
    '    <span class="eyebrow">' +
    '      EXCLUSIVE EXPERIENCES' +
    '    </span>' +
    '    <h2>' +
    '      Upgrade Your Match Day' +
    '    </h2>' +
    '    <p>' +
    '      Discover exclusive hospitality at Talanta Sports City. ' +
    '    </p>' +
    '  </div>' +
    '</section>';
}

/* ============================================================
   04. PAGE COMPOSITION — HOME
   ============================================================ */
function renderHomePage() {
  if (!app) return;

  document.body.classList.remove("ticket-booking-page");

  app.innerHTML = '' +
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

  initializeHomeFeatures();
}

/* ============================================================
   05. PAGE COMPOSITION — TICKETS
   ============================================================ */
function renderTicketPage() {
  if (!app) return;

  document.body.classList.add("ticket-booking-page");

  app.innerHTML = '' +
    renderTicketHeader() +
    '<main class="booking-page">' +
      renderBookingWorkspace() +
      renderTicketHospitalityIntro() +
    '</main>' +
    renderHospitality() +
    renderFooter();

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
    var nextHash = nextRoute === "tickets"
      ? APP_CONFIG.ticketHash
      : APP_CONFIG.homeHash;

    history.pushState({ route: nextRoute }, "", nextHash);
  }

  window.scrollTo({ top: 0, behavior: "instant" });
}

function handleRouteClick(event) {
  var routeLink = event.target.closest("[data-route]");
  if (!routeLink) return;

  event.preventDefault();
  var route = routeLink.getAttribute("data-route");
  var section = routeLink.getAttribute("data-section");

  navigateTo(route);

  if (route === "home" && section && section !== "home") {
    window.setTimeout(function () {
      var target = document.getElementById(section);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }
}

function handleBrowserNavigation() {
  var route = location.hash === APP_CONFIG.ticketHash ? "tickets" : "home";
  navigateTo(route, { fromPopState: true });
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
      var currentTheme = document.body.getAttribute("data-theme") || "light";
      applyTheme(currentTheme === "dark" ? "light" : "dark");
      return;
    }

    handleRouteClick(event);
    closeMobileMenuOnOutsideClick(event);
    closeMobileMenuAfterNavigation(event);
  });

  window.addEventListener("popstate", handleBrowserNavigation);
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

  if (!menuToggle || !navigation || !navigation.classList.contains("active")) return;
  if (navigation.contains(event.target) || menuToggle.contains(event.target)) return;

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
    ".faq-list"
  ];
  var revealItems = document.querySelectorAll(selectors.join(", "));

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("visible");
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries, activeObserver) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

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

  var reduceMotion = window.matchMedia &&
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

  copyright.textContent = "© " + new Date().getFullYear() +
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
    1: 2,
    2: 5000,
    3: 15000,
    gold: 20000,
    platinum: 35000,
    skybox: 75000
  },
  levels: {
    1: { start: 101, count: 28, innerX: 252, innerY: 158, outerX: 282, outerY: 185 },
    2: { start: 201, count: 20, innerX: 292, innerY: 190, outerX: 344, outerY: 235 },
    3: { start: 401, count: 35, innerX: 350, innerY: 239, outerX: 393, outerY: 284 }
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
        price: TICKET_CONFIG.prices[level]
      });
    }
  });

  return sections;
}

/* ============================================================
   15. TICKETING — SVG GEOMETRY HELPERS
   ============================================================ */
function getStadiumPoint(centerX, centerY, radiusX, radiusY, angle) {
  var radians = angle * Math.PI / 180;

  return {
    x: centerX + radiusX * Math.cos(radians),
    y: centerY + radiusY * Math.sin(radians)
  };
}

function createStadiumSectionPath(centerX, centerY, outerX, outerY, innerX, innerY, startAngle, endAngle) {
  var startOuter = getStadiumPoint(centerX, centerY, outerX, outerY, startAngle);
  var endOuter = getStadiumPoint(centerX, centerY, outerX, outerY, endAngle);
  var endInner = getStadiumPoint(centerX, centerY, innerX, innerY, endAngle);
  var startInner = getStadiumPoint(centerX, centerY, innerX, innerY, startAngle);
  var largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return "M " + startOuter.x + " " + startOuter.y +
    " A " + outerX + " " + outerY + " 0 " + largeArc + " 1 " + endOuter.x + " " + endOuter.y +
    " L " + endInner.x + " " + endInner.y +
    " A " + innerX + " " + innerY + " 0 " + largeArc + " 0 " + startInner.x + " " + startInner.y + " Z";
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
    eventSelect: document.getElementById("eventSelect")
  };

  if (!elements.map || !elements.stadiumMap || !elements.sectionList) {
    console.warn("TALANTA ticketing: required stadium elements were not found.");
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
      var section = sections.find(function (item) { return item.id === sectionId; });
      if (!section) return;

      var className = selectedSection && selectedSection.id === section.id
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
        path.setAttribute("d", createStadiumSectionPath(
          500, 333,
          config.outerX, config.outerY,
          config.innerX, config.innerY,
          startAngle, endAngle
        ));
        path.setAttribute("class", "stadium-section " + section.status);
        path.setAttribute("data-section", section.id);
        path.setAttribute("data-level", level);
        path.setAttribute("role", "button");
        path.setAttribute("tabindex", isTicketSectionAvailable(section) ? "0" : "-1");
        path.setAttribute("aria-label", "Section " + section.id + ", level " + level + ", " +
          (isTicketSectionAvailable(section) ? "available" : section.status));
        path.addEventListener("click", function () {
          selectSection(section.id);
        });
        path.addEventListener("keydown", function (event) {
          if ((event.key === "Enter" || event.key === " ") && isTicketSectionAvailable(section)) {
            event.preventDefault();
            selectSection(section.id);
          }
        });
        elements.map.appendChild(path);

        var labelPosition = getStadiumPoint(
          500, 333,
          (config.innerX + config.outerX) / 2,
          (config.innerY + config.outerY) / 2,
          middleAngle
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
      button.classList.toggle("active", button.getAttribute("data-level") === String(currentLevel));
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

    var availableCount = visibleSections.filter(isTicketSectionAvailable).length;
    if (elements.sectionCount) {
      elements.sectionCount.textContent = availableCount + " of " + visibleSections.length + " sections available";
    }

    if (!visibleSections.length) {
      elements.sectionList.innerHTML = '<div class="empty-state">No sections found.</div>';
      return;
    }

    elements.sectionList.innerHTML = visibleSections.map(function (section) {
      var isSelected = selectedSection && selectedSection.id === section.id;
      var unavailable = !isTicketSectionAvailable(section);
      var statusText = section.status === "sold" ? "Sold out" :
        section.status === "taken" ? "Unavailable" : section.seats + " seats left";

      return '' +
        '<div class="section-item ' + (isSelected ? "active" : "") + ' ' + (unavailable ? "unavailable" : "") + '"' +
          ' data-section="' + section.id + '" ' + (unavailable ? 'aria-disabled="true"' : "") + '>' +
          '<div class="section-item-top">' +
            '<div><h4>Section ' + section.id + '</h4><p>Level ' + section.level + ' seating</p></div>' +
            '<div class="section-price"><small>Price per ticket</small><strong>' + formatTicketMoney(section.price) + '</strong></div>' +
          '</div>' +
          '<p class="seats-left">' + statusText + '</p>' +
        '</div>';
    }).join("");

    elements.sectionList.querySelectorAll(".section-item").forEach(function (item) {
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
    if (elements.summaryQuantity) elements.summaryQuantity.textContent = quantity;
    if (elements.selectedSection) elements.selectedSection.textContent = getSelectedName();
    if (elements.ticketPrice) elements.ticketPrice.textContent = formatTicketMoney(price);
    if (elements.totalPrice) elements.totalPrice.textContent = formatTicketMoney(price * quantity);
    if (elements.continueBooking) {
      elements.continueBooking.disabled = !selectedSection && !selectedHospitality;
    }

    updateMapSelection();
  }

  function changeQuantity(amount) {
    var maxQuantity = selectedSection
      ? Math.min(TICKET_CONFIG.maxTickets, selectedSection.seats)
      : TICKET_CONFIG.maxTickets;

    quantity = Math.max(1, Math.min(maxQuantity, quantity + amount));
    updateSummary();
  }

  /* ----------------------------------------------------------
     Find available seats
     ---------------------------------------------------------- */
  function findAvailableSeats() {
    var candidate = sections.filter(isTicketSectionAvailable).filter(function (section) {
      return section.seats >= quantity;
    }).sort(function (first, second) {
      return first.price - second.price || first.id - second.id;
    })[0];

    if (!candidate) {
      alert("No available section currently has " + quantity +
        " seats. Try reducing your quantity.");
      return;
    }

    selectSection(candidate.id);
    var summary = document.querySelector(".booking-summary");
    if (summary) summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ----------------------------------------------------------
     Hospitality package selection
     ---------------------------------------------------------- */
  function selectHospitality(button) {
    var packages = {
      gold: { name: "Gold Hospitality", price: TICKET_CONFIG.prices.gold },
      platinum: { name: "Platinum Hospitality", price: TICKET_CONFIG.prices.platinum },
      skybox: { name: "Skybox VIP", price: TICKET_CONFIG.prices.skybox }
    };
    var category = button.getAttribute("data-category");
    var selectedPackage = packages[category];

    if (!selectedPackage) return;

    selectedSection = null;
    selectedHospitality = {
      name: selectedPackage.name,
      price: selectedPackage.price,
      category: category
    };

    document.querySelectorAll(".hospitality-option").forEach(function (option) {
      option.classList.toggle("chosen", option === button);
    });

    renderSectionList();
    updateSummary();

    var summary = document.querySelector(".booking-summary");
    if (summary) summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  var booking = {
    event: elements.eventSelect
      ? elements.eventSelect.value
      : "Talanta Sports City Demo Event",
    selection: getSelectedName(),
    category: selectedHospitality
      ? selectedHospitality.category
      : "standard",
    ticketType: selectedHospitality ? "hospitality" : "section",
    hospitalityType: selectedHospitality ? selectedHospitality.category : null,
    sectionId: selectedSection ? selectedSection.id : null,
    quantity: quantity,
    pricePerTicket: price,
    total: price * quantity,
    currency: TICKET_CONFIG.currency
  };

  openMpesaCheckout(booking);
  console.log("Talanta checkout:", booking);
}

/* ----------------------------------------------------------
   M-PESA CHECKOUT MODAL
   ---------------------------------------------------------- */
function openMpesaCheckout(booking) {
  var existing = document.getElementById("mpesaCheckoutModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "mpesaCheckoutModal";
  modal.className = "mpesa-modal-overlay";

  modal.innerHTML = `
    <div class="mpesa-modal" role="dialog"
         aria-modal="true" aria-labelledby="mpesaTitle">

      <button type="button" class="mpesa-close"
              aria-label="Close checkout">&times;</button>

      <div class="mpesa-logo">M-PESA</div>

      <h2 id="mpesaTitle">Complete Your Booking</h2>
      <p class="mpesa-subtitle">
        Enter your M-PESA number to receive a payment prompt.
      </p>

      <div class="mpesa-order">
        <div><span>Event</span><strong id="mpesaEvent"></strong></div>
        <div><span>Selection</span><strong id="mpesaSelection"></strong></div>
        <div><span>Tickets</span><strong id="mpesaQuantity"></strong></div>
        <div><span>Price each</span><strong id="mpesaPrice"></strong></div>
        <div class="mpesa-total">
          <span>Total to pay</span>
          <strong id="mpesaTotal"></strong>
        </div>
      </div>

      <form id="mpesaPaymentForm">
        <label for="mpesaPhone">M-PESA phone number</label>
        <input
          id="mpesaPhone"
          type="tel"
          placeholder="07XXXXXXXX"
          autocomplete="tel"
          required
        />

        <button type="submit" id="mpesaPayButton">
          Pay with M-PESA
        </button>

        <p id="mpesaStatus" role="status" aria-live="polite"></p>
      </form>

      <p class="mpesa-security">
        Secure payment request powered by Safaricom Daraja.
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  function money(value) {
    return booking.currency + " " +
      Number(value).toLocaleString("en-KE");
  }

  modal.querySelector("#mpesaEvent").textContent = booking.event;
  modal.querySelector("#mpesaSelection").textContent = booking.selection;
  modal.querySelector("#mpesaQuantity").textContent = booking.quantity;
  modal.querySelector("#mpesaPrice").textContent =
    money(booking.pricePerTicket);
  modal.querySelector("#mpesaTotal").textContent =
    money(booking.total);

  function closeModal() {
    modal.remove();
  }

  modal.querySelector(".mpesa-close")
    .addEventListener("click", closeModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeModal();
  });



async function monitorTalantaPayment(orderId, accessToken, statusElement, button) {
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
        "/api/payment/status/" + encodeURIComponent(orderId),
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "X-Payment-Token": accessToken
          }
        }
      );

      var payment = await response.json();

      if (!response.ok || !payment.success) {
        if (response.status === 404) {
          statusElement.textContent =
            "Payment status could not be authenticated. Contact support with your order reference.";
          return;
        }

        throw new Error(
          payment.message || "Unable to check payment status"
        );
      }

      if (payment.status === "SUCCESS") {
        var ticketCodes = Array.isArray(payment.tickets)
          ? payment.tickets
          : [];

        var ticketText = ticketCodes.length
          ? "\nYour ticket code" +
            (ticketCodes.length > 1 ? "s" : "") +
            ":\n" +
            ticketCodes.map(function (ticket) {
              return ticket.ticketCode;
            }).join("\n")
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


  modal.querySelector("#mpesaPaymentForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      var phoneInput = modal.querySelector("#mpesaPhone");
      var payButton = modal.querySelector("#mpesaPayButton");
      var status = modal.querySelector("#mpesaStatus");

      var phone = phoneInput.value.replace(/[\s+()-]/g, "");

      if (/^0[17]\d{8}$/.test(phone)) {
        phone = "254" + phone.substring(1);
      }

      if (!/^254[17]\d{8}$/.test(phone)) {
        status.textContent =
          "Enter a valid Kenyan Safaricom phone number.";
        return;
      }

      payButton.disabled = true;
      payButton.textContent = "Sending request...";
      status.textContent = "Connecting to Safaricom...";

      try {
        var response = await fetch("/api/payment/stkpush", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: phone,
            ticketType: booking.ticketType,
            sectionId: booking.sectionId,
            hospitalityType: booking.hospitalityType,
            quantity: booking.quantity
          })
        });

        var result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || result.error ||
            "Unable to initiate M-PESA payment."
          );
        }

        status.textContent =
          "STK Push sent. Check your phone and enter your M-PESA PIN. Waiting for Safaricom confirmation...";
        payButton.textContent = "Waiting for payment";
        await monitorTalantaPayment(
  result.orderId,
  result.accessToken,
  status,
  payButton
);
      } catch (error) {
        status.textContent = error.message;
        payButton.disabled = false;
        payButton.textContent = "Try Again";
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
    if (elements.zoomIn) elements.zoomIn.addEventListener("click", function () { changeZoom(0.15); });
    if (elements.zoomOut) elements.zoomOut.addEventListener("click", function () { changeZoom(-0.15); });
    if (elements.resetZoom) elements.resetZoom.addEventListener("click", resetZoom);
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

  console.log("TALANTA TICKETING ENGINE INITIALIZED — " + sections.length + " demo sections");
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

  var initialRoute = location.hash === APP_CONFIG.ticketHash ? "tickets" : "home";
  state.route = initialRoute;

  if (initialRoute === "tickets") {
    renderTicketPage();
  } else {
    renderHomePage();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
