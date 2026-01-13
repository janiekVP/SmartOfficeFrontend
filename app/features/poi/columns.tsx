import type { Column } from '@/lib/components/ui/DataTable';
import type { POI } from '@/lib/clients/poisClient';

export const POIColumns: Column<POI>[] = [
  { key: 'name', header: 'name' },
  { key: 'type', header: 'type' },
  { key: 'description', header: 'description' },
];
