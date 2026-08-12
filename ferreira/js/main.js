import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter } from "./util.mjs";
import Cart from "./Cart.mjs";

const dataSource = new ProductData();
const element = document.getElementById("product-list");
let listing = null;

if (element) {
  listing = new ProductList("all", dataSource, element);
  listing.init();
}

loadHeaderFooter((currency, rates) => {
  if (listing) {
    listing.renderList(listing.products, currency, rates);
  }
});

if (document.querySelector("#cart-list")) {
  const cart = new Cart("so-cart", "#cart-list"); 
  cart.init();
}