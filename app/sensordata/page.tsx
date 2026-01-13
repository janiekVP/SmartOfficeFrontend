import Link from 'next/link';
import { listSensorData } from '@/lib/clients/sensorDataClient';
import { DataTable } from '@/lib/components/ui/DataTable';
import { sensorDataColumns } from '@/features/sensordata/columns';
import SensorDataTable from '@/features/sensordata/SensorDataTable.client';

export const dynamic = 'force-dynamic';

export default async function SensorDataListPage() {
  const data = await listSensorData();

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sensor data</h1>
        <Link
          href="/sensordata/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Nieuwe meting
        </Link>
      </div>

      <SensorDataTable data={data} />
    </section>
  );
}
