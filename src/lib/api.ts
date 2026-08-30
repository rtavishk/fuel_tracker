import { getSupabaseClient } from './supabase';
import { FuelEntry, TripEntry, VehicleConfig, MaintenanceScheduleItem } from '../types';
import { clientLogger } from './logger';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('fuel_tracker_token');
  const userStr = localStorage.getItem('fuel_tracker_user');
  let guestId = '';
  let guestEmail = '';

  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      guestId = u.id || '';
      guestEmail = u.email || '';
    } catch {
      // Ignored
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (guestId) {
    headers['x-guest-user-id'] = guestId;
    headers['x-guest-user-email'] = guestEmail;
  }

  return headers;
}

export const api = {
  // 1. Vehicles
  async getVehicles(): Promise<VehicleConfig[]> {
    try {
      const res = await fetch('/api/vehicles', {
        headers: getAuthHeaders(),
      });
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API getVehicles: Non-JSON response received');
        return [];
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.vehicles || [];
      }
    } catch (e) {
      console.warn('API getVehicles fallback:', e);
    }
    return [];
  },

  async createVehicle(payload: Partial<VehicleConfig>): Promise<VehicleConfig | null> {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API createVehicle: Non-JSON response received');
        return null;
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.vehicle;
      }
    } catch (e) {
      console.warn('API createVehicle fallback:', e);
    }
    return null;
  },

  async updateVehicle(id: string, payload: Partial<VehicleConfig>): Promise<boolean> {
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API updateVehicle: Non-JSON response received');
        return false;
      }
      
      return res.ok;
    } catch (e) {
      console.warn('API updateVehicle fallback:', e);
      return false;
    }
  },

  // 2. Fuel Entries
  async getFuelEntries(vehicleId?: string): Promise<FuelEntry[]> {
    try {
      const url = vehicleId ? `/api/fuel-entries?vehicleId=${vehicleId}` : '/api/fuel-entries';
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API getFuelEntries: Non-JSON response received');
        return [];
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.entries || [];
      }
    } catch (e) {
      console.warn('API getFuelEntries fallback:', e);
    }
    return [];
  },

  async createFuelEntry(payload: Omit<FuelEntry, 'id'> & { vehicleId?: string }): Promise<FuelEntry | null> {
    try {
      const res = await fetch('/api/fuel-entries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API createFuelEntry: Non-JSON response received');
        return null;
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.entry;
      }
    } catch (e) {
      console.warn('API createFuelEntry fallback:', e);
    }
    return null;
  },

  async deleteFuelEntry(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/fuel-entries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API deleteFuelEntry: Non-JSON response received');
        return false;
      }
      
      return res.ok;
    } catch (e) {
      console.warn('API deleteFuelEntry fallback:', e);
      return false;
    }
  },

  // 3. Trip Entries
  async getTripEntries(vehicleId?: string): Promise<TripEntry[]> {
    try {
      const url = vehicleId ? `/api/trip-entries?vehicleId=${vehicleId}` : '/api/trip-entries';
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API getTripEntries: Non-JSON response received');
        return [];
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.trips || [];
      }
    } catch (e) {
      console.warn('API getTripEntries fallback:', e);
    }
    return [];
  },

  async createTripEntry(payload: Omit<TripEntry, 'id'> & { vehicleId?: string }): Promise<TripEntry | null> {
    try {
      const res = await fetch('/api/trip-entries', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API createTripEntry: Non-JSON response received');
        return null;
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.trip;
      }
    } catch (e) {
      console.warn('API createTripEntry fallback:', e);
    }
    return null;
  },

  async deleteTripEntry(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/trip-entries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API deleteTripEntry: Non-JSON response received');
        return false;
      }
      
      return res.ok;
    } catch (e) {
      console.warn('API deleteTripEntry fallback:', e);
      return false;
    }
  },

  // 4. Maintenance Schedules
  async getMaintenance(vehicleId?: string): Promise<MaintenanceScheduleItem[]> {
    try {
      const url = vehicleId ? `/api/maintenance?vehicleId=${vehicleId}` : '/api/maintenance';
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API getMaintenance: Non-JSON response received');
        return [];
      }
      
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch (e) {
      console.warn('API getMaintenance fallback:', e);
    }
    return [];
  },
};
