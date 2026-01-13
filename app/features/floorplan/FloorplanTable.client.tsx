'use client';

import Link from 'next/link';
import { DataTable } from '@/lib/components/ui/DataTable';
import { floorplanColumns } from './columns';
import type { Floorplan } from '@/lib/clients/floorplansClient';

export default function FloorplanTable({ data }: { data: Floorplan[] }) {
  return (
    <DataTable
      rows={data}
      columns={floorplanColumns}
      getRowId={(f) => f.id}
      actions={(f) => (
        <Link
          href={`/floorplan/${f.id}`}
          className="text-blue-600 hover:underline"
        >
          Details
        </Link>
      )}
    />
  );
}
