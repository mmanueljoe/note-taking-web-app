import { getElementByType } from "./utils.js";
import { applyTheme, applyFont } from "./theme.js";
import { savePreferences } from "./storage.js";

const initializeSettings = () => {
  // 1. get all elements
  const elements = {
    settingsSection: getElementByType("class", "settings-section"),
    backBtn: getElementByType("class", "back-btn"),
    settingsNav: getElementByType("class", "settings-nav"),
    settingsNavItemLink: getElementByType("class", "nav-item-link"),
    appMainContainer: getElementByType("class", "app-main-container"),
    colorThemeBtn: getElementByType("id", "color-theme-btn"),
    fontThemeBtn: getElementByType("id", "font-theme-btn"),
    changePasswordBtn: getElementByType("id", "change-password-btn"),
  };

  // 2. helper function: set active section
  const handleViewportChange = () => {
    const hasActiveSection = elements.settingsSection.some((section) =>
      section.classList.contains("is-active")
    );

    if (window.innerWidth < 1024) {
      if (hasActiveSection) {
        elements.appMainContainer[0].classList.add("settings-section-open");
      } else {
        elements.appMainContainer[0].classList.remove("settings-section-open");
      }
    } else {
      elements.appMainContainer[0].classList.remove("settings-section-open");
    }
  };

  const setActiveSection = (sectionId) => {
    // remove active class from all nav links
    elements.settingsNavItemLink.forEach((item) => {
      item.classList.remove("is-active");
    });

    // remove active class from all sections
    elements.settingsSection.forEach((section) => {
      section.classList.remove("is-active");
    });

    // find the clicked link
    const clickedLink = elements.settingsNavItemLink.find((link) => {
      const href = link.getAttribute("href");
      return href === `#${sectionId}`;
    });

    if (clickedLink) {
      clickedLink.classList.add("is-active");
    }

    // add active to matching section
    const targetSection = elements.settingsSection.find((section) => {
      const id = section.getAttribute("id");
      return id === sectionId;
    });

    // add active class to matching section
    if (targetSection) {
      targetSection.classList.add("is-active");
    }

    // on mobile: hide nav and show content
    if (window.innerWidth < 1024) {
      elements.appMainContainer[0].classList.add("settings-section-open");
    }

    handleViewportChange();
  };

  // 3. === settings application handlers ===

  // handle color theme change
  const handleColorThemeChange = () => {
    const selectedTheme = document.querySelector('input[name="color-theme"]:checked');

    if (selectedTheme) {
      console.log(selectedTheme.id);
      applyTheme(selectedTheme.id);
      savePreferences({ colorTheme: selectedTheme.id });
    }
  };

  // handle font theme change
  const handleFontThemeChange = () => {
    const selectedFont = document.querySelector(
      'input[name="font-theme"]:checked'
    );

    if (selectedFont) {
      applyFont(selectedFont.id);
      savePreferences({ fontTheme: selectedFont.id });
    }
  };

  // handle change password
  const handleChangePassword = (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (
      currentPassword === "" ||
      newPassword === "" ||
      confirmPassword === ""
    ) {
      return;
    }
  };

  // ---------------------------------

  // 4. === event listeners ===
  // handle back button clicks (mobile/tablet only) // handle back button clicks (mobile/tablet only)
  elements.backBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // remove active class from all sections
      elements.settingsSection.forEach((section) => {
        section.classList.remove("is-active");
      });

      // remove active class from all nav links
      elements.settingsNavItemLink.forEach((item) => {
        item.classList.remove("is-active");
      });

      elements.appMainContainer[0].classList.remove("settings-section-open");

      handleViewportChange();
    });
  });

  // handle nav link clicks
  elements.settingsNavItemLink.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const sectionId = link.getAttribute("href").split("#")[1];
      setActiveSection(sectionId);
    });
  });

  // handle viewport change
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleViewportChange, 50);
  });

  // set initial active section
  setActiveSection("color-theme-settings");
  handleViewportChange();

  // handle color theme button clicks
  if(elements.colorThemeBtn){
        elements.colorThemeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleColorThemeChange();
      });
  }

  // handle font theme button clicks
  if(elements.fontThemeBtn){
      elements.fontThemeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleFontThemeChange();
      });
  }

  // handle change password button clicks
  if(elements.changePasswordBtn){
      elements.changePasswordBtn.addEventListener('click', (e) => {
          e.preventDefault();
          handleChangePassword();
      });
  }
};

if (document.querySelector(".settings-section")) {
  initializeSettings();
}
