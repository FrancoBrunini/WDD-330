import ShoppingCart from "./ShoppingCart.mjs";

const parentElement = document.querySelector(".product-list");
const cart = new ShoppingCart("so-cart", parentElement);

cart.init();