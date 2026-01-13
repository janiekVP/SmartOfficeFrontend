import type { Column } from '@/lib/components/ui/DataTable';
import type { POISensor } from '@/lib/clients/poiSensorsClient';

export const POISensorColumns: Column<POISensor>[] = [
  { key: 'name', header: 'name' },
  { key: 'type', header: 'type' },
];
