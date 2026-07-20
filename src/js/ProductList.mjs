import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const hasDiscount = product.FinalPrice < product.SuggestedRetailPrice;

  let discountBadge = "";
  let priceHTML = `<p class="product-card__price">$${product.FinalPrice}</p>`;

  if (hasDiscount) {
    const savings = (product.SuggestedRetailPrice - product.FinalPrice).toFixed(2);
    const discountPercent = Math.round(
      ((product.SuggestedRetailPrice - product.FinalPrice) / product.SuggestedRetailPrice) * 100
    );

    discountBadge = `<span class="discount-badge">-${discountPercent}% OFF</span>`;

    priceHTML = `
      <p class="product-card__price">
        <span class="original-price">$${product.SuggestedRetailPrice}</span>
        <span class="discount-price">$${product.FinalPrice}</span>
        <span class="savings-amount">Save $${savings}!</span>
      </p>
    `;
  }

  return `<li class="product-card">
    <a href="/product_pages/index.html?product=${product.Id}">
      ${discountBadge}
      <img src="${product.Images.PrimaryMedium}" alt="Image of ${product.Name}">
      <h3 class="card__brand">${product.Brand.Name}</h3>
      <h2 class="card__name">${product.Name}</h2>
      ${priceHTML}
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
  }

  async init() {
    const list = await this.dataSource.getData(this.category);
    this.renderList(list);
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }}