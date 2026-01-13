'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { POIFields } from '@/features/poi/formConfig';
import { updatePOI } from '@/lib/clients/poisClient';
import type { POI } from '@/lib/clients/poisClient';

export default function EditPOIForm({
  id,
  initial,
}: {
  id: string;
  initial: POI;
}) {
  const router = useRouter();

  return (
    <GenericForm
      mode="edit"
      fields={POIFields}
      initial={initial}
      onSubmit={async (payload) => {
        await updatePOI(id, payload);
        router.replace(`/poi/${id}`);
      }}
    />
  );
}
