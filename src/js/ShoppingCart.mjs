import { getLocalStorage, renderListWithTemplate } from "./utils.mjs";

// Función plantilla para un solo item del carrito
function cartItemTemplate(item) {
  const quantity = item.Quantity || 1;
  const image = item.Images?.PrimaryMedium || item.Image; // fallback para imágenes

  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img
        src="${image}"
        alt="${item.Name}"
      />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
    <p class="cart-card__quantity">qty: ${quantity}</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
  </li>`;
}

export default class ShoppingCart {
  constructor(key, parentElement) {
    this.key = key; // 
    this.parentElement = parentElement;
  }

  async init() {
    const list = getLocalStorage(this.key) || [];
    this.renderCartContents(list);
    this.calculateListTotal(list);
  }

  renderCartContents(list) {
    renderListWithTemplate(cartItemTemplate, this.parentElement, list, "afterbegin", true);
  }

  calculateListTotal(list) {
    const total = list.reduce((sum, item) => {
      const price = parseFloat(item.FinalPrice || item.ListPrice || 0);
      const qty = parseInt(item.Quantity || 1, 10);
      return sum + price * qty;
    }, 0);

    const totalElement = document.querySelector(".cart-total");
    if (totalElement) {
      if (list.length > 0) {
        totalElement.innerText = `Total: $${total.toFixed(2)}`;
        totalElement.classList.remove("hide");
      } else {
        totalElement.classList.add("hide");
      }
    }
  }
}