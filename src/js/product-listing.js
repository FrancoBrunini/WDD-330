import { loadHeaderFooter } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

loadHeaderFooter();

const dataSource = new ProductData("tents");
const listElement = document.querySelector(".product-list");
const productList = new ProductList("tents", dataSource, listElement);

productList.init();