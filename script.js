document.addEventListener("DOMContentLoaded", () => {
  // --- Footer: Huidig jaar ---
  const currentYearElem = document.getElementById("currentYear");
  if (currentYearElem) {
    currentYearElem.textContent = new Date().getFullYear();
  }

  // --- Mobiel Menu Toggle ---
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", !isExpanded);
      menuToggle.classList.toggle("open");
      mobileMenu.classList.toggle("hidden"); // Tailwind display class
      mobileMenu.classList.toggle("open"); // Custom class voor CSS transition

      // Voorkom scrollen op de body als het mobiele menu open is (optioneel)
      // if (!isExpanded) {
      //     // Als het menu wordt geopend
      //     document.body.style.overflow = 'hidden';
      // } else {
      //     // Als het menu wordt gesloten
      //     document.body.style.overflow = '';
      // }
    });
  }

  // --- Actieve Navigatie Link Highlighting ---
  const currentPath = window.location.pathname.split("/").pop() || "index.html"; // Krijg bestandsnaam of index.html

  // Desktop Navigatie
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.classList.remove("active"); // Verwijder eerst overal 'active'
    // Haal de href van de link op en vergelijk alleen de bestandsnaam
    const linkPath = link.getAttribute("href").split("/").pop() || "index.html";
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });

  // Mobiele Navigatie
  const mobileNavLinks = document.querySelectorAll(".mobile-menu a"); // Selecteer alle links in mobiel menu
  mobileNavLinks.forEach((link) => {
    link.classList.remove("active-mobile"); // Verwijder eerst overal 'active-mobile'
    // Haal de href van de link op en vergelijk alleen de bestandsnaam
    const linkPath = link.getAttribute("href").split("/").pop() || "index.html";
    if (linkPath === currentPath) {
      // Voeg de juiste class toe (of 'active-mobile' of de class die startpagina aanduidt)
      if (linkPath === "index.html") {
        // Zorg ervoor dat de 'Start' link de correcte class krijgt
        // Aanname: De 'Start' link in mobiel menu heeft initieel 'active-mobile' of 'mobile-link'
        // We voegen expliciet 'active-mobile' toe indien nodig
        link.classList.add("active-mobile");
        // Verwijder eventueel 'mobile-link' als die er ook op staat en conflicteert
        link.classList.remove("mobile-link");
      } else {
        link.classList.add("active-mobile");
      }
    } else {
      // Als de link niet actief is, zorg dat hij de standaard 'mobile-link' class heeft
      // en niet 'active-mobile', behalve als het de startpagina link is die initieel 'active-mobile' had
      if (
        link.getAttribute("href") !== "index.html" ||
        currentPath !== "index.html"
      ) {
        link.classList.add("mobile-link"); // Zorg dat niet-actieve links de basis styling hebben
      }
      // Als de link de start link is, maar niet de huidige pagina, reset specifiek
      if (
        link.getAttribute("href") === "index.html" &&
        currentPath !== "index.html"
      ) {
        link.classList.remove("active-mobile");
        link.classList.add("mobile-link");
      }
    }
  });

  // --- Fun Typewriter Effect voor Hero Subtitle ---
  const heroSubtitle = document.querySelector(".hero-subtitle");
  if (heroSubtitle) {
    const fullText = heroSubtitle.textContent.trim(); // Pak de originele tekst
    const typingSpeed = 50; // Milliseconden per karakter (pas aan voor snelheid)
    const startDelay = 800; // Wacht tot na de initiële slide-in animatie (pas aan op CSS delay + beetje extra)
    let charIndex = 0;

    heroSubtitle.textContent = ""; // Maak de paragraaf leeg
    heroSubtitle.style.opacity = 1; // Zorg dat het zichtbaar is (CSS animatie doet dit ook, maar voor zekerheid)

    function typeWriter() {
      if (charIndex < fullText.length) {
        heroSubtitle.textContent += fullText.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
      }
    }

    // Start het typen na de ingestelde vertraging
    setTimeout(typeWriter, startDelay);
  }

  // De CSS animaties voor .hero-content-card, .hero-intro, .cta-button, .scroll-down-indicator
  // worden nu volledig door CSS afgehandeld via @keyframes en animation delays.
  // Geen extra JavaScript nodig daarvoor.
});
