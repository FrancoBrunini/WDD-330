import{getParam, 
  loadHeaderFooter, 
  alertMessage, 
  getLocalStorage, 
  setLocalStorage, 
  formatPrice 
} from "../js/util.mjs";
import CommentSystem from "../js/commentsystem.mjs";
import ProductData from "../js/ProductData.mjs";

const dataSource = new ProductData();
const productId = getParam("product");
let currentProduct = null;

function renderProductDetails(product, currency, rates) {
  const brandElem = document.getElementById("product-brand");
  const nameElem = document.getElementById("product-name");
  const imageElem = document.getElementById("product-image");
  const priceElem = document.getElementById("product-price");
  const buttonElem = document.getElementById("addToCart");

  if (brandElem) brandElem.textContent = product.Brand?.Name || product.brand || "";
  if (nameElem) nameElem.textContent = product.Name || product.name;
  if (imageElem) {
    imageElem.src = product.Images?.PrimaryLarge || product.Images?.PrimaryMedium || product.image;
    imageElem.alt = product.Name || product.name;
  }
  
  if (priceElem) {
    const usdPrice = Number(product.FinalPrice || product.price || product.ListPrice || 0);
    const selectedCurrency = currency || getLocalStorage("user-currency") || "USD";
    const selectedRates = rates || getLocalStorage("exchange-rates") || {};
    priceElem.textContent = formatPrice(usdPrice, selectedCurrency, selectedRates);
  }

  if (buttonElem) {
    buttonElem.onclick = () => addToCart(product);
  }
}

function addToCart(product) {
  let cart = getLocalStorage("so-cart") || [];
  if (!Array.isArray(cart)) cart = [];
  cart.push(product);
  setLocalStorage("so-cart", cart);
  alertMessage(`${product.Name || product.name} added to cart!`, false);
}

async function init() {
  if (!productId) {
    console.error("No product ID found in URL");
    return;
  }

  try {
    currentProduct = await dataSource.findProductById(productId);

    loadHeaderFooter((currency, rates) => {
      if (currentProduct) {
        renderProductDetails(currentProduct, currency, rates);
      }
    });

    if (currentProduct) {
      renderProductDetails(currentProduct);
      const comments = new CommentSystem(productId, "#comments-container");
      comments.init();
    }
  } catch (error) {
    console.error("Error loading product details:", error);
  }
}

init();