import { getSensorData } from '@/lib/clients/sensorDataClient';
import { notFound } from 'next/navigation';
import EditSensorDataForm from '@/features/sensordata/EditSensorDataForm.client';

export default async function EditSensorDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const current = await getSensorData(id).catch(() => null);
  if (!current) {
    notFound();
  }

  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sensor meting bewerken</h1>
      <EditSensorDataForm id={id} initial={current} />
    </section>
  );
}
