import { getElementByType } from "./utils.js";
import { applyTheme, applyFont } from "./theme.js";
import { savePreferences, loadPreferences } from "./storage.js";
import {logout, changePassword} from "./auth.js";

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
    colorThemeInput: getElementByType("id", "color-theme-input"),
    fontThemeInput: getElementByType("id", "font-theme-input"),
    colorThemeItem: getElementByType("class", "color-theme-item"),
    fontThemeItem: getElementByType("class", "font-theme-item"),
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

  const restoreThemeSelection = () => {
    const preferences = loadPreferences();

    // restore color theme selection
    if (preferences.colorTheme) {
      const colorRadio = document.getElementById(preferences.colorTheme);
      if (colorRadio) {
        colorRadio.checked = true;
      }
    }

    // restore font theme selection
    if (preferences.fontTheme) {
      const fontRadio = document.getElementById(preferences.fontTheme);
      if (fontRadio) {
        fontRadio.checked = true;
      }
    }

    updateThemeItemActiveState();
  };

  const updateThemeItemActiveState = () => {
    // remove active class from all color theme items
    elements.colorThemeItem.forEach((item) => {
      item.classList.remove("is-active");
    });

    // add active class to the selected color theme item
    const checkedColorRadio = document.querySelector(
      'input[name="color-theme"]:checked'
    );
    if (checkedColorRadio) {
      checkedColorRadio.closest('.color-theme-item').classList.add("is-active");
    }

    // remove active class from all font theme items
    elements.fontThemeItem.forEach((item) => {
      item.classList.remove("is-active");
    });

    // add active class to the selected font theme item
    const checkedFontRadio = document.querySelector(
      'input[name="font-theme"]:checked'
    );
    if (checkedFontRadio) {
      checkedFontRadio.closest('.font-theme-item').classList.add("is-active");
    }
  };

  // 3. === settings application handlers ===

  // handle color theme change
  const handleColorThemeChange = () => {
    const selectedTheme = document.querySelector(
      'input[name="color-theme"]:checked'
    );

    if (selectedTheme) {
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

  // handle logout
  const handleLogout = (e) => {
    e.preventDefault();

    // create logout confirmation dialog
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-content-top">
        <span class="modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5006 9.99875H7.45508M17.5006 9.99875L15.0577 7.55371M17.5006 9.99875L15.0577 12.4448" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.1296 6.88872V6.04237C12.1296 4.7427 11.1957 3.63316 9.92083 3.41799L5.58531 2.53739C3.97092 2.26493 2.5 3.5161 2.5 5.16177V14.8383C2.5 16.4839 3.97091 17.7351 5.5853 17.4626L9.92083 16.582C11.1957 16.3668 12.1296 15.2573 12.1296 13.9577V13.1122" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <div class="modal-label">
          <h2 id="modal-title">Logout</h2>
          <p>Are you sure you want to logout? You'll need to login again to access your notes.</p>
        </div>
      </div>
      <div class="modal-buttons">
        <button class="modal-cancel-button">Cancel</button>
        <button class="modal-archive-button">Logout</button>
      </div>
    </div>`;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add("modal-open");
    }, 10);
    
    // Close modal when clicking backdrop
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        closeModal();
      }
    });
    
    
    // Escape key handler
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    const cancelBtn = modal.querySelector(".modal-cancel-button");
    cancelBtn.addEventListener("click", () => {
      closeModal();
    });

    const logoutBtn = modal.querySelector(".modal-delete-button");
    logoutBtn.addEventListener("click", () => {
      const result = logout();
      if(result.success){
        window.location.href = './auth/login.html';
      }else{
       
        closeModal();
      }
    });

    function closeModal() {
      modal.classList.remove("modal-open");
      modal.classList.add("modal-close");
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
      }, 300);
    }
  };


  // handle change password
  const handleChangePassword = (e) => {
    e.preventDefault();

    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const submitButton = document.getElementById("change-password-btn");

    if(!currentPasswordInput || !newPasswordInput || !confirmPasswordInput || !submitButton) return;

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // clear previous error messages
    clearPasswordErrors();

    // validate fields
    let hasErrors = false;

    if(!currentPassword){
      showPasswordError('current-password', 'Current password is required');
      hasErrors = true;
    }

    if(!newPassword){
      showPasswordError('new-password', 'New password is required');
      hasErrors = true;
    }else if(newPassword.length < 8){
      showPasswordError('new-password', 'New password must be at least 8 characters long');
      hasErrors = true;
    }

    if(!confirmPassword){
      showPasswordError('confirm-password', 'Confirm password is required');
      hasErrors = true;
    }else if(confirmPassword !== newPassword){
      showPasswordError('confirm-password', 'Passwords do not match');
      hasErrors = true;
    }

    if(hasErrors){
      return;
    }

    // disable button during processing
    submitButton.disabled = true;
    submitButton.textContent = 'Changing password...';

    // attempt change password
    const result = changePassword(currentPassword, newPassword);
    if(result.success){
     
      showPasswordSuccess("Password changed successfully!");

      // clear form
      currentPasswordInput.value = '';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';


      // reset button
      submitButton.disabled = false;
      submitButton.textContent = 'Save Password';
    }else{
      // show error message
      if(result.message.toLowerCase().includes('current password')){
        showPasswordError('current-password', result.message);
      } else {
        showPasswordError('new-password', result.message);
      }

      submitButton.disabled = false;
      submitButton.textContent = 'Save Password';
    }
  }

  
  
  // helper functions
  function showPasswordError(field, message){
    const input = document.getElementById(field);
    if(!input) return;
    
    
    // remove existing error message
    clearPasswordFieldError(field);
    
    // add error class
    input.classList.add('form-input-error');
    
    // create error element
    const errorElement = document.createElement('p');
    errorElement.classList.add('form-group-error');
    

    // icon element
    const iconElement = document.createElement('span');
    iconElement.classList.add('form-group-error-icon');
    iconElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M2 8C2 11.3133 4.68605 14 8 14C11.3139 14 14 11.3133 14 8C14 4.68605 11.3139 2 8 2C4.68605 2 2 4.68605 2 8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
         <path d="M8.0038 10.4621V7.59573V10.4621ZM8 5.5695V5.52734V5.5695Z" fill="currentColor"/>
         <path d="M8.0038 10.4621V7.59573M8 5.5695V5.52734" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`;
         
    // text element
    const textSpan = document.createElement('span');
    textSpan.textContent = message;

    // insert error after input wrapper
    const formGroup = input.closest('.form-group');
    if(formGroup){
        const inputWrapper = formGroup.querySelector('.form-group-input');
        if(inputWrapper){
            formGroup.insertBefore(errorElement, inputWrapper.nextSibling);
          } else {
            formGroup.appendChild(errorElement);
          }
        }
  }

  // clear error to clear password field errors
  function clearPasswordFieldError(field){
    const input = document.getElementById(field);

    if(!input) return;

    input.classList.remove('form-input-error');

    const formGroup = input.closest('.form-group');
    if(formGroup){
      const errorElements = formGroup.querySelectorAll('.form-group-error');
      errorElements.forEach(errorElement => {
            errorElement.remove();
          });
    }
  }

  // clear all password errors
  function clearPasswordErrors(){
    clearPasswordFieldError('current-password');
    clearPasswordFieldError('new-password');
    clearPasswordFieldError('confirm-password');
  }
  
  // show success message
  function showPasswordSuccess(message){
    //  remove existing success message
    const existingSuccess = document.querySelector('.password-success-message');
    if(existingSuccess){
      existingSuccess.remove();
    }

    // create success element
    const successElement = document.createElement('p');
    successElement.classList.add('password-success-message');
    successElement.textContent = message;
    
    // insert before submit button
    const form = document.querySelector('.change-passwd-form');
    const buttonWrapper = form.querySelector('.change-password-btn-wrapper');
    if(form && buttonWrapper){
      form.insertBefore(successElement, buttonWrapper.previousSibling);

      setTimeout(() => {
        successElement.remove();
      }, 3000);
    }
  }

  // setup password visibility toggles
  const setupPasswordToggles = () => {
    const toggles = document.querySelectorAll('.show-password-toggle');

    toggles.forEach(toggle => {
      // icon references
      const iconShow = toggle.querySelector('.show-password-toggle-icon-show');
      const iconHide = toggle.querySelector('.show-password-toggle-icon-hide');

      const inputWrapper = toggle.closest('.form-group-input');
      const input = inputWrapper.querySelector('input[type="password"]');

      if(!input) return;

      // initialize icon visibility
      const updateIconVisibility = () => {
        const isPassword = input.type === 'password';
        if(iconShow && iconHide){
          if(isPassword){
            iconShow.style.display = 'block';
            iconHide.style.display = 'none';
          }else{
            iconShow.style.display = 'none';
            iconHide.style.display = 'block';
          }
        }
      };


      // initial icon visibility
      updateIconVisibility();
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

          // toggle input type
          input.type = input.type === 'password' ? 'text' : 'password';

          // update icon visibility
          updateIconVisibility();

          // refocus input to prevent blur validation
          input.focus();
        });
      });
  }
  
  // password visibility toggles
  setupPasswordToggles();
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

  // handle logout link
  const logoutLink = document.querySelector("a[href='./auth/logout.html']");
  if(logoutLink){
    logoutLink.addEventListener("click", handleLogout);
  }

  // handle viewport change
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleViewportChange, 50);
  });

  // handle color theme button clicks
  if (elements.colorThemeBtn) {
    elements.colorThemeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleColorThemeChange();
    });
  }

  // handle font theme button clicks
  if (elements.fontThemeBtn) {
    elements.fontThemeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleFontThemeChange();
    });
  }

  // handle change password button clicks
  if (elements.changePasswordBtn) {
    elements.changePasswordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleChangePassword();
    });
  }

  // update active state when user clicks a radio button
  const colorThemeRadio = document.querySelectorAll(
    'input[name="color-theme"]'
  );
  colorThemeRadio.forEach((radio) => {
    radio.addEventListener("change", () => {
      updateThemeItemActiveState();
    });
  });

  const fontThemeRadio = document.querySelectorAll('input[name="font-theme"]');
  fontThemeRadio.forEach((radio) => {
    radio.addEventListener("change", () => {
      updateThemeItemActiveState();
    });
  });

  // set initial active section
  setActiveSection("color-theme-settings");
  restoreThemeSelection();
  handleViewportChange();
};

if (document.querySelector(".settings-section")) {
  initializeSettings();
}
