import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
  }

  addToCart() {
    const cartItems = getLocalStorage("so-cart") || [];
    cartItems.push(this.product);
    setLocalStorage("so-cart", cartItems);
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);

    this.renderProductDetails();

    document
      .getElementById("addToCart")
      .addEventListener("click", this.addToCart.bind(this));
  }

  renderProductDetails() {
  document.querySelector(".product-detail h3").textContent =
    this.product.Brand.Name;

  document.querySelector(".product-detail h2").textContent =
    this.product.NameWithoutBrand;

  const image = document.querySelector(".product-detail img");
  image.src = this.product.Image;
  image.alt = this.product.Name;

  document.querySelector(".product-card__price").textContent =
    `$${this.product.FinalPrice}`;

  document.querySelector(".product__color").textContent =
    this.product.Colors[0].ColorName;

  document.querySelector(".product__description").innerHTML =
    this.product.DescriptionHtmlSimple;

  document.querySelector("#addToCart").dataset.id =
    this.product.Id;
}
}