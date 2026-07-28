import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

loadHeaderFooter();

const checkout = new CheckoutProcess("so-cart", ".order-summary");
checkout.init();

const zipInput = document.querySelector("#zip");
if (zipInput) {
  zipInput.addEventListener("blur", () => {
    checkout.calculateOrderTotal();
  });
}

const formElement = document.forms["checkout"] || document.querySelector("#checkout-form");

formElement.addEventListener("submit", (e) => {
  e.preventDefault();
  const chk_status = formElement.checkValidity();
  formElement.reportValidity();

  if (chk_status) {
    checkout.calculateOrderTotal();
    
    checkout.checkout(formElement);
  }
});