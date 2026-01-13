'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { sensorDataFields } from '@/features/sensordata/formConfig';
import { createSensorData } from '@/lib/clients/sensorDataClient';
import type { SensorData } from '@/lib/clients/sensorDataClient';

export default function CreateSensorDataForm() {
  const router = useRouter();

  return (
    <GenericForm
      mode="create"
      fields={sensorDataFields}
      onSubmit={async (payload) => {
        const created = await createSensorData(
          payload as Omit<SensorData, 'id'>
        );

        if (created?.id != null) {
          router.replace(`/sensordata/${created.id}`);
        } else {
          router.replace('/sensordata');
        }
      }}
    />
  );
}
