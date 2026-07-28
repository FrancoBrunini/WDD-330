const baseURL = import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();
  if (res.ok) {
    return jsonResponse; 
  } else {
    throw { name: "servicesError", message: jsonResponse };
  }
}

export default class ExternalServices {
  constructor() {}

  async getData(category) {
    const cleanBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
    const response = await fetch(`${cleanBaseURL}products/search/${category}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await convertToJson(response);
    return data.Result;
  }

  async findProductById(id) {
    const cleanBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
    const response = await fetch(`${cleanBaseURL}product/${id}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await convertToJson(response);
    return data.Result;
  }

  async checkout(payload) {
    const cleanBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(`${cleanBaseURL}checkout`, options);
    return await convertToJson(response);
  }
}