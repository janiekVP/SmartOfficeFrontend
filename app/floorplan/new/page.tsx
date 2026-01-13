'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { floorplanFields } from '@/features/floorplan/formConfig';
import { createFloorplan } from '@/lib/clients/floorplansClient';
import type { FloorplanForm, Floorplan } from '@/lib/clients/floorplansClient';

export default function CreateFloorplanForm() {
  const router = useRouter();

  return (
    <GenericForm<FloorplanForm>
      mode="create"
      fields={floorplanFields}
      onSubmit={async (payload) => {
        const created: Floorplan = await createFloorplan(payload as FloorplanForm);
        router.replace(`/floorplan/${created.id}`);
      }}
    />
  );
}
