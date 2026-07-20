import { getLocalStorage, renderListWithTemplate } from "./utils.mjs";

// Función plantilla para un solo item del carrito
function cartItemTemplate(item) {
  return `<li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img
        src="${item.Image}"
        alt="${item.Name}"
      />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
    <p class="cart-card__quantity">qty: 1</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
  </li>`;
}

export default class ShoppingCart {
  constructor(key, parentElement) {
    this.key = key; // Nombre de la clave en LocalStorage (ej: "so-cart")
    this.parentElement = parentElement;
  }

  async init() {
    const list = getLocalStorage(this.key) || [];
    this.renderCartContents(list);
  }

  renderCartContents(list) {
    // Usamos la utilidad reutilizable para renderizar la lista del carrito
    renderListWithTemplate(cartItemTemplate, this.parentElement, list, "afterbegin", true);
  }
}