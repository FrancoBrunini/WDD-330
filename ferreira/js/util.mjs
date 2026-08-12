import ExternalServices from "./ExternalServices.mjs";

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (clear) {
    parentElement.innerHTML = "";
  }
  if (!parentElement || !list) return;

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter(onCurrencyChange) {
  const headerElement = document.getElementById("main-header");
  const footerElement = document.getElementById("main-footer");

  if (!headerElement || !footerElement) return;

  try {
    const headerPath = new URL("../partials/header.html", import.meta.url).href;
    const footerPath = new URL("../partials/footer.html", import.meta.url).href;

    const headerTemplate = await loadTemplate(headerPath);
    const footerTemplate = await loadTemplate(footerPath);

    renderWithTemplate(headerTemplate, headerElement);
    renderWithTemplate(footerTemplate, footerElement);

    initCurrencySelector(onCurrencyChange);
    updateCartCount();
  } catch (error) {
    console.error("Error cargando header o footer:", error);
  }
}

export function alertMessage(message, scroll = true) {
  const alertElement = document.createElement("div");
  alertElement.classList.add("alert-message");

  alertElement.innerHTML = `
    <p>${message}</p>
    <span class="alert-close" style="cursor:pointer; font-weight:bold; margin-left:10px;">X</span>
  `;

  alertElement.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN" || e.target.classList.contains("alert-close")) {
      alertElement.remove();
    }
  });

  const mainElement = document.querySelector("main");
  if (mainElement) {
    mainElement.prepend(alertElement);
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  setTimeout(() => {
    if (alertElement.parentNode) {
      alertElement.remove();
    }
  }, 4000);
}

export const currencySymbols = {
  USD: "$",
  EUR: "€",
  ARS: "ARS $"
};

export function formatPrice(amountInUSD, targetCurrency = "USD", rates = {}) {
  const rate = rates[targetCurrency] || 1;
  const converted = amountInUSD * rate;
  const symbol = currencySymbols[targetCurrency] || "$";
  
  return `${symbol}${converted.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export async function initCurrencySelector(onCurrencyChangeCallback) {
  const select = document.getElementById("currency-select");
  if (!select) return;

  try {
    const services = new ExternalServices();
    const rates = await services.getExchangeRates();

    setLocalStorage("exchange-rates", rates);

    const savedCurrency = getLocalStorage("user-currency") || "USD";
    select.value = savedCurrency;

    if (onCurrencyChangeCallback) {
      onCurrencyChangeCallback(savedCurrency, rates);
    }

    select.addEventListener("change", (e) => {
      const selectedCurrency = e.target.value;
      setLocalStorage("user-currency", selectedCurrency);
      if (onCurrencyChangeCallback) {
        onCurrencyChangeCallback(selectedCurrency, rates);
      }
    });
  } catch (error) {
    console.error("Error al obtener tasas de cambio:", error);
  }
}

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const countElement = document.querySelector(".cart-count");

  if (countElement) {
    const totalCount = cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || item.Quantity || 1),
      0
    );

    countElement.textContent = totalCount;

    if (totalCount > 0) {
      countElement.classList.remove("hide");
    } else {
      countElement.classList.add("hide");
    }
  }
}