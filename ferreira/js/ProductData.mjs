import { getLocalStorage, setLocalStorage, alertMessage } from "./util.mjs";

function convertToJson(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw new Error("Bad Response");
  }
}

export default class ProductData {
  constructor() {
this.path = "./js/json/products.json";  }

  async getData() {
    const response = await fetch(this.path);
    const data = await convertToJson(response);
    return data;
  }

  async findProductById(id) {
    const products = await this.getData();
    return products.find((item) => item.id === id);
  }
}


function addToCartHandler(product) {
  let cart = getLocalStorage("so-cart") || [];

  const existingIndex = cart.findIndex(
    (item) => String(item.Id || item.id) === String(product.Id || product.id)
  );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  setLocalStorage("so-cart", cart);

  alertMessage(`${product.Name || product.name} added to cart!`);
}

