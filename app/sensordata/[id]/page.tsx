import Link from 'next/link';
import { getSensorData } from '@/lib/clients/sensorDataClient';
import DeleteSensorDataButton from '@/features/sensordata/DeleteSensorDataButton.client';

export default async function SensorDataDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await getSensorData(id);

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sensor meting #{s.id}</h1>
        <Link
          href={`/sensordata/${s.id}/edit`}
          className="rounded bg-indigo-600 px-4 py-2 text-white"
        >
          Bewerken
        </Link>
        <DeleteSensorDataButton id={s.id} />
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Detail label="Status" value={s.status ? 'Online' : 'Offline'} />
        <Detail label="Battery (%)" value={s.battery} />
        <Detail label="Temperatuur (°C)" value={s.temperature} />
        <Detail label="Geluid (dB)" value={s.noise} />
        <Detail label="Licht (lx)" value={s.light} />
        <Detail label="CO₂ (ppm)" value={s.co2} />
        <Detail
          label="Laatste communicatie"
          value={new Date(s.lastComDate).toLocaleString()}
        />
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
