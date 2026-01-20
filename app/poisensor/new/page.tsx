import CreatePOISensorForm from '@/features/poisensor/CreatePOISensorForm.client';

export default async function NewPOISensorPage({
  searchParams,
}: {
  searchParams: Promise<{ poiId?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Nieuwe sensor</h1>

      <CreatePOISensorForm POIId={params.poiId} />
    </section>
  );
}
