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
  async getAllLots() {
    const res = await fetch(`${API_BASE}/harvestlots`);
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

  // Transport Vehicles
  async getAvailableVehicles() {
    const res = await fetch(`${API_BASE}/transportvehicles/available`);
    return handleResponse(res);
  },

  async getAllVehicles() {
    const res = await fetch(`${API_BASE}/transportvehicles`);
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
