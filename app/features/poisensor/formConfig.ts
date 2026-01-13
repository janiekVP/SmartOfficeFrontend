import type { FormField } from '@/lib/components/ui/GenericForm';
import type { POISensor } from '@/lib/clients/poiSensorsClient';

export const POISensorFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'text', required: true },
] satisfies FormField<POISensor>[];

