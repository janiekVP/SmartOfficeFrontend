import { http } from '@/lib/http';

const BASE = process.env.NEXT_PUBLIC_FLOORPLANS_API ?? 'http://localhost:5273/api';

export type Floorplan = {
  id: number;
  country: string;
  district: string;
  city: string;
  company: string;
  office: string;
  floor: string;
  imageContentType?: string | null;
  imageBase64?: string | null;
};

export type FloorplanForm = {
  country: string;
  district: string;
  city: string;
  company: string;
  office: string;
  floor: string;
  image?: File;
};

function toFormData(payload: Record<string, any>) {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value == null) return;
    if (value instanceof File) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  });

  return fd;
}

export async function listFloorplan(token?: string) {
  return http<Floorplan[]>(`${BASE}/floorplans`, { authToken: token });
}

export async function getFloorplan(id: string, token?: string) {
  return http<Floorplan>(`${BASE}/floorplans/${id}`, { authToken: token });
}

export async function createFloorplan(payload: FloorplanForm, token?: string ) {
  return http<Floorplan>(`${BASE}/floorplans`, { method: 'POST', body: toFormData(payload), authToken: token});
}

export async function updateFloorplan( id: string, patch: Partial<FloorplanForm>, token?: string) {
  return http<void>(`${BASE}/floorplans/${id}`, { method: 'PUT', body: toFormData(patch), authToken: token});
}

export async function deleteFloorplan(id: string, token?: string) {
  return http<void>(`${BASE}/floorplans/${id}`, { method: 'DELETE', authToken: token });
}
