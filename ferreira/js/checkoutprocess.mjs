import { getLocalStorage, alertMessage, formatPrice } from "./util.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id || item.id,
    name: item.Name || item.name,
    price: Number(item.FinalPrice || item.price || item.ListPrice || 0),
    quantity: Number(item.quantity || item.Quantity || 1),
  }));
}

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};

  formData.forEach((value, key) => {
    convertedJSON[key] = value;
  });

  return convertedJSON;
}

export default class CheckoutProcess {
  constructor(key, outputSelector) {
    this.key = key;
    this.outputSelector = outputSelector;
    this.list = [];
    this.itemTotal = 0;
    this.discount = 0;
    this.shipping = 0;
    this.tax = 0;
    this.orderTotal = 0;
  }

  init() {
    this.list = getLocalStorage(this.key) || [];
    this.calculateItemSubTotal();
  }

  calculateItemSubTotal() {
    const numItemsEl = document.querySelector(`${this.outputSelector} #num-items`);
    const subtotalEl = document.querySelector(`${this.outputSelector} #subtotal`);
    const discountEl = document.querySelector(`${this.outputSelector} #discount`);

    this.itemTotal = this.list.reduce((sum, item) => {
      const price = Number(item.FinalPrice || item.price || item.ListPrice || 0);
      const qty = Number(item.quantity || item.Quantity || 1);
      return sum + price * qty;
    }, 0);

    const discountRate = parseFloat(localStorage.getItem("discountRate")) || 0;
    this.discount = this.itemTotal * discountRate;

    const itemCount = this.list.reduce(
      (sum, item) => sum + Number(item.quantity || item.Quantity || 1),
      0
    );

    const currentCurrency = getLocalStorage("user-currency") || "USD";
    const currentRates = getLocalStorage("exchange-rates") || {};

    if (numItemsEl) numItemsEl.innerText = itemCount;
    if (subtotalEl) {
      subtotalEl.innerText = formatPrice(this.itemTotal, currentCurrency, currentRates);
    }
    if (discountEl) {
      discountEl.innerText = `-${formatPrice(this.discount, currentCurrency, currentRates)}`;
    }
  }

  calculateOrderTotal() {
    const subtotalWithDiscount = Math.max(0, this.itemTotal - this.discount);
    this.tax = subtotalWithDiscount * 0.06;

    const itemCount = this.list.reduce(
      (sum, item) => sum + Number(item.quantity || item.Quantity || 1),
      0
    );

    if (itemCount > 0) {
      this.shipping = 10 + (itemCount - 1) * 2;
    } else {
      this.shipping = 0;
    }

    this.orderTotal = subtotalWithDiscount + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxEl = document.querySelector(`${this.outputSelector} #tax`);
    const shippingEl = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotalEl = document.querySelector(`${this.outputSelector} #orderTotal`);

    const currentCurrency = getLocalStorage("user-currency") || "USD";
    const currentRates = getLocalStorage("exchange-rates") || {};

    if (taxEl) taxEl.innerText = formatPrice(this.tax, currentCurrency, currentRates);
    if (shippingEl) shippingEl.innerText = formatPrice(this.shipping, currentCurrency, currentRates);
    if (orderTotalEl) orderTotalEl.innerText = formatPrice(this.orderTotal, currentCurrency, currentRates);
  }

  async checkout(form) {
    const orderJSON = formDataToJSON(form);

    orderJSON.orderDate = new Date().toISOString();
    orderJSON.items = packageItems(this.list);
    orderJSON.itemTotal = (this.itemTotal - this.discount).toFixed(2);
    orderJSON.discount = this.discount.toFixed(2);
    orderJSON.shipping = this.shipping.toFixed(2);
    orderJSON.tax = this.tax.toFixed(2);
    orderJSON.orderTotal = this.orderTotal.toFixed(2);

    try {
      const res = await services.checkout(orderJSON);
      console.log("Respuesta del servidor:", res);

      localStorage.removeItem(this.key);
      localStorage.removeItem("appliedCouponCode");
      localStorage.removeItem("discountRate");
      
      window.location.href = "./success.html";
    } catch (err) {
      console.error("Error al procesar la orden:", err);

      this.removeAllAlerts();

      if (err.name === "servicesError") {
        if (typeof err.message === "object" && err.message !== null) {
          for (const key in err.message) {
            const msg =
              typeof err.message[key] === "object"
                ? JSON.stringify(err.message[key])
                : err.message[key];
            alertMessage(msg, true);
          }
        } else {
          alertMessage(String(err.message), true);
        }
      } else {
        alertMessage("There was an issue submitting your order.", true);
      }
    }
  }

  removeAllAlerts() {
    const alerts = document.querySelectorAll(".alert-message");
    alerts.forEach((alert) => alert.remove());
  }
}