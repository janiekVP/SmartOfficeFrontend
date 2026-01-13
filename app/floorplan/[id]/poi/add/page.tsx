import FloorplanPageClient from './FloorplanPageClient';

export default async function FloorplanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const floorplanId = Number(id);

  return (
    <section className="h-[calc(100vh-64px)] p-4">
      <FloorplanPageClient floorplanId={floorplanId} />
    </section>
  );
}
