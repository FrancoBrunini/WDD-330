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
  if(callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const headerElement = document.getElementById("main-header");
  const footerElement = document.getElementById("main-footer");

  if (!headerElement || !footerElement) return;

  try {
    const headerTemplate = await loadTemplate("/partials/header.html");
    const footerTemplate = await loadTemplate("/partials/footer.html");

    renderWithTemplate(headerTemplate, headerElement);
    renderWithTemplate(footerTemplate, footerElement);
  } catch (error) {
    console.error("Error cargando header o footer:", error);
  }
}
export function alertMessage(message, scroll = true) {
  const alert = document.createElement("div");
  alert.classList.add("alert-message");

  alert.innerHTML = `
    <p>${message}</p>
    <span class="alert-close">X</span>
  `;

  alert.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN" || e.target.classList.contains("alert-close")) {
      alert.remove();
    }
  });

  const main = document.querySelector("main");
  if (main) {
    main.prepend(alert);
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

