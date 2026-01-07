import * as auth from "./auth.js";
import * as storage from "./storage.js";
import { showToast } from "./ui.js";

// handle login form submission
export const handleLogin = () => {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  // setup password visibility toggle
  setupPasswordToggle();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitButton = document.querySelector(".auth-form-submit");

    if (!emailInput || !passwordInput || !submitButton) return;

    // clear previous error messages
    clearFieldErrors("email");
    clearFieldErrors("password");

    // validate fields
    let hasErrors = false;

    const email = emailInput.value.trim();
    if (!email) {
      showFieldError("email", "Email is required");
      hasErrors = true;
    }
    const password = passwordInput.value.trim();
    if (!password) {
      showFieldError("password", "Password is required");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // disable button during processing
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    // attempt login
    const result = auth.login(email, password);

    if (result.success) {
      // log current user to console
      const users = storage.loadUsers();
      console.log("Current users:", users);
      console.log("Logged in user:", result.user);

      // show toast message
      showToast("saved", "Login successful!", {
        duration: 3000,
      });

      // redirect to home page
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 500);
    } else {
      //show error message
      if (result.message.toLowerCase().includes("email")) {
        showFieldError("email", result.message);
      } else if (result.message.toLowerCase().includes("password")) {
        showFieldError("password", result.message);
      }
      submitButton.disabled = false;
      submitButton.textContent = "Login";
    }
  });

  // real-time validation on blur
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput) {
    emailInput.addEventListener("blur", () => {
      const email = emailInput.value.trim();
      if (email && !isValidEmail(email)) {
        showFieldError("email", "Please enter a valid email address");
      } else {
        clearFieldErrors("email");
      }
    });

    emailInput.addEventListener("input", () => {
      clearFieldErrors("email");
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", () => {
      const password = passwordInput.value.trim();
      if (password && !isValidPassword(password)) {
        showFieldError("password", "Password must is required.");
      } else {
        clearFieldErrors("password");
      }
    });

    passwordInput.addEventListener("input", () => {
      clearFieldErrors("password");
    });
  }
};

// handle signup form submission
export const handleSignup = () => {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  // setup password visibility toggle
  setupPasswordToggle();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitButton = form.querySelector(".auth-form-submit");

    if (!emailInput || !passwordInput || !submitButton) return;

    // ALWAYS clear previous error messages first
    clearFieldErrors("email");
    clearFieldErrors("password");

    // validate fields
    let hasErrors = false;

    const email = emailInput.value.trim();
    if (!email) {
      showFieldError("email", "Email is required");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
      hasErrors = true;
    }

    const password = passwordInput.value.trim();
    if (!password) {
      showFieldError("password", "Password is required");
      hasErrors = true;
    } else if (!isValidPassword(password)) {
      showFieldError("password", "Password must be at least 8 characters long");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // disable button during processing
    submitButton.disabled = true;
    submitButton.textContent = "Signing up...";

    // attempt signup
    const result = auth.signup(email, password);

    if (result.success) {
      // Log all users after signup
      const users = storage.loadUsers();
      console.log("All registered users:", users);
      console.log("Newly created account:", result.user);

      // Show success toast
      showToast("created", "Account created successfully!", {
        duration: 2000,
      });

      // Redirect after a short delay to show toast
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 500);
    } else {
      // show error message
      if (result.message.toLowerCase().includes("email")) {
        showFieldError("email", result.message);
      } else if (result.message.toLowerCase().includes("password")) {
        showFieldError("password", result.message);
      } else {
        // General error - show on email field
        showFieldError("email", result.message);
      }
      submitButton.disabled = false;
      submitButton.textContent = "Sign Up";
    }
  });

  // real-time validation on blur
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (emailInput) {
    emailInput.addEventListener("blur", () => {
      const email = emailInput.value.trim();
      if (email && !isValidEmail(email)) {
        showFieldError("email", "Please enter a valid email address");
      } else {
        clearFieldErrors("email");
      }
    });

    emailInput.addEventListener("input", () => {
      clearFieldErrors("email");
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("blur", () => {
      const password = passwordInput.value.trim();
      if (!password) {
        showFieldError("password", "Password is required");
      } else if (!isValidPassword(password)) {
        showFieldError(
          "password",
          "Password must be at least 8 characters long"
        );
      } else {
        clearFieldErrors("password");
      }
    });

    passwordInput.addEventListener("input", () => {
      clearFieldErrors("password");
    });
  }
};

// === helper functions ===
// validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// validate password strength (min 8 characters)
function isValidPassword(password) {
  return password.length >= 8;
}

// show error message for specific field
function showFieldError(field, message) {
  const input = document.getElementById(field);
  if (!input) return;

  // remove existing error message
  clearFieldErrors(field);

  // add error class
  input.classList.add("auth-form-input-error");

  // create error element
  const errorElement = document.createElement("p");
  errorElement.classList.add("auth-form-group-error");

  if (field === "password") {
    input.classList.add("auth-form-input-error-password");
  }

  // icon element
  const iconElement = document.createElement("span");
  iconElement.classList.add("auth-form-group-error-icon");
  iconElement.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M2 8C2 11.3133 4.68605 14 8 14C11.3139 14 14 11.3133 14 8C14 4.68605 11.3139 2 8 2C4.68605 2 2 4.68605 2 8Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
         <path d="M8.0038 10.4621V7.59573V10.4621ZM8 5.5695V5.52734V5.5695Z" fill="currentColor"/>
         <path d="M8.0038 10.4621V7.59573M8 5.5695V5.52734" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
       </svg>`;

  //  text element
  const textSpan = document.createElement("span");
  textSpan.textContent = message;

  // append elements to error element
  errorElement.appendChild(iconElement);
  errorElement.appendChild(textSpan);

  // insert error element after the input
  const formGroup = input.closest(".auth-form-group");
  if (formGroup) {
    const inputWrapper = formGroup.querySelector(".auth-form-group-input");
    if (inputWrapper) {
      formGroup.insertBefore(errorElement, inputWrapper.nextSibling);
    } else {
      formGroup.appendChild(errorElement);
    }
  }
}

// clear error for specific field
function clearFieldErrors(field) {
  const input = document.getElementById(field);
  if (!input) return;

  // remove error class
  input.classList.remove("auth-form-input-error");
  input.classList.remove("auth-form-input-error-password");

  // remove error message
  const formGroup = input.closest(".auth-form-group");
  if (formGroup) {
    const errorElements = formGroup.querySelectorAll(".auth-form-group-error");

    errorElements.forEach((errorElement) => {
      errorElement.remove();
    });
  }
}

// setup password visibility toggle
function setupPasswordToggle() {
  const passwordInput = document.getElementById("password");
  const toggleButton = document.getElementById("password-toggle");

  if (!passwordInput || !toggleButton) return;

  // get icon references
  const hideIcon = toggleButton.querySelector(
    ".auth-form-group-toggle-icon-hide"
  );
  const showIcon = toggleButton.querySelector(
    ".auth-form-group-toggle-icon-show"
  );

  // update icon based on current password visibility
  const updateIcon = () => {
    const isPassword = passwordInput.type === "password";

    if (hideIcon && showIcon) {
      if (isPassword) {
        showIcon.style.display = "block";
        hideIcon.style.display = "none";
      } else {
        showIcon.style.display = "none";
        hideIcon.style.display = "block";
      }
    }
  };

  // initialize icon visibility
  updateIcon();

  // add event listener for toggle button
  toggleButton.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  toggleButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // toggle input type
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";

    // update icon visibility
    updateIcon();

    // refocus input to prevent blur validation
    passwordInput.focus();
  });
}
