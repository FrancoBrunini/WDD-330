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
  // Usamos # para buscar por ID exactamente como están en tu HTML
  document.querySelector("#productBrand").textContent =
    this.product.Brand.Name;

  document.querySelector("#productName").textContent =
    this.product.NameWithoutBrand || this.product.Name;

  // Imagen en alta resolución
  const image = document.querySelector("#productImage");
  image.src = this.product.Images.PrimaryLarge;
  image.alt = this.product.Name;

  const priceElement = document.querySelector("#productPrice");
  const hasDiscount = this.product.FinalPrice < this.product.SuggestedRetailPrice;

  if (hasDiscount) {
    const savings = (this.product.SuggestedRetailPrice - this.product.FinalPrice).toFixed(2);
    const discountPercent = Math.round(
      ((this.product.SuggestedRetailPrice - this.product.FinalPrice) / this.product.SuggestedRetailPrice) * 100
    );

    priceElement.innerHTML = `
      <span class="discount-badge">-${discountPercent}% OFF</span>
      <span class="original-price">$${this.product.SuggestedRetailPrice}</span>
      <span class="discount-price">$${this.product.FinalPrice}</span>
      <span class="savings-amount">Save $${savings}!</span>
    `;
  } else {
    priceElement.textContent = `$${this.product.FinalPrice}`;
  }

  document.querySelector("#productColor").textContent =
    this.product.Colors[0].ColorName;

  document.querySelector("#productDescription").innerHTML =
    this.product.DescriptionHtmlSimple;

  document.querySelector("#addToCart").dataset.id =
    this.product.Id;
}
}