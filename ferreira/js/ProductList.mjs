import { getLocalStorage, setLocalStorage, alertMessage } from "./util.mjs";
import { formatPrice } from "./util.mjs";

function productCardTemplate(product, currentCurrency = "USD", rates = {}) {
  const productUrl = `/product-list/index.html?product=${product.id || product.Id}`;
  const usdPrice = Number(product.FinalPrice || product.price || product.ListPrice || 0);
  const formattedPrice = formatPrice(usdPrice, currentCurrency, rates);

  return `
    <li class="product-card">
      <a href="${productUrl}" class="product-card__link">
        <img src="${product.Images?.PrimaryMedium || product.image}" alt="${product.Name || product.name}" />
        <h3 class="card__brand">${product.Brand?.Name || product.brand || ''}</h3>
        <h2 class="card__name">${product.Name || product.name}</h2>
      </a>
      
      <div class="product-card__actions">
        <p class="product-card__price">${formattedPrice}</p>
        <a href="${productUrl}" class="btn-detail">View Details</a>
      </div>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    if (this.dataSource && typeof this.dataSource.getData === "function") {
      this.products = await this.dataSource.getData();
    } else if (Array.isArray(this.dataSource)) {
      this.products = this.dataSource;
    }

    this.renderList(this.products);
    this.addAddToCartListeners();
    this.setupFilter();
  }

  renderList(list = this.products, currency, rates) {
    if (!this.listElement) return;
    this.listElement.innerHTML = "";

    const currentCurrency = currency || getLocalStorage("user-currency") || "USD";
    const currentRates = rates || getLocalStorage("exchange-rates") || {};

    const htmlContents = list.map((product) =>
      productCardTemplate(product, currentCurrency, currentRates)
    );
    this.listElement.innerHTML = htmlContents.join("");
  }

  setupFilter() {
    const filterSelect = document.getElementById("category-filter");
    if (!filterSelect) return;

    filterSelect.addEventListener("change", (e) => {
      const selectedCategory = e.target.value;

      if (selectedCategory === "all") {
        this.renderList(this.products);
      } else {
        const filtered = this.products.filter(
          (product) =>
            product.category &&
            product.category.toLowerCase() === selectedCategory.toLowerCase()
        );
        this.renderList(filtered);
      }
    });
  }

  addAddToCartListeners() {
    const buttons = this.listElement.querySelectorAll(".add-to-cart-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const productId = e.target.dataset.id;
        this.addToCart(productId);
      });
    });
  }

  addToCart(productId) {
    const productToAdd = this.products.find((p) => (p.id || p.Id) === productId);
    if (!productToAdd) return;

    let cart = getLocalStorage("so-cart");
    if (!Array.isArray(cart)) {
      cart = [];
    }

    cart.push(productToAdd);
    setLocalStorage("so-cart", cart);

    alertMessage(`${productToAdd.name || productToAdd.Name} added to cart!`, false);
  }
}