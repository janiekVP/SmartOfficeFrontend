import FloorplanPOIViewer from '@/lib/components/ui/FloorplanPOIViewer.client';

export const dynamic = 'force-dynamic';

export default async function FloorplanViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const floorplanId = Number(id);

  return (
    <section className="h-[calc(100vh-64px)] p-4">
      <FloorplanPOIViewer floorplanId={floorplanId} />
    </section>
  );
}
