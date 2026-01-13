import { getPOISensor } from '@/lib/clients/poiSensorsClient';
import { notFound } from 'next/navigation';
import EditPOISensorForm from '@/features/poisensor/EditPOISensorForm.client';

export default async function EditPOISensorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const current = await getPOISensor(id).catch(() => null);
  if (!current) {
    notFound();
  }

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sensor bewerken</h1>
      <EditPOISensorForm id={id} initial={current} />
    </section>
  );
}
