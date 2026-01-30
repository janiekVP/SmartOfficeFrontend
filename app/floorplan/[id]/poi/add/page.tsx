import FloorplanPageClient from './FloorplanPageClient';
import { getFloorplan } from '@/lib/clients/floorplansClient';

export default async function FloorplanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const floorplanId = Number(id);
  const fp = await getFloorplan(id);
  const imageUrl =
    fp.imageBase64 && fp.imageContentType
      ? `data:${fp.imageContentType};base64,${fp.imageBase64}`
      : '/floorplan.png';

  return (
    <section className="h-[calc(100vh-64px)] p-4">
      <FloorplanPageClient floorplanId={floorplanId} imageUrl={imageUrl}/>
    </section>
  );
}
