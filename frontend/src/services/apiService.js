const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5029/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const apiService = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async getDemoUsers() {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return handleResponse(res);
  },

  // Harvest Lots
  async getAllLots(producer = '') {
    const url = producer
      ? `${API_BASE}/harvestlots?producer=${encodeURIComponent(producer)}`
      : `${API_BASE}/harvestlots`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getAvailableLots() {
    const res = await fetch(`${API_BASE}/harvestlots/available`);
    return handleResponse(res);
  },

  async createLot(lotData) {
    const res = await fetch(`${API_BASE}/harvestlots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lotData)
    });
    return handleResponse(res);
  },

  async deleteLot(id) {
    const res = await fetch(`${API_BASE}/harvestlots/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${res.status}: No se pudo eliminar el lote`);
    }
    return true;
  },

  // Transport Vehicles
  async getAvailableVehicles() {
    const res = await fetch(`${API_BASE}/transportvehicles/available`);
    return handleResponse(res);
  },

  async getAllVehicles() {
    const res = await fetch(`${API_BASE}/transportvehicles`);
    return handleResponse(res);
  },

  async createVehicle(data) {
    const res = await fetch(`${API_BASE}/transportvehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Routes & Optimization
  async getAllRoutes() {
    const res = await fetch(`${API_BASE}/routes`);
    return handleResponse(res);
  },

  async getRouteById(id) {
    const res = await fetch(`${API_BASE}/routes/${id}`);
    return handleResponse(res);
  },

  async estimateRoute(data) {
    const res = await fetch(`${API_BASE}/routes/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async optimizeRoute(data) {
    const res = await fetch(`${API_BASE}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async completeStop(routeId, stopId) {
    const res = await fetch(`${API_BASE}/routes/${routeId}/stops/${stopId}/complete`, {
      method: 'PATCH'
    });
    return handleResponse(res);
  },

  // Crops Catalog (Hierarchical & Server-side Search)
  async getCropCategories() {
    const res = await fetch(`${API_BASE}/crops/categories`);
    return handleResponse(res);
  },

  async searchCrops(category = '', search = '', page = 1, pageSize = 12) {
    const params = new URLSearchParams();
    if (category && category !== 'Todos') params.append('category', category);
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('pageSize', pageSize);

    const res = await fetch(`${API_BASE}/crops?${params.toString()}`);
    return handleResponse(res);
  },

  async createCrop(data) {
    const res = await fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Market Prices
  async getAllPrices() {
    const res = await fetch(`${API_BASE}/marketprices`);
    return handleResponse(res);
  },

  async getSuggestedPrice(crop) {
    const res = await fetch(`${API_BASE}/marketprices/suggested?crop=${encodeURIComponent(crop)}`);
    return handleResponse(res);
  }
};
