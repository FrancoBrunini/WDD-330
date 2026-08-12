import Cart from "../js/cart.mjs";
import { loadHeaderFooter } from "../js/util.mjs";

const cart = new Cart("so-cart", "#cart-list");

async function init() {
  loadHeaderFooter((currency, rates) => {
    cart.renderCartContents(currency, rates);
  });

  await cart.init();
}

init();