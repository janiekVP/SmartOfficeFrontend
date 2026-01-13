'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POISensorFields } from '@/features/poisensor/formConfig';
import { createPOISensor } from '@/lib/clients/poiSensorsClient';
import type { POISensor } from '@/lib/clients/poiSensorsClient';

export default function CreatePOISensorForm() {
  const router = useRouter();

  return (
    <GenericForm
      mode="create"
      fields={POISensorFields}
      onSubmit={async (payload) => {
        const created = await createPOISensor(
          payload as Omit<POISensor, 'id'>
        );

        if (created?.id != null) {
          router.replace(`/poisensor/${created.id}`);
        } else {
          router.replace('/poisensor');
        }
      }}
    />
  );
}
