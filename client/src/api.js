const API_BASE_URL = "http://localhost:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("shopez_token");
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (username, email, password, usertype) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password, usertype }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Products
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category && filters.category.length > 0) {
      params.append("category", filters.category.join(","));
    }
    if (filters.gender && filters.gender.length > 0) {
      params.append("gender", filters.gender.join(","));
    }
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.minPrice !== undefined && filters.minPrice !== "") {
      params.append("minPrice", filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== "") {
      params.append("maxPrice", filters.maxPrice);
    }

    const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getProductById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Cart
  getCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  addToCart: async (item) => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  removeFromCart: async (id) => {
    const res = await fetch(`${API_BASE_URL}/cart/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  clearCart: async () => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  placeOrder: async (orderDetails) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderDetails),
    });
    return handleResponse(res);
  },

  updateOrderStatus: async (id, orderStatus) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ orderStatus }),
    });
    return handleResponse(res);
  },

  cancelOrder: async (id) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Config
  getAdminConfig: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/config`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateAdminConfig: async (config) => {
    const res = await fetch(`${API_BASE_URL}/admin/config`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
