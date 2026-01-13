
import type { Column } from '@/lib/components/ui/DataTable';
import type { Floorplan } from '@/lib/clients/floorplansClient';

export const floorplanColumns: Column<Floorplan>[] = [
  { key: 'country', header: 'Land' },
  { key: 'district', header: 'District' },
  { key: 'city', header: 'Stad' },
  { key: 'company', header: 'Bedrijf' },
  { key: 'office', header: 'Kantoor' },
  { key: 'floor', header: 'Verdieping' },
];
