import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const dataSource = new ProductData("tents");

const listElement = document.querySelector(".product-list");

const myList = new ProductList("tents", dataSource, listElement);
myList.init();