import { request } from './api';
import { weatherService } from './weatherService';

const LOCAL_STORAGE_KEY = 'mantaro_predictions_cache';

export const frostPredictionService = {
  /**
   * Execute an evening prediction request.
   */
  async predictEvening(data) {
    const result = await request('/api/predictions', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Save to local cache as secondary persistence
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = [result, ...existing.filter((item) => item.id !== result.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
    } catch {
      // Ignore localStorage issues
    }

    return result;
  },

  /**
   * Retrieve list of previous predictions from Backend (or localStorage fallback).
   */
  async getPredictionHistory() {
    try {
      const records = await request('/api/predictions', { method: 'GET' });
      if (Array.isArray(records)) {
        return records;
      }
    } catch (err) {
      console.warn('[frostPredictionService] Backend history unavailable, reading cache:', err);
    }

    // Fallback to cached items
    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      return cached;
    } catch {
      return [];
    }
  },

  /**
   * Retrieve a specific prediction record.
   */
  async getPredictionById(id) {
    return await request(`/api/predictions/${id}`, { method: 'GET' });
  },

  /**
   * Delete a prediction record.
   */
  async deletePrediction(id) {
    try {
      await request(`/api/predictions/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[frostPredictionService] Backend delete failed:', err);
    }

    try {
      const cached = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const filtered = cached.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Ignore
    }
    return true;
  },

  /**
   * Retrieve ML Model transparency metadata.
   */
  async getModelInfo() {
    return await request('/api/model/info', { method: 'GET' });
  },

  /**
   * Retrieve backend & VPS health status.
   */
  async getHealth() {
    return await request('/api/health', { method: 'GET' });
  },

  /**
   * Retrieve live weather for a corridor zone via backend or Open-Meteo fallback.
   */
  async getLiveWeather(zoneId = 'chupaca') {
    try {
      const data = await request(`/api/weather/live?zone=${zoneId}`, { method: 'GET' });
      if (data && data.zoneId) return data;
    } catch {
      // Fallback handled by direct Open-Meteo service
    }
    return await weatherService.getLiveWeatherForZone(zoneId);
  }
};
