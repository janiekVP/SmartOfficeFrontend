import { http } from '@/lib/http';

const BASE = process.env.NEXT_PUBLIC_POISENSORS_API ?? 'http://localhost:5273/api';

export type POISensor = {
  id: number;
  POIId: number;
  name: string;
  type: string;
};

export type POISensorCreateDto = {
  POIId: number;
  name: string;
  type: string;
};

export async function listPOISensor(token?: string) {
  return http<POISensor[]>(`${BASE}/poisensor`, { authToken: token });
}

export async function listPOISensorByPOIId(POIId: string | number, token?: string) {
  return http<POISensor[]>(`${BASE}/poisensor/poi/${POIId}`, {
    authToken: token
  });
}

export async function getPOISensor(id: string, token?: string) {
  return http<POISensor>(`${BASE}/poisensor/${id}`, { authToken: token });
}

export async function createPOISensor(payload: POISensorCreateDto, token?: string) {
  return http<POISensor>(`${BASE}/poisensor`, {
    method: 'POST',
    body: payload,
    authToken: token,
  });
}

export async function updatePOISensor(id: string, patch: Partial<POISensor>, token?: string) {
  return http<POISensor>(`${BASE}/poisensor/${id}`, { method: 'PUT', body: patch, authToken: token });
}

export async function deletePOISensor(id: string, token?: string) {
  return http<void>(`${BASE}/poisensor/${id}`, { method: 'DELETE', authToken: token });
}
