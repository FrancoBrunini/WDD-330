import { loadHeaderFooter } from "../js/util.mjs";
import CheckoutProcess from "../js/checkoutprocess.mjs";

const myCheckout = new CheckoutProcess("so-cart", "#order-summary");

async function init() {
  loadHeaderFooter((currency, rates) => {
    myCheckout.calculateItemSubTotal();
    myCheckout.calculateOrderTotal();
  });

  myCheckout.init();
  
  
  myCheckout.calculateOrderTotal();

  const zipInput = document.querySelector("#zip");
  if (zipInput) {
    zipInput.addEventListener("blur", () => {
      myCheckout.calculateOrderTotal();
    });
  }

  const form = document.querySelector("#checkout-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.checkValidity();
      form.reportValidity();

      if (status) {
        myCheckout.checkout(form);
      }
    });
  }
}

init();