'use client';

import { useRouter } from 'next/navigation';
import { GenericForm } from '@/lib/components/ui/GenericForm';
import { floorplanFields } from './formConfig';
import { createFloorplan } from '@/lib/clients/floorplansClient';
import type { FloorplanForm } from '@/lib/clients/floorplansClient';

export default function CreateFloorplanForm() {
  const router = useRouter();

  return (
    <GenericForm
      mode="create"
      fields={floorplanFields}
      onSubmit={async (payload) => {
        const created = await createFloorplan(
          payload as Omit<FloorplanForm, 'id'>
        );

        router.replace(`/floorplan/${created.id}`);
      }}
    />
  );
}
