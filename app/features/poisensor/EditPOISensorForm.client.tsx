'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POISensorFields } from '@/features/poisensor/formConfig';
import { updatePOISensor } from '@/lib/clients/poiSensorsClient';
import type { POISensor } from '@/lib/clients/poiSensorsClient';

export default function EditPOISensorForm({
  id,
  initial,
}: {
  id: string;
  initial: POISensor;
}) {
  const router = useRouter();

  return (
    <GenericForm
      mode="edit"
      fields={POISensorFields}
      initial={initial}
      onSubmit={async (payload) => {
        await updatePOISensor(id, payload);
        router.replace(`/poisensor/${id}`);
      }}
    />
  );
}
