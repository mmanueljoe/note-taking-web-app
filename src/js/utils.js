export const getElementByType = (type, value) => {
  switch (type.toLowerCase()) {
    case "id":
      return document.getElementById(value);
    case "class":
      return Array.from(document.getElementsByClassName(value));
    case "tag":
      return Array.from(document.getElementsByTagName(value));
    default:
      return null;
  }
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-GB", options);
};

// escape html to prevent xss attacks
export const escapeHtml = (html) => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};
