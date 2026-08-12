import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        cart: resolve(__dirname, "cart/index.html"),
        checkout: resolve(__dirname, "checkout/index.html"),
        success: resolve(__dirname, "checkout/success.html"),
        product: resolve(__dirname, "product-list/index.html"),
      },
    },
  },
});