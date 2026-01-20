import { http } from '@/lib/http';

const BASE = process.env.NEXT_PUBLIC_SENSORDATA_API ?? 'http://localhost:5273/api';

export type SensorData = {
  id: number;
  poisensorid: number;
  status: boolean;
  battery: number;
  temperature: number;
  noise: number;
  light: number;
  co2: number;
  lastComDate: string;
};

export async function listSensorData(token?: string) {
  return http<SensorData[]>(`${BASE}/sensordata`, { authToken: token });
}

export async function listSensorDataByPOISensorId(poiSensorId: string | number, token?: string) {
  return http<SensorData[]>(`${BASE}/sensordata/poisensor/${poiSensorId}`, {
    authToken: token
  });
}

export async function getSensorData(id: string, token?: string) {
  return http<SensorData>(`${BASE}/sensordata/${id}`, { authToken: token });
}

export async function createSensorData(payload: Omit<SensorData, 'id'>, token?: string) {
  return http<SensorData>(`${BASE}/sensordata`, {
    method: 'POST',
    body: payload,
    authToken: token,
  });
}

export async function updateSensorData(id: string, patch: Partial<SensorData>, token?: string) {
  return http<void>(`${BASE}/sensordata/${id}`, {
    method: 'PUT',
    body: patch,
    authToken: token,
  });
}

export async function deleteSensorData(id: string, token?: string) {
  return http<void>(`${BASE}/sensordata/${id}`, {
    method: 'DELETE',
    authToken: token,
  });
}
