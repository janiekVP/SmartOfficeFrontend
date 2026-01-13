'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { floorplanFields } from './formConfig';
import { updateFloorplan } from '@/lib/clients/floorplansClient';
import type { FloorplanForm } from '@/lib/clients/floorplansClient';

export default function EditFloorplanForm({
  id,
  initial,
}: {
  id: string;
  initial: FloorplanForm;
}) {
  const router = useRouter();

  return (
    <GenericForm
      mode="edit"
      fields={floorplanFields}
      initial={initial}
      onSubmit={async (payload) => {
        await updateFloorplan(id, payload);
        router.replace(`/floorplan/${id}`);
      }}
    />
  );
}
