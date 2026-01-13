import type { FormField } from '@/lib/components/ui/GenericForm';
import type { FloorplanForm } from '@/lib/clients/floorplansClient';

export const floorplanFields = [
  { name: 'country', label: 'Land', type: 'text', required: true },
  { name: 'district', label: 'District', type: 'text', required: true },
  { name: 'city', label: 'Stad', type: 'text', required: true },
  { name: 'company', label: 'Bedrijf', type: 'text', required: true },
  { name: 'office', label: 'Kantoor', type: 'text', required: true },
  { name: 'floor', label: 'Verdieping', type: 'text', required: true },
  { name: 'image', label: 'Floorplan afbeelding', type: 'file', required: false },
] satisfies FormField<FloorplanForm>[];