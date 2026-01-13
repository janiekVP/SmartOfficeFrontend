'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';
import { createPOI } from '@/lib/clients/poisClient';
import type { POI } from '@/lib/clients/poisClient';

export default function CreatePOIForm() {
  const router = useRouter();

  return (
    <GenericForm
      mode="create"
      fields={POIFields}
      onSubmit={async (payload) => {
        const created = await createPOI(
          payload as Omit<POI, 'id'>
        );

        if (created?.id != null) {
          router.replace(`/poi/${created.id}`);
        } else {
          router.replace('/poi');
        }
      }}
    />
  );
}
