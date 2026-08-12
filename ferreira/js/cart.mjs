import { getLocalStorage, setLocalStorage, formatPrice } from "./util.mjs";

function cartItemTemplate(item, currentCurrency = "USD", rates = {}) {
  const usdPrice = Number(item.FinalPrice || item.price || item.ListPrice || 0);
  const qty = Number(item.quantity) || 1;
  const formattedPrice = formatPrice(usdPrice * qty, currentCurrency, rates);
  const itemId = String(item.Id || item.id);

  return `
    <li class="cart-card divider" data-id="${itemId}">
      <button class="cart-card__remove" data-id="${itemId}">X</button>
      <a href="#" class="cart-card__image">
        <img src="${item.Images?.PrimaryMedium || item.image}" alt="${item.Name || item.name}" />
      </a>
      <a href="#">
        <h2 class="card__name">${item.Name || item.name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors?.[0]?.ColorName || ""}</p>
      
      <div class="cart-card__quantity-controls">
        <button class="btn-qty btn-minus" data-id="${itemId}">-</button>
        <span class="cart-card__quantity">${qty}</span>
        <button class="btn-qty btn-plus" data-id="${itemId}">+</button>
      </div>

      <p class="cart-card__price">${formattedPrice}</p>
    </li>
  `;
}

export default class Cart {
  constructor(key, parentSelector) {
    this.key = key;
    this.parentSelector = parentSelector;
    this.listenersAttached = false; 
  }

  async init(currency, rates) {
    this.renderCartContents(currency, rates);
  }

  getCartItems() {
    return getLocalStorage(this.key) || [];
  }

  renderCartContents(currency, rates) {
    const cartItems = this.getCartItems();

    const currentCurrency = currency || getLocalStorage("user-currency") || "USD";
    const currentRates = rates || getLocalStorage("exchange-rates") || {};

    const parent = document.querySelector(this.parentSelector);
    if (!parent) return;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      parent.innerHTML = "<p>Your cart is empty.</p>";
      this.calculateTotal([], currentCurrency, currentRates);
      this.toggleCheckoutButton(false);
      return;
    }

    const htmlItems = cartItems.map((item) =>
      cartItemTemplate(item, currentCurrency, currentRates)
    );
    parent.innerHTML = htmlItems.join("");

    if (!this.listenersAttached) {
      this.attachEventListeners();
      this.setupCouponListener();
      this.listenersAttached = true;
    }

    this.calculateTotal(cartItems, currentCurrency, currentRates);
    this.toggleCheckoutButton(true);
  }

  attachEventListeners() {
    const parent = document.querySelector(this.parentSelector);
    if (!parent) return;

    parent.addEventListener("click", (e) => {
      const target = e.target;
      const id = target.dataset.id;
      if (!id) return;

      const currency = getLocalStorage("user-currency") || "USD";
      const rates = getLocalStorage("exchange-rates") || {};

      if (target.classList.contains("cart-card__remove")) {
        e.preventDefault();
        this.removeItem(id, currency, rates);
      } else if (target.classList.contains("btn-plus")) {
        e.preventDefault();
        this.changeQuantity(id, 1, currency, rates);
      } else if (target.classList.contains("btn-minus")) {
        e.preventDefault();
        this.changeQuantity(id, -1, currency, rates);
      }
    });
  }

  changeQuantity(id, amount, currency, rates) {
    let items = this.getCartItems();
    const targetId = String(id);
    
    const itemIndex = items.findIndex((i) => String(i.Id || i.id) === targetId);

    if (itemIndex !== -1) {
      const currentQty = Number(items[itemIndex].quantity) || 1;
      const newQty = currentQty + amount;

      if (newQty <= 0) {
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = newQty;
      }

      setLocalStorage(this.key, items);
      this.renderCartContents(currency, rates);
    }
  }

  removeItem(id, currency, rates) {
    let items = this.getCartItems();
    const targetId = String(id);
    const itemIndex = items.findIndex((i) => String(i.Id || i.id) === targetId);

    if (itemIndex !== -1) {
      items.splice(itemIndex, 1); 
      setLocalStorage(this.key, items);
      this.renderCartContents(currency, rates);
    }
  }

  calculateTotal(cartItems = this.getCartItems(), currency, rates) {
    const totalElement = document.querySelector(".cart-total");
    if (!totalElement) return;

    if (cartItems.length > 0) {
      const totalUSD = cartItems.reduce((sum, item) => {
        const price = Number(item.FinalPrice || item.price || item.ListPrice || 0);
        const qty = Number(item.quantity) || 1;
        return sum + price * qty;
      }, 0);

      const discountRate = parseFloat(localStorage.getItem("discountRate")) || 0;
      const totalWithDiscountUSD = totalUSD * (1 - discountRate);

      const currentCurrency = currency || getLocalStorage("user-currency") || "USD";
      const currentRates = rates || getLocalStorage("exchange-rates") || {};

      const formattedTotal = formatPrice(totalWithDiscountUSD, currentCurrency, currentRates);
      totalElement.textContent = `Total: ${formattedTotal}`;
      totalElement.classList.remove("hide");
    } else {
      totalElement.classList.add("hide");
    }
  }

  setupCouponListener() {
    const COUPONS = {
      "FERREIRA10": 0.10,
      "FERREIRA20": 0.20,
      "DISCOUNT15": 0.15
    };

    const applyBtn = document.getElementById("apply-coupon-btn");
    if (!applyBtn) return;

    applyBtn.addEventListener("click", () => {
      const input = document.getElementById("coupon-code");
      const message = document.getElementById("coupon-message");
      const code = input ? input.value.trim().toUpperCase() : "";

      if (!code) {
        if (message) {
          message.style.color = "red";
          message.textContent = "Please enter a coupon code.";
        }
        return;
      }

      if (COUPONS[code]) {
        const discountRate = COUPONS[code];

        localStorage.setItem("appliedCouponCode", code);
        localStorage.setItem("discountRate", discountRate);

        if (message) {
          message.style.color = "green";
          message.textContent = `Coupon ${code} applied! ${discountRate * 100}% discount.`;
        }

        this.calculateTotal();
      } else {
        if (message) {
          message.style.color = "red";
          message.textContent = "Invalid coupon code.";
        }
      }
    });
  }

  toggleCheckoutButton(show) {
    let btnCheckout = document.querySelector("#checkout-btn");
    const cartFooter = document.querySelector(".cart-footer");

    if (show) {
      if (!btnCheckout && cartFooter) {
        btnCheckout = document.createElement("a");
        btnCheckout.id = "checkout-btn";
        btnCheckout.href = "../checkout/index.html";
        btnCheckout.className = "btn-checkout";
        btnCheckout.textContent = "Proceed to Checkout";
        cartFooter.appendChild(btnCheckout);
      }
    } else if (btnCheckout) {
      btnCheckout.remove();
    }
  }
}