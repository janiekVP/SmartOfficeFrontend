import Link from 'next/link';
import { listFloorplan } from '@/lib/clients/floorplansClient';
import { DataTable } from '@/lib/components/ui/DataTable';
import { floorplanColumns } from '@/features/floorplan/columns';
import FloorplanTable from '@/features/floorplan/FloorplanTable.client';

export const dynamic = 'force-dynamic';

export default async function FloorplanListPage() {
  const data = await listFloorplan();

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Floorplans</h1>
        <Link
          href="/floorplan/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Nieuwe floorplan
        </Link>
      </div>

      <FloorplanTable data={data} />
    </section>
  );
}
