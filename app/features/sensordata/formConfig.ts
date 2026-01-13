import type { FormField } from '@/lib/components/ui/GenericForm';
import type { SensorData } from '@/lib/clients/sensorDataClient';

export const sensorDataFields = [
  { name: 'battery', label: 'Battery (%)', type: 'number', required: true },
  { name: 'temperature', label: 'Temperatuur (°C)', type: 'number', required: true },
  { name: 'noise', label: 'Geluid (dB)', type: 'number', required: true },
  { name: 'light', label: 'Licht (lx)', type: 'number', required: true },
  { name: 'co2', label: 'CO₂ (ppm)', type: 'number', required: true },
  { name: 'lastComDate', label: 'Laatste contact', type: 'datetime', required: true },
] satisfies FormField<SensorData>[];
