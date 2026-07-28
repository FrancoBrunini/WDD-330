import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import CommentSystem from "./CommentSystem.mjs";
import { getParam } from "./utils.mjs";
export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = {};
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);

    this.renderProductDetails();

    const addToCartBtn = document.getElementById("addToCart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => this.addToCart());
      console.log("✅ Evento click asignado al botón #addToCart");
    } else {
      console.error("❌ No se encontró el botón con id='addToCart'");
    }
  }

  addToCart() {
    console.log("🛒 Intentando agregar al carrito:", this.product);

    let cartItems = getLocalStorage("so-cart");

    if (!Array.isArray(cartItems)) {
      cartItems = cartItems ? [cartItems] : [];
    }

    const existingIndex = cartItems.findIndex((item) => item.Id === this.product.Id);

    if (existingIndex > -1) {
      cartItems[existingIndex].Quantity = (cartItems[existingIndex].Quantity || 1) + 1;
    } else {
      this.product.Quantity = 1;
      cartItems.push(this.product);
    }

    setLocalStorage("so-cart", cartItems);

    console.log("🛒 Carrito actualizado:", cartItems);
    alert(`${this.product.NameWithoutBrand || this.product.Name} added to cart!`);
  }

  renderProductDetails() {
    document.querySelector("#productBrand").textContent =
      this.product.Brand.Name;

    document.querySelector("#productName").textContent =
      this.product.NameWithoutBrand || this.product.Name;

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

const productId = getParam("product");


if (productId) {
  const commentSystem = new CommentSystem(productId, "#comments-container");
  commentSystem.init();
}