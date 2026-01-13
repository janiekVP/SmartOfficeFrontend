'use client';

import { useRouter } from 'next/navigation';
import { deleteSensorData } from '@/lib/clients/sensorDataClient';

type Props = {
  id: number;
};

export default function DeleteSensorDataButton({ id }: Props) {
  const router = useRouter();

  const onDelete = async () => {
    const confirmed = window.confirm(
      'Weet je zeker dat je deze sensormeting wilt verwijderen?'
    );

    if (!confirmed) return;

    try {
      await deleteSensorData(String(id));
      router.replace('/sensordata');
    } catch (e) {
      alert((e as Error).message ?? 'Verwijderen mislukt');
    }
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      className="rounded border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
    >
      Verwijderen
    </button>
  );
}
