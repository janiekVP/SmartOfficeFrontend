'use client';

import Link from 'next/link';
import { DataTable } from '@/lib/components/ui/DataTable';
import { POISensorColumns } from './columns';
import type { POISensor } from '@/lib/clients/poiSensorsClient';

type Props = {
  data: POISensor[];
};

export default function POISensorTable({ data }: Props) {
  return (
    <DataTable
      rows={data}
      columns={POISensorColumns}
      getRowId={(s) => s.id}
      actions={(s) => (
        <Link
          href={`/poisensor/${s.id}`}
          className="text-blue-600 hover:underline"
        >
          Details
        </Link>
      )}
    />
  );
}
