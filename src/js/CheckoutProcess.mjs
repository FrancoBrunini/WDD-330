JavaScript
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: item.FinalPrice,
    quantity: item.Quantity || 1,
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

    this.itemTotal = this.list.reduce(
      (sum, item) => sum + item.FinalPrice * (item.Quantity || 1),
      0
    );

    const itemCount = this.list.reduce(
      (sum, item) => sum + (item.Quantity || 1),
      0
    );

    if (numItemsEl) numItemsEl.innerText = itemCount;
    if (subtotalEl) subtotalEl.innerText = `$${this.itemTotal.toFixed(2)}`;
  }

  calculateOrderTotal() {
    this.tax = this.itemTotal * 0.06;

    const itemCount = this.list.reduce(
      (sum, item) => sum + (item.Quantity || 1),
      0
    );

    if (itemCount > 0) {
      this.shipping = 10 + (itemCount - 1) * 2;
    } else {
      this.shipping = 0;
    }

    this.orderTotal = this.itemTotal + this.tax + this.shipping;

    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const taxEl = document.querySelector(`${this.outputSelector} #tax`);
    const shippingEl = document.querySelector(`${this.outputSelector} #shipping`);
    const orderTotalEl = document.querySelector(`${this.outputSelector} #orderTotal`);

    if (taxEl) taxEl.innerText = `$${this.tax.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = `$${this.shipping.toFixed(2)}`;
    if (orderTotalEl) orderTotalEl.innerText = `$${this.orderTotal.toFixed(2)}`;
  }

  async checkout(form) {
    const orderJSON = formDataToJSON(form);

    orderJSON.orderDate = new Date().toISOString();
    orderJSON.items = packageItems(this.list);
    orderJSON.itemTotal = this.itemTotal.toFixed(2);
    orderJSON.shipping = this.shipping;
    orderJSON.tax = this.tax.toFixed(2);
    orderJSON.orderTotal = this.orderTotal.toFixed(2);

    console.log("Objeto enviado al servidor:", orderJSON);

    try {
      const res = await services.checkout(orderJSON);
      console.log("Respuesta del servidor:", res);
      alert("¡Orden enviada con éxito!");
    } catch (err) {
      console.error("Error al procesar la orden:", err);
    }
  }
}