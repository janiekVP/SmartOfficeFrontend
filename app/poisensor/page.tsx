import Link from 'next/link';
import { listPOISensor } from '@/lib/clients/poiSensorsClient';
import { DataTable } from '@/lib/components/ui/DataTable';
import { POISensorColumns } from '@/features/poisensor/columns';
import POISensorTable from '@/features/poisensor/POISensorTable.client';

export const dynamic = 'force-dynamic';

export default async function POISensorListPage() {
  const data = await listPOISensor();

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sensor</h1>
        <Link
          href="/poisensor/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Nieuwe sensor
        </Link>
      </div>

      <POISensorTable data={data} />
    </section>
  );
}
