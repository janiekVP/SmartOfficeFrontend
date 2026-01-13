import { getFloorplan } from '@/lib/clients/floorplansClient';
import EditFloorplanForm from '@/features/floorplan/EditFloorplanForm.client';

export default async function EditFloorplanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const f = await getFloorplan(id);

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Floorplan #{f.id} bewerken</h1>
      <EditFloorplanForm id={id} initial={f} />
    </section>
  );
}
