import Link from 'next/link';
import { getPOISensor } from '@/lib/clients/poiSensorsClient';
import DeletePOISensorButton from '@/features/poisensor/DeletePOISensorButton.client';

export default async function POISensorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getPOISensor(id);

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sensor #{s.id}</h1>
        <Link
          href={`/poisensor/${s.id}/edit`}
          className="rounded bg-indigo-600 px-4 py-2 text-white"
        >
          Bewerken
        </Link>
        <DeletePOISensorButton id={s.id} />
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Detail label="Naam" value={s.name} />
        <Detail label="Type" value={s.type} />
      </dl>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-lg">{value}</dd>
    </div>
  );
}
