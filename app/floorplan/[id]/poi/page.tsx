import Link from 'next/link';
import POITable from '@/features/poi/POITable.client';
import { listPOIByFloorplanId } from '@/lib/clients/poisClient';

export const dynamic = 'force-dynamic';

export default async function POIListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const floorplanId = Number(id);
  const data = await listPOIByFloorplanId(floorplanId);

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">POI</h1>
        <Link
          href={`/floorplan/${id}/poi/add`}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Nieuwe poi
        </Link>
      </div>

      <POITable data={data} />
    </section>
  );
}
