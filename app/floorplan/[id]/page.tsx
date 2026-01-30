import Link from 'next/link';
import FloorplanPOIViewer from '@/lib/components/ui/FloorplanPOIViewer.client';
import { getFloorplan } from '@/lib/clients/floorplansClient';


export const dynamic = 'force-dynamic';


export default async function FloorplanViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const floorplanId = Number(id);
  const fp = await getFloorplan(id);
  const imageUrl =
    fp.imageBase64 && fp.imageContentType
      ? `data:${fp.imageContentType};base64,${fp.imageBase64}`
      : '/floorplan.png';


  return (
    <section className="h-[calc(100vh-64px)] p-4">
      <div className="flex gap-3 mb-4">
        <Link
          href={`/floorplan/${id}/edit`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Edit Floorplan
        </Link>
        <Link
          href={`/floorplan/${id}/poi`}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          POI List
        </Link>
        <Link
          href={`/floorplan/${id}/poi/add`}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Add POI
        </Link>
      </div>
      <FloorplanPOIViewer floorplanId={floorplanId} imageUrl={imageUrl} />
    </section>
  );
}
