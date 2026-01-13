import type { Column } from '@/lib/components/ui/DataTable';
import type { SensorData } from '@/lib/clients/sensorDataClient';
import Link from 'next/link';

export const sensorDataColumns: Column<SensorData>[] = [
  {
    key: 'status',
    header: 'Status',
    render: (s) => (
      <span className={s.status ? 'text-green-600' : 'text-red-600'}>
        {s.status ? 'Online' : 'Offline'}
      </span>
    ),
  },
  { key: 'battery', header: '(%)' },
  { key: 'temperature', header: '°C' },
  { key: 'co2', header: 'CO₂ (ppm)' },
  {
    key: 'lastComDate',
    header: 'Laatste contact',
    render: (s) => new Date(s.lastComDate).toLocaleString(),
  },
];
