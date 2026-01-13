import FloorplanPOICreator from '@/lib/components/ui/FloorplanPOICreator.client';

export const dynamic = 'force-dynamic';

export default function FloorplanCreatePage({ params }: { params: { id: string } }) {
  const floorplanId = Number(params.id);
  return (
    <section className="h-[calc(100vh-64px)] p-4">
      <FloorplanPOICreator floorplanId={floorplanId} />
    </section>
  );
}
