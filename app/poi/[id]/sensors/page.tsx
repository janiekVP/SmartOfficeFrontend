import Link from 'next/link';
import { listPOISensorByPOIId } from '@/lib/clients/poiSensorsClient';
import { getPOI } from '@/lib/clients/poisClient';
import POISensorTable from '@/features/poisensor/POISensorTable.client';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function POISensorListPage(props: PageProps) {
  const { id } = await props.params;

  const poi = await getPOI(id);

  const sensors = await listPOISensorByPOIId(id);

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Sensors for POI {poi.name}
        </h1>

        <Link
          href={`/poisensor/new?poiId=${id}`}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Nieuwe sensor
        </Link>
      </div>

      <POISensorTable data={sensors} />
    </section>
  );
}
