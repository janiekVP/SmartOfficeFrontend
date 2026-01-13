'use client';

import Link from 'next/link';
import { DataTable } from '@/lib/components/ui/DataTable';
import { sensorDataColumns } from './columns';
import type { SensorData } from '@/lib/clients/sensorDataClient';

type Props = {
  data: SensorData[];
};

export default function SensorDataTable({ data }: Props) {
  return (
    <DataTable
      rows={data}
      columns={sensorDataColumns}
      getRowId={(s) => s.id}
      actions={(s) => (
        <Link
          href={`/sensordata/${s.id}`}
          className="text-blue-600 hover:underline"
        >
          Details
        </Link>
      )}
    />
  );
}
