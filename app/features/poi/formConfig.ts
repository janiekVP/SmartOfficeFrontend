import type { FormField } from '@/lib/components/ui/GenericForm';
import type { POI } from '@/lib/clients/poisClient';

export const POIFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'text', required: true },
] satisfies FormField<POI>[];

