'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { sensorDataFields } from '@/features/sensordata/formConfig';
import { updateSensorData } from '@/lib/clients/sensorDataClient';
import type { SensorData } from '@/lib/clients/sensorDataClient';

export default function EditSensorDataForm({
  id,
  initial,
}: {
  id: string;
  initial: SensorData;
}) {
  const router = useRouter();

  return (
    <GenericForm
      mode="edit"
      fields={sensorDataFields}
      initial={initial}
      onSubmit={async (payload) => {
        await updateSensorData(id, payload);
        router.replace(`/sensordata/${id}`);
      }}
    />
  );
}
