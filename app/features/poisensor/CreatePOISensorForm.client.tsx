
'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POISensorFields } from '@/features/poisensor/formConfig';
import { createPOISensor } from '@/lib/clients/poiSensorsClient';
import type { POISensorCreateDto } from '@/lib/clients/poiSensorsClient';

export default function CreatePOISensorForm({ POIId }: { POIId?: string }) {
  const router = useRouter();

  return (
    <GenericForm
      mode="create"
      fields={POISensorFields}
      onSubmit={async (payload) => {

        const dto: POISensorCreateDto = {
          POIId: Number(POIId),
          name: payload.name,
          type: payload.type,
        };

        const created = await createPOISensor(dto);

        if (created?.id != null) {
          router.replace(`/poisensor/${created.id}`);
        } else {
          router.replace('/poisensor');
        }
      }}
    />
  );
}
