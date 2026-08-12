const baseURL = "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

export default class ExternalServices {
  constructor() {
    this.currencyUrl = "https://open.er-api.com/v6/latest/USD";
  }

  async getExchangeRates() {
    try {
      const response = await fetch(this.currencyUrl);
      if (!response.ok) throw new Error("Error fetching exchange rates");
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error("Exchange Rate API error:", error);
      return { USD: 1 };
    }
  }

  async getData(category) {
    const response = await fetch(baseURL + `products/search/${category}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    const response = await fetch(baseURL + `product/${id}`);
    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(baseURL + "checkout/", options);
    return await convertToJson(response);
  }
}