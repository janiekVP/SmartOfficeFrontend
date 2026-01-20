import { http } from '@/lib/http';

const BASE = process.env.NEXT_PUBLIC_POIS_API ?? 'http://localhost:5273/api';

export type POI = {
  id: number;
  floorplanid: number;
  name: string;
  type: string;
  description: string;
  coordx: number;
  coordy: number;
};

export async function listPOI(token?: string) {
  return http<POI[]>(`${BASE}/poi`, { authToken: token });
}

export async function listPOIByFloorplanId(floorplanId: string | number, token?: string) {
  return http<POI[]>(`${BASE}/poi/floorplan/${floorplanId}`, { authToken: token });
}

export async function getPOI(id: string, token?: string) {
  return http<POI>(`${BASE}/poi/${id}`, { authToken: token });
}

export async function createPOI(payload: Omit<POI, 'id'>, token?: string) {
  return http<POI>(`${BASE}/poi`, { method: 'POST', body: payload, authToken: token });
}

export async function updatePOI(id: string, patch: Partial<POI>, token?: string) {
  return http<POI>(`${BASE}/poi/${id}`, { method: 'PUT', body: patch, authToken: token });
}

export async function deletePOI(id: string, token?: string) {
  return http<void>(`${BASE}/poi/${id}`, { method: 'DELETE', authToken: token });
}
