'use client';

import Link from 'next/link';
import { DataTable } from '@/lib/components/ui/DataTable';
import { POIColumns } from './columns';
import type { POI } from '@/lib/clients/poisClient';

type Props = {
  data: POI[];
};

export default function POITable({ data }: Props) {
  return (
    <DataTable
      rows={data}
      columns={POIColumns}
      getRowId={(s) => s.id}
      actions={(s) => (
        <Link
          href={`/poi/${s.id}/sensors`}
          className="text-blue-600 hover:underline"
        >
          Sensors
        </Link>
      )}
    />
  );
}
